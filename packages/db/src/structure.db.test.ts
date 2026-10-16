import pg from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadRootEnv } from './env.ts';
import { testDatabaseUrl } from './testing/test-database.ts';

// Schema §9 rules for tables 1 to 6, checked against the migrated Neon dev branch. Every test runs inside a
// transaction that is rolled back, so no row is left behind. Codes start with TEST so they never meet seeded codes.

loadRootEnv();
const client = new pg.Client({ connectionString: testDatabaseUrl() });

beforeAll(() => client.connect());
afterAll(() => client.end());
beforeEach(() => client.query('begin'));
afterEach(() => client.query('rollback'));

const PG = { notNull: '23502', restrict: '23001', unique: '23505', check: '23514', invalidValue: '22P02' };

async function id(sql: string, params: unknown[]): Promise<string> {
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

const level = () => id(`insert into levels (code, title) values ('TEST', 'Test level')`, []);
const part = (levelId: string, code = 'TEST.1', position = 1) =>
  id(`insert into course_parts (code, level_id, title, tagline, position) values ($1, $2, 'Part', 'I can test.', $3)`, [
    code,
    levelId,
    position,
  ]);
const unit = (partId: string, code = 'TEST.1.U01', position = 1) =>
  id(
    `insert into units (code, course_part_id, slug, title, subtitle_en, position) values ($1, $2, $3, 'Unit', 'Subtitle', $4)`,
    [code, partId, code.toLowerCase(), position],
  );
const lessonSql = `insert into lessons (code, unit_id, slug, title, archetypes, mastery_task_en, position)
  values ($1, $2, $3, 'Lesson', $4::lesson_archetype[], 'Task', $5)`;
const lesson = (unitId: string, code = 'TEST.1.U01.L01', position = 1) =>
  id(lessonSql, [code, unitId, code.toLowerCase(), '{conversation}', position]);
const objective = (code = 'TEST.1.U01.L01.O1') =>
  id(`insert into learning_objectives (code, can_do_en, skill) values ($1, 'Can test', 'grammar')`, [code]);

async function tree() {
  const levelId = await level();
  const partId = await part(levelId);
  const unitId = await unit(partId);
  const lessonId = await lesson(unitId);
  const objectiveId = await objective();
  await client.query(`insert into lesson_objectives (lesson_id, objective_id, role) values ($1, $2, 'introduces')`, [
    lessonId,
    objectiveId,
  ]);
  return { levelId, partId, unitId, lessonId, objectiveId };
}

describe('defaults (Schema §8.4)', () => {
  it('gives a new lesson status planned, revision 1, a uuid and timestamps', async () => {
    const { lessonId } = await tree();
    const { rows } = await client.query('select status, revision, created_at, updated_at from lessons where id = $1', [
      lessonId,
    ]);
    expect(rows[0]).toMatchObject({ status: 'planned', revision: 1 });
    expect(rows[0].created_at).toBeInstanceOf(Date);
    expect(lessonId).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('unique constraints (DB-UQ-01 to 05)', () => {
  it('refuses a duplicate code (DB-UQ-01)', async () => {
    await level();
    await refused(`insert into levels (code, title) values ('TEST', 'Again')`, [], PG.unique, 'levels_code_key');
  });

  it('refuses a duplicate unit or lesson slug (DB-UQ-02)', async () => {
    const { partId, unitId } = await tree();
    await refused(
      `insert into units (code, course_part_id, slug, title, subtitle_en, position) values ('TEST.1.U02', $1, 'test.1.u01', 'U', 'S', 2)`,
      [partId],
      PG.unique,
      'units_slug_key',
    );
    await refused(
      lessonSql,
      ['TEST.1.U01.L02', unitId, 'test.1.u01.l01', '{grammar}', 2],
      PG.unique,
      'lessons_slug_key',
    );
  });

  it('refuses a duplicate position at commit time (DB-UQ-03 to 05, decision 0005)', async () => {
    const { levelId, partId, unitId } = await tree();
    await part(levelId, 'TEST.2', 1);
    await unit(partId, 'TEST.1.U02', 1);
    await lesson(unitId, 'TEST.1.U01.L02', 1);
    await refused('set constraints all immediate', [], PG.unique);
  });

  it('allows two lessons to swap positions inside one transaction (deferrable, decision 0005)', async () => {
    const { unitId, lessonId } = await tree();
    const second = await lesson(unitId, 'TEST.1.U01.L02', 2);
    await client.query('update lessons set position = 2 where id = $1', [lessonId]);
    await client.query('update lessons set position = 1 where id = $1', [second]);
    await expect(client.query('set constraints all immediate')).resolves.toBeDefined();
  });

  it('keeps code uniqueness non-deferrable, so upserts can target it', async () => {
    await level();
    const { rows } = await client.query(
      `insert into levels (code, title) values ('TEST', 'Renamed') on conflict (code) do update set title = excluded.title returning title`,
    );
    expect(rows[0].title).toBe('Renamed');
  });
});

describe('check constraints and types', () => {
  it('refuses a lesson without archetypes (DB-CK-04)', async () => {
    const { unitId } = await tree();
    await refused(lessonSql, ['TEST.1.U01.L02', unitId, 'test-l02', '{}', 2], PG.check, 'lessons_archetypes_check');
  });

  it('refuses a skill outside the eight (decision 0006)', async () => {
    await refused(
      `insert into learning_objectives (code, can_do_en, skill) values ('TEST.O9', 'x', 'speaking')`,
      [],
      PG.invalidValue,
    );
  });

  it('refuses an objective without a skill (Schema §8.5)', async () => {
    await refused(`insert into learning_objectives (code, can_do_en) values ('TEST.O9', 'x')`, [], PG.notNull);
  });
});

describe('delete rules (DB-DEL-02 to 04)', () => {
  it('refuses deleting a level, part or unit that still has children (DB-DEL-03)', async () => {
    const { levelId, partId, unitId } = await tree();
    await refused('delete from levels where id = $1', [levelId], PG.restrict);
    await refused('delete from course_parts where id = $1', [partId], PG.restrict);
    await refused('delete from units where id = $1', [unitId], PG.restrict);
  });

  it('refuses deleting an objective a lesson uses (DB-DEL-02)', async () => {
    const { objectiveId } = await tree();
    await refused('delete from learning_objectives where id = $1', [objectiveId], PG.restrict);
  });

  it('removes the lesson_objectives link with its lesson (DB-DEL-04)', async () => {
    const { lessonId, objectiveId } = await tree();
    await client.query('delete from lessons where id = $1', [lessonId]);
    const { rows } = await client.query('select count(*)::int as n from lesson_objectives where objective_id = $1', [
      objectiveId,
    ]);
    expect(rows[0].n).toBe(0);
  });

  it('refuses linking the same objective to a lesson twice (primary key)', async () => {
    const { lessonId, objectiveId } = await tree();
    await refused(
      `insert into lesson_objectives (lesson_id, objective_id, role) values ($1, $2, 'assesses')`,
      [lessonId, objectiveId],
      PG.unique,
    );
  });
});
