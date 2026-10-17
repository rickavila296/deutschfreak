import {
  audioVariantSchema,
  blockKindSchema,
  blockRoleSchema,
  blockStatusSchema,
  cefrLevelSchema,
  conceptTypeSchema,
  exerciseTypeSchema,
  lessonArchetypeSchema,
  lessonStatusSchema,
  nounArticleSchema,
  productionMethodSchema,
  registerSchema,
  reviewModeSchema,
  sectionWeightSchema,
  skillSchema,
  vocabularyTierSchema,
  wordClassSchema,
} from '@deutschfreak/validation';
import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// Drizzle schema for Schema v1: enumerated types and the 24 content tables (Schema §8.1 to 8.24, §9).
// Tables 1 to 6 came in Phase 2a; tables 7 to 24 in Phase 2b (DB-MIG-05).
// Enum values come from packages/validation so content, API and database share one list (architecture rule 4).
// Position unique constraints are made deferrable by hand-written migrations (decision 0005, DB-OQ-15).

/** Zod enum options are readonly; pgEnum needs a mutable non-empty tuple. */
const values = <T extends string>(options: readonly T[]) => options as [T, ...T[]];

export const skill = pgEnum('skill', values(skillSchema.options));
export const lessonArchetype = pgEnum('lesson_archetype', values(lessonArchetypeSchema.options));
export const lessonStatus = pgEnum('lesson_status', values(lessonStatusSchema.options));
export const blockRole = pgEnum('block_role', values(blockRoleSchema.options));
export const cefrLevel = pgEnum('cefr_level', values(cefrLevelSchema.options));
export const sectionWeight = pgEnum('section_weight', values(sectionWeightSchema.options));
export const blockKind = pgEnum('block_kind', values(blockKindSchema.options));
export const blockStatus = pgEnum('block_status', values(blockStatusSchema.options));
export const conceptType = pgEnum('concept_type', values(conceptTypeSchema.options));
export const wordClass = pgEnum('word_class', values(wordClassSchema.options));
export const nounArticle = pgEnum('noun_article', values(nounArticleSchema.options));
export const vocabularyTier = pgEnum('vocabulary_tier', values(vocabularyTierSchema.options));
export const register = pgEnum('register', values(registerSchema.options));
export const audioVariant = pgEnum('audio_variant', values(audioVariantSchema.options));
export const productionMethod = pgEnum('production_method', values(productionMethodSchema.options));
export const exerciseType = pgEnum('exercise_type', values(exerciseTypeSchema.options));
export const reviewMode = pgEnum('review_mode', values(reviewModeSchema.options));

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
    /** Course-page copy (Spec §13; decision 0030). */
    descriptionEn: text('description_en'),
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

// ---- Phase 2b: tables 7 to 24 ----

/** 8.7 */
export const lessonSections = pgTable(
  'lesson_sections',
  {
    ...standard(),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    stage: smallint('stage').notNull(),
    weight: sectionWeight('weight').notNull().default('normal'),
  },
  (t) => [
    unique('lesson_sections_code_key').on(t.code),
    unique('lesson_sections_lesson_id_stage_key').on(t.lessonId, t.stage),
    check('lesson_sections_stage_check', sql`${t.stage} between 1 and 9`),
  ],
);

/** 8.9 */
export const concepts = pgTable(
  'concepts',
  {
    ...standard(),
    slug: text('slug').notNull(),
    type: conceptType('type').notNull(),
    title: text('title').notNull(),
    explanationEn: text('explanation_en').notNull(),
    level: cefrLevel('level').notNull(),
  },
  (t) => [unique('concepts_code_key').on(t.code), unique('concepts_slug_key').on(t.slug)],
);

