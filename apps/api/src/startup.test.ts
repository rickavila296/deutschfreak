import { apiErrorResponseSchema } from '@deutschfreak/validation';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './create-app.ts';
import type { ErrorLogLine, LogLine } from './request-log.ts';

// Review 3 finding 4: a configuration error must not stop the API from loading. /health still reports the process up;
// /health/ready and every other route answer internal_error in the one shape; the cause is logged once at startup.

describe('createApp with a startup error', () => {
  const lines: LogLine[] = [];
  const app = createApp({ webOrigin: false, startupError: true, logSink: (line) => lines.push(line) });

  it('still answers /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('answers internal_error on /health/ready and on every other route', async () => {
    for (const path of ['/health/ready', '/v1/levels/A1/map', '/v1/lessons/hallo-und-tschuess', '/anything']) {
      const res = await request(app).get(path);
      expect(res.status, path).toBe(500);
      expect(apiErrorResponseSchema.parse(res.body).error.code).toBe('internal_error');
    }
  });

  it('allows no browser origin', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://deutschfreak.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('src/main.ts with a bad configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loads, logs the cause once without the value, and keeps /health up', async () => {
    vi.resetModules();
    vi.stubEnv('WEB_ORIGIN', 'https://deutschfreak.com/not-an-origin');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:s3cret@ep-placeholder-pooler.eu-central-1.aws.neon.tech/neondb');
    const written: string[] = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
      written.push(String(chunk));
      return true;
    });
    const { default: app } = await import('./main.ts');
    const startup = written.map((w) => JSON.parse(w) as LogLine).filter((l): l is ErrorLogLine => 'error' in l);
    expect(startup).toHaveLength(1);
    expect(startup[0]).toMatchObject({ requestId: 'startup', error: { message: expect.stringMatching(/WEB_ORIGIN/) } });
    expect(JSON.stringify(startup)).not.toContain('not-an-origin');
    expect((await request(app).get('/health')).status).toBe(200);
    expect((await request(app).get('/health/ready')).status).toBe(500);
  });
});
