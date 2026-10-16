import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

// The database client of the running API (TRD-BE-07). The caller creates it once, at module scope, so every request
// in a warm serverless instance reuses the same pool instead of opening new connections (TRD-PERF-03).

export type Db = NodePgDatabase<typeof schema>;

export interface Database {
  db: Db;
  pool: pg.Pool;
  /** Resolves when the database answers `select 1`; rejects otherwise. Used by `/health/ready`. */
  check: () => Promise<void>;
  /** Closes every connection. For scripts and tests; the API never calls it per request. */
  close: () => Promise<void>;
}

export interface DatabaseOptions {
  /** Called when an idle pooled connection fails, instead of crashing the process. */
  onIdleError?: (error: Error) => void;
}

export function createDatabase(connectionString: string, { onIdleError }: DatabaseOptions = {}): Database {
  const pool = new pg.Pool({ connectionString });
  // pg emits 'error' when an idle client loses its connection; without a listener the process would exit.
  pool.on('error', (error) => onIdleError?.(error));
  return {
    db: drizzle({ client: pool, schema }),
    pool,
    check: async () => {
      await pool.query('select 1');
    },
    close: () => pool.end(),
  };
}
