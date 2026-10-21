import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// The only setting the web app takes from the repo-root `.env` (TRD §25). That file also holds the API's database
// strings; loading all of it would put them into the web server's environment, which architecture rule 1 and
// TRD-ENV-03 forbid (review 4b finding 6). So the file is parsed, not loaded, and one name is copied.
const webVariables = ['NEXT_PUBLIC_API_URL'] as const;

/** Copies the web app's variables from `file` into `env` when the file exists. Values already set are kept. */
export function loadWebEnv(file: string, env: Record<string, string | undefined> = process.env): void {
  if (!existsSync(file)) return;
  const parsed = parseEnv(readFileSync(file, 'utf8'));
  for (const name of webVariables) {
    const value = parsed[name];
    if (value !== undefined && env[name] === undefined) env[name] = value;
  }
}
