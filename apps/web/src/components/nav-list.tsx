import { isCurrentSection, type NavItem } from '../lib/routes.ts';

interface NavListProps {
  items: readonly NavItem[];
  currentPath: string;
  /** A row on tablet and desktop, stacked in the mobile menu (DESIGN-UI-004). */
  layout: 'row' | 'stack';
}

// The current section is marked by weight and an underline, not by colour alone (DESIGN-UI-003).
export function NavList({ items, currentPath, layout }: NavListProps) {
  return (
    <ul className={layout === 'row' ? 'flex items-center gap-6' : 'flex flex-col gap-1'}>
      {items.map((item) => {
        const current = isCurrentSection(currentPath, item.href);
        return (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-sm text-body text-ink underline-offset-8 hover:underline ${
                current ? 'font-semibold underline decoration-2' : 'font-normal'
              }`}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
