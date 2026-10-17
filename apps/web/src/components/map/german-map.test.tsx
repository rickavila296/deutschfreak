// @vitest-environment jsdom
import type { LevelMapResponse, MapLesson } from '@deutschfreak/validation';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { GermanMap } from './german-map.tsx';
import { openPartFromHash } from './open-part-from-hash.tsx';

afterEach(cleanup);

// A small map in the API's shape: one live lesson, planned lessons, a checkpoint and a close-out unit.
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
    objectives: [{ code: `${code}.O1`, canDoEn: `Objective of ${slug}`, skill: 'spoken_interaction' }],
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
            lesson('A1.1.U01.L02', 'planned-lesson', 'planned', ['grammar']),
            lesson('A1.1.U01.L03', 'unit-checkpoint', 'planned', ['checkpoint']),
          ],
        },
        {
          code: 'A1.1.U06',
          slug: 'close-out',
          title: 'Close-out',
          subtitleEn: 'Part review',
          lessons: [lesson('A1.1.U06.L01', 'retired-lesson', 'retired', ['integrated'])],
        },
      ],
    },
    {
      code: 'A1.2',
      title: 'Part two',
      tagline: 'Tagline two.',
      units: [
        {
          code: 'A1.2.U01',
          slug: 'unit-two',
          title: 'Unit two',
          subtitleEn: 'Subtitle two',
          lessons: [lesson('A1.2.U01.L01', 'later-lesson', 'planned', ['vocabulary'])],
        },
      ],
    },
  ],
};

const row = (code: string) => {
  const item = screen.getByText(code).closest('li');
  if (!item) throw new Error(`no row for ${code}`);
  return item;
};

describe('German Map (FLOW-LEARN-001, DESIGN-UI-080 to 085)', () => {
  it('shows every part, unit and lesson with ID, title, objective and archetype', () => {
    render(<GermanMap map={map} />);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'A1.1 Part one',
      'A1.2 Part two',
    ]);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const live = within(row('A1.1.U01.L01'));
    expect(live.getByText('Title live-lesson')).toBeTruthy();
    expect(live.getByText('Objective of live-lesson')).toBeTruthy();
    expect(live.getByText('Conversation')).toBeTruthy();
  });

  it('links a live lesson to its page', () => {
    render(<GermanMap map={map} />);
    const link = within(row('A1.1.U01.L01')).getByRole('link');
    expect(link.getAttribute('href')).toBe('/learn/lessons/live-lesson');
    expect(within(row('A1.1.U01.L01')).queryByText('Planned')).toBeNull();
  });

  it('marks planned and retired lessons "Planned" and makes them not interactive (DESIGN-UI-082)', () => {
    render(<GermanMap map={map} />);
    for (const code of ['A1.1.U01.L02', 'A1.1.U01.L03', 'A1.1.U06.L01', 'A1.2.U01.L01']) {
      const planned = row(code);
      expect(within(planned).getByText('Planned')).toBeTruthy();
      expect(within(planned).queryByRole('link')).toBeNull();
      expect(planned.querySelector('[tabindex], button, input')).toBeNull();
    }
    expect(screen.queryByRole('link', { name: /planned-lesson/ })).toBeNull();
  });

  it('marks checkpoint lessons and the close-out unit as checkpoints (DESIGN-UI-085)', () => {
    render(<GermanMap map={map} />);
    expect(within(row('A1.1.U01.L03')).getByText('Checkpoint')).toBeTruthy();
    expect(within(row('A1.1.U01.L01')).queryByText('Checkpoint')).toBeNull();
    const closeOut = screen.getByRole('region', { name: 'Close-out' });
    expect(within(closeOut).getAllByText('Checkpoint').length).toBeGreaterThan(0);
    expect(within(screen.getByRole('region', { name: 'Unit one' })).queryAllByText('Checkpoint')).toHaveLength(1);
  });

  it('tags the live part "Available now" and opens it; other parts are planned and closed (DESIGN-UI-084)', () => {
    const { container } = render(<GermanMap map={map} />);
    const [first, second] = container.querySelectorAll('details');
    expect(first?.id).toBe('a1-1');
    expect(first?.open).toBe(true);
    expect(within(first!.querySelector('summary')!).getByText('Available now')).toBeTruthy();
    expect(second?.id).toBe('a1-2');
    expect(second?.open).toBe(false);
    expect(within(second!.querySelector('summary')!).getByText('Planned')).toBeTruthy();
  });

  it('links units to their pages and marks German titles with lang="de"', () => {
    render(<GermanMap map={map} />);
    const unit = screen.getByRole('link', { name: 'Unit one' });
    expect(unit.getAttribute('href')).toBe('/learn/units/unit-one');
    expect(unit.getAttribute('lang')).toBe('de');
    expect(screen.getByText('Title live-lesson').getAttribute('lang')).toBe('de');
  });
});

describe('part anchors (decision 0028)', () => {
  it('opens the closed part named in the address fragment', () => {
    const { container } = render(<GermanMap map={map} />);
    const second = container.querySelector<HTMLDetailsElement>('details#a1-2');
    Element.prototype.scrollIntoView = () => {};
    expect(second?.open).toBe(false);
    openPartFromHash('#a1-2', container);
    expect(second?.open).toBe(true);
    openPartFromHash('#no-such-part', container);
    openPartFromHash('', container);
  });
});
