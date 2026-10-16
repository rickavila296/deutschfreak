import { loadA1Structure, loadContentFiles } from '@deutschfreak/content';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { loadRootEnv } from '../env.ts';
import * as schema from '../schema.ts';
import { seed } from '../seed.ts';
import migrateTestDatabase from './migrate-test-database.ts';
import { testDatabaseUrl } from './test-database.ts';

/**
 * Vitest global setup for API database tests (decision 0012): migrates the test branch, then seeds a1.yaml and the
 * content files into it, so the API reads the same content as dev. The seed is idempotent; the dev branch is never
 * touched.
 */
export default async function setup() {
  await migrateTestDatabase();
  loadRootEnv();
  const { files, problems } = loadContentFiles();
  if (problems.length > 0) throw new Error(`content files are not valid:\n  - ${problems.join('\n  - ')}`);
  const client = new pg.Client({ connectionString: testDatabaseUrl() });
  await client.connect();
  try {
    await seed(drizzle({ client, schema }), loadA1Structure(), files);
  } finally {
    await client.end();
  }
}