/** 8.10 */
export const conceptPrerequisites = pgTable(
  'concept_prerequisites',
  {
    conceptId: uuid('concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'cascade' }),
    requiresConceptId: uuid('requires_concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.conceptId, t.requiresConceptId] }),
    check('concept_prerequisites_not_self_check', sql`${t.conceptId} <> ${t.requiresConceptId}`),
    index('concept_prerequisites_requires_concept_id_idx').on(t.requiresConceptId),
  ],
);

/** 8.11 */
export const vocabularyItems = pgTable(
  'vocabulary_items',
  {
    ...standard(),
    slug: text('slug').notNull(),
    lemma: text('lemma').notNull(),
    wordClass: wordClass('word_class').notNull(),
    article: nounArticle('article'),
    plural: text('plural'),
    meaningEn: text('meaning_en').notNull(),
    tier: vocabularyTier('tier').notNull(),
    level: cefrLevel('level').notNull(),
  },
  (t) => [
    unique('vocabulary_items_code_key').on(t.code),
    unique('vocabulary_items_slug_key').on(t.slug),
    // DB-CK-05: nouns always carry an article, other words never do.
    check('vocabulary_items_article_check', sql`(${t.article} is not null) = (${t.wordClass} = 'noun')`),
  ],
);

/** 8.12 */
export const phrases = pgTable(
  'phrases',
  {
    ...standard(),
    slug: text('slug').notNull(),
    german: text('german').notNull(),
    meaningEn: text('meaning_en').notNull(),
    register: register('register').notNull().default('neutral'),
    level: cefrLevel('level').notNull(),
  },
  (t) => [unique('phrases_code_key').on(t.code), unique('phrases_slug_key').on(t.slug)],
);

/** 8.13 */
export const examples = pgTable(
  'examples',
  {
    ...standard(),
    german: text('german').notNull(),
    meaningEn: text('meaning_en').notNull(),
    level: cefrLevel('level').notNull(),
  },
  (t) => [unique('examples_code_key').on(t.code)],
);

/** 8.14 */
export const exampleVocabulary = pgTable(
  'example_vocabulary',
  {
    exampleId: uuid('example_id')
      .notNull()
      .references(() => examples.id, { onDelete: 'cascade' }),
    vocabularyItemId: uuid('vocabulary_item_id')
      .notNull()
      .references(() => vocabularyItems.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.exampleId, t.vocabularyItemId] }),
    index('example_vocabulary_vocabulary_item_id_idx').on(t.vocabularyItemId),
  ],
);

/** 8.15 */
export const exampleConcepts = pgTable(
  'example_concepts',
  {
    exampleId: uuid('example_id')
      .notNull()
      .references(() => examples.id, { onDelete: 'cascade' }),
    conceptId: uuid('concept_id')
      .notNull()
      .references(() => concepts.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.exampleId, t.conceptId] }),
    index('example_concepts_concept_id_idx').on(t.conceptId),
  ],
);

