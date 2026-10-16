import { createDatabase } from '@deutschfreak/db';
import { testDatabaseUrl } from '@deutschfreak/db/testing';
import { apiErrorResponseSchema, levelMapResponseSchema } from '@deutschfreak/validation';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.ts';

// Task 3.5: Supertest against the real app and the seeded Neon test branch (TRD-ERR-02: success, 404, invalid input).
const database = createDatabase(testDatabaseUrl());
const app = createApp({ webOrigin: 'https://deutschfreak.com', logSink: () => {}, db: database.db });

afterAll(() => database.close());

describe('GET /v1/levels/:code/map (TRD-API-02)', () => {
  it('returns the whole A1 tree: 4 parts, 24 units, 92 lessons (FR-011)', async () => {
    const res = await request(app).get('/v1/levels/A1/map');
    expect(res.status).toBe(200);
    const map = levelMapResponseSchema.parse(res.body);
    expect(map.level.code).toBe('A1');
    expect(map.parts.map((p) => p.code)).toEqual(['A1.1', 'A1.2', 'A1.3', 'A1.4']);
    expect(map.parts.map((p) => p.units.length)).toEqual([6, 6, 6, 6]);
    const lessons = map.parts.flatMap((p) => p.units.flatMap((u) => u.lessons));
    expect(lessons).toHaveLength(92);
    expect(new Set(lessons.map((l) => l.code)).size).toBe(92);
    for (const lesson of lessons) expect(lesson.objectives.length).toBeGreaterThanOrEqual(1);
  });

  it('keeps curriculum order and marks only authored lessons as published (FR-012)', async () => {
    const map = levelMapResponseSchema.parse((await request(app).get('/v1/levels/A1/map')).body);
    const lessons = map.parts.flatMap((p) => p.units.flatMap((u) => u.lessons));
    expect(lessons[0]?.code).toBe('A1.1.U01.L01');
    expect(lessons.map((l) => l.code)).toEqual([...lessons.map((l) => l.code)].sort());
    expect(lessons.filter((l) => l.status === 'published').map((l) => l.code)).toEqual(['A1.1.U01.L01']);
  });

  it('never exposes a uuid (TRD-API-21)', async () => {
    const res = await request(app).get('/v1/levels/A1/map');
    expect(res.text).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(res.text).not.toMatch(/"id"/);
  });

  it('answers level_not_found for a well-formed code with no level', async () => {
    const res = await request(app).get('/v1/levels/B2/map');
    expect(res.status).toBe(404);
    expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('level_not_found');
  });

  it('answers validation_failed for a malformed code, before any query runs (TRD-ERR-03)', async () => {
    for (const code of ['a1', 'A9', 'A1.1', 'xyz']) {
      const res = await request(app).get(`/v1/levels/${code}/map`);
      expect(res.status).toBe(400);
      expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('validation_failed');
    }
  });
});
