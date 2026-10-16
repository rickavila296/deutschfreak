# 0016 — Database and Supertest tests run in CI

- **ID:** Task 3.5 open point (M2 gate: "all Supertest cases pass in CI"); no PLAN-DEC number
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** CI runs the database tests, including the API's Supertest suite (`test:db`), against the Neon test branch of decision 0012. The owner adds `DATABASE_URL_TEST` as a GitHub Actions secret; the workflow change is made in task 3.7. CI never receives the dev or production connection strings for writing.
- **Reason:** The M2 gate requires the Supertest cases to pass in CI, and the API routes cannot be tested without a database (tests never mock the thing under test). Option A, recommended in task 3.5, accepted by the owner.
- **Affects:** `.github/workflows/ci.yml` (task 3.7); TRD §22 testing and §25 environment (CI secret, local Bible); Plan Phase 3 gate. Open for 3.7: the test-branch guard (decision 0012, review finding 6) needs a dev URL to compare against; how CI satisfies it is settled in 3.7.
