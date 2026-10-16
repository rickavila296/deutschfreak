import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadRootEnv, readDatabaseUrl } from './env.ts';

// Schema §9 rules for tables 7 to 24, checked against the migrated Neon dev branch (task 2b.1). Every test runs in
// a transaction that is rolled back. Codes start with TEST so they never meet authored codes.

loadRootEnv();
const client = new pg.Client({ connectionString: readDatabaseUrl('DATABASE_URL_DIRECT') });

beforeAll(() => client.connect());
afterAll(() => client.end());
beforeEach(() => client.query('begin'));
afterEach(() => client.query('rollback'));

const PG = { notNull: '23502', restrict: '23001', unique: '23505', check: '23514', invalidValue: '22P02' };

async function id(sql: string, params: unknown[] = []): Promise<string> {
  const { rows } = await client.query<{ id: string }>(`${sql} returning id`, params);
  return rows[0]!.id;
}

/** Expects the statement to be refused with the given PostgreSQL error code (and constraint name, if given). */
async function refused(sql: string, params: unknown[], code: string, constraint?: string) {
  await client.query('savepoint s');
  let error: (Error & { code?: string; constraint?: string }) | undefined;
  try {
    await client.query(sql, params);
  } catch (e) {
    error = e as typeof error;
  }
  await client.query('rollback to savepoint s');
  expect(error, `expected PostgreSQL to refuse: ${sql}`).toBeDefined();
  expect(error!.code).toBe(code);
  if (constraint) expect(error!.constraint).toBe(constraint);
}

const count = async (sql: string, params: unknown[] = []) =>
  (await client.query<{ n: number }>(`select count(*)::int as n from ${sql}`, params)).rows[0]!.n;

// ---- fixtures ----

async function lesson() {
  const level = await id(`insert into levels (code, title) values ('TEST', 'L')`);
  const part = await id(
    `insert into course_parts (code, level_id, title, tagline, position) values ('TEST.1', $1, 'P', 'T', 1)`,
    [level],
  );
  const unit = await id(
    `insert into units (code, course_part_id, slug, title, subtitle_en, position) values ('TEST.1.U01', $1, 'test-unit', 'U', 'S', 1)`,
    [part],
  );
  return id(
    `insert into lessons (code, unit_id, slug, title, archetypes, mastery_task_en, position)
     values ('TEST.1.U01.L01', $1, 'test-lesson', 'L', '{conversation}', 'T', 1)`,
    [unit],
  );
}
const section = (lessonId: string, stage = 1, code = 'TEST.1.U01.L01.S1') =>
  id(`insert into lesson_sections (code, lesson_id, stage) values ($1, $2, $3)`, [code, lessonId, stage]);
const word = (code = 'vocab:test', wordClass = 'noun', article: string | null = 'der') =>
  id(
    `insert into vocabulary_items (code, slug, lemma, word_class, article, meaning_en, tier, level)
     values ($1, $1, 'Test', $2, $3, 'test', 'core_active', 'A1')`,
    [code, wordClass, article],
  );
const phrase = (code = 'phrase:test') =>
  id(`insert into phrases (code, slug, german, meaning_en, level) values ($1, $1, 'Test', 'test', 'A1')`, [code]);
const concept = (code = 'G99') =>
  id(
    `insert into concepts (code, slug, type, title, explanation_en, level) values ($1, $1, 'grammar', 'T', 'E', 'A1')`,
    [code],
  );
const example = (code = 'eg:test-01') =>
  id(`insert into examples (code, german, meaning_en, level) values ($1, 'Test.', 'test', 'A1')`, [code]);
const voice = (code = 'voice:test') => id(`insert into voices (code, name) values ($1, 'Test')`, [code]);
const dialogue = (code = 'dlg:test-01') =>
  id(`insert into dialogues (code, slug, title, register) values ($1, $1, 'T', 'informal')`, [code]);
