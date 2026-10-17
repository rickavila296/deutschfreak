// @vitest-environment jsdom
import type { LevelMapResponse, MapLesson } from '@deutschfreak/validation';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { findUnit } from './map-rules.ts';
import { UnitPage } from './unit-page.tsx';

afterEach(cleanup);

function lesson(
  code: string,
  slug: string,
  status: MapLesson['status'],
  archetypes: MapLesson['archetypes'],
): MapLesson {
  return {
    code,
    slug,
    title: `Title ${slug}`,
    archetypes,
    status,
    objectives: [{ code: `${code}.O1`, canDoEn: `Objective of ${slug}`, skill: 'reading' }],
  };
}

const map: LevelMapResponse = {
  level: { code: 'A1', title: 'German A1' },
  parts: [
    {
      code: 'A1.1',
      title: 'Part one',
      tagline: 'Tagline one.',
      units: [
        {
          code: 'A1.1.U01',
          slug: 'unit-one',
          title: 'Unit one',
          subtitleEn: 'Subtitle one',
          lessons: [
            lesson('A1.1.U01.L01', 'live-lesson', 'published', ['conversation']),
            lesson('A1.1.U01.L02', 'unit-checkpoint', 'planned', ['checkpoint']),
          ],
        },
      ],
    },
    {
      code: 'A1.2',
      title: 'Part two',
      tagline: 'Tagline two.',
      units: [{ code: 'A1.2.U06', slug: 'close-out', title: 'Close-out', subtitleEn: 'Review', lessons: [] }],
    },
  ],
};

describe('findUnit', () => {
  it('finds a unit and its part by slug, in any part', () => {
    expect(findUnit(map, 'unit-one')?.part.code).toBe('A1.1');
    expect(findUnit(map, 'close-out')?.part.code).toBe('A1.2');
    expect(findUnit(map, 'no-such-unit')).toBeNull();
  });
});

describe('unit page (FLOW-LEARN-003)', () => {
  it('shows the unit title in German, its subtitle and a link back to its part section', () => {
    const found = findUnit(map, 'unit-one')!;
    render(<UnitPage part={found.part} unit={found.unit} />);
    const title = screen.getByRole('heading', { level: 1, name: 'Unit one' });
    expect(title.getAttribute('lang')).toBe('de');
    expect(screen.getByText('Subtitle one')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'A1.1 Part one' }).getAttribute('href')).toBe('/learn#a1-1');
  });

  it('lists the lessons in order; only live ones are links, the checkpoint is marked', () => {
    const found = findUnit(map, 'unit-one')!;
    render(<UnitPage part={found.part} unit={found.unit} />);
    const rows = screen.getAllByRole('listitem');
    expect(rows.map((row) => within(row).getByText(/^A1\.1\.U01\.L0\d$/).textContent)).toEqual([
      'A1.1.U01.L01',
      'A1.1.U01.L02',
    ]);
    expect(within(rows[0]!).getByRole('link').getAttribute('href')).toBe('/learn/lessons/live-lesson');
    expect(within(rows[1]!).queryByRole('link')).toBeNull();
    expect(within(rows[1]!).getByText('Planned')).toBeTruthy();
    expect(within(rows[1]!).getByText('Checkpoint')).toBeTruthy();
  });

  it('marks a close-out unit as a checkpoint (DESIGN-UI-085)', () => {
    const found = findUnit(map, 'close-out')!;
    render(<UnitPage part={found.part} unit={found.unit} />);
    expect(screen.getByText('Checkpoint')).toBeTruthy();
  });
});
