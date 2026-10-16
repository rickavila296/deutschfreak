import { defineConfig } from 'vitest/config';

// Unit tests only. Database tests (*.db.test.ts) need a Neon branch and run with `pnpm --filter @deutschfreak/db test:db`.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], exclude: ['src/**/*.db.test.ts'] },
});
