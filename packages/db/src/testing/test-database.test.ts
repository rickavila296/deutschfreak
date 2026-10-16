import { describe, expect, it } from 'vitest';
import { testDatabaseUrl } from './test-database.ts';

// Decision 0012: database tests use their own Neon branch (DATABASE_URL_TEST) and must never touch the dev branch.
const dev = 'postgresql://owner:pw@ep-dev-123.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const test = 'postgresql://owner:pw@ep-test-456.eu-central-1.aws.neon.tech/neondb?sslmode=require';

describe('testDatabaseUrl (decision 0012)', () => {
  it('returns DATABASE_URL_TEST when it points at a different database from DATABASE_URL_DIRECT', () => {
    expect(testDatabaseUrl({ DATABASE_URL_TEST: test, DATABASE_URL_DIRECT: dev })).toBe(test);
  });

  it('fails when DATABASE_URL_TEST is missing, naming the variable', () => {
    expect(() => testDatabaseUrl({ DATABASE_URL_DIRECT: dev })).toThrow(/DATABASE_URL_TEST is not set/);
  });

  it('refuses a test database on the same host as the dev database, without showing either value', () => {
    let message = '';
    try {
      testDatabaseUrl({ DATABASE_URL_TEST: dev.replace('neondb', 'other'), DATABASE_URL_DIRECT: dev });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL_TEST points at the same database host as DATABASE_URL_DIRECT/);
    expect(message).not.toContain('ep-dev-123');
    expect(message).not.toContain('pw');
  });

  it('refuses a pooled test connection, as migrations need the direct one', () => {
    expect(() =>
      testDatabaseUrl({
        DATABASE_URL_TEST: test.replace('ep-test-456', 'ep-test-456-pooler'),
        DATABASE_URL_DIRECT: dev,
      }),
    ).toThrow(/DATABASE_URL_TEST must be a direct connection string/);
  });
});

describe('testDatabaseUrl when DATABASE_URL_DIRECT is not set (review finding 6)', () => {
  const pooledDev = dev.replace('ep-dev-123', 'ep-dev-123-pooler');

  it('refuses a test database on the dev endpoint known only from the pooled DATABASE_URL', () => {
    expect(() => testDatabaseUrl({ DATABASE_URL_TEST: dev, DATABASE_URL: pooledDev })).toThrow(
      /DATABASE_URL_TEST points at the same database host as DATABASE_URL/,
    );
  });

  it('accepts a separate test database when only DATABASE_URL is set', () => {
    expect(testDatabaseUrl({ DATABASE_URL_TEST: test, DATABASE_URL: pooledDev })).toBe(test);
  });

  it('refuses to run when neither dev variable is set, so the guard cannot be skipped', () => {
    expect(() => testDatabaseUrl({ DATABASE_URL_TEST: test })).toThrow(
      /Set DATABASE_URL_DIRECT or DATABASE_URL so the tests can check they are not using the dev database/,
    );
  });
});
