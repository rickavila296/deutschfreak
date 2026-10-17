import { defineConfig } from 'vitest/config';

// Database tests against their own Neon branch, DATABASE_URL_TEST (decision 0012); never the dev branch. The global
// setup applies the migrations first. Each test runs in a transaction that is rolled back.
export default defineConfig({
  test: {
    include: ['src/**/*.db.test.ts'],
    globalSetup: ['src/testing/migrate-test-database.ts'],
    fileParallelism: false,
    // CI runs in the US against Neon in Frankfurt; the seed's row-by-row writes (decision 0013 finding 7, Phase 6)
    // need far longer there than locally (decision 0020).
    testTimeout: 180_000,
    hookTimeout: 60_000,
  },
});
