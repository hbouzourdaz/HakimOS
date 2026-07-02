/**
 * HakimOS Virtual File System.
 *
 * The whole tree lives in memory for synchronous access; every mutation
 * schedules a debounced persist into IndexedDB (localStorage fallback).
 * File contents are plain strings; binary data is stored as data: URLs.
 */
import { EventBus, Path, debounce } from './utils';
import { settings } from './settings';

export interface FileNode { type: 'file'; content: string; ctime: number; mtime: number }
export interface DirNode { type: 'dir'; children: Record<string, FSNode>; ctime: number; mtime: number }
export type FSNode = FileNode | DirNode;

const DB_NAME = 'hakimos';
const STORE = 'system';
const FS_KEY = 'fs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<unknown> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const now = () => Date.now();
const dir = (): DirNode => ({ type: 'dir', children: {}, ctime: now(), mtime: now() });
const file = (content: string): FileNode => ({ type: 'file', content, ctime: now(), mtime: now() });

class VFS extends EventBus {
  root: DirNode = dir();
  ready = false;
  wasSeeded = false;
  private useLocalStorage = false;
  private persistSoon = debounce(() => void this.persist(), 400);

  async init(): Promise<void> {
    let loaded: unknown = null;
    try {
      loaded = await idbGet(FS_KEY);
    } catch {
      this.useLocalStorage = true;
      try { loaded = JSON.parse(localStorage.getItem('hakimos.fs') ?? 'null'); } catch { /* fresh */ }
    }
    if (loaded && (loaded as DirNode).type === 'dir') {
      this.root = loaded as DirNode;
    } else {
      seed(this);
      this.wasSeeded = true;
      await this.persist();
    }
    this.ready = true;
  }

  async persist(): Promise<void> {
    const data = JSON.parse(JSON.stringify(this.root));
    try {
      if (this.useLocalStorage) localStorage.setItem('hakimos.fs', JSON.stringify(data));
      else await idbSet(FS_KEY, data);
    } catch (e) {
      console.warn('[vfs] persist failed', e);
    }
  }

  private changed(path: string) {
    this.persistSoon();
    this.emit('change', path);
  }

  /** Returns the node at path, or null. */
  stat(path: string): FSNode | null {
    const p = Path.normalize(path);
    if (p === '/') return this.root;
    let node: FSNode = this.root;
    for (const part of p.slice(1).split('/')) {
      if (node.type !== 'dir') return null;
      const next: FSNode | undefined = node.children[part];
      if (!next) return null;
      node = next;
    }
    return node;
  }

  exists(path: string): boolean { return this.stat(path) !== null; }
  isDir(path: string): boolean { return this.stat(path)?.type === 'dir'; }

  private parentOf(path: string): { parent: DirNode; name: string } {
    const p = Path.normalize(path);
    if (p === '/') throw new Error('cannot operate on /');
    const parent = this.stat(Path.dirname(p));
    if (!parent) throw new Error(`no such directory: ${Path.dirname(p)}`);
    if (parent.type !== 'dir') throw new Error(`not a directory: ${Path.dirname(p)}`);
    return { parent, name: Path.basename(p) };
  }

  list(path: string): Array<{ name: string; node: FSNode }> {
    const node = this.stat(path);
    if (!node) throw new Error(`no such directory: ${path}`);
    if (node.type !== 'dir') throw new Error(`not a directory: ${path}`);
    return Object.entries(node.children)
      .map(([name, n]) => ({ name, node: n }))
      .sort((a, b) =>
        a.node.type === b.node.type ? a.name.localeCompare(b.name) : a.node.type === 'dir' ? -1 : 1);
  }

  readFile(path: string): string {
    const node = this.stat(path);
    if (!node) throw new Error(`no such file: ${path}`);
    if (node.type !== 'file') throw new Error(`is a directory: ${path}`);
    return node.content;
  }

