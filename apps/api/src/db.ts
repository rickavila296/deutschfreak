import { createDatabase, loadRootEnv, readPooledDatabaseUrl, type Database } from '@deutschfreak/db';
import { attachDatabasePool } from '@vercel/functions';
import { errorLogLine, stdoutSink } from './request-log.ts';

// The API's one database client, with the pooled connection string (TRD-BE-07, TRD-PERF-03). src/main.ts calls this
// once, at module scope, so every request in a warm instance reuses the same pool. Only this app opens a database
// connection (TRD-BE-01); apps/web never imports packages/db (architecture rule 1). Throws, naming the variable,
// when DATABASE_URL is missing or not pooled.
export function createApiDatabase(): Database {
  loadRootEnv();
  const database = createDatabase(readPooledDatabaseUrl(), {
    onIdleError: (error) => stdoutSink(errorLogLine(error, 'idle-connection')),
  });
  // Vercel Fluid compute: release idle pool clients before an instance is suspended, so connections do not leak
  // (Vercel docs, @vercel/functions attachDatabasePool, checked 2026-10-16).
  attachDatabasePool(database.pool);
  return database;
}
