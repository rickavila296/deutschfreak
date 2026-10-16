import { describe, expect, it } from 'vitest';
import { A1_EXPECTED_COUNTS, structureFileSchema, validateA1Structure, type StructureFile } from './structure.ts';

// A small, valid tree: 1 part, 1 unit, 2 lessons. Values are placeholders, not curriculum content.
function tree(): StructureFile {
  return {
    level: {
      code: 'A1',
      title: 'Level',
      parts: [
        {
          code: 'A1.1',
          title: 'Part',
          tagline: 'Tagline',
          units: [
            {
              code: 'A1.1.U01',
              title: 'Unit',
              slug: 'unit',
              subtitle_en: 'Subtitle',
              lessons: [
                {
                  code: 'A1.1.U01.L01',
                  title: 'Lesson one',
                  slug: 'lesson-one',
                  archetypes: ['conversation'],
                  mastery_task_en: 'Task',
                  objectives: [{ code: 'A1.1.U01.L01.O1', can_do_en: 'Can do', skill: 'spoken_interaction' }],
                },
                {
                  code: 'A1.1.U01.L02',
                  title: 'Lesson two',
                  slug: 'lesson-two',
                  archetypes: ['grammar', 'vocabulary'],
                  mastery_task_en: 'Task',
                  objectives: [{ code: 'A1.1.U01.L02.O1', can_do_en: 'Can do', skill: 'grammar' }],
                  notes: 'Authoring reference only (TRD-CNT-09)',
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

const firstUnit = (t: StructureFile) => t.level.parts[0]!.units[0]!;
const firstLesson = (t: StructureFile) => firstUnit(t).lessons[0]!;
const issues = (t: unknown) => {
  const r = structureFileSchema.safeParse(t);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe('structureFileSchema (a1.yaml, TRD-CNT-01, TRD-VAL-02)', () => {
  it('accepts a well-formed tree', () => {
    expect(issues(tree())).toEqual([]);
  });

  it('rejects an unknown field (strict, TRD-VAL-02)', () => {
    const t = tree() as unknown as { level: { parts: { units: { lessons: Record<string, unknown>[] }[] }[] } };
    t.level.parts[0]!.units[0]!.lessons[0]!.status = 'published';
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a malformed unit code (A1.1.U1, Spec Stable codes)', () => {
    const t = tree();
    firstUnit(t).code = 'A1.1.U1';
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a lowercase objective code', () => {
    const t = tree();
    firstLesson(t).objectives[0]!.code = 'a1.1.u01.l01.o1';
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a duplicate lesson code', () => {
    const t = tree();
    firstUnit(t).lessons[1]!.code = 'A1.1.U01.L01';
    firstUnit(t).lessons[1]!.objectives[0]!.code = 'A1.1.U01.L01.O2';
    expect(issues(t)).toContain('Duplicate code A1.1.U01.L01');
  });

  it('rejects a lesson code that does not belong to its unit', () => {
    const t = tree();
    firstLesson(t).code = 'A1.1.U02.L01';
    firstLesson(t).objectives[0]!.code = 'A1.1.U02.L01.O1';
    expect(issues(t)).toContain('A1.1.U02.L01 is not inside A1.1.U01');
  });

  it('rejects an objective not named after its home lesson (Spec Stable codes)', () => {
    const t = tree();
    firstLesson(t).objectives[0]!.code = 'A1.1.U01.L02.O2';
    expect(issues(t)).toContain('A1.1.U01.L02.O2 is not inside A1.1.U01.L01');
  });

  it('rejects an unknown archetype', () => {
    const t = tree() as unknown as { level: { parts: { units: { lessons: { archetypes: string[] }[] }[] }[] } };
    t.level.parts[0]!.units[0]!.lessons[0]!.archetypes = ['dance'];
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a lesson with no archetype', () => {
    const t = tree();
    firstLesson(t).archetypes = [];
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a lesson with no objective', () => {
    const t = tree();
    firstLesson(t).objectives = [];
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects an objective with no skill (PLAN-DEC-02, decision 0006)', () => {
    const t = tree() as unknown as {
      level: { parts: { units: { lessons: { objectives: Record<string, unknown>[] }[] }[] }[] };
    };
    delete t.level.parts[0]!.units[0]!.lessons[0]!.objectives[0]!.skill;
    expect(issues(t).length).toBeGreaterThan(0);
  });

  it('rejects a skill outside the eight (Schema enum skill)', () => {
    const t = tree() as unknown as {
      level: { parts: { units: { lessons: { objectives: Record<string, unknown>[] }[] }[] }[] };
    };
    t.level.parts[0]!.units[0]!.lessons[0]!.objectives[0]!.skill = 'speaking';
    expect(issues(t).length).toBeGreaterThan(0);
  });
  it('rejects a unit or lesson without a slug (DB-SLUG-02, decision 0008)', () => {
    const t = tree() as unknown as { level: { parts: { units: Record<string, unknown>[] }[] } };
    delete t.level.parts[0]!.units[0]!.slug;
    expect(issues(t).length).toBeGreaterThan(0);
    const u = tree();
    delete (firstLesson(u) as { slug?: string }).slug;
    expect(issues(u).length).toBeGreaterThan(0);
  });

  it.each(['Lesson-one', 'lesson one', 'lesson_one', 'hallo-und-tschüss', '-lesson', 'lesson--one', 'lesson-'])(
    'rejects the slug %s, which is not lower-case hyphenated ASCII (TRD-CNT-05)',
    (slug) => {
      const t = tree();
      firstLesson(t).slug = slug;
      expect(issues(t).length).toBeGreaterThan(0);
    },
  );

  it('accepts digits in a slug, as in a1-1-abschluss (decision 0008)', () => {
    const t = tree();
    firstLesson(t).slug = 'a1-1-abschluss';
    expect(issues(t)).toEqual([]);
  });

  it('rejects two lessons with the same slug (DB-UQ-02)', () => {
    const t = tree();
    firstUnit(t).lessons[1]!.slug = 'lesson-one';
    expect(issues(t)).toContain('Duplicate lesson slug lesson-one');
  });
});

describe('validateA1Structure (Spec §20: 4 parts, 24 units, 92 lessons)', () => {
  it('expects the counts from Spec §20', () => {
    expect(A1_EXPECTED_COUNTS).toEqual({ parts: 4, units: 24, lessons: 92 });
  });

  it('reports the counts and fails a tree that is too small', () => {
    const result = validateA1Structure(tree());
    expect(result.counts).toEqual({ parts: 1, units: 1, lessons: 2, objectives: 2 });
    expect(result.ok).toBe(false);
    expect(result.problems).toContain('Expected 4 parts, found 1');
  });

  it('reports schema problems instead of counts for invalid data', () => {
    const result = validateA1Structure({ level: {} });
    expect(result.ok).toBe(false);
    expect(result.counts).toBeNull();
    expect(result.problems.length).toBeGreaterThan(0);
  });
});
