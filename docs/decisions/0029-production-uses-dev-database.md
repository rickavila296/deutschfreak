# 0029 — Production uses the dev database until a production database is set up

- **ID:** Phase 3 carry-over (production database before real learners); needed for gate M3
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** The Vercel API project's Production environment gets the same `DATABASE_URL` and `DATABASE_URL_DIRECT` as Preview: the Neon dev branch's pooled and direct strings (as decision 0019 does for previews). Production's `WEB_ORIGIN` is the web app's production origin. A separate production database is still required before real learners use the site (release checklist); this decision is revisited at the latest in Phase 5, when accounts start writing learner data.
- **Reason:** The owner's call ("prod uses dev"): dev already holds the seeded A1 content, so the production API can serve the German Map and lessons for gate M3 without setting up a new database while nothing is written.
- **Affects:** TRD §25 (DATABASE_URL row); Vercel API project environment variables (set by the owner); gate M3; review before Phase 5.
