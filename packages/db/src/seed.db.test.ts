import { loadA1Structure } from '@deutschfreak/content';
import type { StructureFile } from '@deutschfreak/validation';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadRootEnv } from './env.ts';
import { testDatabaseUrl } from './testing/test-database.ts';
import * as schema from './schema.ts';
import { seed, seedStructure } from './seed.ts';

// Task 2a.4: the seed runner against the Neon dev branch (Schema §10, DB-IMP-01 to 09, DB-INT-01, DB-INT-04).
// Tests in "inside a transaction" roll back, so they leave the database as they found it.

loadRootEnv();
const url = testDatabaseUrl();
const client = new pg.Client({ connectionString: url });
const db = drizzle({ client, schema });
const file = loadA1Structure();
const copy = (): StructureFile => structuredClone(file);

beforeAll(() => client.connect());
afterAll(() => client.end());

async function counts() {
  const { rows } = await client.query<Record<string, number>>(`select
    (select count(*)::int from levels where code = 'A1') as levels,
    (select count(*)::int from course_parts where code like 'A1.%') as course_parts,
    (select count(*)::int from units where code like 'A1.%') as units,
    (select count(*)::int from lessons where code like 'A1.%') as lessons,
    (select count(*)::int from lessons where code like 'A1.%' and status = 'planned') as planned,
    (select count(*)::int from learning_objectives where code like 'A1.%') as learning_objectives,
    (select count(*)::int from lesson_objectives lo join lessons l on l.id = lo.lesson_id where l.code like 'A1.%') as lesson_objectives`);
  return rows[0]!;
}

const one = async <T extends pg.QueryResultRow>(sql: string, params: unknown[] = []) =>
  (await client.query<T>(sql, params)).rows[0]!;

