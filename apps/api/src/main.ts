import { createApp } from './create-app.ts';
import { readApiConfig } from './config.ts';
import { database } from './db.ts';

// The API with its real configuration and database client, created once at module scope and reused by every
// request a warm instance serves (TRD-BE-07). Used by the local dev server and, bundled into dist/app.js by
// scripts/bundle.ts, by the Vercel entry apps/api/index.js (TRD-DEP-01).
const app = createApp({ ...readApiConfig(), checkDatabase: database.check, db: database.db });

export default app;
