/**
 * About — HakimOS portfolio information center with full CV.
 * Content from the old portfolio site (hbouzourdaz.space).
 */
import { h } from '../core/utils';
import { kernel, AppManifest, AppContext } from '../core/kernel';
import { icons } from '../icons';
import { t, dir } from '../core/i18n';

interface SkillCategory {
  name: string;
  skills: string[];
}

interface Project {
  name: string;
  url: string;
  descKey: string;
  category: string;
}

const SKILLS: SkillCategory[] = [
  { name: 'Frontend', skills: ['HTML/CSS/JS', 'Tailwind CSS', 'React', 'Vue', 'TypeScript'] },
  { name: 'Backend', skills: ['Node.js', 'Python', 'PHP', 'Express'] },
  { name: 'Mobile', skills: ['React Native', 'Flutter'] },
  { name: 'Database', skills: ['MongoDB', 'PostgreSQL', 'Firebase'] },
  { name: 'DevOps', skills: ['Git', 'Docker', 'Vercel', 'Netlify'] },
  { name: 'Other', skills: ['Physics Simulation', 'Research Analysis', 'Teaching'] },
];

const PROJECTS: Project[] = [
  { name: 'Exam DZ', url: 'https://exam-dz.vercel.app/', descKey: 'cv_project_exam_desc', category: 'edu' },
  { name: 'Hakim Tutor', url: 'https://hakim-tutor.vercel.app/', descKey: 'link_tutor_desc', category: 'edu' },
  { name: 'Physics Blog', url: 'https://physics-blog.vercel.app/', descKey: 'link_physics_desc', category: 'edu' },
  { name: 'CEM Grades', url: 'https://cemdz.netlify.app/', descKey: 'link_cem_desc', category: 'edu' },
  { name: 'BEM 2026', url: 'https://bem2026.netlify.app/', descKey: 'link_bem_desc', category: 'edu' },
  { name: '7al Archive', url: 'https://7al.vercel.app/', descKey: 'link_7al_desc', category: 'edu' },
  { name: 'Sahhel', url: 'https://sahel-three.vercel.app/', descKey: 'link_sahel_desc', category: 'edu' },
  { name: 'Grades Entry', url: 'https://hajzdz.vercel.app/', descKey: 'link_grades_desc', category: 'school' },
  { name: 'Absence System', url: 'https://dzabsence.vercel.app/', descKey: 'link_absence_desc', category: 'school' },
  { name: 'FET Print', url: 'https://fet-print.vercel.app/', descKey: 'link_fet_desc', category: 'school' },
  { name: 'SchoolHb', url: 'https://github.com/hbouzourdaz/SchoolHb', descKey: 'link_schoolhb_desc', category: 'school' },
  { name: 'Portfolio v1', url: 'https://hbouzourdaz.netlify.app/', descKey: 'link_port1_desc', category: 'personal' },
  { name: 'Personal Site', url: 'https://bouzourdaz.vercel.app/', descKey: 'link_intro_desc', category: 'personal' },
  { name: 'Portfolio v21', url: 'https://hbouzourdaz21.vercel.app/', descKey: 'link_port21_desc', category: 'personal' },
  { name: 'Ana DZ', url: 'https://anadz.netlify.app/', descKey: 'link_ana_desc', category: 'personal' },
  { name: 'Izmawen', url: 'https://izmawen.vercel.app/', descKey: 'link_izmawen_desc', category: 'personal' },
  { name: 'Hakim Tech', url: 'https://hakim-tech.vercel.app/', descKey: 'link_hakimtech_desc', category: 'tech' },
  { name: 'AIO Software', url: 'https://aiosoft.netlify.app/', descKey: 'link_aiosoft_desc', category: 'tech' },
  { name: 'Nojom', url: 'https://nojom.netlify.app/', descKey: 'link_nojom_desc', category: 'tech' },
  { name: 'HakimOS', url: '#', descKey: 'link_hakimtech_desc', category: 'tech' },
];

