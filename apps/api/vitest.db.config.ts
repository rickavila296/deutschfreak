import { defineConfig } from 'vitest/config';

// Supertest against the real app and the Neon test branch, DATABASE_URL_TEST (decision 0012); never the dev branch.
// The global setup migrates and seeds the test branch first.
export default defineConfig({
  test: {
    include: ['src/**/*.db.test.ts'],
    globalSetup: ['src/testing/db-setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    // The global setup seeds the test branch; from a US CI runner that takes minutes (decision 0020).
    hookTimeout: 600_000,
  },
});
