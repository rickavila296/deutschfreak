import { createDatabase, loadRootEnv, readPooledDatabaseUrl } from '@deutschfreak/db';
import { attachDatabasePool } from '@vercel/functions';
import { stdoutSink } from './request-log.ts';

// The API's one database client, created once at module scope with the pooled connection string (TRD-BE-07,
// TRD-PERF-03). Every request in a warm instance reuses this pool. Only this app opens a database connection
// (TRD-BE-01); apps/web never imports packages/db (architecture rule 1).

loadRootEnv();

export const database = createDatabase(readPooledDatabaseUrl(), {
  onIdleError: (error) =>
    stdoutSink({
      level: 'error',
      time: new Date().toISOString(),
      requestId: 'none',
      error: { name: error.name, message: error.message, stack: error.stack },
    }),
});

// Vercel Fluid compute: release idle pool clients before an instance is suspended, so connections do not leak
// (Vercel docs, @vercel/functions attachDatabasePool, checked 2026-10-16).
attachDatabasePool(database.pool);
