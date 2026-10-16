# 0012 — Database tests on their own Neon branch; clean gate proof

- **ID:** Task 2b.5 finding (no PLAN-DEC number)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:**
  1. Database tests (`pnpm --filter @deutschfreak/db test:db`) run against their own Neon branch, given by a new variable `DATABASE_URL_TEST` (direct connection string). The tests refuse to start if it is missing, pooled, or on the same host as `DATABASE_URL_DIRECT`, and they apply all migrations to it before running. The dev branch is used only by `migrate`, `seed` and the other scripts.
  2. The Phase 2 gate is re-proved from an empty dev branch: the owner resets the dev branch from its parent in Neon, then all migrations are applied and the seed is run twice.
- **Reason:** In task 2b.4, a deliberately broken run of a test that calls the real seed outside a rolled-back transaction committed partial content to the dev branch, so the first gate run in 2b.5 did not start empty, and a 2a test that assumes no published lessons began to fail. A separate test branch removes both risks without changing any approved test.
- **Affects:** `packages/db` (database test setup), `.env.example`, TRD §25 environment table (new row, local Bible); Plan §5 Phase 2 gate
