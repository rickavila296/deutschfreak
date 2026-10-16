import { z } from 'zod';
import {
  blockCodeSchema,
  codeKind,
  conceptCodeSchema,
  dialogueCodeSchema,
  dialogueLineCodeSchema,
  exampleCodeSchema,
  exerciseCodeSchema,
  exerciseItemCodeSchema,
  lessonCodeSchema,
  phraseCodeSchema,
  sectionCodeSchema,
  slugSchema,
  topicCodeSchema,
  vocabularyCodeSchema,
  voiceCodeSchema,
} from './codes.ts';
import {
  blockKindSchema,
  blockRoleSchema,
  blockStatusSchema,
  cefrLevelSchema,
  conceptTypeSchema,
  exerciseTypeSchema,
  nounArticleSchema,
  registerSchema,
  reviewModeSchema,
  sectionWeightSchema,
  vocabularyTierSchema,
  wordClassSchema,
} from './enums.ts';
import { skillSchema } from './structure.ts';

// Schemas for the content files in packages/content (TRD-CNT-01, decision 0010). Each mirrors its table in
// Schema §8; references to other rows are codes. All are strict (TRD-VAL-02). Whether a referenced code exists in
// another file is checked by the importer (TRD-CNT-06), not here.

const text = z.string().trim().min(1);

type Ctx = z.RefinementCtx;
type Path = (string | number)[];

/** Reports each code that appears twice among `rows`. */
function uniqueCodes(ctx: Ctx, rows: { code: string }[], path: Path) {
  const seen = new Set<string>();
  rows.forEach((row, i) => {
    if (seen.has(row.code))
      ctx.addIssue({ code: 'custom', message: `Duplicate code ${row.code}`, path: [...path, i, 'code'] });
    seen.add(row.code);
  });
}

function uniqueSlugs(ctx: Ctx, rows: { slug: string }[], path: Path) {
  const seen = new Set<string>();
  rows.forEach((row, i) => {
    if (seen.has(row.slug))
      ctx.addIssue({ code: 'custom', message: `Duplicate slug ${row.slug}`, path: [...path, i, 'slug'] });
    seen.add(row.slug);
  });
}

/** Reports a code listed twice in one reference list. */
function noRepeats(ctx: Ctx, owner: string, codes: string[], path: Path) {
  const seen = new Set<string>();
  for (const code of codes) {
    if (seen.has(code)) ctx.addIssue({ code: 'custom', message: `${owner} lists ${code} twice`, path });
    seen.add(code);
  }
}

/** Reports a child code that is not `<parent>:<suffix>` or `<parent>.<suffix>`. */
function inside(ctx: Ctx, child: string, parent: string, separator: string, path: Path) {
  if (!child.startsWith(`${parent}${separator}`)) {
    ctx.addIssue({ code: 'custom', message: `${child} is not inside ${parent}`, path });
  }
}

// ---- topics.yaml, voices.yaml (decision 0010) ----

export const topicSchema = z.strictObject({ code: topicCodeSchema, slug: slugSchema, title: text });
export const topicsFileSchema = z.strictObject({ topics: z.array(topicSchema).min(1) }).superRefine((f, ctx) => {
  uniqueCodes(ctx, f.topics, ['topics']);
  uniqueSlugs(ctx, f.topics, ['topics']);
});

/** Schema §8.20. The three descriptions are plain text; the sources define no value lists for them. */
export const voiceSchema = z.strictObject({
  code: voiceCodeSchema,
  name: text,
  gender: text.optional(),
  age_band: text.optional(),
  region: text.optional(),
});
export const voicesFileSchema = z
  .strictObject({ voices: z.array(voiceSchema).min(1) })
  .superRefine((f, ctx) => uniqueCodes(ctx, f.voices, ['voices']));

// ---- concepts/ (Schema §8.9, 8.10) ----

const conceptTypeOfCode = (code: string) =>
  code.startsWith('sound:') ? 'pronunciation' : code.startsWith('pattern:') ? 'pattern' : 'grammar';

export const conceptSchema = z.strictObject({
  code: conceptCodeSchema,
  slug: slugSchema,
  type: conceptTypeSchema,
  title: text,
  explanation_en: text,
  level: cefrLevelSchema,
  /** Prerequisites, by code (concept_prerequisites). */
  requires: z.array(conceptCodeSchema).optional(),
});
export const conceptsFileSchema = z.strictObject({ concepts: z.array(conceptSchema).min(1) }).superRefine((f, ctx) => {
  uniqueCodes(ctx, f.concepts, ['concepts']);
  uniqueSlugs(ctx, f.concepts, ['concepts']);
  f.concepts.forEach((c, i) => {
    const expected = conceptTypeOfCode(c.code);
    if (c.type !== expected) {
      ctx.addIssue({ code: 'custom', message: `${c.code} must have type ${expected}`, path: ['concepts', i, 'type'] });
    }
    if (c.requires?.includes(c.code)) {
      ctx.addIssue({ code: 'custom', message: `${c.code} requires itself`, path: ['concepts', i, 'requires'] });
    }
    noRepeats(ctx, c.code, c.requires ?? [], ['concepts', i, 'requires']);
  });
});