const CONTACT = [
  { icon: 'code', label: 'GitHub', value: 'github.com/hbouzourdaz', url: 'https://github.com/hbouzourdaz' },
  { icon: 'mail', label: 'Email', value: 'hbouzourdaz@gmail.com', url: 'mailto:hbouzourdaz@gmail.com' },
  { icon: 'send', label: 'Telegram', value: '@h_bouzourdaz', url: 'https://t.me/h_bouzourdaz' },
  { icon: 'smartphone', label: 'Phone', value: '0549 52 35 94', url: '#' },
  { icon: 'location_on', label: 'Location', value: 'Beni Djemati, Sétif', url: '#' },
];

function launchAbout(ctx: AppContext) {
  let activeSection = 'profile';

  const content = h('div', { class: 'about-content' });

  function renderNav() {
    const nav = h('div', { class: 'about-nav' },
      ...['profile', 'cv', 'skills', 'projects', 'contact'].map((section) =>
        h('button', {
          class: `about-nav-btn${section === activeSection ? ' active' : ''}`,
          onclick: () => { activeSection = section; render(); },
        }, section.charAt(0).toUpperCase() + section.slice(1))
      )
    );
    return nav;
  }

  function renderProfile() {
    return h('div', { class: 'about-section' },
      h('div', { class: 'about-profile-header centered' },
        h('img', { class: 'about-avatar', src: '/avatar.png', alt: 'Hakim' }),
        h('h1', { class: 'about-name' }, t('name')),
        h('p', { class: 'about-handle' }, '@hbouzourdaz'),
      ),
      h('p', { class: 'about-bio' }, t('bio')),
      h('div', { class: 'about-stats' },
        h('div', { class: 'about-stat' },
          h('span', { class: 'about-stat-value' }, '+5'),
          h('span', { class: 'about-stat-label' }, t('stat_experience')),
        ),
        h('div', { class: 'about-stat' },
          h('span', { class: 'about-stat-value' }, '20+'),
          h('span', { class: 'about-stat-label' }, t('stat_projects')),
        ),
        h('div', { class: 'about-stat' },
          h('span', { class: 'about-stat-value' }, 'M2'),
          h('span', { class: 'about-stat-label' }, t('stat_degree')),
        ),
      ),
      h('div', { class: 'about-tags' },
        h('span', { class: 'about-tag' }, t('cv_physic')),
        h('span', { class: 'about-tag' }, t('cv_dev')),
        h('span', { class: 'about-tag' }, t('cv_research')),
      ),
    );
  }

  function renderCV() {
    return h('div', { class: 'about-section' },
      h('h2', { class: 'about-section-title' }, t('cv_title')),
      h('p', { class: 'about-section-subtitle' }, t('cv_subtitle')),

      // Work Experience
      h('h3', { class: 'about-cv-heading' },
        h('span', { class: 'material-symbols-rounded' }, 'business_center'),
        t('cv_work'),
      ),
      h('div', { class: 'about-cv-timeline' },
        h('div', { class: 'about-cv-item' },
          h('div', { class: 'about-cv-dot' }),
          h('div', { class: 'about-cv-content' },
            h('div', { class: 'about-cv-role' }, t('cv_physic')),
            h('div', { class: 'about-cv-date' }, t('cv_work_edu_dept')),
            h('p', { class: 'about-cv-desc' }, t('cv_work_edu_desc')),
          ),
        ),
        h('div', { class: 'about-cv-item' },
          h('div', { class: 'about-cv-dot secondary' }),
          h('div', { class: 'about-cv-content' },
            h('div', { class: 'about-cv-role' }, t('cv_dev')),
            h('div', { class: 'about-cv-date' }, t('cv_work_freelance')),
            h('p', { class: 'about-cv-desc' }, t('cv_work_freelance_desc')),
          ),
        ),
      ),

      // Education
      h('h3', { class: 'about-cv-heading' },
        h('span', { class: 'material-symbols-rounded' }, 'school'),
        t('cv_edu'),
      ),
      h('div', { class: 'about-cv-timeline' },
        h('div', { class: 'about-cv-item' },
          h('div', { class: 'about-cv-dot' }),
          h('div', { class: 'about-cv-content' },
            h('div', { class: 'about-cv-date' }, '2023 - 2024'),
            h('div', { class: 'about-cv-role' }, t('cv_edu_master')),
            h('p', { class: 'about-cv-desc' }, t('cv_edu_master_desc')),
          ),
        ),
        h('div', { class: 'about-cv-item' },
          h('div', { class: 'about-cv-dot secondary' }),
          h('div', { class: 'about-cv-content' },
            h('div', { class: 'about-cv-date' }, '2021 - 2023'),
            h('div', { class: 'about-cv-role' }, t('cv_edu_bachelor')),
            h('p', { class: 'about-cv-desc' }, t('cv_edu_bachelor_desc')),
          ),
        ),
      ),

      // Projects Summary
      h('h3', { class: 'about-cv-heading' },
        h('span', { class: 'material-symbols-rounded' }, 'stars'),
        t('cv_projects'),
      ),
      h('div', { class: 'about-cv-projects' },
        h('div', { class: 'about-cv-project-card' },
          h('div', { class: 'about-cv-project-name' }, 'Exam DZ'),
          h('div', { class: 'about-cv-project-desc' }, t('cv_project_exam_desc')),
        ),
        h('div', { class: 'about-cv-project-card' },
          h('div', { class: 'about-cv-project-name' }, t('link_schoolhb_title')),
          h('div', { class: 'about-cv-project-desc' }, t('cv_project_school_desc')),
        ),
      ),
    );
  }

  function renderSkills() {
    return h('div', { class: 'about-section' },
      h('h2', { class: 'about-section-title' }, t('cv_skills')),
      ...SKILLS.map((cat) =>
        h('div', { class: 'about-skill-category' },
          h('h3', { class: 'about-skill-name' }, cat.name),
          h('div', { class: 'about-skill-tags' },
            ...cat.skills.map((skill) =>
              h('span', { class: 'about-skill-tag' }, skill)
            )
          ),
        )
      ),
    );
  }

  function renderProjects() {
    const categories = [
      { id: 'edu', label: t('tab_edu') },
      { id: 'school', label: t('tab_school') },
      { id: 'personal', label: t('tab_personal') },
      { id: 'tech', label: t('tab_tech') },
    ];
    return h('div', { class: 'about-section' },
      h('h2', { class: 'about-section-title' }, t('stat_projects')),
      ...categories.map((cat) =>
        h('div', { class: 'about-project-category' },
          h('h3', { class: 'about-category-name' }, cat.label),
          ...PROJECTS.filter((p) => p.category === cat.id).map((proj) =>
            h('div', {
              class: 'about-project',
              onclick: () => {
                if (proj.url !== '#') void kernel.launch('browser', { url: proj.url });
              },
            },
              h('span', { class: 'about-project-name' }, proj.name),
              h('span', { class: 'about-project-desc' }, t(proj.descKey)),
            )
          ),
        )
      ),
    );
  }

  function renderContact() {
    return h('div', { class: 'about-section' },
      h('h2', { class: 'about-section-title' }, t('tab_contact')),
      ...CONTACT.map((c) =>
        h('div', {
          class: 'about-contact-item',
          onclick: () => {
            if (c.url !== '#') void kernel.launch('browser', { url: c.url });
          },
        },
          h('span', { class: 'material-symbols-rounded about-contact-icon' }, c.icon),
          h('div', { class: 'about-contact-info' },
            h('div', { class: 'about-contact-label' }, c.label),
            h('div', { class: 'about-contact-value' }, c.value),
          ),
          h('span', { class: 'material-symbols-rounded about-contact-arrow' }, 'arrow_forward'),
        )
      ),
      h('div', { class: 'about-footer' },
        h('span', null, `${t('footer_made')} ${t('footer_by')} `),
        h('strong', null, '🇩🇿'),
      ),
    );
  }

  function render() {
    content.innerHTML = '';
    content.append(renderNav());
    switch (activeSection) {
      case 'profile': content.append(renderProfile()); break;
      case 'cv': content.append(renderCV()); break;
      case 'skills': content.append(renderSkills()); break;
      case 'projects': content.append(renderProjects()); break;
      case 'contact': content.append(renderContact()); break;
    }
  }

  render();
  const d = dir();
  ctx.root.append(h('div', { class: 'about', dir: d }, content));
}

export const aboutApp: AppManifest = {
  id: 'about',
  name: 'About',
  icon: icons.portfolio,
  description: 'Hakim Bouzourdaz — profile, CV & projects',
  category: 'System',
  window: { width: 420, height: 600, minWidth: 320, minHeight: 400 },
  launch: launchAbout,
};
