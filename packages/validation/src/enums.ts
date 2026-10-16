import { z } from 'zod';

// Enumerated types shared by content files, the API and the database (Schema §8, Enumerated types).

/** Lesson status (Schema enum `lesson_status`, DB-REC-05, decision 0005). */
export const lessonStatusSchema = z.enum(['planned', 'published', 'retired']);

/** The four block roles (Schema enum `block_role`); lesson_objectives reuses them (DB-REC-07). */
export const blockRoleSchema = z.enum(['introduces', 'reinforces', 'applies', 'assesses']);

/** CEFR levels (Schema enum `cefr_level`, DB-REC-06). Knowledge objects carry one (DB-PRIN-04). */
export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2']);

/** Section weight (Schema enum `section_weight`, DB-REC-07). */
export const sectionWeightSchema = z.enum(['heavy', 'normal', 'light']);

/** What a lesson block points at (Schema enum `block_kind`, DB-REC-04). */
export const blockKindSchema = z.enum(['text', 'vocabulary', 'phrase', 'concept', 'example', 'dialogue', 'exercise']);

/** Block status (Schema enum `block_status`). */
export const blockStatusSchema = z.enum(['productive', 'chunk', 'recognition']);

/** Concept type (Schema enum `concept_type`). */
export const conceptTypeSchema = z.enum(['grammar', 'pronunciation', 'pattern']);

/** Word class (Schema enum `word_class`); pronouns and numerals stay under function_word (decision 0007). */
export const wordClassSchema = z.enum(['noun', 'verb', 'adjective', 'adverb', 'function_word']);

/** Noun article (Schema enum `noun_article`). */
export const nounArticleSchema = z.enum(['der', 'die', 'das']);

/** Vocabulary tier (Schema enum `vocabulary_tier`). */
export const vocabularyTierSchema = z.enum(['core_active', 'secondary_active', 'recognition']);

/** Register (Schema enum `register`, DB-REC-12). */
export const registerSchema = z.enum(['neutral', 'formal', 'informal']);

/** Audio variant (Schema enum `audio_variant`). */
export const audioVariantSchema = z.enum(['normal', 'slow']);

/** How a clip was produced (Schema enum `production_method`, DB-REC-12). */
export const productionMethodSchema = z.enum(['synthetic', 'human']);

/** The 18 exercise types (Schema enum `exercise_type`, DB-REC-12). */
export const exerciseTypeSchema = z.enum([
  'multiple_choice',
  'matching',
  'fill_blank',
  'sentence_ordering',
  'translation',
  'listening_selection',
  'listening_dictation',
  'article_selection',
  'gender_selection',
  'vocabulary_recall',
  'sentence_building',
  'reading_comprehension',
  'writing',
  'speaking',
  'pronunciation_repetition',
  'dialogue_completion',
  'roleplay',
  'image_labelling',
]);

/** Review mode (Schema enum `review_mode`); also a lesson block's mode, e.g. stage 7 recall (decision 0007). */
export const reviewModeSchema = z.enum(['recognise', 'recall', 'produce']);
