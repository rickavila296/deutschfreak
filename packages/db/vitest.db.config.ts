import { defineConfig } from 'vitest/config';

// Database tests against the Neon dev branch (DATABASE_URL_DIRECT). Each test runs in a transaction that is rolled back.
export default defineConfig({
  test: { include: ['src/**/*.db.test.ts'], fileParallelism: false, testTimeout: 30_000, hookTimeout: 30_000 },
});
