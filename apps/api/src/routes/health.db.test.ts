import { createDatabase } from '@deutschfreak/db';
import { testDatabaseUrl } from '@deutschfreak/db/testing';
import { apiErrorResponseSchema, readyResponseSchema } from '@deutschfreak/validation';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../create-app.ts';

// Task 3.7: the health routes and the /v1 router against the real client on the Neon test branch (TRD-API-01,
// TRD-OBS-01, TRD-TEST-02). Route coverage of the Supertest suite (success, 404, invalid input):
//   GET /health             success (health.test.ts); no input to validate
//   GET /health/ready       success (here), database down → 503 (here and health.test.ts); no input to validate
//   GET /v1/levels/:code/map  success, 404, invalid input (levels.db.test.ts)
//   GET /v1/lessons/:slug     success, 404, invalid input, no answers (lessons.db.test.ts)
//   any other method or path  404 not_found (here)
const database = createDatabase(testDatabaseUrl());
const app = createApp({
  webOrigin: 'https://deutschfreak.com',
  logSink: () => {},
  checkDatabase: database.check,
  db: database.db,
});

afterAll(() => database.close());

describe('GET /health/ready with the real client (TRD-API-01)', () => {
  it('reports the database reachable', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(readyResponseSchema.parse(res.body)).toEqual({ status: 'ready', database: 'reachable' });
  });

  it('reports database_unavailable when the database cannot be reached', async () => {
    const unreachable = createDatabase('postgresql://user:pw@127.0.0.1:1/none');
    try {
      const down = createApp({
        webOrigin: 'https://deutschfreak.com',
        logSink: () => {},
        checkDatabase: unreachable.check,
      });
      const res = await request(down).get('/health/ready');
      expect(res.status).toBe(503);
      expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('database_unavailable');
    } finally {
      await unreachable.close();
    }
  });
});

describe('the /v1 router (TRD-API-22, TRD-ERR-01)', () => {
  it('answers not_found for an unknown /v1 path and for a method no route takes', async () => {
    for (const req of [
      request(app).get('/v1/unknown'),
      request(app).get('/v1/levels/A1'),
      request(app).post('/v1/lessons/hallo-und-tschuess').send({}),
      request(app).delete('/v1/levels/A1/map'),
      request(app).get('/levels/A1/map'),
    ]) {
      const res = await req;
      expect(res.status).toBe(404);
      expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('not_found');
    }
  });

  it('lets the web origin read /v1 responses and nobody else (TRD-SEC-15)', async () => {
    const allowed = await request(app).get('/v1/levels/A1/map').set('Origin', 'https://deutschfreak.com');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://deutschfreak.com');
    const other = await request(app).get('/v1/levels/A1/map').set('Origin', 'https://evil.example');
    // The header always names the one allowed origin, so a browser on any other site refuses to hand over the body.
    expect(other.headers['access-control-allow-origin']).not.toBe('https://evil.example');
    expect(other.headers['access-control-allow-origin']).not.toBe('*');
  });
});
