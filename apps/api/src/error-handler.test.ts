import { apiErrorResponseSchema } from '@deutschfreak/validation';
import { Router } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createApp } from './app.ts';
import { ApiError } from './errors.ts';
import type { ErrorLogLine, LogLine } from './request-log.ts';

let lines: LogLine[];
let app: ReturnType<typeof createApp>;

const querySchema = z.strictObject({ page: z.coerce.number().int().positive() });

beforeEach(() => {
  lines = [];
  const routes = Router();
  routes.get('/lesson', () => {
    throw new ApiError('lesson_not_found', 'No lesson has this slug.');
  });
  routes.get('/async-lesson', async () => {
    await Promise.resolve();
    throw new ApiError('lesson_not_found', 'No lesson has this slug.');
  });
  routes.get('/validated', (req, res) => {
    const query = querySchema.parse(req.query);
    res.json(query);
  });
  routes.post('/body', (req, res) => {
    res.json(req.body);
  });
  routes.get('/crash', () => {
    throw new Error('connect ECONNREFUSED secret-detail');
  });
  routes.get('/async-crash', async () => {
    await Promise.resolve();
    throw new Error('async secret-detail');
  });
  routes.get('/throw-string', () => {
    throw 'a bare string';
  });
  app = createApp({ webOrigin: 'https://deutschfreak.com', logSink: (line) => lines.push(line), extraRoutes: routes });
});

/** Every error response must be exactly the one shape, with the status that belongs to its code. */
function expectErrorShape(res: request.Response, code: string, status: number) {
  expect(res.status).toBe(status);
  expect(res.headers['content-type']).toMatch(/^application\/json/);
  expect(apiErrorResponseSchema.parse(res.body).error.code).toBe(code);
}

describe('the one error shape (TRD-API-20, TRD-ERR-01)', () => {
  it('answers an unknown route with not_found', async () => {
    const res = await request(app).get('/v1/nothing-here');
    expectErrorShape(res, 'not_found', 404);
  });

  it('answers an ApiError with its code and status, thrown or rejected', async () => {
    expectErrorShape(await request(app).get('/lesson'), 'lesson_not_found', 404);
    expectErrorShape(await request(app).get('/async-lesson'), 'lesson_not_found', 404);
    expect((await request(app).get('/lesson')).body.error.message).toBe('No lesson has this slug.');
  });

  it('answers a Zod failure with validation_failed, naming the field (TRD-ERR-03)', async () => {
    const bad = await request(app).get('/validated?page=zero');
    expectErrorShape(bad, 'validation_failed', 400);
    expect(bad.body.error.message).toContain('page');
    expectErrorShape(await request(app).get('/validated?page=1&extra=x'), 'validation_failed', 400);
    expect((await request(app).get('/validated?page=2')).body).toEqual({ page: 2 });
  });

  it('answers a malformed JSON body with invalid_json', async () => {
    const res = await request(app).post('/body').set('Content-Type', 'application/json').send('{"broken": ');
    expectErrorShape(res, 'invalid_json', 400);
  });

  it('answers an oversized body with payload_too_large', async () => {
    const res = await request(app)
      .post('/body')
      .send({ text: 'x'.repeat(200_000) });
    expectErrorShape(res, 'payload_too_large', 413);
  });
});

describe('unexpected errors', () => {
  it('answer internal_error without revealing the cause', async () => {
    for (const path of ['/crash', '/async-crash', '/throw-string']) {
      const res = await request(app).get(path);
      expectErrorShape(res, 'internal_error', 500);
      expect(JSON.stringify(res.body)).not.toMatch(/secret-detail|bare string|ECONNREFUSED|at /);
    }
  });

  it('are logged once with the request id, beside the request line', async () => {
    const res = await request(app).get('/crash');
    const errorLines = lines.filter((l): l is ErrorLogLine => 'error' in l);
    expect(errorLines).toHaveLength(1);
    expect(errorLines[0]).toMatchObject({
      level: 'error',
      requestId: res.headers['x-request-id'],
      error: { name: 'Error', message: 'connect ECONNREFUSED secret-detail' },
    });
    expect(lines.filter((l) => 'status' in l && l.status === 500)).toHaveLength(1);
  });

  it('are not logged for expected API errors', async () => {
    await request(app).get('/lesson');
    await request(app).get('/v1/nothing-here');
    expect(lines.some((l) => 'error' in l)).toBe(false);
  });
});
