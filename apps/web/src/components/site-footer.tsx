import { footerGroups } from '../lib/routes.ts';

// DESIGN-UI-005 and FLOW-NAV-005: link groups and the line "Open-source German learning". Groups without a link
// yet are left out.
export function SiteFooter() {
  const groups = footerGroups.filter((group) => group.links.length > 0);
  return (
    <footer className="border-t border-border bg-paper">
      <div className="mx-auto max-w-page px-4 py-12 md:px-6 lg:px-8">
        <p className="text-body font-semibold text-ink">Open-source German learning</p>
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {groups.map((group) => {
            const headingId = `footer-${group.heading.toLowerCase()}`;
            return (
              <section key={group.heading} aria-labelledby={headingId}>
                <h2 id={headingId} className="text-small font-semibold text-ink">
                  {group.heading}
                </h2>
                <ul className="mt-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex min-h-11 items-center rounded-sm text-small text-blue-text underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
