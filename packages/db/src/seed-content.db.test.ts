import { countContent, loadA1Structure, loadContentFiles, type ContentFiles } from '@deutschfreak/content';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadRootEnv, readDatabaseUrl } from './env.ts';
import * as schema from './schema.ts';
import { seed, seedStructure } from './seed.ts';
import { seedContent } from './seed-content.ts';

// Task 2b.4: the full seed order against the Neon dev branch (Schema §10, DB-IMP-01 to 09, DB-INT-01, 04, 08;
// TRD-CNT-06, 07, 08). Tests "inside a transaction" roll back and leave the database as they found it.

loadRootEnv();
const client = new pg.Client({ connectionString: readDatabaseUrl('DATABASE_URL_DIRECT') });
const db = drizzle({ client, schema });
const structure = loadA1Structure();
const { files: content } = loadContentFiles();
const copy = (): ContentFiles => structuredClone(content);
const L01 = 'A1.1.U01.L01';

beforeAll(() => client.connect());
afterAll(() => client.end());

const TABLES = [
  'topics',
  'voices',
  'concepts',
  'concept_prerequisites',
  'vocabulary_items',
  'vocabulary_topics',
  'phrases',
  'examples',
  'example_vocabulary',
  'example_concepts',
  'dialogues',
  'dialogue_lines',
  'exercises',
  'exercise_items',
  'exercise_targets',
  'lesson_sections',
  'lesson_blocks',
] as const;

async function counts() {
  const out: Record<string, number> = {};
  for (const t of TABLES) out[t] = (await client.query(`select count(*)::int as n from ${t}`)).rows[0].n;
  return out;
}

const one = async (sql: string, params: unknown[] = []) => (await client.query(sql, params)).rows[0];

/** The row counts the content files imply. */
function expected() {
  const c = countContent(content);
  const all = <T>(f: (x: ContentFiles) => T[]) => f(content);
  const lesson = content.lessons[0]!;
  return {
    topics: c.topics,
    voices: c.voices,
    concepts: c.concepts,
    concept_prerequisites: all((x) => x.concepts.flatMap((f) => f.concepts.flatMap((k) => k.requires ?? []))).length,
    vocabulary_items: c.vocabulary,
    vocabulary_topics: all((x) => x.vocabulary.flatMap((f) => f.items.flatMap((i) => [f.topic, ...(i.topics ?? [])])))
      .length,
    phrases: c.phrases,
    examples: c.examples,
    example_vocabulary: all((x) => x.examples.flatMap((f) => f.examples.flatMap((e) => e.vocabulary ?? []))).length,
    example_concepts: all((x) => x.examples.flatMap((f) => f.examples.flatMap((e) => e.concepts ?? []))).length,
    dialogues: c.dialogues,
    dialogue_lines: c.dialogueLines,
    exercises: c.exercises,
    exercise_items: c.exerciseItems,
    exercise_targets: all((x) => x.exercises.flatMap((f) => f.exercises.flatMap((e) => e.targets))).length,
    lesson_sections: lesson.sections.length,
    lesson_blocks: lesson.sections.flatMap((s) => s.blocks).length,
  };
}

