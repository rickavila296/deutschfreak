# 0020 — Longer time limits for database tests

- **ID:** Task 3.7/3.8 CI finding (no PLAN-DEC number); follows decisions 0013, 0016 and 0018
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** (Option A) The `packages/db` database tests get a per-test limit of 180 s (was 30 s) and the API database suite's global setup a limit of 600 s (was 300 s). No test or assertion changes. Batching the seed's row-by-row writes stays the Phase 6 follow-up of decision 0013 (finding 7).
- **Reason:** The first CI run of the database job (run 38949134545, branch phase-03/3.7-supertest-ci) reached the test branch with the owner's secrets, but 10 tests in `seed-content.db.test.ts` stopped at the 30 s limit without a wrong result: GitHub's runners are in the US and the Neon branch is in Frankfurt, so each of the seed's many round trips crosses the Atlantic. Locally the same suite passes in about 3 minutes. The owner chose the quick, safe fix over pulling the Phase 6 batching forward (B) or running only the API suite in CI (C).
- **Affects:** `packages/db/vitest.db.config.ts`, `apps/api/vitest.db.config.ts`; CI duration (database job roughly 10–15 minutes); Plan Phase 6 (finding 7 still to do).
