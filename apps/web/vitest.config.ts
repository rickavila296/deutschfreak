import { defineConfig } from 'vitest/config';

// Unit tests (*.test.ts) run in Node; component tests (*.test.tsx) declare the jsdom environment in their header.
export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  test: { include: ['src/**/*.test.{ts,tsx}'] },
});
