# 0003 — Build Phase 1 session 3 (structure schema for content)
- **ID:** none (Plan Phase 1, session 3 is marked R)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** Session 3 is built as the Plan describes it: a strict Zod schema for `a1.yaml` in `packages/validation`, and a `content:check` script that confirms 4 parts, 24 units and 92 lessons with unique, well-formed codes, run locally and in CI.
- **Reason:** The owner directed it in chat ("proceed to next task") and approved the result. It is the first content check that later phases (TRD-VAL-05) build on.
- **Affects:** Plan §5 Phase 1; `packages/validation`, `packages/content`, `.github/workflows/ci.yml`
