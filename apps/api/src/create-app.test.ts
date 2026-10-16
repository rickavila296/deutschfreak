import { Router, type Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './create-app.ts';
import type { LogLine, RequestLogLine } from './request-log.ts';

const webOrigin = 'https://deutschfreak.com';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let app: Express;
let lines: LogLine[];

beforeEach(() => {
  lines = [];
  // Probe routes for the middleware tests; real routes come in later tasks.
  const probes = Router();
  probes.get('/probe', (_req, res) => {
    res.json({ ok: true });
  });
  probes.post('/probe', (_req, res) => {
    res.status(201).json({ ok: true });
  });
  probes.get('/broken', (_req, res) => {
    res.status(503).json({ ok: false });
  });
  app = createApp({ webOrigin, logSink: (line) => lines.push(line), extraRoutes: probes });
});

describe('request id', () => {
  it('sets a fresh uuid on every response and ignores one sent by the client', async () => {
    const first = await request(app).get('/probe').set('X-Request-Id', 'forged');
    const second = await request(app).get('/probe');
    expect(first.headers['x-request-id']).toMatch(uuid);
    expect(second.headers['x-request-id']).toMatch(uuid);
    expect(first.headers['x-request-id']).not.toBe(second.headers['x-request-id']);
  });
});

describe('request log (TRD-LOG-01, decision 0014)', () => {
  it('writes one JSON line per request carrying the request id', async () => {
    const res = await request(app).get('/probe');
    expect(lines).toHaveLength(1);
    const line = lines[0]!;
    expect(line).toEqual({
      level: 'info',
      time: expect.any(String),
      requestId: res.headers['x-request-id'],
      method: 'GET',
      path: '/probe',
      status: 200,
      durationMs: expect.any(Number),
    });
    expect(() => JSON.parse(JSON.stringify(line))).not.toThrow();
  });

  it('never logs the query string, headers or body', async () => {
    await request(app)
      .post('/probe?token=query-secret')
      .set('Authorization', 'Bearer header-secret')
      .set('Cookie', 'session=cookie-secret')
      .send({ password: 'body-secret' });
    expect(lines).toHaveLength(1);
    const text = JSON.stringify(lines);
    for (const secret of ['query-secret', 'header-secret', 'cookie-secret', 'body-secret', 'token=']) {
      expect(text).not.toContain(secret);
    }
    expect((lines[0] as RequestLogLine).path).toBe('/probe');
  });

  it('marks client errors as warn and server errors as error', async () => {
    await request(app).get('/no-such-route');
    await request(app).get('/broken');
    expect((lines as RequestLogLine[]).map((l) => [l.status, l.level])).toEqual([
      [404, 'warn'],
      [503, 'error'],
    ]);
  });
});

describe('helmet (TRD-SEC-15)', () => {
  it('sets security headers and hides the framework', async () => {
    const res = await request(app).get('/probe');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('CORS (TRD-SEC-15)', () => {
  it('allows the web origin', async () => {
    const res = await request(app).get('/probe').set('Origin', webOrigin);
    expect(res.headers['access-control-allow-origin']).toBe(webOrigin);
  });

  it('does not allow any other origin', async () => {
    const res = await request(app).get('/probe').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).not.toBe('https://evil.example');
    expect(res.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('answers a preflight from the web origin', async () => {
    const res = await request(app)
      .options('/probe')
      .set('Origin', webOrigin)
      .set('Access-Control-Request-Method', 'POST');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(webOrigin);
  });
});

describe('JSON body parser', () => {
  it('parses JSON bodies for routes', async () => {
    const routes = Router();
    routes.post('/echo', (req, res) => {
      res.json(req.body);
    });
    const echo = createApp({ webOrigin, logSink: () => {}, extraRoutes: routes });
    const res = await request(echo).post('/echo').send({ hallo: 'welt' });
    expect(res.body).toEqual({ hallo: 'welt' });
  });
});
