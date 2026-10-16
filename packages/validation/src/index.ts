import { z } from 'zod';

/**
 * Lesson curriculum ID, e.g. `A1.1.U01.L01` (Curriculum Specification §3, Stable codes).
 * Upper case; unit and lesson numbers are two digits.
 */
export const lessonCodeSchema = z
  .string()
  .regex(/^[ABC][12]\.\d\.U\d{2}\.L\d{2}$/, 'Expected a lesson code like A1.1.U01.L01');

export type LessonCode = z.infer<typeof lessonCodeSchema>;
