// Shows the database refusing two kinds of bad data on the seeded content (Phase 2b acceptance). Everything runs in
// a transaction that is rolled back, so nothing changes. Run with `pnpm --filter @deutschfreak/db show-refusals`.
import pg from 'pg';
import { loadRootEnv, readDatabaseUrl } from '../src/env.ts';

loadRootEnv();
const client = new pg.Client({ connectionString: readDatabaseUrl('DATABASE_URL_DIRECT') });

async function attempt(label: string, sql: string) {
  await client.query('savepoint s');
  try {
    await client.query(sql);
    console.log(`${label}: ACCEPTED (this should not happen)`);
    process.exitCode = 1;
  } catch (error) {
    const e = error as Error & { constraint?: string };
    console.log(`${label}: refused (${e.message}${e.constraint ? `; constraint ${e.constraint}` : ''})`);
  }
  await client.query('rollback to savepoint s');
}

try {
  await client.connect();
  await client.query('begin');
  await attempt(
    '1. A block with two targets (a word and a phrase)',
    `insert into lesson_blocks (code, section_id, position, kind, vocabulary_item_id, phrase_id)
     select 'A1.1.U01.L01.S3.B99', s.id, 99, 'vocabulary', w.id, p.id
     from lesson_sections s, vocabulary_items w, phrases p
     where s.code = 'A1.1.U01.L01.S3' and w.code = 'vocab:danke' and p.code = 'phrase:hallo'`,
  );
  // danke is also used by an example and an exercise; drop those links first (rolled back) so the lesson block is
  // what refuses.
  for (const table of ['example_vocabulary', 'exercise_targets']) {
    await client.query(
      `delete from ${table} where vocabulary_item_id = (select id from vocabulary_items where code = 'vocab:danke')`,
    );
  }
  await attempt(
    '2. Deleting the word danke, which lesson A1.1.U01.L01 uses',
    `delete from vocabulary_items where code = 'vocab:danke'`,
  );
} finally {
  await client.query('rollback');
  await client.end();
}
