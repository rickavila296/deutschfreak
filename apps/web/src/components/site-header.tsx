import { routes } from '../lib/routes.ts';
import { PrimaryNav } from './primary-nav.tsx';

// DESIGN-UI-001: the wordmark at the left (the name in Inter 700, deep ink, until a logo is approved), then the
// primary navigation. Login and sign-up join the header with accounts in Phase 5.
export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-white">
      <div className="mx-auto flex max-w-page items-center justify-between gap-6 px-4 py-2 md:px-6 lg:px-8">
        <a href={routes.home} className="flex min-h-11 items-center rounded-sm text-h3 font-bold text-ink">
          DeutschFreak
        </a>
        <PrimaryNav />
      </div>
    </header>
  );
}
