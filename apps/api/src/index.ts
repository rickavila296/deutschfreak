// Vercel only accepts an entry file that imports express itself ("No entrypoint found which imports express",
// first preview build of task 3.8), so the app's type comes from express here.
import type { Express } from 'express';
import { createApp } from './create-app.ts';
import { readApiConfig } from './config.ts';
import { database } from './db.ts';

// The deployed API (TRD-DEP-01). Vercel finds this file (src/index.ts) and serves its default export as one
// function; no other file in apps/api has a name Vercel looks for (app, index, server). The app and its database
// client are created once, at module scope, and reused by every request a warm instance serves (TRD-BE-07).
const app: Express = createApp({ ...readApiConfig(), checkDatabase: database.check, db: database.db });

export default app;
