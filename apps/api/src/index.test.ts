import request from 'supertest';
import { describe, expect, it } from 'vitest';

// The Vercel entry contract (Vercel docs, Express on Vercel, checked 2026-10-16): src/index.ts default-exports the
// app. A placeholder pooled URL is enough: the pool connects lazily and /health never touches the database.
describe('src/index.ts, the deployed entry (TRD-DEP-01)', () => {
  it('default-exports the configured Express app', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pw@ep-placeholder-pooler.eu-central-1.aws.neon.tech/neondb';
    process.env.WEB_ORIGIN = 'https://deutschfreak.com';
    const { default: app } = await import('./index.ts');
    expect(typeof app).toBe('function');
    const res = await request(app).get('/health').set('Origin', 'https://deutschfreak.com');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://deutschfreak.com');
    // The /v1 routes are mounted: a malformed code is refused before any query runs.
    expect((await request(app).get('/v1/levels/a1/map')).status).toBe(400);
  });
});
