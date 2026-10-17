import { describe, expect, it } from 'vitest';
import { readDatabaseUrl, readPooledDatabaseUrl } from './env.ts';

// TRD-DB-14: the app uses the pooled string, migrations the direct one. TRD-ENV-02: values never appear in output.
const secret = 'postgresql://owner:s3cret-pw@ep-example.eu-central-1.aws.neon.tech/neondb?sslmode=require';

describe('readDatabaseUrl (TRD-DB-14, TRD-ENV-02)', () => {
  it('returns the direct connection string', () => {
    expect(readDatabaseUrl('DATABASE_URL_DIRECT', { DATABASE_URL_DIRECT: secret })).toBe(secret);
  });

  it('returns the pooled connection string', () => {
    expect(readDatabaseUrl('DATABASE_URL', { DATABASE_URL: secret })).toBe(secret);
  });

  it('fails with the variable name when the variable is missing or blank', () => {
    expect(() => readDatabaseUrl('DATABASE_URL_DIRECT', {})).toThrow(/DATABASE_URL_DIRECT is not set/);
    expect(() => readDatabaseUrl('DATABASE_URL_DIRECT', { DATABASE_URL_DIRECT: '  ' })).toThrow(
      /DATABASE_URL_DIRECT is not set/,
    );
  });

  it('rejects a value that is not a PostgreSQL URL without repeating the value', () => {
    const wrong = 'mysql://owner:s3cret-pw@host/db';
    let message = '';
    try {
      readDatabaseUrl('DATABASE_URL_DIRECT', { DATABASE_URL_DIRECT: wrong });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL_DIRECT is not a PostgreSQL connection string/);
    expect(message).not.toContain('s3cret-pw');
    expect(message).not.toContain('host');
  });
});

describe('readPooledDatabaseUrl (TRD-BE-07, TRD-DB-14)', () => {
  const pooled = 'postgresql://owner:s3cret-pw@ep-example-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require';

  it('returns the pooled connection string', () => {
    expect(readPooledDatabaseUrl({ DATABASE_URL: pooled })).toBe(pooled);
  });

  it('refuses a direct connection string without repeating it', () => {
    let message = '';
    try {
      readPooledDatabaseUrl({ DATABASE_URL: secret });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL must be the pooled connection string/);
    expect(message).not.toContain('s3cret-pw');
    expect(message).not.toContain('ep-example');
  });

  it('fails with the variable name when DATABASE_URL is missing', () => {
    expect(() => readPooledDatabaseUrl({})).toThrow(/DATABASE_URL is not set/);
  });
});
