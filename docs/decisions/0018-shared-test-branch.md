# 0018 — Both database suites share the one test branch

- **ID:** Task 3.7 finding (no PLAN-DEC number); follows decisions 0012 and 0016
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** (Option A) The `packages/db` database tests and the API Supertest suite both run on the one Neon test branch (`DATABASE_URL_TEST`). The API suite's global setup migrates and seeds the content, which publishes A1.1.U01.L01 there and leaves it committed. A test that needs a particular state sets it up itself inside its rolled-back transaction; the 2a test "seeds … 92 planned lessons" now first sets every A1 lesson back to planned (one line, assertion unchanged). In CI (decision 0016) the database job needs two secrets added by the owner: `DATABASE_URL_TEST` and `DATABASE_DEV_HOST` (the dev endpoint host only, no credentials); `DATABASE_URL` in CI is a placeholder built from that host so the test-branch guard can still refuse the dev branch, and the job stops if either secret is empty.
- **Reason:** Owner accepted option A over a third Neon branch (B) or resetting L01 after the API tests (C): no new branch, smallest change, and tests no longer depend on what another suite left on the shared branch. A separate branch for the API tests can be added later if later phases need it.
- **Affects:** `packages/db/src/seed.db.test.ts` (approved test change), `packages/db/src/testing/` (seed setup for the API suite), `apps/api` (`test:db`), `.github/workflows/ci.yml`, root `package.json` (`test:db`); TRD §22 and §25 (local Bible); Plan Phase 3 gate M2.
