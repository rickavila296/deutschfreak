import { createDatabase } from '@deutschfreak/db';
import { testDatabaseUrl } from '@deutschfreak/db/testing';
import { apiErrorResponseSchema, levelMapResponseSchema, lessonResponseSchema } from '@deutschfreak/validation';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.ts';

// Task 3.6: Supertest against the real app and the seeded Neon test branch (TRD-API-03, TRD-ERR-02).
const database = createDatabase(testDatabaseUrl());
const app = createApp({ webOrigin: 'https://deutschfreak.com', logSink: () => {}, db: database.db });
const slug = 'hallo-und-tschuess'; // A1.1.U01.L01, the one published lesson

/** Every key anywhere in a JSON value. */
function allKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) for (const v of value) allKeys(v, keys);
  else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      allKeys(v, keys);
    }
  }
  return keys;
}

/** Every string anywhere in a JSON value. */
function allStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const v of value) allStrings(v, out);
  else if (value !== null && typeof value === 'object') for (const v of Object.values(value)) allStrings(v, out);
  return out;
}

/** Every value of a `code` or `voice` key anywhere in a JSON value: the codes the response exposes. */
function allCodes(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) for (const v of value) allCodes(v, out);
  else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if ((k === 'code' || k === 'voice') && typeof v === 'string') out.push(v);
      else allCodes(v, out);
    }
  }
  return out;
}

/** The stored payloads of the lesson's exercise items, read straight from the database. */
let stored: { code: string; payload: Record<string, unknown>; feedbackEn: string | null }[] = [];

beforeAll(async () => {
  const { rows } = await database.pool.query<{
    code: string;
    payload: Record<string, unknown>;
    feedback_en: string | null;
  }>(
    `select i.code, i.payload, i.feedback_en from exercise_items i
       join lesson_blocks b on b.exercise_id = i.exercise_id
       join lesson_sections s on s.id = b.section_id
       join lessons l on l.id = s.lesson_id
      where l.slug = $1`,
    [slug],
  );
  stored = rows.map((r) => ({ code: r.code, payload: r.payload, feedbackEn: r.feedback_en }));
});

afterAll(() => database.close());

describe('GET /v1/lessons/:slug (TRD-API-03)', () => {
  it('returns the published lesson with its nine sections in stage order, blocks and targets', async () => {
    const res = await request(app).get(`/v1/lessons/${slug}`);
    expect(res.status).toBe(200);
    const body = lessonResponseSchema.parse(res.body);
    expect(body.lesson).toMatchObject({ code: 'A1.1.U01.L01', slug, unit: { code: 'A1.1.U01' } });
    expect(body.sections.map((s) => s.stage)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const blocks = body.sections.flatMap((s) => s.blocks);
    expect(blocks).toHaveLength(36);
    const dialogue = blocks.find((b) => b.kind === 'dialogue');
    expect(dialogue?.kind === 'dialogue' && dialogue.dialogue.lines.length).toBeGreaterThan(0);
    const exercises = blocks.flatMap((b) => (b.kind === 'exercise' ? [b.exercise] : []));
    expect(exercises.length).toBeGreaterThan(0);
    for (const exercise of exercises) expect(exercise.items.length).toBeGreaterThan(0);
  });

  it('contains no answer field (TRD-ARCH-03, TRD-SEC-11, TRD-TEST-03)', async () => {
    const res = await request(app).get(`/v1/lessons/${slug}`);
    expect(res.status).toBe(200);
    expect(stored.length).toBeGreaterThan(0);
    const keys = allKeys(res.body);
    for (const answerKey of [
      'answers',
      'answer',
      'model',
      'checklist',
      'feedbackEn',
      'feedback_en',
      'payload',
      'hint',
    ]) {
      expect(keys.has(answerKey), `response has the key "${answerKey}"`).toBe(false);
    }
    // Each item is exactly its code plus the prompt side of its stored payload: nothing else of the payload (answers,
    // model, checklist, hint) and none of the feedback reaches the browser. Answer words may still appear elsewhere
    // as lesson content (a model answer can be a phrase the lesson teaches), so values are compared item by item.
    const items = lessonResponseSchema
      .parse(res.body)
      .sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'exercise' ? b.exercise.items : [])));
    expect(items).toHaveLength(stored.length);
    const byCode = new Map(stored.map((row) => [row.code, row.payload]));
    for (const item of items) {
      const payload = byCode.get(item.code);
      expect(payload, item.code).toBeDefined();
      const promptSide = Object.fromEntries(
        Object.entries(payload!).filter(([key]) => ['prompt', 'options'].includes(key)),
      );
      expect(item).toEqual({ code: item.code, ...promptSide });
    }
    expect(stored.some((row) => 'answers' in row.payload || 'model' in row.payload)).toBe(true);
    // No item names anything else in the response: a phrase or word code would point to the block that holds its
    // meaning, which is the answer of a listening item (review 3 finding 1). Every code found anywhere in the
    // response is collected, so no list of code prefixes can go stale (review notes N3).
    expect(stored.some((row) => 'audio' in row.payload)).toBe(true);
    const responseCodes = new Set(allCodes(res.body));
    for (const item of items) {
      const { code, ...rest } = item;
      for (const value of allStrings(rest)) expect(responseCodes.has(value), `${code} names ${value}`).toBe(false);
    }
  });

  it('loads the lesson with one query, not one per block (TRD-BE-04)', async () => {
    const pool = database.pool as unknown as { query: (...args: unknown[]) => unknown };
    const original = pool.query;
    let queries = 0;
    pool.query = (...args: unknown[]) => {
      queries += 1;
      return original.apply(database.pool, args);
    };
    try {
      expect((await request(app).get(`/v1/lessons/${slug}`)).status).toBe(200);
    } finally {
      pool.query = original;
    }
    expect(queries).toBe(1);
  });

  it('never exposes a uuid (TRD-API-21)', async () => {
    const res = await request(app).get(`/v1/lessons/${slug}`);
    expect(res.text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  });

  it('answers lesson_not_found for an unknown slug', async () => {
    const res = await request(app).get('/v1/lessons/no-such-lesson');
    expect(res.status).toBe(404);
    expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('lesson_not_found');
  });

  it('answers lesson_not_found for a planned lesson, which cannot be opened (FR-012)', async () => {
    const map = levelMapResponseSchema.parse((await request(app).get('/v1/levels/A1/map')).body);
    const planned = map.parts.flatMap((p) => p.units.flatMap((u) => u.lessons)).find((l) => l.status === 'planned');
    expect(planned).toBeDefined();
    const res = await request(app).get(`/v1/lessons/${planned!.slug}`);
    expect(res.status).toBe(404);
    expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('lesson_not_found');
  });

  it('answers validation_failed for a malformed slug (TRD-ERR-03)', async () => {
    for (const bad of ['Hallo-Und-Tschuess', 'hallo_und_tschuess', '-hallo', 'hallo--tschuess']) {
      const res = await request(app).get(`/v1/lessons/${bad}`);
      expect(res.status).toBe(400);
      expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('validation_failed');
    }
  });
});