// ---- vocabulary/<topic>.yaml (Schema §8.11, 8.19; decision 0010) ----

export const vocabularyItemSchema = z.strictObject({
  code: vocabularyCodeSchema,
  slug: slugSchema,
  lemma: text,
  word_class: wordClassSchema,
  article: nounArticleSchema.optional(),
  plural: text.optional(),
  meaning_en: text,
  tier: vocabularyTierSchema,
  level: cefrLevelSchema,
  /** Topics besides the file's own. */
  topics: z.array(topicCodeSchema).optional(),
});
export const vocabularyFileSchema = z
  .strictObject({
    /** Every word in the file belongs to this topic. */
    topic: topicCodeSchema,
    items: z.array(vocabularyItemSchema).min(1),
  })
  .superRefine((f, ctx) => {
    uniqueCodes(ctx, f.items, ['items']);
    uniqueSlugs(ctx, f.items, ['items']);
    f.items.forEach((w, i) => {
      // DB-CK-05: nouns always carry an article, other words never do.
      if (w.word_class === 'noun' && !w.article) {
        ctx.addIssue({
          code: 'custom',
          message: `${w.code} is a noun and needs an article`,
          path: ['items', i, 'article'],
        });
      }
      if (w.word_class !== 'noun' && w.article) {
        ctx.addIssue({
          code: 'custom',
          message: `${w.code} is not a noun and must not have an article`,
          path: ['items', i, 'article'],
        });
      }
      noRepeats(ctx, w.code, [f.topic, ...(w.topics ?? [])], ['items', i, 'topics']);
    });
  });

// ---- phrases/ (Schema §8.12) ----

export const phraseSchema = z.strictObject({
  code: phraseCodeSchema,
  slug: slugSchema,
  german: text,
  meaning_en: text,
  /** Defaults to neutral in the database. */
  register: registerSchema.optional(),
  level: cefrLevelSchema,
});
export const phrasesFileSchema = z.strictObject({ phrases: z.array(phraseSchema).min(1) }).superRefine((f, ctx) => {
  uniqueCodes(ctx, f.phrases, ['phrases']);
  uniqueSlugs(ctx, f.phrases, ['phrases']);
});

// ---- examples/ (Schema §8.13 to 8.15; decision 0010) ----

export const exampleSchema = z.strictObject({
  code: exampleCodeSchema,
  german: text,
  meaning_en: text,
  level: cefrLevelSchema,
  /** example_vocabulary, by code. */
  vocabulary: z.array(vocabularyCodeSchema).optional(),
  /** example_concepts, by code. */
  concepts: z.array(conceptCodeSchema).optional(),
});
export const examplesFileSchema = z.strictObject({ examples: z.array(exampleSchema).min(1) }).superRefine((f, ctx) => {
  uniqueCodes(ctx, f.examples, ['examples']);
  f.examples.forEach((e, i) => {
    noRepeats(ctx, e.code, e.vocabulary ?? [], ['examples', i, 'vocabulary']);
    noRepeats(ctx, e.code, e.concepts ?? [], ['examples', i, 'concepts']);
  });
});

// ---- dialogues/ (Schema §8.16, 8.17) ----

export const dialogueLineSchema = z.strictObject({
  code: dialogueLineCodeSchema,
  speaker_role: text,
  german: text,
  meaning_en: text,
  voice: voiceCodeSchema,
});
export const dialogueSchema = z.strictObject({
  code: dialogueCodeSchema,
  slug: slugSchema,
  title: text,
  register: registerSchema,
  /** In order; order sets position. */
  lines: z.array(dialogueLineSchema).min(1),
});
export const dialoguesFileSchema = z
  .strictObject({ dialogues: z.array(dialogueSchema).min(1) })
  .superRefine((f, ctx) => {
    uniqueCodes(ctx, f.dialogues, ['dialogues']);
    uniqueSlugs(ctx, f.dialogues, ['dialogues']);
    uniqueCodes(
      ctx,
      f.dialogues.flatMap((d) => d.lines),
      ['dialogues', 'lines'],
    );
    f.dialogues.forEach((d, i) =>
      d.lines.forEach((line, j) => inside(ctx, line.code, d.code, ':', ['dialogues', i, 'lines', j, 'code'])),
    );
  });

// ---- exercises/ (Schema §8.22 to 8.24; decision 0010) ----

/**
 * Provisional (decision 0010, option A): any JSON object. The per-type discriminated union is designed in Phase 8
 * (TRD-VAL-03). The payload holds the correct answer and is never sent to the browser as stored.
 */
export const exercisePayloadSchema = z.record(z.string(), z.unknown());