  writeFile(path: string, content: string) {
    const { parent, name } = this.parentOf(path);
    const existing = parent.children[name];
    if (existing?.type === 'dir') throw new Error(`is a directory: ${path}`);
    if (existing) {
      existing.content = content;
      existing.mtime = now();
    } else {
      parent.children[name] = file(content);
    }
    parent.mtime = now();
    this.changed(path);
  }

  appendFile(path: string, content: string) {
    const node = this.stat(path);
    if (node && node.type === 'file') {
      node.content += content;
      node.mtime = now();
      this.changed(path);
    } else if (!node) {
      this.writeFile(path, content);
    } else {
      throw new Error(`is a directory: ${path}`);
    }
  }

  mkdir(path: string) {
    const { parent, name } = this.parentOf(path);
    if (parent.children[name]) throw new Error(`already exists: ${path}`);
    parent.children[name] = dir();
    parent.mtime = now();
    this.changed(path);
  }

  mkdirp(path: string) {
    const p = Path.normalize(path);
    if (p === '/') return;
    const parts = p.slice(1).split('/');
    let cur = '';
    for (const part of parts) {
      cur += '/' + part;
      const node = this.stat(cur);
      if (!node) this.mkdir(cur);
      else if (node.type !== 'dir') throw new Error(`not a directory: ${cur}`);
    }
  }

  remove(path: string, recursive = false) {
    const { parent, name } = this.parentOf(path);
    const node = parent.children[name];
    if (!node) throw new Error(`no such file or directory: ${path}`);
    if (node.type === 'dir' && Object.keys(node.children).length > 0 && !recursive) {
      throw new Error(`directory not empty: ${path}`);
    }
    delete parent.children[name];
    parent.mtime = now();
    this.changed(path);
  }

  /** Moves src to the exact destination path dst. */
  move(src: string, dst: string) {
    const s = Path.normalize(src), d = Path.normalize(dst);
    if (s === d) return;
    if (d.startsWith(s + '/')) throw new Error('cannot move a directory into itself');
    const node = this.stat(s);
    if (!node) throw new Error(`no such file or directory: ${src}`);
    const { parent: dstParent, name: dstName } = this.parentOf(d);
    if (dstParent.children[dstName]) throw new Error(`already exists: ${dst}`);
    const { parent: srcParent, name: srcName } = this.parentOf(s);
    delete srcParent.children[srcName];
    dstParent.children[dstName] = node;
    srcParent.mtime = now();
    dstParent.mtime = now();
    this.changed(d);
  }

  copy(src: string, dst: string) {
    const s = Path.normalize(src), d = Path.normalize(dst);
    if (d === s || d.startsWith(s + '/')) throw new Error('cannot copy a directory into itself');
    const node = this.stat(s);
    if (!node) throw new Error(`no such file or directory: ${src}`);
    const { parent, name } = this.parentOf(d);
    if (parent.children[name]) throw new Error(`already exists: ${dst}`);
    parent.children[name] = JSON.parse(JSON.stringify(node));
    parent.mtime = now();
    this.changed(d);
  }

  touch(path: string) {
    const node = this.stat(path);
    if (node) { node.mtime = now(); this.changed(path); }
    else this.writeFile(path, '');
  }

  sizeOf(node: FSNode): number {
    if (node.type === 'file') return node.content.length;
    return Object.values(node.children).reduce((sum, n) => sum + this.sizeOf(n), 0);
  }

  totalSize(): number { return this.sizeOf(this.root); }

  countFiles(node: FSNode = this.root): number {
    if (node.type === 'file') return 1;
    return Object.values(node.children).reduce((sum, n) => sum + this.countFiles(n), 0);
  }

