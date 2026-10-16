// Prints the row count of every content table, for the Phase 2 gate (seed twice, same counts; DB-MIG-06).
// Run with `pnpm --filter @deutschfreak/db counts`. Prints counts only, never the connection string.
import pg from 'pg';
import { loadRootEnv, readDatabaseUrl } from '../src/env.ts';

// The 24 content tables of Schema v1 in seed order (Schema §8, DB-IMP-04). audio_assets is written by the audio script.
const tables = [
  'levels',
  'course_parts',
  'units',
  'lessons',
  'learning_objectives',
  'lesson_objectives',
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
  'audio_assets',
];

loadRootEnv();
const client = new pg.Client({ connectionString: readDatabaseUrl('DATABASE_URL_DIRECT') });
try {
  await client.connect();
  for (const table of tables) {
    const { rows } = await client.query<{ n: number }>(`select count(*)::int as n from ${table}`);
    console.log(`${table}: ${rows[0]?.n}`);
  }
  const { rows } = await client.query<{ status: string; n: number }>(
    'select status, count(*)::int as n from lessons group by status order by status',
  );
  console.log(`lessons by status: ${rows.map((r) => `${r.status} ${r.n}`).join(', ') || 'none'}`);
  const published = await client.query<{ code: string; sections: number }>(
    `select l.code, count(s.id)::int as sections from lessons l left join lesson_sections s on s.lesson_id = l.id
     where l.status = 'published' group by l.code order by l.code`,
  );
  for (const r of published.rows) console.log(`published: ${r.code} with ${r.sections} sections`);
} finally {
  await client.end();
}
