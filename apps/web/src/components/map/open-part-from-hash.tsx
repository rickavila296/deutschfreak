'use client';

import { useEffect } from 'react';

/** Opens the part section named in the address (/learn#a1-3), on load and when the fragment changes (decision 0028). */
export function openPartFromHash(hash: string, root: ParentNode = document): void {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return;
  const target = root.querySelector(`details[id="${CSS.escape(id)}"]`);
  if (target instanceof HTMLDetailsElement && !target.open) {
    target.open = true;
    target.scrollIntoView();
  }
}

// Browsers scroll to a closed <details> but do not open it, so the part a link points to would stay collapsed.
export function OpenPartFromHash() {
  useEffect(() => {
    const open = () => openPartFromHash(window.location.hash);
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
