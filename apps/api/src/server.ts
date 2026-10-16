import { loadRootEnv } from '@deutschfreak/db';
import { createApp } from './app.ts';
import { readApiConfig } from './config.ts';
import { database } from './db.ts';

// Local development server. The Vercel entry point comes with task 3.8.
loadRootEnv();

const port = Number(process.env.PORT ?? 4000);
createApp({ ...readApiConfig(), checkDatabase: database.check, db: database.db }).listen(port, () => {
  process.stdout.write(`API listening on http://localhost:${port}\n`);
});