  /** Recursive name search, returns matching absolute paths. */
  find(query: string, base = '/', limit = 50): string[] {
    const q = query.toLowerCase();
    const results: string[] = [];
    const walk = (path: string, node: FSNode) => {
      if (results.length >= limit) return;
      if (path !== '/' && Path.basename(path).toLowerCase().includes(q)) results.push(path);
      if (node.type === 'dir') {
        for (const [name, child] of Object.entries(node.children)) {
          walk(path === '/' ? '/' + name : path + '/' + name, child);
        }
      }
    };
    const start = this.stat(base);
    if (start) walk(Path.normalize(base), start);
    return results;
  }

  async resetAll(): Promise<void> {
    try { await new Promise<void>((res) => { const r = indexedDB.deleteDatabase(DB_NAME); r.onsuccess = r.onerror = r.onblocked = () => res(); }); } catch { /* ignore */ }
    try { localStorage.removeItem('hakimos.fs'); } catch { /* ignore */ }
  }
}

export const vfs = new VFS();

export const homeDir = () => `/home/${settings.get('username')}`;

/* ---------------------------------------------------------------- seeding */

const sampleSvg = (gradA: string, gradB: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${gradA}"/><stop offset="1" stop-color="${gradB}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#bg)"/>${body}</svg>`;

function seed(fs: VFS) {
  const user = settings.get('username');
  const home = `/home/${user}`;
  fs.root = dir();
  for (const p of [
    '/bin', '/etc', '/tmp', '/usr/share',
    home, `${home}/Desktop`, `${home}/Documents`, `${home}/Pictures`,
    `${home}/Music`, `${home}/Downloads`,
  ]) fs.mkdirp(p);

  fs.writeFile('/etc/hostname', settings.get('hostname') + '\n');
  fs.writeFile('/etc/os-release', [
    'NAME="HakimOS"', 'VERSION="1.0 (Aurora)"', 'ID=hakimos',
    'PRETTY_NAME="HakimOS 1.0 Aurora"', 'HOME_URL="about:hakimos"', '',
  ].join('\n'));
  fs.writeFile('/etc/motd', 'Welcome to HakimOS — type `help` to see what this shell can do.\n');

  fs.writeFile(`${home}/Desktop/Terminal.app`, 'terminal');
  fs.writeFile(`${home}/Desktop/Files.app`, 'files');
  fs.writeFile(`${home}/Desktop/Browser.app`, 'browser');
  fs.writeFile(`${home}/Desktop/Portfolio.app`, 'portfolio');
  fs.writeFile(`${home}/Desktop/About.app`, 'about');
  fs.writeFile(`${home}/Desktop/Settings.app`, 'settings');
  fs.writeFile(`${home}/Desktop/Calculator.app`, 'calculator');
  fs.writeFile(`${home}/Desktop/Paint.app`, 'paint');

  // Project shortcuts (link apps)
  fs.writeFile(`${home}/Desktop/Exam DZ.app`, 'link-exam');
  fs.writeFile(`${home}/Desktop/Hakim Tutor.app`, 'link-tutor');
  fs.writeFile(`${home}/Desktop/Physics Blog.app`, 'link-physics');
  fs.writeFile(`${home}/Desktop/CEM Grades.app`, 'link-cem');
  fs.writeFile(`${home}/Desktop/BEM 2026.app`, 'link-bem');
  fs.writeFile(`${home}/Desktop/7al Archive.app`, 'link-7al');
  fs.writeFile(`${home}/Desktop/Sahhel.app`, 'link-sahel');
  fs.writeFile(`${home}/Desktop/Grades Entry.app`, 'link-grades');
  fs.writeFile(`${home}/Desktop/Absence System.app`, 'link-absence');
  fs.writeFile(`${home}/Desktop/FET Print.app`, 'link-fet');
  fs.writeFile(`${home}/Desktop/SchoolHb.app`, 'link-schoolhb');
  fs.writeFile(`${home}/Desktop/Portfolio v1.app`, 'link-port1');
  fs.writeFile(`${home}/Desktop/Personal Site.app`, 'link-personal');
  fs.writeFile(`${home}/Desktop/Portfolio v21.app`, 'link-port21');
  fs.writeFile(`${home}/Desktop/Ana DZ.app`, 'link-ana');
  fs.writeFile(`${home}/Desktop/Izmawen.app`, 'link-izmawen');
  fs.writeFile(`${home}/Desktop/Hakim Tech.app`, 'link-hakimtech');
  fs.writeFile(`${home}/Desktop/AIO Software.app`, 'link-aiosoft');
  fs.writeFile(`${home}/Desktop/Nojom.app`, 'link-nojom');
  fs.writeFile(`${home}/Desktop/README.md`, [
    '# Welcome to HakimOS',
    '',
    'This entire operating system runs in your browser tab. Everything you',
    'see — the kernel, the file system, the window manager and every app —',
    'was built from scratch with zero runtime dependencies.',
    '',
    '## Things to try',
    '',
    '- Open the **Terminal** and run `neofetch`, `tree ~`, or `cowsay hello`',
    '- Pipe commands together: `ls /bin | grep e`',
    '- Create a file: `echo "hi" > ~/notes.txt`, then find it in **Files**',
    '- Draw something in **Paint** and save it to your Pictures folder',
    '- Change the wallpaper and accent color in **Settings**',
    '- Your files survive a reboot — everything persists in IndexedDB',
    '',
    '## Shortcuts',
    '',
    '- `Ctrl+Alt+T` — open a terminal',
    '- Drag windows to screen edges to snap them',
    '- Double-click a title bar to maximize',
    '',
    'Have fun! — Hakim',
    '',
  ].join('\n'));

  fs.writeFile(`${home}/Documents/welcome.md`, [
    '# Welcome to HakimOS',
    '',
    'This entire operating system runs in your browser tab. Everything you',
    'see — the kernel, the file system, the window manager and every app —',
    'was built from scratch with zero runtime dependencies.',
    '',
    '## About HakimOS',
    '',
    'HakimOS is a personal portfolio operating system created by Hakim Bouzourdaz.',
    'It showcases my skills in full-stack development, educational technology,',
    'and creative problem-solving.',
    '',
    '## Things to try',
    '',
    '- Open the **Terminal** and run `profile`, `skills`, or `projects`',
    '- Open the **Portfolio** app to see all my links and projects',
    '- Try `cv` in the terminal for a quick resume summary',
    '- Explore the file system to see sample project files',
    '',
    '## Links',
    '',
    '- GitHub: github.com/hbouzourdaz',
    '- Email: hbouzourdaz@gmail.com',
    '- Telegram: @h_bouzourdaz',
    '',
    'Have fun! — Hakim',
    '',
  ].join('\n'));
  fs.writeFile(`${home}/Documents/cv.md`, [
    '# Curriculum Vitae',
    '',
    '## Hakim Bouzourdaz',
    '',
    '### Education',
    '- Master 2 in Physics — University of Setif, Algeria',
    '',
    '### Experience',
    '- +5 years in web development',
    '- Physics teacher & tech educator',
    '- 20+ personal & professional projects',
    '',
    '### Specializations',
    '- Educational technology platforms',
    '- School management systems',
    '- Interactive learning tools',
    '- Full-stack web applications',
    '',
    '### Languages',
    '- Arabic (Native)',
    '- French (Fluent)',
    '- English (Professional)',
    '- Kabyle (Native)',
    '',
    '### Contact',
    '- GitHub: github.com/hbouzourdaz',
    '- Email: hbouzourdaz@gmail.com',
    '- Telegram: @h_bouzourdaz',
    '',
  ].join('\n'));
  fs.writeFile(`${home}/Documents/projects.md`, [
    '# Projects Portfolio',
    '',
    '## Education',
    '- **Exam DZ** — exam-dz.vercel.app — Exam & test generator platform',
    '- **Hakim Tutor** — hakim-tutor.vercel.app — Interactive lessons & summaries',
    '- **Physics Blog** — physics-blog.vercel.app — Physics articles & explanations',
    '- **CEM Grades** — cemdz.netlify.app — Middle school grade calculator',
    '- **BEM 2026** — bem2026.netlify.app — BEM exam preparation guide',
    '- **7al Archive** — 7al.vercel.app — Physics exercises solutions',
    '',
    '## School Management',
    '- **Grades Entry** — hajzdz.vercel.app — Digital grades management tool',
    '- **Absence System** — dzabsence.vercel.app — Cloud-based absence tracking',
    '- **FET Print** — fet-print.vercel.app — School timetable printing tool',
    '- **SchoolHb** — github.com/hbouzourdaz/SchoolHb — Complete school management system',
    '',
    '## Personal Sites',
    '- **Portfolio v1** — hbouzourdaz.netlify.app — First portfolio edition',
    '- **Personal Site** — bouzourdaz.vercel.app — Personal introduction website',
    '- **Portfolio v21** — hbouzourdaz21.vercel.app — Professional portfolio',
    '- **Ana DZ** — anadz.netlify.app — Personal & cultural blogging space',
    '',
    '## Tech Projects',
    '- **Hakim Tech** — hakim-tech.vercel.app — Tech articles, news & tutorials',
    '- **AIO Software** — aiosoft.netlify.app — Software bundle installer',
    '- **Nojom** — nojom.netlify.app — Student excellence platform',
    '- **HakimOS** — This browser-based operating system!',
    '',
  ].join('\n'));
  fs.writeFile(`${home}/Documents/todo.md`, [
    '# Todo',
    '',
    '- [x] Boot the operating system',
    '- [x] Create portfolio OS experience',
    '- [ ] Beat Minesweeper',
    '- [ ] Get a high score in Snake',
    '- [ ] Compose a masterpiece on the Piano',
    '- [ ] Share HakimOS with the world',
    '',
  ].join('\n'));
  fs.writeFile(`${home}/Documents/sample-page.html`, [
    '<!doctype html><html><head><style>',
    'body{font-family:system-ui;background:#0b1220;color:#e2e8f0;display:grid;place-items:center;height:95vh;margin:0}',
    '.card{text-align:center;padding:2rem 3rem;border:1px solid #334155;border-radius:16px;background:#111a2e}',
    'h1{background:linear-gradient(90deg,#7c6cff,#38bdf8);-webkit-background-clip:text;background-clip:text;color:transparent}',
    'button{margin-top:1rem;padding:.6rem 1.4rem;border-radius:8px;border:none;background:#6d8dff;color:#fff;font-size:1rem;cursor:pointer}',
    '</style></head><body><div class="card"><h1>Hello from the HakimOS Browser</h1>',
    '<p>This page lives at <code>~/Documents/sample-page.html</code> in the virtual file system.</p>',
    '<p>JavaScript runs too: <b id="n">0</b></p>',
    '<button onclick="n.textContent=+n.textContent+1">Click me</button>',
    '</div></body></html>',
  ].join('\n'));
  fs.writeFile(`${home}/Documents/links.md`, [
    '# Quick Links',
    '',
    '## Education Platforms',
    '- Exam DZ: https://exam-dz.vercel.app/',
    '- Hakim Tutor: https://hakim-tutor.vercel.app/',
    '- Physics Blog: https://physics-blog.vercel.app/',
    '',
    '## School Tools',
    '- Grades Entry: https://hajzdz.vercel.app/',
    '- Absence System: https://dzabsence.vercel.app/',
    '- FET Print: https://fet-print.vercel.app/',
    '',
    '## Personal',
    '- Portfolio: https://hbouzourdaz.netlify.app/',
    '- GitHub: https://github.com/hbouzourdaz',
    '- Email: hbouzourdaz@gmail.com',
    '',
  ].join('\n'));

  fs.writeFile(`${home}/Pictures/aurora.svg`, sampleSvg('#0f172a', '#1e1b4b',
    `<path d="M0 380 Q200 180 400 300 T800 220 V500 H0 Z" fill="#34d399" opacity="0.35"/>
<path d="M0 420 Q250 240 500 340 T800 300 V500 H0 Z" fill="#38bdf8" opacity="0.4"/>
<path d="M0 460 Q300 320 600 400 T800 380 V500 H0 Z" fill="#a78bfa" opacity="0.45"/>
<circle cx="640" cy="110" r="46" fill="#fef9c3" opacity="0.9"/>
<g fill="#fff" opacity="0.8"><circle cx="120" cy="80" r="2"/><circle cx="300" cy="60" r="1.5"/><circle cx="480" cy="100" r="2"/><circle cx="210" cy="150" r="1.5"/><circle cx="720" cy="60" r="1.5"/><circle cx="90" cy="200" r="1.5"/></g>`));
  fs.writeFile(`${home}/Pictures/hakimos-brand.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0f172a"/>
    <stop offset="1" stop-color="#1e1b4b"/>
  </linearGradient>
  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#7c6cff"/>
    <stop offset="1" stop-color="#38bdf8"/>
  </linearGradient>
</defs>
<rect width="800" height="500" fill="url(#bg)"/>
<g opacity="0.15">
  <circle cx="100" cy="100" r="200" fill="#7c6cff"/>
  <circle cx="700" cy="400" r="250" fill="#38bdf8"/>
  <circle cx="400" cy="250" r="150" fill="#a78bfa"/>
</g>
<g transform="translate(400,200)">
  <rect x="-60" y="-80" width="20" height="160" rx="4" fill="url(#accent)"/>
  <rect x="-20" y="-80" width="20" height="160" rx="4" fill="url(#accent)"/>
  <rect x="-60" y="-20" width="60" height="20" rx="4" fill="url(#accent)"/>
  <rect x="-60" y="40" width="60" height="20" rx="4" fill="url(#accent)"/>
</g>
<text x="400" y="350" text-anchor="middle" font-family="system-ui" font-size="36" font-weight="bold" fill="#e2e8f0">HakimOS</text>
<text x="400" y="380" text-anchor="middle" font-family="system-ui" font-size="14" fill="#94a3b8">Portfolio Operating System</text>
<g fill="#fff" opacity="0.5">
  <circle cx="120" cy="80" r="1.5"/><circle cx="300" cy="60" r="1"/><circle cx="500" cy="90" r="1.5"/>
  <circle cx="680" cy="70" r="1"/><circle cx="200" cy="150" r="1"/><circle cx="600" cy="140" r="1.5"/>
</g>
</svg>`);
  fs.writeFile(`${home}/Pictures/mountains.svg`, sampleSvg('#fcd9a0', '#f97362',
    `<circle cx="400" cy="240" r="90" fill="#fff7ed" opacity="0.9"/>
<path d="M0 500 L180 220 L320 420 L460 180 L620 430 L800 260 V500 Z" fill="#7c2d4f" opacity="0.85"/>
<path d="M0 500 L120 350 L280 500 M340 500 L500 320 L700 500" fill="#4a1d3d" opacity="0.9"/>
<path d="M0 500 H800 V440 Q400 400 0 440 Z" fill="#2d1130"/>`));
  fs.writeFile(`${home}/Pictures/circles.svg`, sampleSvg('#042f2e', '#134e4a',
    `<g fill="none" stroke-width="3">
<circle cx="400" cy="250" r="60" stroke="#5eead4" opacity="0.9"/>
<circle cx="400" cy="250" r="110" stroke="#2dd4bf" opacity="0.7"/>
<circle cx="400" cy="250" r="160" stroke="#14b8a6" opacity="0.5"/>
<circle cx="400" cy="250" r="210" stroke="#0d9488" opacity="0.35"/>
<circle cx="400" cy="250" r="260" stroke="#0f766e" opacity="0.25"/></g>
<circle cx="400" cy="250" r="18" fill="#99f6e4"/>`));
}
