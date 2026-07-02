/**
 * Link — opens a URL in the browser.
 * Used for project shortcuts in the start menu.
 */
import { kernel, AppManifest, AppContext } from '../core/kernel';
import { icons } from '../icons';

const svg = (inner: string, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="4" fill="${color}"/>
    ${inner}
  </svg>`;

const LINK_ICONS: Record<string, string> = {
  quiz: svg('<path d="M8 8h2v2H8zm0 4h2v2H8zm4-4h2v2h-2zm0 4h2v2h-2z" fill="#fff"/><path d="M12 4a8 8 0 100 16 8 8 0 000-16z" stroke="#fff" stroke-width="1.5" fill="none"/>', '#3b82f6'),
  local_library: svg('<path d="M4 19V5c0-1 .5-2 2-2h5v18H6c-1.5 0-2-1-2-2zm14-16h-5v18h5c1.5 0 2-1 2-2V5c0-1-.5-2-2-2z" fill="#fff" opacity="0.9"/>', '#8b5cf6'),
  science: svg('<circle cx="9" cy="9" r="2" fill="#fff"/><circle cx="15" cy="15" r="2" fill="#fff"/><path d="M9 9l6 6M15 9l-6 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>', '#06b6d4'),
  backpack: svg('<rect x="6" y="4" width="12" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M9 4v-1M15 4v-1M9 8h6M9 12h6" stroke="' + '#10b981' + '" stroke-width="1.5" stroke-linecap="round"/>', '#10b981'),
  workspace_premium: svg('<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.3L12 15l-4.9 3 .9-5.3-4-3.9 5.5-.8z" fill="#fff"/>', '#f59e0b'),
  task_alt: svg('<path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '#22c55e'),
  check_circle: svg('<circle cx="12" cy="12" r="7" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M8 12.5l3 3 5-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '#6366f1'),
  grading: svg('<rect x="4" y="4" width="16" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M7 8h10M7 12h10M7 16h6" stroke="' + '#ec4899' + '" stroke-width="1.5" stroke-linecap="round"/>', '#ec4899'),
  fact_check: svg('<rect x="4" y="4" width="16" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M8 12l3 3 5-6" stroke="' + '#f97316' + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '#f97316'),
  print: svg('<rect x="6" y="2" width="12" height="6" fill="#fff" opacity="0.9"/><rect x="4" y="8" width="16" height="8" rx="1" fill="#fff"/><rect x="6" y="14" width="12" height="6" fill="#fff" opacity="0.9"/>', '#8b5cf6'),
  data_object: svg('<circle cx="12" cy="6" r="2.5" fill="#fff"/><circle cx="12" cy="18" r="2.5" fill="#fff"/><path d="M12 8.5v7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>', '#64748b'),
  badge: svg('<rect x="5" y="3" width="14" height="18" rx="2" fill="#fff" opacity="0.9"/><circle cx="12" cy="10" r="3" fill="' + '#3b82f6' + '"/>', '#3b82f6'),
  web: svg('<circle cx="12" cy="12" r="8" stroke="#fff" stroke-width="1.5" fill="none"/><ellipse cx="12" cy="12" rx="3.5" ry="8" stroke="#fff" stroke-width="1.2" fill="none"/><path d="M4 12h16" stroke="#fff" stroke-width="1.2"/>', '#10b981'),
  layers: svg('<path d="M12 4L3 9l9 5 9-5-9-5z" fill="#fff" opacity="0.9"/><path d="M3 14l9 5 9-5" stroke="#fff" stroke-width="1.5" fill="none"/>', '#8b5cf6'),
  account_circle: svg('<circle cx="12" cy="8" r="4" fill="#fff"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6" fill="#fff" opacity="0.9"/>', '#f59e0b'),
  masks: svg('<circle cx="8" cy="10" r="3" fill="#fff" opacity="0.9"/><circle cx="16" cy="10" r="3" fill="#fff" opacity="0.9"/><path d="M8 13c0 3 4 5 4 5s4-2 4-5" fill="#fff" opacity="0.7"/>', '#ef4444'),
  terminal2: svg('<rect x="3" y="5" width="18" height="14" rx="2" fill="#fff" opacity="0.9"/><path d="M7 10l3 2-3 2" stroke="' + '#3b82f6' + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M13 14h4" stroke="' + '#3b82f6' + '" stroke-width="1.5" stroke-linecap="round"/>', '#3b82f6'),
  inventory_2: svg('<rect x="4" y="4" width="16" height="16" rx="2" fill="#fff" opacity="0.9"/><path d="M8 8h8M8 12h8M8 16h4" stroke="' + '#10b981' + '" stroke-width="1.5" stroke-linecap="round"/>', '#10b981'),
  stars: svg('<path d="M12 3l2 4.5 5 .7-3.6 3.5.8 5L12 14l-4.2 2.7.8-5L5 8.2l5-.7z" fill="#fff"/>', '#f59e0b'),
};

export function createLinkApp(id: string, name: string, url: string, iconName: string): AppManifest {
  return {
    id,
    name,
    icon: LINK_ICONS[iconName] ?? icons.browser,
    description: url,
    category: 'Projects',
    window: { width: 100, height: 100, minWidth: 100, minHeight: 100 },
    launch(_ctx: AppContext) {
      void kernel.launch('browser', { url });
      setTimeout(() => kernel.kill(_ctx.pid), 100);
    },
  };
}
