/** Registers every built-in app with the kernel. */
import { kernel } from '../core/kernel';
import { terminalApp } from './terminal';
import { filesApp } from './files';
import { editorApp } from './editor';
import { browserApp } from './browser';
import { paintApp } from './paint';
import { calculatorApp } from './calculator';
import { viewerApp } from './viewer';
import { pianoApp } from './piano';
import { minesweeperApp } from './minesweeper';
import { snakeApp } from './snake';
import { monitorApp } from './monitor';
import { settingsApp } from './settings-app';
import { welcomeApp } from './welcome';
import { portfolioApp } from './portfolio';
import { aboutApp } from './about';
import { createLinkApp } from './link';

const PROJECT_LINKS = [
  createLinkApp('link-exam', 'Exam DZ', 'https://exam-dz.vercel.app/', 'quiz'),
  createLinkApp('link-tutor', 'Hakim Tutor', 'https://hakim-tutor.vercel.app/', 'local_library'),
  createLinkApp('link-physics', 'Physics Blog', 'https://physics-blog.vercel.app/', 'science'),
  createLinkApp('link-cem', 'CEM Grades', 'https://cemdz.netlify.app/', 'backpack'),
  createLinkApp('link-bem', 'BEM 2026', 'https://bem2026.netlify.app/', 'workspace_premium'),
  createLinkApp('link-7al', '7al Archive', 'https://7al.vercel.app/', 'task_alt'),
  createLinkApp('link-sahel', 'Sahhel', 'https://sahel-three.vercel.app/', 'check_circle'),
  createLinkApp('link-grades', 'Grades Entry', 'https://hajzdz.vercel.app/', 'grading'),
  createLinkApp('link-absence', 'Absence System', 'https://dzabsence.vercel.app/', 'fact_check'),
  createLinkApp('link-fet', 'FET Print', 'https://fet-print.vercel.app/', 'print'),
  createLinkApp('link-schoolhb', 'SchoolHb', 'https://github.com/hbouzourdaz/SchoolHb', 'data_object'),
  createLinkApp('link-port1', 'Portfolio v1', 'https://hbouzourdaz.netlify.app/', 'badge'),
  createLinkApp('link-personal', 'Personal Site', 'https://bouzourdaz.vercel.app/', 'web'),
  createLinkApp('link-port21', 'Portfolio v21', 'https://hbouzourdaz21.vercel.app/', 'layers'),
  createLinkApp('link-ana', 'Ana DZ', 'https://anadz.netlify.app/', 'account_circle'),
  createLinkApp('link-izmawen', 'Izmawen', 'https://izmawen.vercel.app/', 'masks'),
  createLinkApp('link-hakimtech', 'Hakim Tech', 'https://hakim-tech.vercel.app/', 'terminal'),
  createLinkApp('link-aiosoft', 'AIO Software', 'https://aiosoft.netlify.app/', 'inventory_2'),
  createLinkApp('link-nojom', 'Nojom', 'https://nojom.netlify.app/', 'stars'),
];

export function registerApps() {
  for (const app of [
    terminalApp,
    filesApp,
    editorApp,
    browserApp,
    paintApp,
    calculatorApp,
    viewerApp,
    pianoApp,
    minesweeperApp,
    snakeApp,
    monitorApp,
    settingsApp,
    welcomeApp,
    portfolioApp,
    aboutApp,
    ...PROJECT_LINKS,
  ]) {
    kernel.register(app);
  }
}
