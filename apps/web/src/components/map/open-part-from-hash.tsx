'use client';

import { useEffect } from 'react';

/** Opens the part section named in the address (/learn#a1-3), on load and when the fragment changes (decision 0028). */
export function openPartFromHash(hash: string, root: ParentNode = document): void {
  let id: string;
  try {
    id = decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    // A fragment that is not valid percent-encoding (/learn#%E0) names no part; it must not break the page (review 4
    // finding 2).
    return;
  }
  if (!id) return;
  const part = root.querySelector(`section[id="${CSS.escape(id)}"]`);
  const units = part?.querySelector('details');
  if (part && units instanceof HTMLDetailsElement && !units.open) {
    units.open = true;
    part.scrollIntoView();
  }
}

// Browsers scroll to a part but do not open its collapsed unit list, so the part a link points to would stay closed.
export function OpenPartFromHash() {
  useEffect(() => {
    const open = () => openPartFromHash(window.location.hash);
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
  }, []);
  return null;
}
