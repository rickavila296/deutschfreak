import { describe, expect, it } from 'vitest';
import { createDatabase } from './client.ts';

// No network: a pool connects lazily, and an unreachable address fails the check. The real round trip is in
// client.db.test.ts on the test branch.
describe('createDatabase (TRD-BE-07)', () => {
  it('opens no connection until a query runs', async () => {
    const database = createDatabase('postgresql://user:pw@127.0.0.1:1/none');
    expect(database.pool.totalCount).toBe(0);
    await database.close();
  });

  it('check() rejects when the database cannot be reached', async () => {
    const database = createDatabase('postgresql://user:pw@127.0.0.1:1/none');
    await expect(database.check()).rejects.toThrow();
    await database.close();
  });

  it('reports an idle connection error instead of crashing', async () => {
    const errors: Error[] = [];
    const database = createDatabase('postgresql://user:pw@127.0.0.1:1/none', { onIdleError: (e) => errors.push(e) });
    database.pool.emit('error', new Error('idle client lost'));
    expect(errors.map((e) => e.message)).toEqual(['idle client lost']);
    await database.close();
  });
});
