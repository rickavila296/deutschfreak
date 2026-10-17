'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { primaryNav } from '../lib/routes.ts';
import { MobileMenu } from './mobile-menu.tsx';
import { NavList } from './nav-list.tsx';

// Primary navigation (FLOW-NAV-001, DESIGN-UI-002 to 004): one row from the md breakpoint (tablet and desktop),
// a menu behind a labelled button on mobile.
export function PrimaryNav() {
  const pathname = usePathname() ?? '/';
  return (
    <nav aria-label="Primary">
      <div className="hidden md:block">
        <NavList items={primaryNav} currentPath={pathname} layout="row" />
      </div>
      <div className="md:hidden">
        <MobileMenu
          key={pathname}
          openIcon={<Menu aria-hidden="true" size={20} />}
          closeIcon={<X aria-hidden="true" size={20} />}
        >
          <NavList items={primaryNav} currentPath={pathname} layout="stack" />
        </MobileMenu>
      </div>
    </nav>
  );
}
