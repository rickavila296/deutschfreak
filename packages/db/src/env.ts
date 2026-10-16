import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Database connection settings (TRD §25). The running app uses DATABASE_URL (pooled); migrations and
// local scripts use DATABASE_URL_DIRECT (TRD-DB-14); database tests use DATABASE_URL_TEST, their own Neon
// branch (decision 0012). Values are never logged or put in error messages (TRD-ENV-02).

export type DatabaseUrlName = 'DATABASE_URL' | 'DATABASE_URL_DIRECT' | 'DATABASE_URL_TEST';

const rootEnvFile = fileURLToPath(new URL('../../../.env', import.meta.url));

/** Loads the repo-root `.env` into `process.env` when it exists. Variables already set are kept. */
export function loadRootEnv(): void {
  if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);
}

/** Returns a connection string, or throws an error that names the variable but never shows its value. */
export function readDatabaseUrl(name: DatabaseUrlName, env: NodeJS.ProcessEnv = process.env): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is not set. Add it to the .env file in the repo root (see .env.example).`);
  if (!/^postgres(ql)?:\/\//.test(value)) {
    throw new Error(`${name} is not a PostgreSQL connection string. It must start with postgresql://`);
  }
  return value;
}
