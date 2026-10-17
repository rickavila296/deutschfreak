import { findLessonRows, type Db, type LessonRow } from '@deutschfreak/db';
import { lessonResponseSchema, type AnswerFreeItem, type LessonResponse } from '@deutschfreak/validation';
import { ApiError } from '../errors.ts';
import { answerFreeItem } from './answer-free.ts';

// The lesson service (TRD-API-03, TRD-BE-05). Builds the lesson tree from the repository's rows and STRIPS ANSWERS:
// exercise items go through answerFreeItem, and the stored payload is never copied into the response. The result
// must pass the strict shared response schema, so no extra (answer) field can leave; a mismatch is a server fault.

// The tree as it is built from rows; the response schema then checks and types it.
interface Line {
  code: string;
  speakerRole: string;
  german: string;
  meaningEn: string;
  voice: string | null;
}
interface Block {
  code: string;
  kind: string;
  role: string | null;
  status: string | null;
  mode: string | null;
  textEn: string | null;
  [target: string]: unknown;
}
interface Section {
  code: string;
  stage: number;
  weight: string;
  blocks: Block[];
}

/** The block's target object, keyed by its kind; null for a text block. Lines and items are added row by row. */
function target(row: LessonRow): [string, Record<string, unknown>] | undefined {
  switch (row.blockKind) {
    case 'vocabulary':
      return [
        'vocabulary',
        {
          code: row.vocabularyCode,
          slug: row.vocabularySlug,
          lemma: row.vocabularyLemma,
          wordClass: row.vocabularyWordClass,
          article: row.vocabularyArticle,
          plural: row.vocabularyPlural,
          meaningEn: row.vocabularyMeaningEn,
        },
      ];
    case 'phrase':
      return [
        'phrase',
        {
          code: row.phraseCode,
          slug: row.phraseSlug,
          german: row.phraseGerman,
          meaningEn: row.phraseMeaningEn,
          register: row.phraseRegister,
        },
      ];
    case 'concept':
      return [
        'concept',
        {
          code: row.conceptCode,
          slug: row.conceptSlug,
          type: row.conceptType,
          title: row.conceptTitle,
          explanationEn: row.conceptExplanationEn,
        },
      ];
    case 'example':
      return ['example', { code: row.exampleCode, german: row.exampleGerman, meaningEn: row.exampleMeaningEn }];
    case 'dialogue':
      return [
        'dialogue',
        {
          code: row.dialogueCode,
          slug: row.dialogueSlug,
          title: row.dialogueTitle,
          register: row.dialogueRegister,
          lines: [] as Line[],
        },
      ];
    case 'exercise':
      return [
        'exercise',
        {
          code: row.exerciseCode,
          type: row.exerciseType,
          skill: row.exerciseSkill,
          instructionEn: row.exerciseInstructionEn,
          items: [] as AnswerFreeItem[],
        },
      ];
    default:
      return undefined;
  }
}

/** Builds the answer-free lesson from its rows (already in order). Pure; undefined when there are no rows. */
export function buildLesson(rows: LessonRow[]): LessonResponse | undefined {
  const first = rows[0];
  if (!first) return undefined;
  const sections: Section[] = [];
  let section: Section | undefined;
  let block: Block | undefined;
  for (const row of rows) {
    if (row.sectionCode === null || row.sectionStage === null || row.sectionWeight === null) continue;
    if (!section || section.code !== row.sectionCode) {
      section = { code: row.sectionCode, stage: row.sectionStage, weight: row.sectionWeight, blocks: [] };
      sections.push(section);
      block = undefined;
    }
    if (row.blockCode === null || row.blockKind === null) continue;
    if (!block || block.code !== row.blockCode) {
      block = {
        code: row.blockCode,
        kind: row.blockKind,
        role: row.blockRole,
        status: row.blockStatus,
        mode: row.blockMode,
        textEn: row.blockTextEn,
      };
      const t = target(row);
      if (t) block[t[0]] = t[1];
      section.blocks.push(block);
    }
    if (
      row.lineCode !== null &&
      row.lineSpeakerRole !== null &&
      row.lineGerman !== null &&
      row.lineMeaningEn !== null
    ) {
      (block.dialogue as { lines: Line[] }).lines.push({
        code: row.lineCode,
        speakerRole: row.lineSpeakerRole,
        german: row.lineGerman,
        meaningEn: row.lineMeaningEn,
        voice: row.lineVoice,
      });
    }
    if (row.itemCode !== null) {
      // The only place a stored payload is read: it goes through the allow-list and nothing else of it is kept.
      (block.exercise as { items: AnswerFreeItem[] }).items.push(answerFreeItem(row.itemCode, row.itemPayload));
    }
  }
  const result = lessonResponseSchema.safeParse({
    lesson: {
      code: first.lessonCode,
      slug: first.lessonSlug,
      title: first.lessonTitle,
      archetypes: first.lessonArchetypes,
      masteryTaskEn: first.lessonMasteryTaskEn,
      unit: { code: first.unitCode, slug: first.unitSlug, title: first.unitTitle },
    },
    sections,
  });
  if (!result.success) throw new Error(`Lesson does not match its response schema: ${result.error.message}`);
  return result.data;
}

/**
 * A published lesson without answers (TRD-API-03), or `lesson_not_found`. A planned or retired lesson cannot be
 * opened as a lesson (FR-012); answering it like an unknown slug is provisional until FLOW-OQ-05 is decided.
 */
export async function getLesson(db: Db, slug: string): Promise<LessonResponse> {
  const rows = await findLessonRows(db, slug);
  const lesson = rows[0]?.lessonStatus === 'published' ? buildLesson(rows) : undefined;
  if (!lesson) throw new ApiError('lesson_not_found', `No lesson has the slug ${slug}.`);
  return lesson;
}
