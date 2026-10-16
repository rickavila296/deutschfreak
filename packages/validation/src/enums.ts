import { z } from 'zod';

// Enumerated types shared by content files, the API and the database (Schema §8, Enumerated types).

/** Lesson status (Schema enum `lesson_status`, DB-REC-05, decision 0005). */
export const lessonStatusSchema = z.enum(['planned', 'published', 'retired']);

/** The four block roles (Schema enum `block_role`); lesson_objectives reuses them (DB-REC-07). */
export const blockRoleSchema = z.enum(['introduces', 'reinforces', 'applies', 'assesses']);
