# 0028 — Page route paths of the web app

- **ID:** TRD-FE-12, Plan task 4.3 (closes FLOW-OQ-05, page side)
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** The web app's page addresses are:
  1. `/` — Home. Until a home page is built it shows the German Map, as `/learn` does.
  2. `/learn` — the German Map (the Learn item of the primary navigation). The four parts of A1 are sections of this page, each with an anchor made from its code: `/learn#a1-1` to `/learn#a1-4`.
  3. `/learn/units/<unit-slug>` — a unit page, e.g. `/learn/units/im-cafe`.
  4. `/learn/lessons/<lesson-slug>` — a lesson page. Its nine stages are on that one page; a stage has no address of its own.
  5. A planned lesson's address, and any unknown unit or lesson slug, shows the not-found page (task 4.8) with HTTP status 404 and a link back to `/learn`. This is what a direct visit to a planned lesson shows (FLOW-OQ-05; the API answers 404 `lesson_not_found`, decision 0017).
  Slugs are the literal ones in `a1.yaml` (decision 0008). Lessons are not nested under units.
- **Reason:** The owner approved the proposal. Lesson slugs are unique across A1, so a flat lesson address stays stable even if a lesson moves to another unit (TRD-SEO-02), and it matches the API's `/v1/lessons/<slug>`.
- **Affects:** TRD §7 TRD-FE-12; Flow §5 and FLOW-OQ-05; Phase 4 tasks 4.5 to 4.8; later pages (knowledge, Germany, dashboard) get their paths in their own phases.
