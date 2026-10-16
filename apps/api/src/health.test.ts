import { apiErrorResponseSchema, healthResponseSchema, readyResponseSchema } from '@deutschfreak/validation';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { errorHandler } from './error-handler.ts';
import { healthRouter, type DatabaseCheck } from './health.ts';
import { requestId } from './request-id.ts';
import type { ErrorLogLine, LogLine } from './request-log.ts';

const webOrigin = 'https://deutschfreak.com';

function appWith(checkDatabase?: DatabaseCheck) {
  const lines: LogLine[] = [];
  const app = createApp({ webOrigin, logSink: (line) => lines.push(line), checkDatabase });
  return { app, lines };
}

describe('GET /health (TRD-API-01)', () => {
  it('reports the process up without touching the database', async () => {
    let calls = 0;
    const { app } = appWith(async () => {
      calls += 1;
    });
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(healthResponseSchema.parse(res.body)).toEqual({ status: 'ok' });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(calls).toBe(0);
  });

  it('answers even when the database is down', async () => {
    const { app } = appWith(() => Promise.reject(new Error('down')));
    expect((await request(app).get('/health')).status).toBe(200);
  });
});

describe('GET /health/ready (TRD-API-01)', () => {
  it('reports the database reachable when the check passes', async () => {
    let calls = 0;
    const { app } = appWith(async () => {
      calls += 1;
    });
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(readyResponseSchema.parse(res.body)).toEqual({ status: 'ready', database: 'reachable' });
    expect(res.headers['cache-control']).toBe('no-store');
    expect(calls).toBe(1);
  });

  it('answers database_unavailable (503) when the check fails, logging the cause but not returning it', async () => {
    const { app, lines } = appWith(() => Promise.reject(new Error('password authentication failed for user x')));
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('database_unavailable');
    expect(JSON.stringify(res.body)).not.toContain('password');
    const errorLines = lines.filter((l): l is ErrorLogLine => 'error' in l);
    expect(errorLines).toHaveLength(1);
    expect(errorLines[0]!.requestId).toBe(res.headers['x-request-id']);
    expect(errorLines[0]!.error.message).toContain('password authentication failed');
  });

  it('reports the database unavailable when no check is configured', async () => {
    const { app } = appWith();
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('database_unavailable');
  });

  it('gives up after the timeout when the database hangs', async () => {
    const lines: LogLine[] = [];
    const app = express();
    app.use(requestId);
    app.use(
      healthRouter(
        () => new Promise<void>(() => {}),
        (line) => lines.push(line),
        50,
      ),
    );
    app.use(errorHandler(() => {}));
    const started = Date.now();
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('database_unavailable');
    expect(Date.now() - started).toBeLessThan(2000);
    expect((lines[0] as ErrorLogLine).error.message).toContain('timed out');
  });

  it('does not set no-store on other routes', async () => {
    const { app } = appWith();
    const res = await request(app).get('/v1/anything');
    expect(res.headers['cache-control']).toBeUndefined();
  });
});
