import { createApp } from './create-app.ts';
import { readApiConfig } from './config.ts';
import { database } from './db.ts';

// The deployed API (TRD-DEP-01). Vercel finds this file (src/index.ts) and serves its default export as one
// function; no other file in apps/api has a name Vercel looks for (app, index, server). The app and its database
// client are created once, at module scope, and reused by every request a warm instance serves (TRD-BE-07).
const app = createApp({ ...readApiConfig(), checkDatabase: database.check, db: database.db });

export default app;
