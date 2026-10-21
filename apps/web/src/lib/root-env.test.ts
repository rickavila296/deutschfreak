import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadWebEnv } from './root-env.ts';

const dirs: string[] = [];
function envFile(text: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'df-web-env-'));
  dirs.push(dir);
  const file = join(dir, '.env');
  writeFileSync(file, text);
  return file;
}
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true })));

describe('loadWebEnv (architecture rule 1, TRD-ENV-03; review 4b finding 6)', () => {
  const file = () =>
    envFile(
      'DATABASE_URL=postgresql://u:p@db.example/x\nWEB_ORIGIN=http://localhost:3000\nNEXT_PUBLIC_API_URL=http://localhost:4000\n',
    );

  it('takes only NEXT_PUBLIC_API_URL from the root .env, never the database strings', () => {
    const env: Record<string, string | undefined> = {};
    loadWebEnv(file(), env);
    expect(env).toEqual({ NEXT_PUBLIC_API_URL: 'http://localhost:4000' });
  });

  it('keeps a value that is already set, and does nothing without the file', () => {
    const env: Record<string, string | undefined> = { NEXT_PUBLIC_API_URL: 'https://api.example' };
    loadWebEnv(file(), env);
    expect(env.NEXT_PUBLIC_API_URL).toBe('https://api.example');
    const empty: Record<string, string | undefined> = {};
    loadWebEnv(join(tmpdir(), 'no-such-dir-df', '.env'), empty);
    expect(empty).toEqual({});
  });
});
