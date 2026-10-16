import { z } from 'zod';

// Curriculum IDs (Curriculum Specification §3 and Stable codes): upper case, as printed in the tree.
const LEVEL = '[ABC][12]';
const PART = String.raw`${LEVEL}\.\d`;
const UNIT = String.raw`${PART}\.U\d{2}`;
const LESSON = String.raw`${UNIT}\.L\d{2}`;
const OBJECTIVE = String.raw`${LESSON}\.O\d+`;

const codeSchema = (pattern: string, example: string) =>
  z.string().regex(new RegExp(`^${pattern}$`), `Expected a code like ${example}`);

export const levelCodeSchema = codeSchema(LEVEL, 'A1');
export const partCodeSchema = codeSchema(PART, 'A1.1');
export const unitCodeSchema = codeSchema(UNIT, 'A1.1.U01');
/**
 * Lesson curriculum ID, e.g. `A1.1.U01.L01` (Curriculum Specification §3, Stable codes).
 * Upper case; unit and lesson numbers are two digits.
 */
export const lessonCodeSchema = codeSchema(LESSON, 'A1.1.U01.L01');
/** Learning objective, named after its home lesson: `<lesson>.O<n>`. */
export const objectiveCodeSchema = codeSchema(OBJECTIVE, 'A1.1.U01.L01.O1');

/** Lesson section: `<lesson>.S<stage>`, stage 1 to 9 (Schema §10 Stable codes). */
export const sectionCodeSchema = codeSchema(String.raw`${LESSON}\.S[1-9]`, 'A1.2.U01.L02.S3');
/** Lesson block: `<section>.B<nn>`. The number is identity only; order sets position (DB-CODE-07). */
export const blockCodeSchema = codeSchema(String.raw`${LESSON}\.S[1-9]\.B\d{2}`, 'A1.2.U01.L02.S3.B02');

// Knowledge and activity codes (Schema §10 Stable codes). The slug part has the slug form of DB-CODE-01.
const SLUG = '[a-z0-9]+(-[a-z0-9]+)*';
const NUMBERED = String.raw`${SLUG}-\d{2}`;

/** Slug form (TRD-CNT-05, DB-SLUG-02): lower-case ASCII letters and digits in hyphen-separated words, written literally. */
export const slugSchema = z
  .string()
  .regex(new RegExp(`^${SLUG}$`), 'Expected a lower-case hyphenated slug like hallo-und-tschuess');

export const grammarConceptCodeSchema = codeSchema(String.raw`G\d{2}`, 'G11');
export const pronunciationConceptCodeSchema = codeSchema(`sound:${SLUG}`, 'sound:ich-laut');
export const patternConceptCodeSchema = codeSchema(`pattern:${SLUG}`, 'pattern:time-verb-subject');
export const conceptCodeSchema = codeSchema(
  String.raw`(G\d{2}|sound:${SLUG}|pattern:${SLUG})`,
  'G11, sound:ich-laut or pattern:time-verb-subject',
);
export const vocabularyCodeSchema = codeSchema(`vocab:${SLUG}`, 'vocab:gehen');
export const phraseCodeSchema = codeSchema(`phrase:${SLUG}`, 'phrase:wie-gehts');
export const exampleCodeSchema = codeSchema(`eg:${NUMBERED}`, 'eg:ich-moechte-einen-kaffee-01');
export const dialogueCodeSchema = codeSchema(`dlg:${NUMBERED}`, 'dlg:im-cafe-01');
export const dialogueLineCodeSchema = codeSchema(String.raw`dlg:${NUMBERED}:l\d{2}`, 'dlg:im-cafe-01:l03');
export const exerciseCodeSchema = codeSchema(`ex:${NUMBERED}`, 'ex:g11-article-selection-01');
export const exerciseItemCodeSchema = codeSchema(String.raw`ex:${NUMBERED}:i\d{2}`, 'ex:g11-article-selection-01:i04');
export const topicCodeSchema = codeSchema(`topic:${SLUG}`, 'topic:food');
export const voiceCodeSchema = codeSchema(`voice:${SLUG}`, 'voice:thorsten');

/** The table a referenced code belongs to, read from its fixed prefix; null if the code has no known form. */
export function codeKind(
  code: string,
): 'concept' | 'vocabulary' | 'phrase' | 'example' | 'dialogue' | 'exercise' | 'objective' | null {
  if (conceptCodeSchema.safeParse(code).success) return 'concept';
  if (vocabularyCodeSchema.safeParse(code).success) return 'vocabulary';
  if (phraseCodeSchema.safeParse(code).success) return 'phrase';
  if (exampleCodeSchema.safeParse(code).success) return 'example';
  if (dialogueCodeSchema.safeParse(code).success) return 'dialogue';
  if (exerciseCodeSchema.safeParse(code).success) return 'exercise';
  if (objectiveCodeSchema.safeParse(code).success) return 'objective';
  return null;
}

export type LevelCode = z.infer<typeof levelCodeSchema>;
export type PartCode = z.infer<typeof partCodeSchema>;
export type UnitCode = z.infer<typeof unitCodeSchema>;
export type LessonCode = z.infer<typeof lessonCodeSchema>;
export type ObjectiveCode = z.infer<typeof objectiveCodeSchema>;
