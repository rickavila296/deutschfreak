'use client';

import { useId, useState, type ReactNode } from 'react';

interface MobileMenuProps {
  children: ReactNode;
  openIcon: ReactNode;
  closeIcon: ReactNode;
}

// The compact mobile menu (DESIGN-UI-004): a button with a visible label that shows or hides the navigation.
// Keyboard operable (TRD-A11Y-02); Escape closes it and returns focus to the button. The parent remounts it with a
// new key on navigation, so it starts closed on every page.
export function MobileMenu({ children, openIcon, closeIcon }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          document.getElementById(`${menuId}-button`)?.focus();
        }
      }}
    >
      <button
        id={`${menuId}-button`}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 min-w-11 items-center gap-2 rounded-md px-3 text-body font-medium text-ink"
      >
        {open ? closeIcon : openIcon}
        Menu
      </button>
      <div id={menuId} hidden={!open} className="absolute inset-x-0 border-b border-border bg-white px-4 py-2">
        {children}
      </div>
    </div>
  );
}
