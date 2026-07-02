/**
 * Portfolio — Hakim's personal portfolio with all links, projects and CV info.
 * Full integration from the old portfolio site (hbouzourdaz.space).
 */
import { h } from '../core/utils';
import { kernel, AppManifest, AppContext } from '../core/kernel';
import { icons } from '../icons';
import { t, getLang, setLang, dir } from '../core/i18n';
import type { Lang } from '../core/i18n';

interface LinkItem {
  icon: string;
  titleKey: string;
  descKey: string;
  url: string;
  color?: string;
}

interface TabDef {
  id: string;
  labelKey: string;
  icon: string;
  links: LinkItem[];
}

const TABS: TabDef[] = [
  {
    id: 'edu',
    labelKey: 'tab_edu',
    icon: 'menu_book',
    links: [
      { icon: 'quiz', titleKey: 'link_exam_title', descKey: 'link_exam_desc', url: 'https://exam-dz.vercel.app/', color: '#3b82f6' },
      { icon: 'local_library', titleKey: 'link_tutor_title', descKey: 'link_tutor_desc', url: 'https://hakim-tutor.vercel.app/', color: '#8b5cf6' },
      { icon: 'science', titleKey: 'link_physics_title', descKey: 'link_physics_desc', url: 'https://physics-blog.vercel.app/', color: '#06b6d4' },
      { icon: 'backpack', titleKey: 'link_cem_title', descKey: 'link_cem_desc', url: 'https://cemdz.netlify.app/', color: '#10b981' },
      { icon: 'workspace_premium', titleKey: 'link_bem_title', descKey: 'link_bem_desc', url: 'https://bem2026.netlify.app/', color: '#f59e0b' },
      { icon: 'biotech', titleKey: 'link_physetif_title', descKey: 'link_physetif_desc', url: 'https://phy-setif.vercel.app/', color: '#14b8a6' },
      { icon: 'menu_book', titleKey: 'link_phyblog_title', descKey: 'link_phyblog_desc', url: 'https://physic-setif.blogspot.com/', color: '#ef4444' },
      { icon: 'task_alt', titleKey: 'link_7al_title', descKey: 'link_7al_desc', url: 'https://7al.vercel.app/', color: '#22c55e' },
      { icon: 'check_circle', titleKey: 'link_sahel_title', descKey: 'link_sahel_desc', url: 'https://sahel-three.vercel.app/', color: '#6366f1' },
    ],
  },
  {
    id: 'school',
    labelKey: 'tab_school',
    icon: 'domain',
    links: [
      { icon: 'grading', titleKey: 'link_grades_title', descKey: 'link_grades_desc', url: 'https://hajzdz.vercel.app/', color: '#ec4899' },
      { icon: 'fact_check', titleKey: 'link_absence_title', descKey: 'link_absence_desc', url: 'https://dzabsence.vercel.app/', color: '#f97316' },
      { icon: 'print', titleKey: 'link_fet_title', descKey: 'link_fet_desc', url: 'https://fet-print.vercel.app/', color: '#8b5cf6' },
      { icon: 'data_object', titleKey: 'link_schoolhb_title', descKey: 'link_schoolhb_desc', url: 'https://github.com/hbouzourdaz/SchoolHb', color: '#64748b' },
    ],
  },
  {
    id: 'personal',
    labelKey: 'tab_personal',
    icon: 'language',
    links: [
      { icon: 'badge', titleKey: 'link_port1_title', descKey: 'link_port1_desc', url: 'https://hbouzourdaz.netlify.app/', color: '#3b82f6' },
      { icon: 'web', titleKey: 'link_intro_title', descKey: 'link_intro_desc', url: 'https://bouzourdaz.vercel.app/', color: '#10b981' },
      { icon: 'layers', titleKey: 'link_port21_title', descKey: 'link_port21_desc', url: 'https://hbouzourdaz21.vercel.app/', color: '#8b5cf6' },
      { icon: 'account_circle', titleKey: 'link_ana_title', descKey: 'link_ana_desc', url: 'https://anadz.netlify.app/', color: '#f59e0b' },
      { icon: 'masks', titleKey: 'link_izmawen_title', descKey: 'link_izmawen_desc', url: 'https://izmawen.vercel.app/', color: '#ef4444' },
    ],
  },
  {
    id: 'tech',
    labelKey: 'tab_tech',
    icon: 'rocket_launch',
    links: [
      { icon: 'terminal', titleKey: 'link_hakimtech_title', descKey: 'link_hakimtech_desc', url: 'https://hakim-tech.vercel.app/', color: '#3b82f6' },
      { icon: 'inventory_2', titleKey: 'link_aiosoft_title', descKey: 'link_aiosoft_desc', url: 'https://aiosoft.netlify.app/', color: '#10b981' },
      { icon: 'stars', titleKey: 'link_nojom_title', descKey: 'link_nojom_desc', url: 'https://nojom.netlify.app/', color: '#f59e0b' },
      { icon: 'computer', titleKey: 'link_hakimtech_title', descKey: 'HakimOS — This OS!', url: '#', color: '#7c6cff' },
    ],
  },
  {
    id: 'contact',
    labelKey: 'tab_contact',
    icon: 'alternate_email',
    links: [
      { icon: 'code', titleKey: 'link_github_title', descKey: 'link_github_desc', url: 'https://github.com/hbouzourdaz', color: '#64748b' },
      { icon: 'mail', titleKey: 'link_email_title', descKey: 'link_email_desc', url: 'mailto:hbouzourdaz@gmail.com', color: '#ef4444' },
      { icon: 'send', titleKey: 'link_telegram_title', descKey: 'link_telegram_desc', url: 'https://t.me/h_bouzourdaz', color: '#3b82f6' },
    ],
  },
];

