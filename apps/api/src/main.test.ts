import request from 'supertest';
import { describe, expect, it } from 'vitest';

// src/main.ts default-exports the configured app, which the Vercel entry (index.js, via dist/app.js) serves. The
// A placeholder pooled URL is enough: the pool connects lazily and /health never touches the database.
describe('src/main.ts, the configured app (TRD-DEP-01)', () => {
  it('default-exports the configured Express app', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pw@ep-placeholder-pooler.eu-central-1.aws.neon.tech/neondb';
    process.env.WEB_ORIGIN = 'https://deutschfreak.com';
    const { default: app } = await import('./main.ts');
    expect(typeof app).toBe('function');
    const res = await request(app).get('/health').set('Origin', 'https://deutschfreak.com');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://deutschfreak.com');
    // The /v1 routes are mounted: a malformed code is refused before any query runs.
    expect((await request(app).get('/v1/levels/a1/map')).status).toBe(400);
  });
});
