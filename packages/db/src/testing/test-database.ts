import { readDatabaseUrl } from '../env.ts';

/**
 * The connection string for database tests (decision 0012): DATABASE_URL_TEST, a separate Neon branch. It must be a
 * direct connection and must not point at the same host as DATABASE_URL_DIRECT, so a test can never write to the dev
 * branch. Errors name the variables, never their values (TRD-ENV-02).
 */
export function testDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = readDatabaseUrl('DATABASE_URL_TEST', env);
  const host = new URL(url).hostname;
  if (host.includes('-pooler')) {
    throw new Error(
      'DATABASE_URL_TEST must be a direct connection string (no -pooler host); the tests run migrations.',
    );
  }
  const dev = env.DATABASE_URL_DIRECT?.trim();
  if (dev && /^postgres(ql)?:\/\//.test(dev) && new URL(dev).hostname === host) {
    throw new Error(
      'DATABASE_URL_TEST points at the same database host as DATABASE_URL_DIRECT. Use a separate Neon branch for tests.',
    );
  }
  return url;
}
