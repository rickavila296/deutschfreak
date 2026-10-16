# 0019 — Preview deployments use the dev database branch

- **ID:** TRD-OQ-18 (Plan task 3.8)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** (Option A) Vercel preview deployments of the API use the Neon dev branch: the Preview environment's `DATABASE_URL` and `DATABASE_URL_DIRECT` are the dev branch's pooled and direct strings. To be revisited before Phase 5 (accounts), when previews start writing learner data; the recommended next step then is a separate Neon "preview" branch (option B). Production gets its own database, set up separately. The per-preview Neon–Vercel integration (option C) was not chosen and is unverified.
- **Reason:** Owner accepted the recommendation: dev already holds the seeded content, so the deployed `/health/ready` and the 92-lesson map work at once, with no new branch while previews only read.
- **Affects:** TRD §24 (TRD-OQ-18 closed) and §25 (local Bible); Vercel API project environment variables; Plan task 3.8; review before Phase 5.
