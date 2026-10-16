// Checks that the direct connection string reaches Neon. Run with `pnpm --filter @deutschfreak/db check-connection`.
// Prints only the database name, server version and region; never the connection string.
import pg from 'pg';
import { loadRootEnv, readDatabaseUrl } from '../src/env.ts';

loadRootEnv();
const url = readDatabaseUrl('DATABASE_URL_DIRECT');
const region = /\.([a-z]{2}-[a-z]+-\d)\.aws\.neon\.tech/.exec(new URL(url).hostname)?.[1] ?? 'unknown';
const pooled = new URL(url).hostname.includes('-pooler');

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  const { rows } = await client.query<{ database: string; version: string }>(
    'select current_database() as database, current_setting($1) as version',
    ['server_version'],
  );
  console.log(`Connected: database ${rows[0]?.database}, PostgreSQL ${rows[0]?.version}, region ${region}`);
  if (pooled) {
    console.error('DATABASE_URL_DIRECT points at a pooled (-pooler) host; migrations need the direct one.');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Connection failed: ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
