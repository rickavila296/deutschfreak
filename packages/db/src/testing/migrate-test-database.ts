import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { loadRootEnv } from '../env.ts';
import { testDatabaseUrl } from './test-database.ts';

// Vitest global setup for database tests (decision 0012): brings the test branch up to the latest migration first,
// so the tests always run against the current schema. The dev branch is never touched.
export default async function setup() {
  loadRootEnv();
  const client = new pg.Client({ connectionString: testDatabaseUrl() });
  await client.connect();
  try {
    await migrate(drizzle({ client }), {
      migrationsFolder: fileURLToPath(new URL('../../migrations', import.meta.url)),
    });
  } finally {
    await client.end();
  }
}