const line = (dialogueId: string, voiceId: string, position = 1, code = `dlg:test-01:l0${position}`) =>
  id(
    `insert into dialogue_lines (code, dialogue_id, position, speaker_role, german, meaning_en, voice_id)
     values ($1, $2, $3, 'A', 'Hallo.', 'Hello.', $4)`,
    [code, dialogueId, position, voiceId],
  );
const exercise = (code = 'ex:test-01') =>
  id(`insert into exercises (code, type, skill, instruction_en) values ($1, 'multiple_choice', 'grammar', 'Choose.')`, [
    code,
  ]);
const item = (exerciseId: string, position = 1, exampleId: string | null = null) =>
  id(`insert into exercise_items (code, exercise_id, position, payload, example_id) values ($1, $2, $3, '{}', $4)`, [
    `ex:test-01:i0${position}`,
    exerciseId,
    position,
    exampleId,
  ]);
const blockSql = `insert into lesson_blocks (code, section_id, position, kind, vocabulary_item_id, phrase_id, exercise_id, text_en, mode)
  values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
const block = (
  sectionId: string,
  position: number,
  kind: string,
  t: { word?: string; phrase?: string; exercise?: string; text?: string; mode?: string } = {},
) =>
  id(blockSql, [
    `TEST.1.U01.L01.S1.B0${position}`,
    sectionId,
    position,
    kind,
    t.word ?? null,
    t.phrase ?? null,
    t.exercise ?? null,
    t.text ?? null,
    t.mode ?? null,
  ]);

// ---- tests ----

describe('lesson_sections (DB-CK-03, DB-UQ-06, DB-DEL-01)', () => {
  it('refuses a stage outside 1 to 9', async () => {
    const l = await lesson();
    for (const stage of [0, 10]) {
      await refused(
        `insert into lesson_sections (code, lesson_id, stage) values ('TEST.S', $1, $2)`,
        [l, stage],
        PG.check,
        'lesson_sections_stage_check',
      );
    }
  });

  it('refuses two sections for the same stage', async () => {
    const l = await lesson();
    await section(l, 3, 'TEST.S3');
    await refused(
      `insert into lesson_sections (code, lesson_id, stage) values ('TEST.S3b', $1, 3)`,
      [l],
      PG.unique,
      'lesson_sections_lesson_id_stage_key',
    );
  });

  it('gives a section weight normal by default', async () => {
    const s = await section(await lesson());
    expect((await client.query('select weight from lesson_sections where id = $1', [s])).rows[0]).toEqual({
      weight: 'normal',
    });
  });

  it('deletes sections and blocks with their lesson', async () => {
    const l = await lesson();
    const s = await section(l);
    await block(s, 1, 'text', { text: 'Intro' });
    await client.query('delete from lessons where id = $1', [l]);
    expect(await count('lesson_sections where id = $1', [s])).toBe(0);
    expect(await count('lesson_blocks where section_id = $1', [s])).toBe(0);
  });
});

describe('lesson_blocks (DB-CK-01, DB-CK-02, DB-UQ-07, DB-DEL-02, decision 0007)', () => {
  it('refuses a block with two targets (Phase 2b acceptance)', async () => {
    const s = await section(await lesson());
    const [w, p] = [await word(), await phrase()];
    await refused(
      blockSql,
      ['TEST.B', s, 1, 'vocabulary', w, p, null, null, null],
      PG.check,
      'lesson_blocks_one_target_check',
    );
  });

  it('refuses a text block with a target, and a vocabulary block without one', async () => {
    const s = await section(await lesson());
    const w = await word();
    await refused(
      blockSql,
      ['TEST.B', s, 1, 'text', w, null, null, 'x', null],
      PG.check,
      'lesson_blocks_one_target_check',
    );
    // A vocabulary block with no target breaks both block checks; PostgreSQL may name either one.
    await refused(blockSql, ['TEST.B', s, 1, 'vocabulary', null, null, null, null, null], PG.check);
  });

  it('refuses a target that does not match the kind', async () => {
    const s = await section(await lesson());
    const w = await word();
    await refused(
      blockSql,
      ['TEST.B', s, 1, 'phrase', w, null, null, null, null],
      PG.check,
      'lesson_blocks_kind_target_check',
    );
  });

  it('accepts a text block and one block per target kind', async () => {
    const s = await section(await lesson());
    await block(s, 1, 'text', { text: 'Intro' });
    await block(s, 2, 'vocabulary', { word: await word() });
    await block(s, 3, 'phrase', { phrase: await phrase() });
    await block(s, 4, 'exercise', { exercise: await exercise(), mode: 'recall' });
    expect(await count('lesson_blocks where section_id = $1', [s])).toBe(4);
  });

  it('refuses a mode on a block that is not an exercise (decision 0007)', async () => {
    const s = await section(await lesson());
    const w = await word();
    await refused(
      blockSql,
      ['TEST.B', s, 1, 'vocabulary', w, null, null, null, 'recall'],
      PG.check,
      'lesson_blocks_mode_check',
    );
    await refused(
      blockSql,
      ['TEST.B', s, 1, 'text', null, null, null, 'x', 'recall'],
      PG.check,
      'lesson_blocks_mode_check',
    );
  });

  it('refuses a mode outside the review modes', async () => {
    const s = await section(await lesson());
    const e = await exercise();
    await refused(blockSql, ['TEST.B', s, 1, 'exercise', null, null, e, null, 'remember'], PG.invalidValue);
  });

  it('refuses deleting a word a block uses (Phase 2b acceptance)', async () => {
    const s = await section(await lesson());
    const w = await word();
    await block(s, 1, 'vocabulary', { word: w });
    await refused('delete from vocabulary_items where id = $1', [w], PG.restrict);
  });

  it('refuses deleting a phrase or an exercise a block uses', async () => {
    const s = await section(await lesson());
    const [p, e] = [await phrase(), await exercise()];
    await block(s, 1, 'phrase', { phrase: p });
    await block(s, 2, 'exercise', { exercise: e });
    await refused('delete from phrases where id = $1', [p], PG.restrict);
    await refused('delete from exercises where id = $1', [e], PG.restrict);
  });

  it('refuses a duplicate position at commit, and allows two blocks to swap (deferrable, decision 0005)', async () => {
    const s = await section(await lesson());
    const a = await block(s, 1, 'text', { text: 'a' });
    const b = await block(s, 2, 'text', { text: 'b' });
    await client.query('update lesson_blocks set position = 2 where id = $1', [a]);
    await client.query('update lesson_blocks set position = 1 where id = $1', [b]);
    await client.query('set constraints all immediate');
    await client.query('set constraints all deferred');
    await client.query('update lesson_blocks set position = 1 where id = $1', [a]);
    await refused('set constraints all immediate', [], PG.unique, 'lesson_blocks_section_id_position_key');
  });
});

describe('concepts and concept_prerequisites (DB-CK-06)', () => {
  it('refuses a concept that requires itself', async () => {
    const c = await concept();
    await refused(
      `insert into concept_prerequisites (concept_id, requires_concept_id) values ($1, $1)`,
      [c],
      PG.check,
      'concept_prerequisites_not_self_check',
    );
  });

  it('restricts deleting a required concept and cascades from the requiring one', async () => {
    const [a, b] = [await concept('G98'), await concept('G99')];
    await client.query(`insert into concept_prerequisites (concept_id, requires_concept_id) values ($1, $2)`, [a, b]);
    await refused('delete from concepts where id = $1', [b], PG.restrict);
    await client.query('delete from concepts where id = $1', [a]);
    expect(await count('concept_prerequisites where requires_concept_id = $1', [b])).toBe(0);
  });

  it('refuses a duplicate concept slug (DB-UQ-02)', async () => {
    await concept('G98');
    await refused(
      `insert into concepts (code, slug, type, title, explanation_en, level) values ('G97', 'G98', 'grammar', 'T', 'E', 'A1')`,
      [],
      PG.unique,
      'concepts_slug_key',
    );
  });
});

describe('vocabulary_items (DB-CK-05) and phrases', () => {
  it('refuses a noun without an article and a verb with one', async () => {
    await refused(
      `insert into vocabulary_items (code, slug, lemma, word_class, meaning_en, tier, level) values ('vocab:x', 'x', 'X', 'noun', 'x', 'core_active', 'A1')`,
      [],
      PG.check,
      'vocabulary_items_article_check',
    );
    await refused(
      `insert into vocabulary_items (code, slug, lemma, word_class, article, meaning_en, tier, level) values ('vocab:y', 'y', 'y', 'verb', 'der', 'y', 'core_active', 'A1')`,
      [],
      PG.check,
      'vocabulary_items_article_check',
    );
  });

  it('accepts a function word without an article', async () => {
    await word('vocab:und', 'function_word', null);
    expect(await count(`vocabulary_items where code = 'vocab:und'`)).toBe(1);
  });

  it('gives a phrase register neutral by default', async () => {
    const p = await phrase();
    expect((await client.query('select register from phrases where id = $1', [p])).rows[0]).toEqual({
      register: 'neutral',
    });
  });
});

describe('example links, topics and voices (DB-DEL-02, DB-DEL-04, DB-DEL-07)', () => {
  it('cascades example links from the example and restricts the word and concept they point at', async () => {
    const [e, w, c] = [await example(), await word(), await concept()];
    await client.query(`insert into example_vocabulary (example_id, vocabulary_item_id) values ($1, $2)`, [e, w]);
    await client.query(`insert into example_concepts (example_id, concept_id) values ($1, $2)`, [e, c]);
    await refused('delete from vocabulary_items where id = $1', [w], PG.restrict);
    await refused('delete from concepts where id = $1', [c], PG.restrict);
    await client.query('delete from examples where id = $1', [e]);
    expect(await count('example_vocabulary where vocabulary_item_id = $1', [w])).toBe(0);
    expect(await count('example_concepts where concept_id = $1', [c])).toBe(0);
  });

  it('restricts deleting a topic in use and cascades the link from the word', async () => {
    const w = await word();
    const t = await id(`insert into topics (code, slug, title) values ('topic:test', 'test', 'Test')`);
    await client.query(`insert into vocabulary_topics (vocabulary_item_id, topic_id) values ($1, $2)`, [w, t]);
    await refused('delete from topics where id = $1', [t], PG.restrict);
    await client.query('delete from vocabulary_items where id = $1', [w]);
    expect(await count('vocabulary_topics where topic_id = $1', [t])).toBe(0);
  });

  it('cascades dialogue lines from their dialogue and restricts a voice in use (DB-DEL-05)', async () => {
    const [d, v] = [await dialogue(), await voice()];
    await line(d, v, 1);
    await refused('delete from voices where id = $1', [v], PG.restrict);
    await client.query('delete from dialogues where id = $1', [d]);
    expect(await count('dialogue_lines where dialogue_id = $1', [d])).toBe(0);
  });

  it('refuses two dialogue lines in one position at commit (DB-UQ-08, deferrable)', async () => {
    const [d, v] = [await dialogue(), await voice()];
    await line(d, v, 1, 'dlg:test-01:l01');
    await line(d, v, 1, 'dlg:test-01:l02');
    await refused('set constraints all immediate', [], PG.unique, 'dialogue_lines_dialogue_id_position_key');
  });
});

describe('audio_assets (DB-CK-07, DB-UQ-10, DB-DEL-06)', () => {
  const audioSql = `insert into audio_assets (vocabulary_item_id, phrase_id, voice_id, variant, production_method, storage_key, duration_ms, text_hash)
    values ($1, $2, $3, $4, 'synthetic', $5, $6, 'hash')`;

  it('refuses a clip with no owner or with two owners', async () => {
    const [w, p, v] = [await word(), await phrase(), await voice()];
    await refused(audioSql, [null, null, v, 'normal', 'k1', 100], PG.check, 'audio_assets_one_owner_check');
    await refused(audioSql, [w, p, v, 'normal', 'k1', 100], PG.check, 'audio_assets_one_owner_check');
  });

  it('refuses a duration of zero', async () => {
    const [w, v] = [await word(), await voice()];
    await refused(audioSql, [w, null, v, 'normal', 'k1', 0], PG.check, 'audio_assets_duration_ms_check');
  });

  it('refuses a second clip for the same owner, voice and variant, but allows the slow variant', async () => {
    const [w, v] = [await word(), await voice()];
    await client.query(audioSql, [w, null, v, 'normal', 'k1', 100]);
    await refused(
      audioSql,
      [w, null, v, 'normal', 'k2', 100],
      PG.unique,
      'audio_assets_vocabulary_item_id_voice_id_variant_key',
    );
    await client.query(audioSql, [w, null, v, 'slow', 'k3', 100]);
    expect(await count('audio_assets where vocabulary_item_id = $1', [w])).toBe(2);
  });

  it('refuses a duplicate storage key', async () => {
    const [w, p, v] = [await word(), await phrase(), await voice()];
    await client.query(audioSql, [w, null, v, 'normal', 'k1', 100]);
    await refused(audioSql, [null, p, v, 'normal', 'k1', 100], PG.unique, 'audio_assets_storage_key_key');
  });

  it('deletes a clip with its owner and restricts deleting its voice', async () => {
    const [w, v] = [await word(), await voice()];
    await client.query(audioSql, [w, null, v, 'normal', 'k1', 100]);
    await refused('delete from voices where id = $1', [v], PG.restrict);
    await client.query('delete from vocabulary_items where id = $1', [w]);
    expect(await count(`audio_assets where storage_key = 'k1'`)).toBe(0);
  });
});

describe('exercises, exercise_items and exercise_targets (DB-CK-08, DB-UQ-09, DB-UQ-11)', () => {
  it('cascades items from the exercise and restricts an example an item uses', async () => {
    const [e, ex] = [await exercise(), await example()];
    await item(e, 1, ex);
    await refused('delete from examples where id = $1', [ex], PG.restrict);
    await client.query('delete from exercises where id = $1', [e]);
    expect(await count('exercise_items where exercise_id = $1', [e])).toBe(0);
  });

  it('refuses two items in one position at commit (deferrable)', async () => {
    const e = await exercise();
    await item(e, 1);
    await client.query(
      `insert into exercise_items (code, exercise_id, position, payload) values ('ex:test-01:i09', $1, 1, '{}')`,
      [e],
    );
    await refused('set constraints all immediate', [], PG.unique, 'exercise_items_exercise_id_position_key');
  });

  it('refuses a target row with no target or two targets', async () => {
    const [e, w, c] = [await exercise(), await word(), await concept()];
    await refused(
      `insert into exercise_targets (exercise_id) values ($1)`,
      [e],
      PG.check,
      'exercise_targets_one_target_check',
    );
    await refused(
      `insert into exercise_targets (exercise_id, vocabulary_item_id, concept_id) values ($1, $2, $3)`,
      [e, w, c],
      PG.check,
      'exercise_targets_one_target_check',
    );
  });

  it('refuses the same target twice for one exercise but allows several different targets', async () => {
    const [e, w, c] = [await exercise(), await word(), await concept()];
    await client.query(`insert into exercise_targets (exercise_id, vocabulary_item_id) values ($1, $2)`, [e, w]);
    await client.query(`insert into exercise_targets (exercise_id, concept_id) values ($1, $2)`, [e, c]);
    await refused(
      `insert into exercise_targets (exercise_id, vocabulary_item_id) values ($1, $2)`,
      [e, w],
      PG.unique,
      'exercise_targets_exercise_id_vocabulary_item_id_key',
    );
    await refused('delete from vocabulary_items where id = $1', [w], PG.restrict);
  });

  it('refuses an exercise type outside the 18', async () => {
    await refused(
      `insert into exercises (code, type, skill, instruction_en) values ('ex:x', 'crossword', 'grammar', 'x')`,
      [],
      PG.invalidValue,
    );
  });
});
