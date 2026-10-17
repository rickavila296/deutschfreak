import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, getLevelMap } from './api.ts';

// The network is replaced; the client's own handling of status codes and schema checks is what is tested.
const validMap = {
  level: { code: 'A1', title: 'German A1' },
  parts: [{ code: 'A1.1', title: 'Part', tagline: 'Tagline.', descriptionEn: null, units: [] }],
};

function fakeFetch(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test/'));
afterEach(() => vi.unstubAllEnvs());

describe('getLevelMap (TRD-FE-05)', () => {
  it('calls /v1/levels/:code/map on the configured API and returns the checked map', async () => {
    const fetchImpl = fakeFetch(200, validMap);
    await expect(getLevelMap('A1', fetchImpl)).resolves.toEqual(validMap);
    expect(vi.mocked(fetchImpl).mock.calls[0]?.[0]).toBe('http://api.test/v1/levels/A1/map');
  });

  it('returns null for 404', async () => {
    await expect(getLevelMap('B2', fakeFetch(404, { error: { code: 'level_not_found' } }))).resolves.toBeNull();
  });

  it('throws ApiRequestError for other error statuses', async () => {
    await expect(getLevelMap('A1', fakeFetch(500, {}))).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('throws ApiRequestError when the response does not match the schema', async () => {
    await expect(getLevelMap('A1', fakeFetch(200, { ...validMap, extra: true }))).rejects.toThrow(/schema/);
  });

  it('throws ApiRequestError when the API cannot be reached', async () => {
    const down = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    await expect(getLevelMap('A1', down)).rejects.toBeInstanceOf(ApiRequestError);
  });
});