describe('inside a transaction', () => {
  beforeEach(() => client.query('begin'));
  afterEach(() => client.query('rollback'));

  it('seeds 1 level, 4 parts, 24 units, 92 planned lessons and 92 objectives with their links (Schema §10)', async () => {
    // The shared test branch may hold content published by the API tests (decision 0018); start from planned lessons.
    // Rolled back with the rest of the test.
    await client.query(`update lessons set status = 'planned' where code like 'A1.%'`);
    await seedStructure(db, file);
    expect(await counts()).toEqual({
      levels: 1,
      course_parts: 4,
      units: 24,
      lessons: 92,
      planned: 92,
      learning_objectives: 92,
      lesson_objectives: 92,
    });
  });

  it('gives identical counts and keeps every id when run twice (DB-INT-04, DB-IMP-03)', async () => {
    await seedStructure(db, file);
    const first = await counts();
    const ids = await client.query('select code, id from lessons order by code');
    await seedStructure(db, file);
    expect(await counts()).toEqual(first);
    expect((await client.query('select code, id from lessons order by code')).rows).toEqual(ids.rows);
  });

  it('sets positions from file order, starting at 1 (Spec: order sets position)', async () => {
    await seedStructure(db, file);
    expect(await one(`select position from course_parts where code = 'A1.4'`)).toEqual({ position: 4 });
    expect(await one(`select position from units where code = 'A1.2.U06'`)).toEqual({ position: 6 });
    expect(await one(`select position from lessons where code = 'A1.1.U01.L03'`)).toEqual({ position: 3 });
  });

  it('writes the part descriptions and the unit contexts from the file; close-out units have none (decision 0030)', async () => {
    await seedStructure(db, file);
    expect(await one(`select count(description_en)::int as n from course_parts where code like 'A1.%'`)).toEqual({
      n: 4,
    });
    expect(await one(`select count(context_en)::int as n from units where code like 'A1.%'`)).toEqual({ n: 19 });
    expect(await one(`select context_en from units where code = 'A1.1.U01'`)).toEqual({
      context_en: 'Meeting someone for the first time, formally and informally.',
    });
    expect(await one(`select context_en from units where code = 'A1.1.U06'`)).toEqual({ context_en: null });
    const changed = copy();
    changed.level.parts[0]!.description_en = 'Changed copy.';
    await seedStructure(db, changed);
    expect(await one(`select description_en from course_parts where code = 'A1.1'`)).toEqual({
      description_en: 'Changed copy.',
    });
  });

  it('writes slugs, titles and skills literally from the file', async () => {
    await seedStructure(db, file);
    expect(await one(`select slug, title, archetypes from lessons where code = 'A1.1.U01.L01'`)).toEqual({
      slug: 'hallo-und-tschuess',
      title: 'Hallo und Tschüss',
      archetypes: '{conversation}',
    });
    expect(await one(`select skill from learning_objectives where code = 'A1.1.U01.L01.O1'`)).toEqual({
      skill: 'spoken_interaction',
    });
  });

  it('links each objective to its own lesson with role introduces (Schema §8.6)', async () => {
    await seedStructure(db, file);
    const { rows } = await client.query(`select l.code as lesson, o.code as objective, lo.role
      from lesson_objectives lo join lessons l on l.id = lo.lesson_id join learning_objectives o on o.id = lo.objective_id
      where l.code like 'A1.%' and (o.code not like l.code || '.O%' or lo.role <> 'introduces')`);
    expect(rows).toEqual([]);
  });

  it('updates a changed title on the next run without a new row (DB-IMP-03)', async () => {
    await seedStructure(db, file);
    const before = await one<{ id: string }>(`select id from lessons where code = 'A1.1.U01.L01'`);
    const changed = copy();
    changed.level.parts[0]!.units[0]!.lessons[0]!.title = 'Changed title';
    await seedStructure(db, changed);
    expect(await one(`select id, title from lessons where code = 'A1.1.U01.L01'`)).toEqual({
      id: before.id,
      title: 'Changed title',
    });
    expect((await counts()).lessons).toBe(92);
  });

  it('keeps a lesson status the importer set, so a reseed never unpublishes a lesson', async () => {
    await seedStructure(db, file);
    await client.query(`update lessons set status = 'published' where code = 'A1.1.U01.L01'`);
    await seedStructure(db, file);
    expect(await one(`select status from lessons where code = 'A1.1.U01.L01'`)).toEqual({ status: 'published' });
  });

  it('removes a lesson-objective link that is no longer in the file (DB-IMP-06)', async () => {
    await seedStructure(db, file);
    await client.query(`insert into lesson_objectives (lesson_id, objective_id, role)
      select l.id, o.id, 'assesses' from lessons l, learning_objectives o
      where l.code = 'A1.1.U01.L05' and o.code = 'A1.1.U01.L01.O1'`);
    await seedStructure(db, file);
    expect((await counts()).lesson_objectives).toBe(92);
  });

  it('reports a code that is in the database but not in the file, and does not delete it (DB-IMP-07)', async () => {
    await seedStructure(db, file);
    const unitId = (await one<{ id: string }>(`select id from units where code = 'A1.1.U01'`)).id;
    await client.query(
      `insert into lessons (code, unit_id, slug, title, archetypes, mastery_task_en, position)
       values ('A1.1.U01.L99', $1, 'retired-test-lesson', 'Retired', '{conversation}', 'Task', 99)`,
      [unitId],
    );
    const report = await seedStructure(db, file);
    expect(report.absent).toEqual(['lessons A1.1.U01.L99']);
    expect(await one(`select count(*)::int as n from lessons where code = 'A1.1.U01.L99'`)).toEqual({ n: 1 });
  });

  it('returns the number of rows written per table', async () => {
    const report = await seedStructure(db, file);
    expect(report.written).toEqual({
      levels: 1,
      course_parts: 4,
      units: 24,
      lessons: 92,
      learning_objectives: 92,
      lesson_objectives: 92,
    });
  });
});

describe('one transaction for the whole run (DB-IMP-02, DB-INT-01)', () => {
  it('rolls back everything when one row fails', async () => {
    const before = await counts();
    const broken = copy();
    // The last lesson breaks the database check lessons_archetypes_check after every other row was written.
    const lastUnit = broken.level.parts.at(-1)!.units.at(-1)!;
    (lastUnit.lessons.at(-1)!.archetypes as string[]).length = 0;
    await expect(seed(db, broken)).rejects.toThrow();
    expect(await counts()).toEqual(before);
  });
});
