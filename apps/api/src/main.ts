import type { Express } from 'express';
import { readApiConfig } from './config.ts';
import { createApp } from './create-app.ts';
import { createApiDatabase } from './db.ts';
import { errorLogLine, stdoutSink } from './request-log.ts';

// The API with its real configuration and database client, created once at module scope and reused by every
// request a warm instance serves (TRD-BE-07). Used by the local dev server and, bundled into dist/app.js by
// scripts/bundle.ts, by the Vercel entry apps/api/index.js (TRD-DEP-01).
//
// A configuration error (WEB_ORIGIN or DATABASE_URL missing or malformed) must not stop the module from loading:
// then every request, /health included, would fail on Vercel with no answer in the one error shape. Instead the error
// is logged once, /health still says the process is up, and everything else answers internal_error (review 3
// finding 4, TRD-API-01).
function buildApp(): Express {
  try {
    const config = readApiConfig();
    const database = createApiDatabase();
    return createApp({ ...config, checkDatabase: database.check, db: database.db });
  } catch (error) {
    stdoutSink(errorLogLine(error, 'startup'));
    return createApp({ webOrigin: false, startupError: true });
  }
}

const app = buildApp();

export default app;
