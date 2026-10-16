// Prints the row count of every structure table, for the Phase 2 gate (seed twice, same counts; DB-MIG-06).
// Run with `pnpm --filter @deutschfreak/db counts`. Prints counts only, never the connection string.
import pg from 'pg';
import { loadRootEnv, readDatabaseUrl } from '../src/env.ts';

const tables = ['levels', 'course_parts', 'units', 'lessons', 'learning_objectives', 'lesson_objectives'];

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
} finally {
  await client.end();
}
