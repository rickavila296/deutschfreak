# 0017 — Lesson endpoint: planned lessons and model answers

- **ID:** FLOW-OQ-05 (API side only); task 3.6 open points; no PLAN-DEC number
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:**
  1. (Option A) `GET /v1/lessons/:slug` answers a planned or retired lesson exactly like an unknown slug: 404 `lesson_not_found`. No new error code. What the web page shows at a planned lesson's address (FLOW-OQ-05) stays open for Phase 4, where the German Map data already says which lessons are planned.
  2. (Keep) Until Phase 8 designs the per-type payload (decision 0010, TRD-VAL-03), the lesson response sends only an exercise item's `prompt`, `options` and `audio` (an allow-list). The model answer, the checklist, accepted answers, the hint and `feedback_en` are never sent. Known gap: pronunciation-repetition and self-check items arrive without the model to repeat or compare, so they are not usable until Phase 8 decides which keys each type may show before an answer.
- **Reason:** Owner accepted both recommendations in task 3.6: no answer can leak while the payload is undesigned, and no new code is added before the web app needs it.
- **Affects:** TRD-API-03, TRD-BE-05, TRD-SEC-11; Flow FLOW-OQ-05 and FLOW-LEARN-001 (Phase 4); Plan Phase 8 (payload union, grading response carrying feedback). Bible text unchanged until the next Bible update.
