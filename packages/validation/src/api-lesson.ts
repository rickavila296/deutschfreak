import { z } from 'zod';
import { blockCodeSchema, lessonCodeSchema, sectionCodeSchema, slugSchema, unitCodeSchema } from './codes.ts';
import {
  blockRoleSchema,
  blockStatusSchema,
  conceptTypeSchema,
  exerciseTypeSchema,
  nounArticleSchema,
  registerSchema,
  reviewModeSchema,
  sectionWeightSchema,
  wordClassSchema,
} from './enums.ts';
import { lessonArchetypeSchema, skillSchema } from './structure.ts';

// `GET /v1/lessons/:slug` (TRD-API-03): the lesson with its sections, blocks and exercises, WITHOUT ANSWERS
// (TRD-ARCH-03, TRD-SEC-11). Every object is strict, so an answer field cannot pass this schema. Public: codes and
// slugs only, never a uuid (TRD-API-21).

export const lessonParamsSchema = z.strictObject({ slug: slugSchema });

const text = z.string().min(1);

export const lessonVocabularySchema = z.strictObject({
  code: text,
  slug: slugSchema,
  lemma: text,
  wordClass: wordClassSchema,
  article: nounArticleSchema.nullable(),
  plural: text.nullable(),
  meaningEn: text,
});

export const lessonPhraseSchema = z.strictObject({
  code: text,
  slug: slugSchema,
  german: text,
  meaningEn: text,
  register: registerSchema,
});

export const lessonConceptSchema = z.strictObject({
  code: text,
  slug: slugSchema,
  type: conceptTypeSchema,
  title: text,
  explanationEn: text,
});

export const lessonExampleSchema = z.strictObject({ code: text, german: text, meaningEn: text });

export const lessonDialogueLineSchema = z.strictObject({
  code: text,
  speakerRole: text,
  german: text,
  meaningEn: text,
  /** Voice code, for audio once it exists (Phase 7). */
  voice: text,
});

export const lessonDialogueSchema = z.strictObject({
  code: text,
  slug: slugSchema,
  title: text,
  register: registerSchema,
  lines: z.array(lessonDialogueLineSchema),
});

/**
 * The answer-free side of an exercise item: only the prompt and the options. Accepted answers, the stored audio
 * reference (it names the phrase being heard; decision 0021), the model answer, the checklist, the feedback and
 * anything else in the stored payload are never sent.
 */
export const answerFreeItemSchema = z.strictObject({
  code: text,
  prompt: text.optional(),
  options: z.array(text).optional(),
});

export const lessonExerciseSchema = z.strictObject({
  code: text,
  type: exerciseTypeSchema,
  skill: skillSchema,
  instructionEn: text,
  items: z.array(answerFreeItemSchema),
});

const blockBase = {
  code: blockCodeSchema,
  role: blockRoleSchema.nullable(),
  status: blockStatusSchema.nullable(),
  mode: reviewModeSchema.nullable(),
  /** English text of the block; a text block has nothing else (DB-PRIN-02). */
  textEn: text.nullable(),
};

/** One block; its target object sits under the key named by its kind (DB-PRIN-02). */
export const lessonResponseBlockSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...blockBase, kind: z.literal('text') }),
  z.strictObject({ ...blockBase, kind: z.literal('vocabulary'), vocabulary: lessonVocabularySchema }),
  z.strictObject({ ...blockBase, kind: z.literal('phrase'), phrase: lessonPhraseSchema }),
  z.strictObject({ ...blockBase, kind: z.literal('concept'), concept: lessonConceptSchema }),
  z.strictObject({ ...blockBase, kind: z.literal('example'), example: lessonExampleSchema }),
  z.strictObject({ ...blockBase, kind: z.literal('dialogue'), dialogue: lessonDialogueSchema }),
  z.strictObject({ ...blockBase, kind: z.literal('exercise'), exercise: lessonExerciseSchema }),
]);

export const lessonResponseSectionSchema = z.strictObject({
  code: sectionCodeSchema,
  stage: z.number().int().min(1).max(9),
  weight: sectionWeightSchema,
  blocks: z.array(lessonResponseBlockSchema),
});

export const lessonResponseSchema = z.strictObject({
  lesson: z.strictObject({
    code: lessonCodeSchema,
    slug: slugSchema,
    title: text,
    archetypes: z.array(lessonArchetypeSchema).min(1),
    masteryTaskEn: text,
    unit: z.strictObject({ code: unitCodeSchema, slug: slugSchema, title: text }),
  }),
  sections: z.array(lessonResponseSectionSchema),
});

export type LessonResponse = z.infer<typeof lessonResponseSchema>;
export type LessonResponseBlock = z.infer<typeof lessonResponseBlockSchema>;
export type AnswerFreeItem = z.infer<typeof answerFreeItemSchema>;