/** 8.16 */
export const dialogues = pgTable(
  'dialogues',
  {
    ...standard(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    register: register('register').notNull(),
  },
  (t) => [unique('dialogues_code_key').on(t.code), unique('dialogues_slug_key').on(t.slug)],
);

/** 8.20 */
export const voices = pgTable(
  'voices',
  {
    ...standard(),
    name: text('name').notNull(),
    gender: text('gender'),
    ageBand: text('age_band'),
    region: text('region'),
  },
  (t) => [unique('voices_code_key').on(t.code)],
);

/** 8.17 */
export const dialogueLines = pgTable(
  'dialogue_lines',
  {
    ...standard(),
    dialogueId: uuid('dialogue_id')
      .notNull()
      .references(() => dialogues.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    speakerRole: text('speaker_role').notNull(),
    german: text('german').notNull(),
    meaningEn: text('meaning_en').notNull(),
    voiceId: uuid('voice_id')
      .notNull()
      .references(() => voices.id, { onDelete: 'restrict' }),
  },
  (t) => [
    unique('dialogue_lines_code_key').on(t.code),
    unique('dialogue_lines_dialogue_id_position_key').on(t.dialogueId, t.position),
    index('dialogue_lines_voice_id_idx').on(t.voiceId),
  ],
);

/** 8.18 */
export const topics = pgTable(
  'topics',
  { ...standard(), slug: text('slug').notNull(), title: text('title').notNull() },
  (t) => [unique('topics_code_key').on(t.code), unique('topics_slug_key').on(t.slug)],
);

/** 8.19 */
export const vocabularyTopics = pgTable(
  'vocabulary_topics',
  {
    vocabularyItemId: uuid('vocabulary_item_id')
      .notNull()
      .references(() => vocabularyItems.id, { onDelete: 'cascade' }),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (t) => [
    primaryKey({ columns: [t.vocabularyItemId, t.topicId] }),
    index('vocabulary_topics_topic_id_idx').on(t.topicId),
  ],
);

/** 8.21. No code: a clip is identified by owner, voice and variant. */
export const audioAssets = pgTable(
  'audio_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vocabularyItemId: uuid('vocabulary_item_id').references(() => vocabularyItems.id, { onDelete: 'cascade' }),
    phraseId: uuid('phrase_id').references(() => phrases.id, { onDelete: 'cascade' }),
    exampleId: uuid('example_id').references(() => examples.id, { onDelete: 'cascade' }),
    dialogueLineId: uuid('dialogue_line_id').references(() => dialogueLines.id, { onDelete: 'cascade' }),
    voiceId: uuid('voice_id')
      .notNull()
      .references(() => voices.id, { onDelete: 'restrict' }),
    variant: audioVariant('variant').notNull().default('normal'),
    productionMethod: productionMethod('production_method').notNull(),
    storageKey: text('storage_key').notNull(),
    durationMs: integer('duration_ms'),
    textHash: text('text_hash').notNull(),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    unique('audio_assets_storage_key_key').on(t.storageKey),
    check(
      'audio_assets_one_owner_check',
      sql`num_nonnulls(${t.vocabularyItemId}, ${t.phraseId}, ${t.exampleId}, ${t.dialogueLineId}) = 1`,
    ),
    check('audio_assets_duration_ms_check', sql`${t.durationMs} > 0`),
    // DB-UQ-10: one clip per owner, voice and variant. Nulls are distinct, so there is one partial index per owner.
    uniqueIndex('audio_assets_vocabulary_item_id_voice_id_variant_key')
      .on(t.vocabularyItemId, t.voiceId, t.variant)
      .where(sql`${t.vocabularyItemId} is not null`),
    uniqueIndex('audio_assets_phrase_id_voice_id_variant_key')
      .on(t.phraseId, t.voiceId, t.variant)
      .where(sql`${t.phraseId} is not null`),
    uniqueIndex('audio_assets_example_id_voice_id_variant_key')
      .on(t.exampleId, t.voiceId, t.variant)
      .where(sql`${t.exampleId} is not null`),
    uniqueIndex('audio_assets_dialogue_line_id_voice_id_variant_key')
      .on(t.dialogueLineId, t.voiceId, t.variant)
      .where(sql`${t.dialogueLineId} is not null`),
    index('audio_assets_voice_id_idx').on(t.voiceId),
  ],
);

/** 8.22 */
export const exercises = pgTable(
  'exercises',
  {
    ...standard(),
    type: exerciseType('type').notNull(),
    skill: skill('skill').notNull(),
    instructionEn: text('instruction_en').notNull(),
  },
  (t) => [unique('exercises_code_key').on(t.code)],
);

/** 8.23. `payload` holds the correct answer and is never returned to the browser as stored (architecture rule 3). */
export const exerciseItems = pgTable(
  'exercise_items',
  {
    ...standard(),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    payload: jsonb('payload').notNull(),
    feedbackEn: text('feedback_en'),
    exampleId: uuid('example_id').references(() => examples.id, { onDelete: 'restrict' }),
  },
  (t) => [
    unique('exercise_items_code_key').on(t.code),
    unique('exercise_items_exercise_id_position_key').on(t.exerciseId, t.position),
    index('exercise_items_example_id_idx').on(t.exampleId),
  ],
);

/** 8.24. No code. An exercise may have several targets, each once. */
export const exerciseTargets = pgTable(
  'exercise_targets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    conceptId: uuid('concept_id').references(() => concepts.id, { onDelete: 'restrict' }),
    vocabularyItemId: uuid('vocabulary_item_id').references(() => vocabularyItems.id, { onDelete: 'restrict' }),
    phraseId: uuid('phrase_id').references(() => phrases.id, { onDelete: 'restrict' }),
    objectiveId: uuid('objective_id').references(() => learningObjectives.id, { onDelete: 'restrict' }),
    ...timestamps,
  },
  (t) => [
    check(
      'exercise_targets_one_target_check',
      sql`num_nonnulls(${t.conceptId}, ${t.vocabularyItemId}, ${t.phraseId}, ${t.objectiveId}) = 1`,
    ),
    // DB-UQ-11: the same target once per exercise, through one partial index per target column.
    uniqueIndex('exercise_targets_exercise_id_concept_id_key')
      .on(t.exerciseId, t.conceptId)
      .where(sql`${t.conceptId} is not null`),
    uniqueIndex('exercise_targets_exercise_id_vocabulary_item_id_key')
      .on(t.exerciseId, t.vocabularyItemId)
      .where(sql`${t.vocabularyItemId} is not null`),
    uniqueIndex('exercise_targets_exercise_id_phrase_id_key')
      .on(t.exerciseId, t.phraseId)
      .where(sql`${t.phraseId} is not null`),
    uniqueIndex('exercise_targets_exercise_id_objective_id_key')
      .on(t.exerciseId, t.objectiveId)
      .where(sql`${t.objectiveId} is not null`),
    // The partial indexes cannot serve "all targets of an exercise", so exercise_id has its own index.
    index('exercise_targets_exercise_id_idx').on(t.exerciseId),
    index('exercise_targets_concept_id_idx').on(t.conceptId),
    index('exercise_targets_vocabulary_item_id_idx').on(t.vocabularyItemId),
    index('exercise_targets_phrase_id_idx').on(t.phraseId),
    index('exercise_targets_objective_id_idx').on(t.objectiveId),
  ],
);

/** 8.8. A block points at exactly one target, or at none if it is a text block (DB-PRIN-02). */
export const lessonBlocks = pgTable(
  'lesson_blocks',
  {
    ...standard(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => lessonSections.id, { onDelete: 'cascade' }),
    position: integer('position').notNull(),
    kind: blockKind('kind').notNull(),
    role: blockRole('role'),
    status: blockStatus('status'),
    textEn: text('text_en'),
    vocabularyItemId: uuid('vocabulary_item_id').references(() => vocabularyItems.id, { onDelete: 'restrict' }),
    phraseId: uuid('phrase_id').references(() => phrases.id, { onDelete: 'restrict' }),
    conceptId: uuid('concept_id').references(() => concepts.id, { onDelete: 'restrict' }),
    exampleId: uuid('example_id').references(() => examples.id, { onDelete: 'restrict' }),
    dialogueId: uuid('dialogue_id').references(() => dialogues.id, { onDelete: 'restrict' }),
    exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'restrict' }),
    /** Stage 7 "exercises in recall mode". NULL is the exercise's normal mode (decision 0007). */
    mode: reviewMode('mode'),
  },
  (t) => [
    unique('lesson_blocks_code_key').on(t.code),
    unique('lesson_blocks_section_id_position_key').on(t.sectionId, t.position),
    // DB-CK-01 (Schema §8.8, SS §6).
    check(
      'lesson_blocks_one_target_check',
      sql`num_nonnulls(${t.vocabularyItemId}, ${t.phraseId}, ${t.conceptId}, ${t.exampleId}, ${t.dialogueId}, ${t.exerciseId}) = (${t.kind} <> 'text')::int`,
    ),
    // DB-CK-02: the filled target column matches the kind.
    check(
      'lesson_blocks_kind_target_check',
      sql`(${t.kind} <> 'vocabulary' or ${t.vocabularyItemId} is not null)
        and (${t.kind} <> 'phrase' or ${t.phraseId} is not null)
        and (${t.kind} <> 'concept' or ${t.conceptId} is not null)
        and (${t.kind} <> 'example' or ${t.exampleId} is not null)
        and (${t.kind} <> 'dialogue' or ${t.dialogueId} is not null)
        and (${t.kind} <> 'exercise' or ${t.exerciseId} is not null)`,
    ),
    // Only an exercise block carries a mode (owner decision, decision 0007).
    check('lesson_blocks_mode_check', sql`${t.mode} is null or ${t.kind} = 'exercise'`),
    // DB-IX-02: find the block that uses an object ("taught in").
    index('lesson_blocks_vocabulary_item_id_idx').on(t.vocabularyItemId),
    index('lesson_blocks_phrase_id_idx').on(t.phraseId),
    index('lesson_blocks_concept_id_idx').on(t.conceptId),
    index('lesson_blocks_example_id_idx').on(t.exampleId),
    index('lesson_blocks_dialogue_id_idx').on(t.dialogueId),
    index('lesson_blocks_exercise_id_idx').on(t.exerciseId),
  ],
);
