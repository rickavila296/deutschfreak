import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Review 4 finding 3: `dynamic = 'force-dynamic'` (or a no-store fetchCache) sets every fetch to no-store in Next 16,
// which silently turns off the five-minute API cache in src/lib/api.ts. Pages call connection() instead.
const appDir = fileURLToPath(new URL('.', import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

describe('route segment config', () => {
  it('no page or layout turns off the fetch cache', () => {
    const offenders = files(appDir)
      .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.test.ts'))
      .filter((file) => /force-dynamic|fetchCache|revalidate\s*=\s*0/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('every page that reads the API renders per request through connection()', () => {
    const pages = files(appDir).filter((file) => file.endsWith('page.tsx'));
    expect(pages.length).toBeGreaterThanOrEqual(4);
    for (const page of pages) expect(readFileSync(page, 'utf8'), page).toMatch(/await connection\(\)/);
  });
});
