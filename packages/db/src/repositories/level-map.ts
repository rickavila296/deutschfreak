import { asc, eq } from 'drizzle-orm';
import type { Db } from '../client.ts';
import { courseParts, learningObjectives, lessonObjectives, lessons, levels, units } from '../schema.ts';

// Repository for `GET /v1/levels/:code/map` (TRD-BE-02): one joined query, one row per lesson objective, in map
// order. The service turns the rows into the tree. Codes and slugs only; no uuid leaves this function (TRD-API-21).

export interface LevelMapRow {
  levelCode: string;
  levelTitle: string;
  partCode: string;
  partTitle: string;
  partTagline: string;
  unitCode: string;
  unitSlug: string;
  unitTitle: string;
  unitSubtitleEn: string;
  lessonCode: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonArchetypes: string[];
  lessonStatus: string;
  objectiveCode: string | null;
  objectiveCanDoEn: string | null;
  objectiveSkill: string | null;
}

/** Every lesson of a level with its objectives, ordered part → unit → lesson → objective. Empty if no level has this code. */
export function findLevelMapRows(db: Db, levelCode: string): Promise<LevelMapRow[]> {
  return db
    .select({
      levelCode: levels.code,
      levelTitle: levels.title,
      partCode: courseParts.code,
      partTitle: courseParts.title,
      partTagline: courseParts.tagline,
      unitCode: units.code,
      unitSlug: units.slug,
      unitTitle: units.title,
      unitSubtitleEn: units.subtitleEn,
      lessonCode: lessons.code,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      lessonArchetypes: lessons.archetypes,
      lessonStatus: lessons.status,
      objectiveCode: learningObjectives.code,
      objectiveCanDoEn: learningObjectives.canDoEn,
      objectiveSkill: learningObjectives.skill,
    })
    .from(levels)
    .innerJoin(courseParts, eq(courseParts.levelId, levels.id))
    .innerJoin(units, eq(units.coursePartId, courseParts.id))
    .innerJoin(lessons, eq(lessons.unitId, units.id))
    .leftJoin(lessonObjectives, eq(lessonObjectives.lessonId, lessons.id))
    .leftJoin(learningObjectives, eq(learningObjectives.id, lessonObjectives.objectiveId))
    .where(eq(levels.code, levelCode))
    .orderBy(asc(courseParts.position), asc(units.position), asc(lessons.position), asc(learningObjectives.code));
}
