import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { createDatabase } from './client.ts';
import { loadRootEnv } from './env.ts';
import { levels } from './schema.ts';
import { testDatabaseUrl } from './testing/test-database.ts';

// Task 3.4: the API's client against the test branch (decision 0012). Read-only.
loadRootEnv();
const database = createDatabase(testDatabaseUrl());

afterAll(() => database.close());

describe('createDatabase against Neon (TRD-BE-07)', () => {
  it('check() resolves when the database answers', async () => {
    await expect(database.check()).resolves.toBeUndefined();
  });

  it('runs Drizzle queries through one pool, reusing its connection', async () => {
    const [row] = await database.db.execute<{ one: number }>(sql`select 1 as one`).then((r) => r.rows);
    expect(row?.one).toBe(1);
    await database.db.select({ code: levels.code }).from(levels).limit(1);
    await database.check();
    expect(database.pool.totalCount).toBe(1);
  });
});
