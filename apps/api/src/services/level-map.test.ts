import type { LevelMapRow } from '@deutschfreak/db';
import { describe, expect, it } from 'vitest';
import { buildLevelMap } from './level-map.ts';

const row = (over: Partial<LevelMapRow>): LevelMapRow => ({
  levelCode: 'A1',
  levelTitle: 'A1',
  partCode: 'A1.1',
  partTitle: 'Part one',
  partTagline: 'Tagline one',
  partDescriptionEn: null,
  unitCode: 'A1.1.U01',
  unitSlug: 'unit-one',
  unitTitle: 'Unit one',
  unitSubtitleEn: 'Subtitle one',
  unitContextEn: null,
  lessonCode: 'A1.1.U01.L01',
  lessonSlug: 'lesson-one',
  lessonTitle: 'Lesson one',
  lessonArchetypes: ['conversation'],
  lessonStatus: 'published',
  objectiveCode: 'A1.1.U01.L01.O1',
  objectiveCanDoEn: 'Can greet',
  objectiveSkill: 'spoken_interaction',
  ...over,
});

describe('buildLevelMap (TRD-API-02)', () => {
  it('returns undefined when there are no rows (unknown level)', () => {
    expect(buildLevelMap([])).toBeUndefined();
  });

  it('nests rows into parts, units and lessons in row order, objectives under their lesson', () => {
    const map = buildLevelMap([
      row({}),
      row({ objectiveCode: 'A1.1.U01.L01.O2', objectiveCanDoEn: 'Can say goodbye' }),
      row({
        lessonCode: 'A1.1.U01.L02',
        lessonSlug: 'lesson-two',
        lessonStatus: 'planned',
        objectiveCode: 'A1.1.U01.L02.O1',
      }),
      row({
        unitCode: 'A1.1.U02',
        unitSlug: 'unit-two',
        lessonCode: 'A1.1.U02.L01',
        lessonSlug: 'lesson-three',
        objectiveCode: null,
        objectiveCanDoEn: null,
        objectiveSkill: null,
      }),
      row({
        partCode: 'A1.2',
        partTitle: 'Part two',
        unitCode: 'A1.2.U01',
        unitSlug: 'unit-three',
        lessonCode: 'A1.2.U01.L01',
        lessonSlug: 'lesson-four',
        objectiveCode: 'A1.2.U01.L01.O1',
      }),
    ]);
    expect(map?.level).toEqual({ code: 'A1', title: 'A1' });
    expect(map?.parts.map((p) => p.code)).toEqual(['A1.1', 'A1.2']);
    const [u1, u2] = map!.parts[0]!.units;
    expect(u1!.lessons.map((l) => [l.code, l.status])).toEqual([
      ['A1.1.U01.L01', 'published'],
      ['A1.1.U01.L02', 'planned'],
    ]);
    expect(u1!.lessons[0]!.objectives.map((o) => o.code)).toEqual(['A1.1.U01.L01.O1', 'A1.1.U01.L01.O2']);
    expect(u2!.lessons[0]!.objectives).toEqual([]);
    expect(map!.parts[1]!.units[0]!.lessons[0]!.code).toBe('A1.2.U01.L01');
  });

  it('carries the part description and unit context, null when there is none (decision 0030)', () => {
    const map = buildLevelMap([
      row({ partDescriptionEn: 'Part copy.', unitContextEn: 'A situation.' }),
      row({ unitCode: 'A1.1.U06', unitSlug: 'close-out', lessonCode: 'A1.1.U06.L01', lessonSlug: 'lesson-six' }),
    ]);
    expect(map!.parts[0]!.descriptionEn).toBe('Part copy.');
    expect(map!.parts[0]!.units.map((u) => u.contextEn)).toEqual(['A situation.', null]);
  });

  it('treats a row that breaks the response schema as a server fault, not a client error', () => {
    expect(() => buildLevelMap([row({ lessonStatus: 'bogus' })])).toThrow(/response schema/);
    expect(() => buildLevelMap([row({ lessonSlug: 'Not A Slug' })])).toThrow(/response schema/);
  });
});
