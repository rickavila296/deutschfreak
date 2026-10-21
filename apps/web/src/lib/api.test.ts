import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, getLesson, getLevelMap } from './api.ts';

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
    await expect(
      getLevelMap('B2', fakeFetch(404, { error: { code: 'level_not_found', message: 'No level has the code B2.' } })),
    ).resolves.toBeNull();
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

describe('getLesson (TRD-FE-05)', () => {
  const lesson = {
    lesson: {
      code: 'A1.1.U01.L01',
      slug: 'example-lesson',
      title: 'Title',
      archetypes: ['conversation'],
      masteryTaskEn: 'Task',
      unit: { code: 'A1.1.U01', slug: 'unit-one', title: 'Unit' },
    },
    sections: [],
  };

  it('calls /v1/lessons/:slug and returns the checked lesson', async () => {
    const fetchImpl = fakeFetch(200, lesson);
    await expect(getLesson('example-lesson', fetchImpl)).resolves.toEqual(lesson);
    expect(vi.mocked(fetchImpl).mock.calls[0]?.[0]).toBe('http://api.test/v1/lessons/example-lesson');
  });

  it('returns null for 404, as for a planned lesson (decision 0017)', async () => {
    await expect(
      getLesson(
        'planned',
        fakeFetch(404, { error: { code: 'lesson_not_found', message: 'No published lesson has this slug.' } }),
      ),
    ).resolves.toBeNull();
  });

  it('refuses a response with an answer field (TRD-SEC-11)', async () => {
    const leaky = {
      ...lesson,
      sections: [
        {
          code: 'A1.1.U01.L01.S5',
          stage: 5,
          weight: 'normal',
          blocks: [
            {
              code: 'A1.1.U01.L01.S5.B01',
              kind: 'exercise',
              role: null,
              status: null,
              mode: null,
              textEn: null,
              exercise: {
                code: 'ex:one',
                type: 'multiple_choice',
                skill: 'reading',
                instructionEn: 'Choose.',
                items: [{ code: 'ex:one:i01', prompt: 'Which?', options: ['A', 'B'], answer: 'A' }],
              },
            },
          ],
        },
      ],
    };
    await expect(getLesson('example-lesson', fakeFetch(200, leaky))).rejects.toThrow(/schema/);
  });
});

describe('review 4 fixes (api client)', () => {
  it('treats a 404 that is not the API not-found answer as an error, not "Page not found" (finding 4)', async () => {
    const vercel404 = vi.fn(
      async () => new Response('The page could not be found', { status: 404 }),
    ) as unknown as typeof fetch;
    await expect(getLevelMap('A1', vercel404)).rejects.toBeInstanceOf(ApiRequestError);
    const routeMissing = fakeFetch(404, { error: { code: 'not_found', message: 'No route.' } });
    await expect(getLevelMap('A1', routeMissing)).rejects.toBeInstanceOf(ApiRequestError);
    const wrongCode = fakeFetch(404, { error: { code: 'level_not_found', message: 'No level.' } });
    await expect(getLesson('x', wrongCode)).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('turns a 2xx body that is not JSON into ApiRequestError (finding 5)', async () => {
    const html = vi.fn(
      async () => new Response('<!doctype html><title>Login</title>', { status: 200 }),
    ) as unknown as typeof fetch;
    await expect(getLevelMap('A1', html)).rejects.toBeInstanceOf(ApiRequestError);
    await expect(getLesson('x', html)).rejects.toBeInstanceOf(ApiRequestError);
  });

  it('asks Next to cache API responses for five minutes (finding 3)', async () => {
    const fetchImpl = fakeFetch(200, validMap);
    await getLevelMap('A1', fetchImpl);
    const init = vi.mocked(fetchImpl).mock.calls[0]?.[1] as RequestInit & { next?: { revalidate?: number } };
    expect(init.next?.revalidate).toBe(300);
    expect(init.cache).toBeUndefined();
  });
});

describe('review 4b fixes (api client)', () => {
  it('treats a 2xx body that is literally null as a schema failure, not as not-found (finding 1)', async () => {
    await expect(getLevelMap('A1', fakeFetch(200, null))).rejects.toThrow(/schema/);
    await expect(getLesson('x', fakeFetch(200, null))).rejects.toThrow(/schema/);
  });
});
