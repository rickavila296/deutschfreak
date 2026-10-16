import { z } from 'zod';
import { levelCodeSchema, lessonCodeSchema, objectiveCodeSchema, partCodeSchema, unitCodeSchema } from './codes.ts';

// Schema for packages/content/structure/a1.yaml (TRD-CNT-01). Strict: unknown fields are rejected (TRD-VAL-02).
// Learning-objective skills are not part of the file yet (PLAN-DEC-02).

/** The nine lesson archetypes (Schema enum `lesson_archetype`, Spec §3). */
export const lessonArchetypeSchema = z.enum([
  'conversation',
  'grammar',
  'vocabulary',
  'pronunciation',
  'reading',
  'listening',
  'writing',
  'integrated',
  'checkpoint',
]);

const text = z.string().trim().min(1);

export const structureObjectiveSchema = z.strictObject({
  code: objectiveCodeSchema,
  can_do_en: text,
});

export const structureLessonSchema = z.strictObject({
  code: lessonCodeSchema,
  title: text,
  /** Primary type first (Schema §8.4). */
  archetypes: z.array(lessonArchetypeSchema).min(1),
  mastery_task_en: text,
  objectives: z.array(structureObjectiveSchema).min(1),
  /** Authoring reference; not loaded by the importer (TRD-CNT-09). */
  notes: text.optional(),
});

export const structureUnitSchema = z.strictObject({
  code: unitCodeSchema,
  title: text,
  subtitle_en: text,
  lessons: z.array(structureLessonSchema).min(1),
});

export const structurePartSchema = z.strictObject({
  code: partCodeSchema,
  title: text,
  tagline: text,
  units: z.array(structureUnitSchema).min(1),
});

export const structureLevelSchema = z.strictObject({
  code: levelCodeSchema,
  title: text,
  parts: z.array(structurePartSchema).min(1),
});

export const structureFileSchema = z
  .strictObject({
    level: structureLevelSchema,
  })
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    const check = (code: string, parent: string | null, path: (string | number)[]) => {
      if (seen.has(code)) ctx.addIssue({ code: 'custom', message: `Duplicate code ${code}`, path });
      seen.add(code);
      if (parent !== null && !code.startsWith(`${parent}.`)) {
        ctx.addIssue({ code: 'custom', message: `${code} is not inside ${parent}`, path });
      }
    };
    const { level } = file;
    check(level.code, null, ['level', 'code']);
    level.parts.forEach((part, p) => {
      const pp = ['level', 'parts', p];
      check(part.code, level.code, [...pp, 'code']);
      part.units.forEach((unit, u) => {
        const up = [...pp, 'units', u];
        check(unit.code, part.code, [...up, 'code']);
        unit.lessons.forEach((lesson, l) => {
          const lp = [...up, 'lessons', l];
          check(lesson.code, unit.code, [...lp, 'code']);
          lesson.objectives.forEach((objective, o) => {
            check(objective.code, lesson.code, [...lp, 'objectives', o, 'code']);
          });
        });
      });
    });
  });

export type LessonArchetype = z.infer<typeof lessonArchetypeSchema>;
export type StructureFile = z.infer<typeof structureFileSchema>;

/** The canonical A1 tree has 4 parts, 24 units and 92 lessons (Curriculum Specification §20). */
export const A1_EXPECTED_COUNTS = { parts: 4, units: 24, lessons: 92 } as const;

export interface StructureCounts {
  parts: number;
  units: number;
  lessons: number;
  objectives: number;
}

export interface StructureValidationResult {
  ok: boolean;
  counts: StructureCounts | null;
  problems: string[];
}

/** Validates parsed a1.yaml data: schema, unique and nested codes, then the §20 counts. */
export function validateA1Structure(data: unknown): StructureValidationResult {
  const parsed = structureFileSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      counts: null,
      problems: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    };
  }
  const units = parsed.data.level.parts.flatMap((p) => p.units);
  const lessons = units.flatMap((u) => u.lessons);
  const counts: StructureCounts = {
    parts: parsed.data.level.parts.length,
    units: units.length,
    lessons: lessons.length,
    objectives: lessons.reduce((n, l) => n + l.objectives.length, 0),
  };
  const problems = (['parts', 'units', 'lessons'] as const)
    .filter((k) => counts[k] !== A1_EXPECTED_COUNTS[k])
    .map((k) => `Expected ${A1_EXPECTED_COUNTS[k]} ${k}, found ${counts[k]}`);
  return { ok: problems.length === 0, counts, problems };
}
