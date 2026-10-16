import { z } from 'zod';
import {
  lessonCodeSchema,
  levelCodeSchema,
  objectiveCodeSchema,
  partCodeSchema,
  slugSchema,
  unitCodeSchema,
} from './codes.ts';
import { lessonStatusSchema } from './enums.ts';
import { lessonArchetypeSchema, skillSchema } from './structure.ts';

// `GET /v1/levels/:code/map` (TRD-API-02): parts, units and lessons as one tree for the German Map (FR-011,
// FLOW-LEARN-001, DESIGN-UI-080 to 082, 085). Public: codes and slugs only, never a uuid (TRD-API-21).

export const levelMapParamsSchema = z.strictObject({ code: levelCodeSchema });

export const mapObjectiveSchema = z.strictObject({
  code: objectiveCodeSchema,
  canDoEn: z.string().min(1),
  skill: skillSchema,
});

export const mapLessonSchema = z.strictObject({
  code: lessonCodeSchema,
  slug: slugSchema,
  title: z.string().min(1),
  /** Primary archetype first (TRD-DB-11); `checkpoint` marks checkpoint lessons (DESIGN-UI-085). */
  archetypes: z.array(lessonArchetypeSchema).min(1),
  /** `published` lessons can be opened; `planned` ones are shown but not openable (FR-012). */
  status: lessonStatusSchema,
  objectives: z.array(mapObjectiveSchema),
});

export const mapUnitSchema = z.strictObject({
  code: unitCodeSchema,
  slug: slugSchema,
  title: z.string().min(1),
  subtitleEn: z.string().min(1),
  lessons: z.array(mapLessonSchema),
});

export const mapPartSchema = z.strictObject({
  code: partCodeSchema,
  title: z.string().min(1),
  tagline: z.string().min(1),
  units: z.array(mapUnitSchema),
});

export const levelMapResponseSchema = z.strictObject({
  level: z.strictObject({ code: levelCodeSchema, title: z.string().min(1) }),
  parts: z.array(mapPartSchema),
});

export type LevelMapResponse = z.infer<typeof levelMapResponseSchema>;
export type MapPart = z.infer<typeof mapPartSchema>;
export type MapUnit = z.infer<typeof mapUnitSchema>;
export type MapLesson = z.infer<typeof mapLessonSchema>;
