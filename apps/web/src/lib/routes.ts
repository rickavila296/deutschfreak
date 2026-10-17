// Page addresses of the web app (decision 0028). Pages build links only through these helpers.

export const routes = {
  home: '/',
  learn: '/learn',
  /** A part section on the German Map: A1.1 → /learn#a1-1. */
  part: (code: string) => `/learn#${code.toLowerCase().replaceAll('.', '-')}`,
  unit: (slug: string) => `/learn/units/${encodeURIComponent(slug)}`,
  lesson: (slug: string) => `/learn/lessons/${encodeURIComponent(slug)}`,
} as const;

export interface NavItem {
  label: string;
  href: string;
}

// Primary navigation (FLOW-NAV-001, DESIGN-UI-002). Items are added as their pages are built, in this order:
// Learn, Browse, Vocabulary, Pronunciation, Germany, Progress. Practice is not listed until its hub exists.
export const primaryNav: readonly NavItem[] = [{ label: 'Learn', href: routes.learn }];

const repository = 'https://github.com/rickavila296/deutschfreak';

export interface FooterGroup {
  heading: string;
  links: readonly NavItem[];
}

// Footer groups of DESIGN-UI-005. Only links with a destination today are listed; Browse, Vocabulary, Germany,
// Documentation, Contribute, Roadmap, Licences, Content guidelines, Discussion and Changelog are added when their
// pages or files exist (FLOW-OQ-08). A group with no links is not shown.
export const footerGroups: readonly FooterGroup[] = [
  { heading: 'DeutschFreak', links: [{ label: 'Learn', href: routes.learn }] },
  {
    heading: 'Project',
    links: [
      { label: 'GitHub', href: repository },
      { label: 'Report an issue', href: `${repository}/issues` },
    ],
  },
  { heading: 'Community', links: [] },
];

/** True when `path` is `href` or a page below it, so /learn/lessons/x marks Learn as the current section. */
export function isCurrentSection(path: string, href: string): boolean {
  if (href === routes.home) return path === routes.home;
  return path === href || path.startsWith(`${href}/`);
}