describe('inside a transaction', () => {
  beforeEach(async () => {
    await client.query('begin');
    await seedStructure(db, structure);
  });
  afterEach(() => client.query('rollback'));

  it('writes every pool and lesson row the files define, in the full seed order (TRD-CNT-07)', async () => {
    await seedContent(db, content);
    expect(await counts()).toEqual(expected());
  });

  it('gives identical counts and keeps every id when run twice (DB-INT-04, the Phase 2 gate)', async () => {
    await seedContent(db, content);
    const first = await counts();
    const ids = (await client.query('select code, id from lesson_blocks order by code')).rows;
    await seedContent(db, content);
    expect(await counts()).toEqual(first);
    expect((await client.query('select code, id from lesson_blocks order by code')).rows).toEqual(ids);
  });

  it('publishes L01 with nine sections and leaves the other U01 lessons planned (decision 0009, DB-INT-08)', async () => {
    await seedContent(db, content);
    expect(await one(`select status from lessons where code = $1`, [L01])).toEqual({ status: 'published' });
    expect(
      await one(
        `select count(*)::int as n from lesson_sections s join lessons l on l.id = s.lesson_id where l.code = $1`,
        [L01],
      ),
    ).toEqual({ n: 9 });
    expect(
      await one(`select count(*)::int as n from lessons where code like 'A1.1.U01.%' and status = 'planned'`),
    ).toEqual({ n: 4 });
  });

  it('resolves each block target by code into the column for its kind', async () => {
    await seedContent(db, content);
    const row = await one(
      `select b.kind, p.code as phrase, b.vocabulary_item_id, b.exercise_id
       from lesson_blocks b left join phrases p on p.id = b.phrase_id where b.code = $1`,
      [`${L01}.S3.B02`],
    );
    expect(row).toEqual({ kind: 'phrase', phrase: 'phrase:hallo', vocabulary_item_id: null, exercise_id: null });
  });

  it('sets positions from file order for blocks, dialogue lines and exercise items (TRD-CNT-08)', async () => {
    await seedContent(db, content);
    expect(await one(`select position from lesson_blocks where code = $1`, [`${L01}.S3.B17`])).toEqual({
      position: 17,
    });
    expect(await one(`select position from dialogue_lines where code = 'dlg:erste-begegnung-01:l03'`)).toEqual({
      position: 3,
    });
    expect(await one(`select position from exercise_items where code = 'ex:greetings-speaking-02:i06'`)).toEqual({
      position: 6,
    });
  });

  it('carries stage 7 recall mode and the section weights from the file', async () => {
    await seedContent(db, content);
    expect(await one(`select mode from lesson_blocks where code = $1`, [`${L01}.S7.B01`])).toEqual({ mode: 'recall' });
    expect(await one(`select weight from lesson_sections where code = $1`, [`${L01}.S2`])).toEqual({ weight: 'heavy' });
    expect(await one(`select weight from lesson_sections where code = $1`, [`${L01}.S5`])).toEqual({
      weight: 'normal',
    });
  });

  it('links exercise targets to concepts, words, phrases and objectives by code', async () => {
    await seedContent(db, content);
    const { rows } = await client.query(
      `select count(*)::int as n from exercise_targets t join exercises e on e.id = t.exercise_id
       join learning_objectives o on o.id = t.objective_id
       where e.code = 'ex:greetings-speaking-02' and o.code = 'A1.1.U01.L01.O1'`,
    );
    expect(rows[0].n).toBe(1);
  });

  it('stores the exercise payload as JSON', async () => {
    await seedContent(db, content);
    expect(
      await one(`select payload->'answers' as answers from exercise_items where code = $1`, [
        'ex:greetings-vocabulary-recall-01:i01',
      ]),
    ).toEqual({ answers: ['danke'] });
  });

  it('removes links no longer in the files (DB-IMP-06)', async () => {
    await seedContent(db, content);
    const changed = copy();
    changed.concepts.flatMap((f) => f.concepts).find((c) => c.code === 'G02')!.requires = [];
    changed.examples.flatMap((f) => f.examples).find((e) => e.code === 'eg:ja-danke-01')!.vocabulary = ['vocab:ja'];
    changed.exercises.flatMap((f) => f.exercises).find((e) => e.code === 'ex:greetings-speaking-02')!.targets = [
      'phrase:hallo',
    ];
    await seedContent(db, changed);
    const now = await counts();
    const before = expected();
    expect(now.concept_prerequisites).toBe(before.concept_prerequisites - 1);
    expect(now.example_vocabulary).toBe(before.example_vocabulary - 1);
    expect(now.exercise_targets).toBe(before.exercise_targets);
    expect(
      await one(`select count(*)::int as n from exercise_targets t join exercises e on e.id = t.exercise_id
        where e.code = 'ex:greetings-speaking-02' and t.objective_id is not null`),
    ).toEqual({ n: 0 });
  });

  it('reports a code that is in the database but not in the files, and does not delete it (DB-IMP-07)', async () => {
    await seedContent(db, content);
    await client.query(
      `insert into phrases (code, slug, german, meaning_en, level) values ('phrase:retired', 'retired', 'x', 'x', 'A1')`,
    );
    const report = await seedContent(db, content);
    expect(report.absent).toEqual(['phrases phrase:retired']);
    expect(await one(`select count(*)::int as n from phrases where code = 'phrase:retired'`)).toEqual({ n: 1 });
  });
});

describe('one transaction for the whole run (DB-IMP-02, TRD-CNT-06)', () => {
  it('fails loudly on an unknown code and rolls back everything, structure included', async () => {
    const before = await counts();
    const lessonsBefore = await one(`select count(*)::int as n from lessons where status = 'published'`);
    const broken = copy();
    broken.lessons[0]!.sections[2]!.blocks[1]!.ref = 'phrase:does-not-exist';
    await expect(seed(db, structure, broken)).rejects.toThrow('Unknown code phrase:does-not-exist');
    expect(await counts()).toEqual(before);
    expect(await one(`select count(*)::int as n from lessons where status = 'published'`)).toEqual(lessonsBefore);
  });

  it('refuses to publish a lesson file without all nine sections (DB-INT-08)', async () => {
    const before = await counts();
    const broken = copy();
    broken.lessons[0]!.sections.pop();
    await expect(seed(db, structure, broken)).rejects.toThrow(`${L01} has 8 sections; a published lesson needs 9`);
    expect(await counts()).toEqual(before);
  });

  it('refuses a lesson file for a lesson that is not in a1.yaml', async () => {
    const broken = copy();
    broken.lessons[0]!.lesson = 'A1.1.U09.L01';
    await expect(seed(db, structure, broken)).rejects.toThrow('Unknown code A1.1.U09.L01');
  });
});
