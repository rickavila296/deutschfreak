import { findLevelMapRows, type Db, type LevelMapRow } from '@deutschfreak/db';
import { levelMapResponseSchema, type LevelMapResponse } from '@deutschfreak/validation';
import { ApiError } from '../errors.ts';

// The tree as it is built from database rows; the shared response schema then checks and types it.
interface Objective {
  code: string;
  canDoEn: string | null;
  skill: string | null;
}
interface Lesson {
  code: string;
  slug: string;
  title: string;
  archetypes: string[];
  status: string;
  objectives: Objective[];
}
interface Unit {
  code: string;
  slug: string;
  title: string;
  subtitleEn: string;
  lessons: Lesson[];
}
interface Part {
  code: string;
  title: string;
  tagline: string;
  units: Unit[];
}

/**
 * Turns the repository's flat rows (already in map order) into the German Map tree. Pure; returns undefined when
 * there are no rows. The result must pass the shared response schema, so no extra field can leak; a mismatch is a
 * server fault (internal_error), not a client one.
 */
export function buildLevelMap(rows: LevelMapRow[]): LevelMapResponse | undefined {
  const first = rows[0];
  if (!first) return undefined;
  const parts: Part[] = [];
  let part: Part | undefined;
  let unit: Unit | undefined;
  let lesson: Lesson | undefined;
  for (const row of rows) {
    if (!part || part.code !== row.partCode) {
      part = { code: row.partCode, title: row.partTitle, tagline: row.partTagline, units: [] };
      parts.push(part);
      unit = undefined;
    }
    if (!unit || unit.code !== row.unitCode) {
      unit = {
        code: row.unitCode,
        slug: row.unitSlug,
        title: row.unitTitle,
        subtitleEn: row.unitSubtitleEn,
        lessons: [],
      };
      part.units.push(unit);
      lesson = undefined;
    }
    if (!lesson || lesson.code !== row.lessonCode) {
      lesson = {
        code: row.lessonCode,
        slug: row.lessonSlug,
        title: row.lessonTitle,
        archetypes: row.lessonArchetypes,
        status: row.lessonStatus,
        objectives: [],
      };
      unit.lessons.push(lesson);
    }
    if (row.objectiveCode !== null) {
      lesson.objectives.push({ code: row.objectiveCode, canDoEn: row.objectiveCanDoEn, skill: row.objectiveSkill });
    }
  }
  const result = levelMapResponseSchema.safeParse({ level: { code: first.levelCode, title: first.levelTitle }, parts });
  if (!result.success) throw new Error(`Level map does not match its response schema: ${result.error.message}`);
  return result.data;
}

/** The German Map of a level (TRD-API-02), or `level_not_found`. */
export async function getLevelMap(db: Db, levelCode: string): Promise<LevelMapResponse> {
  const map = buildLevelMap(await findLevelMapRows(db, levelCode));
  if (!map) throw new ApiError('level_not_found', `No level has the code ${levelCode}.`);
  return map;
}
