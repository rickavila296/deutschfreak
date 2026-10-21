import type { ReactNode } from 'react';

const tones = {
  // DESIGN-COLOR-03: text on a teal fill is deep ink.
  live: 'bg-teal text-ink',
  planned: 'bg-surface text-muted-text',
  checkpoint: 'border border-muted text-ink',
  // A lesson's type is a quiet label, never boxed like the Checkpoint mark (review 4b finding 4, DESIGN-UI-085).
  archetype: 'text-muted-text',
} as const;

/** A status tag (Design §24): always a word, so meaning never rests on colour alone (DESIGN-COLOR-05). */
export function Tag({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-caption ${tones[tone]}`}>{children}</span>
  );
}
