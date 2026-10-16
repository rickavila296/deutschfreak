import { defineConfig } from 'vitest/config';

// Unit and Supertest tests without a database. Tests that need one (*.db.test.ts) run with `test:db`.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], exclude: ['src/**/*.db.test.ts'] },
});
