# HakimOS

**A portfolio operating system that runs in your browser tab.**

Created by Hakim Bouzourdaz (@hbouzourdaz) — Physics Teacher & Full-Stack Developer.

Kernel, persistent file system, window manager, terminal with a real shell, and
thirteen applications — built entirely from scratch in TypeScript with **zero
runtime dependencies**. The only things in `package.json` are Vite and the
TypeScript compiler.

![HakimOS desktop](docs/screenshot-desktop.png)

## Run it

```sh
npm install
npm run dev          # → http://localhost:5173
```

Production build (static files, host anywhere):

```sh
npm run build        # outputs dist/ (~42 KB JS gzipped)
npm run preview      # → http://localhost:4173
```

## About HakimOS

This isn't just an operating system — it's a portfolio. Every component showcases
full-stack development skills, from the kernel to the applications. Built to
demonstrate expertise in:

- **Frontend**: JavaScript, TypeScript, React, Vue, HTML/CSS
- **Backend**: Node.js, Python, PHP, Express
- **Mobile**: React Native, Flutter
- **Design**: Material UI, Tailwind CSS, Figma

## What's inside

| Layer | What it does |
|---|---|
| **Kernel** (`src/core/kernel.ts`) | App registry, process table with PIDs, launch/kill lifecycle, system power actions |
| **VFS** (`src/core/vfs.ts`) | Full virtual file system held in memory, persisted to IndexedDB (localStorage fallback). Files survive reboots |
| **HakimWM** (`src/ui/wm.ts`) | Dragging, 8-direction resizing, edge snapping (left/right halves, top to maximize) with live preview, minimize/maximize animations, focus and z-order |
| **Shell UI** (`src/ui/`) | Boot sequence, lock screen, shutdown screen, desktop with icons and wallpapers, taskbar with tray + calendar, start menu with app/file search, context menus, dialogs, toast notifications |

### Applications

- **Terminal (HakimTerm/fsh)** — a real shell with portfolio commands: `profile`, `skills`, `projects`, `contact`, `cv`
- **Portfolio** — full portfolio app with links, projects, and CV info
- **About** — dedicated profile, skills, projects, and contact center
- **Files** — grid/list views, breadcrumbs, cut/copy/paste across windows
- **Scribe** — text editor with line numbers, dirty tracking, Ctrl+S
- **Voyage** — browser that renders `.html` files from the VFS
- **Paint** — pen/eraser/shapes/flood-fill/eyedropper, undo/redo
- **Calculator** — hand-written expression parser (no `eval`), history tape
- **Viewer** — image viewer with zoom and *set as wallpaper*
- **Keys** — two-octave WebAudio synth piano
- **Minesweeper** & **Snake** — first-click-safe sweeping; high scores persist
- **System Monitor** — process table with End-task, CPU/heap charts, FPS
- **Settings** — themes (dark/light), accent colors, wallpapers, identity

### Portfolio Features

```
profile                       # Show Hakim's profile
skills                        # List technical skills
projects                      # List all projects
contact                       # Show contact information
cv                            # Show CV/resume summary
portfolio                     # Open the Portfolio app
```

### Things to try

```
neofetch                      # system info with ASCII art
echo "hi" > ~/notes.txt       # then find it in Files
ls /bin | grep e              # pipes work
tree ~                        # the whole home directory
open ~/Pictures/aurora.svg    # opens the Viewer
js [1,2,3].map(x => x*2)      # inline JavaScript
```

- Open the **About** app to see full profile, skills, and projects
- Open the **Portfolio** app to browse all links organized by category
- Explore `~/Documents` to see CV, projects, and links files
- Drag a window against the screen edges to snap it
- `Ctrl+Alt+T` opens a terminal anywhere
- Reload the tab: your files, wallpaper, history and high scores persist

## Architecture notes

- Everything is DOM + CSS; no canvas-rendered UI, no frameworks. A ~40-line
  `h()` helper builds all UI.
- The whole FS tree lives in memory for synchronous reads; every mutation
  debounces a persist into a single IndexedDB record.
- Apps are plain manifests: `{ id, name, icon, window, launch(ctx) }`. The
  kernel creates the window, the app renders into `ctx.root` and registers
  cleanups with `ctx.onClose()`.
- All icons are inline SVG — no emoji or icon-font dependencies, renders the
  same everywhere.

![Start menu](docs/screenshot-startmenu.png)

---

Built from an empty directory by an AI — kernel to cowsay, in one session.

Portfolio by Hakim Bouzourdaz — hbouzourdaz@gmail.com
