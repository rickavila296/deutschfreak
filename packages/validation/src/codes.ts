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

export type LevelCode = z.infer<typeof levelCodeSchema>;
export type PartCode = z.infer<typeof partCodeSchema>;
export type UnitCode = z.infer<typeof unitCodeSchema>;
export type LessonCode = z.infer<typeof lessonCodeSchema>;
export type ObjectiveCode = z.infer<typeof objectiveCodeSchema>;
