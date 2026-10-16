import type { ContentFiles } from '@deutschfreak/content';
import { codeKind } from '@deutschfreak/validation';
import { and, eq, inArray, notInArray } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import {
  conceptPrerequisites,
  concepts,
  dialogueLines,
  dialogues,
  exampleConcepts,
  examples,
  exampleVocabulary,
  exerciseItems,
  exercises,
  exerciseTargets,
  learningObjectives,
  lessonBlocks,
  lessons,
  lessonSections,
  phrases,
  topics,
  vocabularyItems,
  vocabularyTopics,
  voices,
} from './schema.ts';
import {
  absentCodes,
  excluded,
  existing,
  idOf,
  idsByCode,
  now,
  rewriteLinks,
  type Db,
  type Ids,
  type SeedReport,
} from './seed-helpers.ts';

// Seed runner for the knowledge pool and lesson files (Plan task 2b.4; Schema §10, DB-IMP-01 to 09; TRD-CNT-06 to 08).
// Runs after the structure seed, in the same transaction, in the seed order of DB-IMP-04 / TRD-CNT-07. Every row is
// upserted on its code; references are resolved from code to id and an unknown code fails the whole run. Link tables
// are rewritten to match the files (DB-IMP-06). A lesson whose file is imported becomes `published`, and its file must
// hold all nine sections (DB-INT-08, decision 0009). Parts of an imported lesson, dialogue or exercise that its
// file no longer has are deleted (decision 0013); knowledge objects are only reported (DB-IMP-07). Audio assets are written by the audio script, not here.

/**
 * Deletes the parts of an imported owner (lines of a dialogue, items of an exercise, sections or blocks of a lesson)
 * that its file no longer has, before the remaining parts are written, so their positions cannot collide
 * (decision 0013). Returns "table code" for each deleted row.
 */
async function removeParts(
  db: Db,
  table: PgTable & { code: PgColumn },
  name: string,
  ownerColumn: PgColumn,
  ownerId: string,
  keep: string[],
): Promise<string[]> {
  const where =
    keep.length > 0 ? and(eq(ownerColumn, ownerId), notInArray(table.code, keep)) : eq(ownerColumn, ownerId);
  const rows = (await db.delete(table).where(where).returning({ code: table.code })) as { code: string }[];
  return rows.map((r) => `${name} ${r.code}`).sort();
}

const flat = <F, T>(files: F[], rows: (f: F) => T[]) => files.flatMap(rows);

