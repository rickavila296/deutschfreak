import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.ts';
import { readApiConfig } from './config.ts';

// Local development server. The Vercel entry point comes with task 3.8.
const rootEnvFile = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const port = Number(process.env.PORT ?? 4000);
createApp(readApiConfig()).listen(port, () => {
  process.stdout.write(`API listening on http://localhost:${port}\n`);
});