export const exerciseItemSchema = z.strictObject({
  code: exerciseItemCodeSchema,
  payload: exercisePayloadSchema,
  feedback_en: text.optional(),
  example: exampleCodeSchema.optional(),
});
const targetKinds = new Set(['concept', 'vocabulary', 'phrase', 'objective']);
export const exerciseSchema = z.strictObject({
  code: exerciseCodeSchema,
  type: exerciseTypeSchema,
  skill: skillSchema,
  instruction_en: text,
  /** exercise_targets, by code: concepts, words, phrases or learning objectives. */
  targets: z.array(z.string()),
  /** In order; order sets position. */
  items: z.array(exerciseItemSchema).min(1),
});
export const exercisesFileSchema = z
  .strictObject({ exercises: z.array(exerciseSchema).min(1) })
  .superRefine((f, ctx) => {
    uniqueCodes(ctx, f.exercises, ['exercises']);
    uniqueCodes(
      ctx,
      f.exercises.flatMap((e) => e.items),
      ['exercises', 'items'],
    );
    f.exercises.forEach((e, i) => {
      e.targets.forEach((target, j) => {
        const kind = codeKind(target);
        if (!kind || !targetKinds.has(kind)) {
          ctx.addIssue({
            code: 'custom',
            message: `${target} cannot be an exercise target`,
            path: ['exercises', i, 'targets', j],
          });
        }
      });
      noRepeats(ctx, e.code, e.targets, ['exercises', i, 'targets']);
      e.items.forEach((item, j) => inside(ctx, item.code, e.code, ':', ['exercises', i, 'items', j, 'code']));
    });
  });

// ---- lessons/<lesson code>.yaml (Schema §8.7, 8.8; TRD-CNT-02, TRD-CNT-08) ----

export const lessonBlockSchema = z.strictObject({
  code: blockCodeSchema,
  kind: blockKindSchema,
  role: blockRoleSchema.optional(),
  status: blockStatusSchema.optional(),
  text_en: text.optional(),
  /** The one target, by code; none for a text block (DB-CK-01). */
  ref: z.string().optional(),
  /** Stage 7 recall and the like; exercise blocks only (decision 0007). */
  mode: reviewModeSchema.optional(),
});
export const lessonSectionSchema = z.strictObject({
  code: sectionCodeSchema,
  stage: z.number().int().min(1).max(9),
  /** Defaults to normal in the database. */
  weight: sectionWeightSchema.optional(),
  /** In order; order sets position (TRD-CNT-08). */
  blocks: z.array(lessonBlockSchema),
});
export const lessonFileSchema = z
  .strictObject({
    lesson: lessonCodeSchema,
    sections: z.array(lessonSectionSchema).min(1),
  })
  .superRefine((f, ctx) => {
    uniqueCodes(
      ctx,
      f.sections.flatMap((s) => s.blocks),
      ['sections', 'blocks'],
    );
    // DB-INT-08: a lesson file publishes its lesson, and a published lesson has all nine sections (review finding 5).
    if (f.sections.length !== 9) {
      ctx.addIssue({
        code: 'custom',
        message: `${f.lesson} has ${f.sections.length} sections; a lesson file needs all 9`,
        path: ['sections'],
      });
    }
    const stages = new Set<number>();
    f.sections.forEach((s, i) => {
      const path = ['sections', i];
      const expected = `${f.lesson}.S${s.stage}`;
      if (s.code !== expected) {
        ctx.addIssue({
          code: 'custom',
          message: `${s.code} must be ${expected} (lesson and stage)`,
          path: [...path, 'code'],
        });
      }
      if (stages.has(s.stage)) {
        ctx.addIssue({ code: 'custom', message: `Stage ${s.stage} appears twice`, path: [...path, 'stage'] });
      }
      stages.add(s.stage);
      s.blocks.forEach((b, j) => {
        const bp = [...path, 'blocks', j];
        inside(ctx, b.code, s.code, '.B', [...bp, 'code']);
        if (b.kind === 'text') {
          if (b.ref !== undefined) {
            ctx.addIssue({
              code: 'custom',
              message: `${b.code} is a text block and must not have a ref`,
              path: [...bp, 'ref'],
            });
          }
        } else if (b.ref === undefined) {
          ctx.addIssue({ code: 'custom', message: `${b.code} needs a ref`, path: [...bp, 'ref'] });
        } else if (codeKind(b.ref) !== b.kind) {
          ctx.addIssue({
            code: 'custom',
            message: `${b.code} is a ${b.kind} block but ${b.ref} is not a ${b.kind} code`,
            path: [...bp, 'ref'],
          });
        }
        if (b.mode !== undefined && b.kind !== 'exercise') {
          ctx.addIssue({
            code: 'custom',
            message: `${b.code} has a mode but only exercise blocks may`,
            path: [...bp, 'mode'],
          });
        }
      });
    });
  });

export type TopicsFile = z.infer<typeof topicsFileSchema>;
export type VoicesFile = z.infer<typeof voicesFileSchema>;
export type ConceptsFile = z.infer<typeof conceptsFileSchema>;
export type VocabularyFile = z.infer<typeof vocabularyFileSchema>;
export type PhrasesFile = z.infer<typeof phrasesFileSchema>;
export type ExamplesFile = z.infer<typeof examplesFileSchema>;
export type DialoguesFile = z.infer<typeof dialoguesFileSchema>;
export type ExercisesFile = z.infer<typeof exercisesFileSchema>;
export type LessonFile = z.infer<typeof lessonFileSchema>;