const STATS = [
  { value: '+5', icon: 'work_history' },
  { value: '20+', icon: 'dashboard' },
  { value: 'M2', icon: 'school' },
];

const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: 'kab', label: 'Taqbaylit', flag: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Berber_flag.svg' },
  { id: 'ar', label: 'العربية', flag: 'https://flagcdn.com/w40/dz.png' },
  { id: 'fr', label: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  { id: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
];

function launchPortfolio(ctx: AppContext) {
  let activeTab = 'edu';
  let currentLang = getLang();

  const content = h('div', { class: 'portfolio-content' });

  function render() {
    content.innerHTML = '';

    // Language selector
    const langBar = h('div', { class: 'portfolio-lang-bar' });
    for (const lang of LANGS) {
      const btn = h('button', {
        class: `portfolio-lang-btn${lang.id === currentLang ? ' active' : ''}`,
        onclick: () => { currentLang = lang.id; setLang(lang.id); render(); },
      },
        h('img', { class: 'portfolio-lang-flag', src: lang.flag, alt: lang.label }),
        h('span', null, lang.label),
      );
      langBar.append(btn);
    }

    // Profile header (centered)
    const profile = h('div', { class: 'portfolio-profile centered' },
      h('img', { class: 'portfolio-avatar', src: '/avatar.png', alt: 'Hakim BOUZOURDAZ' }),
      h('h1', { class: 'portfolio-name' }, t('name')),
      h('p', { class: 'portfolio-handle' }, '@hbouzourdaz'),
      h('p', { class: 'portfolio-bio' }, t('bio')),
    );

    // Stats row
    const statsRow = h('div', { class: 'portfolio-stats' });
    const statLabels = [t('stat_experience'), t('stat_projects'), t('stat_degree')];
    for (let i = 0; i < STATS.length; i++) {
      const s = STATS[i];
      statsRow.append(
        h('div', { class: 'portfolio-stat' },
          h('span', { class: 'material-symbols-rounded portfolio-stat-icon' }, s.icon),
          h('span', { class: 'portfolio-stat-value' }, s.value),
          h('span', { class: 'portfolio-stat-label' }, statLabels[i]),
        )
      );
    }

    // Tabs
    const tabsBar = h('div', { class: 'portfolio-tabs' });
    for (const tab of TABS) {
      const btn = h('button', {
        class: `portfolio-tab${tab.id === activeTab ? ' active' : ''}`,
        onclick: () => { activeTab = tab.id; render(); },
      },
        h('span', { class: 'material-symbols-rounded' }, tab.icon),
        h('span', null, t(tab.labelKey)),
      );
      tabsBar.append(btn);
    }

    // Links
    const tab = TABS.find((t) => t.id === activeTab);
    const linksEl = h('div', { class: 'portfolio-links' });
    if (tab) {
      for (const link of tab.links) {
        const card = h('div', {
          class: 'portfolio-link',
          onclick: () => {
            if (link.url && link.url !== '#') void kernel.launch('browser', { url: link.url });
          },
        },
          h('span', { class: 'material-symbols-rounded portfolio-link-icon', style: { background: link.color || '#64748b' } }, link.icon),
          h('div', { class: 'portfolio-link-text' },
            h('div', { class: 'portfolio-link-title' }, t(link.titleKey)),
            h('div', { class: 'portfolio-link-desc' }, t(link.descKey)),
          ),
          h('span', { class: 'portfolio-link-arrow material-symbols-rounded' }, 'arrow_forward'),
        );
        linksEl.append(card);
      }
    }

    // Footer
    const footer = h('div', { class: 'portfolio-footer' },
      h('span', null, `${t('footer_made')} ${t('footer_by')} `),
      h('strong', null, '🇩🇿'),
    );

    content.append(langBar, profile, statsRow, tabsBar, linksEl, footer);
  }

  render();
  const d = dir();
  const root = h('div', { class: 'portfolio', dir: d }, content);
  ctx.root.append(root);
}

export const portfolioApp: AppManifest = {
  id: 'portfolio',
  name: 'Portfolio',
  icon: icons.portfolio,
  description: 'Hakim Bouzourdaz — links, projects & CV',
  category: 'System',
  window: { width: 420, height: 640, minWidth: 320, minHeight: 400 },
  launch: launchPortfolio,
};
