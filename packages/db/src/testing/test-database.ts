import { readDatabaseUrl } from '../env.ts';

/** The Neon endpoint of a connection string: its host without the `-pooler` suffix, so pooled and direct match. */
const endpoint = (url: string) => new URL(url).hostname.replace('-pooler', '');

/**
 * The connection string for database tests (decision 0012): DATABASE_URL_TEST, a separate Neon branch. It must be a
 * direct connection and must not point at the dev endpoint of DATABASE_URL_DIRECT or DATABASE_URL, and at least one of
 * those must be set so the check cannot be skipped (review finding 6). A test can never write to the dev branch.
 * Errors name the variables, never their values (TRD-ENV-02).
 */
export function testDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = readDatabaseUrl('DATABASE_URL_TEST', env);
  if (new URL(url).hostname.includes('-pooler')) {
    throw new Error(
      'DATABASE_URL_TEST must be a direct connection string (no -pooler host); the tests run migrations.',
    );
  }
  const devNames = (['DATABASE_URL_DIRECT', 'DATABASE_URL'] as const).filter((name) => env[name]?.trim());
  if (devNames.length === 0) {
    throw new Error(
      'Set DATABASE_URL_DIRECT or DATABASE_URL so the tests can check they are not using the dev database.',
    );
  }
  for (const name of devNames) {
    if (endpoint(readDatabaseUrl(name, env)) === endpoint(url)) {
      throw new Error(
        `DATABASE_URL_TEST points at the same database host as ${name}. Use a separate Neon branch for tests.`,
      );
    }
  }
  return url;
}