/** Writes the pool and lesson files. Call it after `seedStructure`, inside the same transaction. */
export async function seedContent(db: Db, files: ContentFiles): Promise<SeedReport> {
  const written: Record<string, number> = {};
  const removed: string[] = [];

  // 1. Topics and voices.
  const topicRows = flat(files.topics, (f) => f.topics);
  const topicIds = idsByCode(
    topicRows.length === 0
      ? []
      : await db
          .insert(topics)
          .values(topicRows.map((t) => ({ code: t.code, slug: t.slug, title: t.title })))
          .onConflictDoUpdate({
            target: topics.code,
            set: { slug: excluded('slug'), title: excluded('title'), updatedAt: now },
          })
          .returning({ id: topics.id, code: topics.code }),
  );
  written.topics = topicIds.size;

  const voiceRows = flat(files.voices, (f) => f.voices);
  const voiceIds = idsByCode(
    voiceRows.length === 0
      ? []
      : await db
          .insert(voices)
          .values(
            voiceRows.map((v) => ({
              code: v.code,
              name: v.name,
              gender: v.gender ?? null,
              ageBand: v.age_band ?? null,
              region: v.region ?? null,
            })),
          )
          .onConflictDoUpdate({
            target: voices.code,
            set: {
              name: excluded('name'),
              gender: excluded('gender'),
              ageBand: excluded('age_band'),
              region: excluded('region'),
              updatedAt: now,
            },
          })
          .returning({ id: voices.id, code: voices.code }),
  );
  written.voices = voiceIds.size;

  // 2. Concepts, then prerequisites.
  const conceptRows = flat(files.concepts, (f) => f.concepts);
  const conceptIds = idsByCode(
    conceptRows.length === 0
      ? []
      : await db
          .insert(concepts)
          .values(
            conceptRows.map((c) => ({
              code: c.code,
              slug: c.slug,
              type: c.type,
              title: c.title,
              explanationEn: c.explanation_en,
              level: c.level,
            })),
          )
          .onConflictDoUpdate({
            target: concepts.code,
            set: {
              slug: excluded('slug'),
              type: excluded('type'),
              title: excluded('title'),
              explanationEn: excluded('explanation_en'),
              level: excluded('level'),
              updatedAt: now,
            },
          })
          .returning({ id: concepts.id, code: concepts.code }),
  );
  written.concepts = conceptIds.size;
  written.concept_prerequisites = 0;
  for (const c of conceptRows) {
    const required = (c.requires ?? []).map((code) => idOf(conceptIds, code));
    await rewriteLinks(
      db,
      conceptPrerequisites,
      conceptPrerequisites.conceptId,
      conceptPrerequisites.requiresConceptId,
      idOf(conceptIds, c.code),
      required,
      (requiresConceptId) => ({ conceptId: idOf(conceptIds, c.code), requiresConceptId }),
    );
    written.concept_prerequisites += required.length;
  }

  // 3. Vocabulary (with its topics), phrases, examples (with their links).
  const wordRows = flat(files.vocabulary, (f) =>
    f.items.map((item) => ({ item, topics: [f.topic, ...(item.topics ?? [])] })),
  );
  const wordIds = idsByCode(
    wordRows.length === 0
      ? []
      : await db
          .insert(vocabularyItems)
          .values(
            wordRows.map(({ item: w }) => ({
              code: w.code,
              slug: w.slug,
              lemma: w.lemma,
              wordClass: w.word_class,
              article: w.article ?? null,
              plural: w.plural ?? null,
              meaningEn: w.meaning_en,
              tier: w.tier,
              level: w.level,
            })),
          )
          .onConflictDoUpdate({
            target: vocabularyItems.code,
            set: {
              slug: excluded('slug'),
              lemma: excluded('lemma'),
              wordClass: excluded('word_class'),
              article: excluded('article'),
              plural: excluded('plural'),
              meaningEn: excluded('meaning_en'),
              tier: excluded('tier'),
              level: excluded('level'),
              updatedAt: now,
            },
          })
          .returning({ id: vocabularyItems.id, code: vocabularyItems.code }),
  );
  written.vocabulary_items = wordIds.size;
  written.vocabulary_topics = 0;
  for (const { item, topics: topicCodes } of wordRows) {
    const wordId = idOf(wordIds, item.code);
    const ids = topicCodes.map((code) => idOf(topicIds, code));
    await rewriteLinks(
      db,
      vocabularyTopics,
      vocabularyTopics.vocabularyItemId,
      vocabularyTopics.topicId,
      wordId,
      ids,
      (topicId) => ({
        vocabularyItemId: wordId,
        topicId,
      }),
    );
    written.vocabulary_topics += ids.length;
  }

  const phraseRows = flat(files.phrases, (f) => f.phrases);
  const phraseIds = idsByCode(
    phraseRows.length === 0
      ? []
      : await db
          .insert(phrases)
          .values(
            phraseRows.map((p) => ({
              code: p.code,
              slug: p.slug,
              german: p.german,
              meaningEn: p.meaning_en,
              register: p.register ?? 'neutral',
              level: p.level,
            })),
          )
          .onConflictDoUpdate({
            target: phrases.code,
            set: {
              slug: excluded('slug'),
              german: excluded('german'),
              meaningEn: excluded('meaning_en'),
              register: excluded('register'),
              level: excluded('level'),
              updatedAt: now,
            },
          })
          .returning({ id: phrases.id, code: phrases.code }),
  );
  written.phrases = phraseIds.size;

  const exampleRows = flat(files.examples, (f) => f.examples);
  const exampleIds = idsByCode(
    exampleRows.length === 0
      ? []
      : await db
          .insert(examples)
          .values(exampleRows.map((e) => ({ code: e.code, german: e.german, meaningEn: e.meaning_en, level: e.level })))
          .onConflictDoUpdate({
            target: examples.code,
            set: {
              german: excluded('german'),
              meaningEn: excluded('meaning_en'),
              level: excluded('level'),
              updatedAt: now,
            },
          })
          .returning({ id: examples.id, code: examples.code }),
  );
  written.examples = exampleIds.size;
  written.example_vocabulary = 0;
  written.example_concepts = 0;
  for (const e of exampleRows) {
    const exampleId = idOf(exampleIds, e.code);
    const words = (e.vocabulary ?? []).map((code) => idOf(wordIds, code));
    await rewriteLinks(
      db,
      exampleVocabulary,
      exampleVocabulary.exampleId,
      exampleVocabulary.vocabularyItemId,
      exampleId,
      words,
      (vocabularyItemId) => ({
        exampleId,
        vocabularyItemId,
      }),
    );
    const conceptLinks = (e.concepts ?? []).map((code) => idOf(conceptIds, code));
    await rewriteLinks(
      db,
      exampleConcepts,
      exampleConcepts.exampleId,
      exampleConcepts.conceptId,
      exampleId,
      conceptLinks,
      (conceptId) => ({
        exampleId,
        conceptId,
      }),
    );
    written.example_vocabulary += words.length;
    written.example_concepts += conceptLinks.length;
  }

  // 4. Dialogues, then lines.
  const dialogueRows = flat(files.dialogues, (f) => f.dialogues);
  const dialogueIds = idsByCode(
    dialogueRows.length === 0
      ? []
      : await db
          .insert(dialogues)
          .values(dialogueRows.map((d) => ({ code: d.code, slug: d.slug, title: d.title, register: d.register })))
          .onConflictDoUpdate({
            target: dialogues.code,
            set: { slug: excluded('slug'), title: excluded('title'), register: excluded('register'), updatedAt: now },
          })
          .returning({ id: dialogues.id, code: dialogues.code }),
  );
  written.dialogues = dialogueIds.size;
  for (const d of dialogueRows) {
    removed.push(
      ...(await removeParts(
        db,
        dialogueLines,
        'dialogue_lines',
        dialogueLines.dialogueId,
        idOf(dialogueIds, d.code),
        d.lines.map((l) => l.code),
      )),
    );
  }
  const lineRows = dialogueRows.flatMap((d) =>
    d.lines.map((line, i) => ({
      code: line.code,
      dialogueId: idOf(dialogueIds, d.code),
      position: i + 1,
      speakerRole: line.speaker_role,
      german: line.german,
      meaningEn: line.meaning_en,
      voiceId: idOf(voiceIds, line.voice),
    })),
  );
  const lineIds = idsByCode(
    lineRows.length === 0
      ? []
      : await db
          .insert(dialogueLines)
          .values(lineRows)
          .onConflictDoUpdate({
            target: dialogueLines.code,
            set: {
              dialogueId: excluded('dialogue_id'),
              position: excluded('position'),
              speakerRole: excluded('speaker_role'),
              german: excluded('german'),
              meaningEn: excluded('meaning_en'),
              voiceId: excluded('voice_id'),
              updatedAt: now,
            },
          })
          .returning({ id: dialogueLines.id, code: dialogueLines.code }),
  );
  written.dialogue_lines = lineIds.size;

  // 5. Exercises, items, targets.
  const exerciseRows = flat(files.exercises, (f) => f.exercises);
  const exerciseIds = idsByCode(
    exerciseRows.length === 0
      ? []
      : await db
          .insert(exercises)
          .values(
            exerciseRows.map((e) => ({ code: e.code, type: e.type, skill: e.skill, instructionEn: e.instruction_en })),
          )
          .onConflictDoUpdate({
            target: exercises.code,
            set: {
              type: excluded('type'),
              skill: excluded('skill'),
              instructionEn: excluded('instruction_en'),
              updatedAt: now,
            },
          })
          .returning({ id: exercises.id, code: exercises.code }),
  );
  written.exercises = exerciseIds.size;
  for (const e of exerciseRows) {
    removed.push(
      ...(await removeParts(
        db,
        exerciseItems,
        'exercise_items',
        exerciseItems.exerciseId,
        idOf(exerciseIds, e.code),
        e.items.map((i) => i.code),
      )),
    );
  }
  const itemRows = exerciseRows.flatMap((e) =>
    e.items.map((item, i) => ({
      code: item.code,
      exerciseId: idOf(exerciseIds, e.code),
      position: i + 1,
      payload: item.payload,
      feedbackEn: item.feedback_en ?? null,
      exampleId: item.example ? idOf(exampleIds, item.example) : null,
    })),
  );
  const itemIds = idsByCode(
    itemRows.length === 0
      ? []
      : await db
          .insert(exerciseItems)
          .values(itemRows)
          .onConflictDoUpdate({
            target: exerciseItems.code,
            set: {
              exerciseId: excluded('exercise_id'),
              position: excluded('position'),
              payload: excluded('payload'),
              feedbackEn: excluded('feedback_en'),
              exampleId: excluded('example_id'),
              updatedAt: now,
            },
          })
          .returning({ id: exerciseItems.id, code: exerciseItems.code }),
  );
  written.exercise_items = itemIds.size;

  const objectiveIds = await existing(
    db,
    learningObjectives,
    exerciseRows.flatMap((e) => e.targets.filter((t) => codeKind(t) === 'objective')),
  );
  written.exercise_targets = 0;
  for (const e of exerciseRows) {
    const exerciseId = idOf(exerciseIds, e.code);
    const wanted = e.targets.map((code) => {
      switch (codeKind(code)) {
        case 'concept':
          return { conceptId: idOf(conceptIds, code) };
        case 'vocabulary':
          return { vocabularyItemId: idOf(wordIds, code) };
        case 'phrase':
          return { phraseId: idOf(phraseIds, code) };
        case 'objective':
          return { objectiveId: idOf(objectiveIds, code) };
        default:
          throw new Error(`Unknown code ${code}`);
      }
    });
    const key = (t: {
      conceptId?: string | null;
      vocabularyItemId?: string | null;
      phraseId?: string | null;
      objectiveId?: string | null;
    }) => [t.conceptId ?? '', t.vocabularyItemId ?? '', t.phraseId ?? '', t.objectiveId ?? ''].join('|');
    const wantedKeys = new Set(wanted.map(key));
    const current = await db.select().from(exerciseTargets).where(eq(exerciseTargets.exerciseId, exerciseId));
    const stale = current.filter((t) => !wantedKeys.has(key(t))).map((t) => t.id);
    if (stale.length > 0) await db.delete(exerciseTargets).where(inArray(exerciseTargets.id, stale));
    const currentKeys = new Set(current.map(key));
    const missing = wanted.filter((t) => !currentKeys.has(key(t)));
    if (missing.length > 0) await db.insert(exerciseTargets).values(missing.map((t) => ({ exerciseId, ...t })));
    written.exercise_targets += wanted.length;
  }

  // 6. Lesson sections and blocks; the lesson becomes published.
  const lessonIds = await existing(
    db,
    lessons,
    files.lessons.map((l) => l.lesson),
  );
  const targetIds: Record<string, Ids> = {
    vocabulary: wordIds,
    phrase: phraseIds,
    concept: conceptIds,
    example: exampleIds,
    dialogue: dialogueIds,
    exercise: exerciseIds,
  };
  written.lesson_sections = 0;
  written.lesson_blocks = 0;
  for (const file of files.lessons) {
    const lessonId = idOf(lessonIds, file.lesson);
    if (file.sections.length !== 9) {
      throw new Error(`${file.lesson} has ${file.sections.length} sections; a published lesson needs 9`);
    }
    // Sections the file no longer has go first; their blocks go with them (DB-DEL-01).
    removed.push(
      ...(await removeParts(
        db,
        lessonSections,
        'lesson_sections',
        lessonSections.lessonId,
        lessonId,
        file.sections.map((sec) => sec.code),
      )),
    );
    const sectionIds = idsByCode(
      await db
        .insert(lessonSections)
        .values(file.sections.map((s) => ({ code: s.code, lessonId, stage: s.stage, weight: s.weight ?? 'normal' })))
        .onConflictDoUpdate({
          target: lessonSections.code,
          set: {
            lessonId: excluded('lesson_id'),
            stage: excluded('stage'),
            weight: excluded('weight'),
            updatedAt: now,
          },
        })
        .returning({ id: lessonSections.id, code: lessonSections.code }),
    );
    written.lesson_sections += sectionIds.size;
    for (const sec of file.sections) {
      removed.push(
        ...(await removeParts(
          db,
          lessonBlocks,
          'lesson_blocks',
          lessonBlocks.sectionId,
          idOf(sectionIds, sec.code),
          sec.blocks.map((b) => b.code),
        )),
      );
    }

    const blockRows = file.sections.flatMap((s) =>
      s.blocks.map((b, i) => {
        const target = (kind: string) => (b.kind === kind && b.ref ? idOf(targetIds[kind]!, b.ref) : null);
        return {
          code: b.code,
          sectionId: idOf(sectionIds, s.code),
          position: i + 1,
          kind: b.kind,
          role: b.role ?? null,
          status: b.status ?? null,
          textEn: b.text_en ?? null,
          vocabularyItemId: target('vocabulary'),
          phraseId: target('phrase'),
          conceptId: target('concept'),
          exampleId: target('example'),
          dialogueId: target('dialogue'),
          exerciseId: target('exercise'),
          mode: b.mode ?? null,
        };
      }),
    );
    if (blockRows.length > 0) {
      const blocks = await db
        .insert(lessonBlocks)
        .values(blockRows)
        .onConflictDoUpdate({
          target: lessonBlocks.code,
          set: {
            sectionId: excluded('section_id'),
            position: excluded('position'),
            kind: excluded('kind'),
            role: excluded('role'),
            status: excluded('status'),
            textEn: excluded('text_en'),
            vocabularyItemId: excluded('vocabulary_item_id'),
            phraseId: excluded('phrase_id'),
            conceptId: excluded('concept_id'),
            exampleId: excluded('example_id'),
            dialogueId: excluded('dialogue_id'),
            exerciseId: excluded('exercise_id'),
            mode: excluded('mode'),
            updatedAt: now,
          },
        })
        .returning({ id: lessonBlocks.id });
      written.lesson_blocks += blocks.length;
    }
    // Schema §8.4: a lesson becomes published when its sections and blocks are imported (decision 0009).
    // Only a planned lesson is published; a retired one stays retired (review finding 4).
    await db
      .update(lessons)
      .set({ status: 'published', updatedAt: now })
      .where(and(eq(lessons.id, lessonId), eq(lessons.status, 'planned')));
  }

  const absent: string[] = [];
  const codesOf = (ids: Ids) => [...ids.keys()];
  for (const [table, ids] of [
    ['topics', topicIds],
    ['voices', voiceIds],
    ['concepts', conceptIds],
    ['vocabulary_items', wordIds],
    ['phrases', phraseIds],
    ['examples', exampleIds],
    ['dialogues', dialogueIds],
    ['dialogue_lines', lineIds],
    ['exercises', exerciseIds],
    ['exercise_items', itemIds],
  ] as const) {
    absent.push(...(await absentCodes(db, table, codesOf(ids))));
  }
  const sectionCodes = files.lessons.flatMap((l) => l.sections.map((s) => s.code));
  const blockCodes = files.lessons.flatMap((l) => l.sections.flatMap((s) => s.blocks.map((b) => b.code)));
  absent.push(...(await absentCodes(db, 'lesson_sections', sectionCodes)));
  absent.push(...(await absentCodes(db, 'lesson_blocks', blockCodes)));

  return { written, absent, removed };
}
