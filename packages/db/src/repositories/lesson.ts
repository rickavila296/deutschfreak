import { asc, eq } from 'drizzle-orm';
import type { Db } from '../client.ts';
import {
  concepts,
  dialogueLines,
  dialogues,
  examples,
  exerciseItems,
  exercises,
  lessonBlocks,
  lessonSections,
  lessons,
  phrases,
  units,
  vocabularyItems,
  voices,
} from '../schema.ts';

// Repository for `GET /v1/lessons/:slug` (TRD-BE-02, TRD-BE-04): ONE joined query for the whole lesson, not one per
// block. One row per dialogue line or exercise item (a block has one target, so rows do not multiply across
// targets), in stage, block, line and item order. The service builds the tree and strips answers; this returns the
// stored exercise payload unchanged and is never sent to the browser as is. No uuid leaves this function.

/** Every row of a lesson, or none if no lesson has the slug. Section columns are null for a lesson without sections. */
export function findLessonRows(db: Db, slug: string) {
  return db
    .select({
      lessonCode: lessons.code,
      lessonSlug: lessons.slug,
      lessonTitle: lessons.title,
      lessonArchetypes: lessons.archetypes,
      lessonStatus: lessons.status,
      lessonMasteryTaskEn: lessons.masteryTaskEn,
      unitCode: units.code,
      unitSlug: units.slug,
      unitTitle: units.title,
      sectionCode: lessonSections.code,
      sectionStage: lessonSections.stage,
      sectionWeight: lessonSections.weight,
      blockCode: lessonBlocks.code,
      blockKind: lessonBlocks.kind,
      blockRole: lessonBlocks.role,
      blockStatus: lessonBlocks.status,
      blockMode: lessonBlocks.mode,
      blockTextEn: lessonBlocks.textEn,
      vocabularyCode: vocabularyItems.code,
      vocabularySlug: vocabularyItems.slug,
      vocabularyLemma: vocabularyItems.lemma,
      vocabularyWordClass: vocabularyItems.wordClass,
      vocabularyArticle: vocabularyItems.article,
      vocabularyPlural: vocabularyItems.plural,
      vocabularyMeaningEn: vocabularyItems.meaningEn,
      phraseCode: phrases.code,
      phraseSlug: phrases.slug,
      phraseGerman: phrases.german,
      phraseMeaningEn: phrases.meaningEn,
      phraseRegister: phrases.register,
      conceptCode: concepts.code,
      conceptSlug: concepts.slug,
      conceptType: concepts.type,
      conceptTitle: concepts.title,
      conceptExplanationEn: concepts.explanationEn,
      exampleCode: examples.code,
      exampleGerman: examples.german,
      exampleMeaningEn: examples.meaningEn,
      dialogueCode: dialogues.code,
      dialogueSlug: dialogues.slug,
      dialogueTitle: dialogues.title,
      dialogueRegister: dialogues.register,
      lineCode: dialogueLines.code,
      lineSpeakerRole: dialogueLines.speakerRole,
      lineGerman: dialogueLines.german,
      lineMeaningEn: dialogueLines.meaningEn,
      lineVoice: voices.code,
      exerciseCode: exercises.code,
      exerciseType: exercises.type,
      exerciseSkill: exercises.skill,
      exerciseInstructionEn: exercises.instructionEn,
      itemCode: exerciseItems.code,
      /** Holds the correct answer (Schema §8.23). The service must strip it. */
      itemPayload: exerciseItems.payload,
    })
    .from(lessons)
    .innerJoin(units, eq(units.id, lessons.unitId))
    .leftJoin(lessonSections, eq(lessonSections.lessonId, lessons.id))
    .leftJoin(lessonBlocks, eq(lessonBlocks.sectionId, lessonSections.id))
    .leftJoin(vocabularyItems, eq(vocabularyItems.id, lessonBlocks.vocabularyItemId))
    .leftJoin(phrases, eq(phrases.id, lessonBlocks.phraseId))
    .leftJoin(concepts, eq(concepts.id, lessonBlocks.conceptId))
    .leftJoin(examples, eq(examples.id, lessonBlocks.exampleId))
    .leftJoin(dialogues, eq(dialogues.id, lessonBlocks.dialogueId))
    .leftJoin(dialogueLines, eq(dialogueLines.dialogueId, dialogues.id))
    .leftJoin(voices, eq(voices.id, dialogueLines.voiceId))
    .leftJoin(exercises, eq(exercises.id, lessonBlocks.exerciseId))
    .leftJoin(exerciseItems, eq(exerciseItems.exerciseId, exercises.id))
    .where(eq(lessons.slug, slug))
    .orderBy(
      asc(lessonSections.stage),
      asc(lessonBlocks.position),
      asc(dialogueLines.position),
      asc(exerciseItems.position),
    );
}

export type LessonRow = Awaited<ReturnType<typeof findLessonRows>>[number];
