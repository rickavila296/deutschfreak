import { blockRoleSchema, lessonArchetypeSchema, lessonStatusSchema, skillSchema } from '@deutschfreak/validation';
import { sql } from 'drizzle-orm';
import { check, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';

// Drizzle schema for Schema v1, Phase 2a: enumerated types and tables 1 to 6 (Schema §8.1 to 8.6, §9).
// Enum values come from packages/validation so content, API and database share one list (architecture rule 4).
// The position unique constraints are made deferrable by a hand-written migration in 2a.3 (decision 0005).

/** Zod enum options are readonly; pgEnum needs a mutable non-empty tuple. */
const values = <T extends string>(options: readonly T[]) => options as [T, ...T[]];

export const skill = pgEnum('skill', values(skillSchema.options));
export const lessonArchetype = pgEnum('lesson_archetype', values(lessonArchetypeSchema.options));
export const lessonStatus = pgEnum('lesson_status', values(lessonStatusSchema.options));
export const blockRole = pgEnum('block_role', values(blockRoleSchema.options));

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Standard columns of every content table with a code (Schema §8, DB-PRIN-01). */
const standard = () => ({
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull(),
  ...timestamps,
});

/** 8.1 */
export const levels = pgTable('levels', { ...standard(), title: text('title').notNull() }, (t) => [
  unique('levels_code_key').on(t.code),
]);

/** 8.2 */
export const courseParts = pgTable(
  'course_parts',
  {
    ...standard(),
    levelId: uuid('level_id')
      .notNull()
      .references(() => levels.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    position: integer('position').notNull(),
  },
  (t) => [
    unique('course_parts_code_key').on(t.code),
    unique('course_parts_level_id_position_key').on(t.levelId, t.position),
  ],
);

/** 8.3 */
export const units = pgTable(
  'units',
  {
    ...standard(),
    coursePartId: uuid('course_part_id')
      .notNull()
      .references(() => courseParts.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    subtitleEn: text('subtitle_en').notNull(),
    contextEn: text('context_en'),
    position: integer('position').notNull(),
  },
  (t) => [
    unique('units_code_key').on(t.code),
    unique('units_slug_key').on(t.slug),
    unique('units_course_part_id_position_key').on(t.coursePartId, t.position),
  ],
);

/** 8.4 */
export const lessons = pgTable(
  'lessons',
  {
    ...standard(),
    unitId: uuid('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    archetypes: lessonArchetype('archetypes').array().notNull(),
    masteryTaskEn: text('mastery_task_en').notNull(),
    status: lessonStatus('status').notNull().default('planned'),
    revision: integer('revision').notNull().default(1),
    position: integer('position').notNull(),
  },
  (t) => [
    unique('lessons_code_key').on(t.code),
    unique('lessons_slug_key').on(t.slug),
    unique('lessons_unit_id_position_key').on(t.unitId, t.position),
    check('lessons_archetypes_check', sql`cardinality(${t.archetypes}) >= 1`),
  ],
);

/** 8.5 */
export const learningObjectives = pgTable(
  'learning_objectives',
  { ...standard(), canDoEn: text('can_do_en').notNull(), skill: skill('skill').notNull() },
  (t) => [unique('learning_objectives_code_key').on(t.code)],
);

/** 8.6 */
export const lessonObjectives = pgTable(
  'lesson_objectives',
  {
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    objectiveId: uuid('objective_id')
      .notNull()
      .references(() => learningObjectives.id, { onDelete: 'restrict' }),
    role: blockRole('role').notNull(),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.lessonId, t.objectiveId] }),
    index('lesson_objectives_objective_id_idx').on(t.objectiveId),
  ],
);
