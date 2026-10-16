// Seeds a1.yaml and the pool and lesson files into the database in one transaction. Run with `pnpm --filter @deutschfreak/db seed`.
// Uses the direct connection string, like migrations. Prints row counts, never the connection string.
import { loadA1Structure, loadContentFiles } from '@deutschfreak/content';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { loadRootEnv, readDatabaseUrl } from '../src/env.ts';
import * as schema from '../src/schema.ts';
import { seed } from '../src/seed.ts';

loadRootEnv();
const client = new pg.Client({ connectionString: readDatabaseUrl('DATABASE_URL_DIRECT') });
try {
  const file = loadA1Structure();
  const { files: content, problems } = loadContentFiles();
  if (problems.length > 0) throw new Error(`content files are not valid:\n  - ${problems.join('\n  - ')}`);
  await client.connect();
  const { written, absent } = await seed(drizzle({ client, schema }), file, content);
  for (const [table, n] of Object.entries(written)) console.log(`${table}: ${n} rows written`);
  if (absent.length > 0) {
    console.log(`In the database but not in the content files (not deleted, retire them explicitly; DB-IMP-07):`);
    for (const entry of absent) console.log(`  - ${entry}`);
  }
} catch (error) {
  console.error(`Seed failed, nothing was written: ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
