# 0030 — Unit context and part course-page copy are content

- **ID:** none; gap found in task 4.6 (FLOW-LEARN-002 and 003 name texts that were never loaded)
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** (1) Each unit's `context_en` is the "Context:" clause of its section in the Curriculum Specification (§4 to §7), copied word for word with the first letter capitalised, e.g. "Meeting someone for the first time, formally and informally." The rest of those paragraphs (Goals, Grammar, Recycles) is authoring guidance and is not shown. 19 units have one; the four U06 close-outs and A1.4.U05 have none, so the column stays NULL. (2) A new nullable column `course_parts.description_en` (migration 0005) holds each part's course-page copy from Specification §13, word for word, with the Markdown italics removed. (3) Both are written in `a1.yaml` (`context_en`, `description_en`), seeded, sent by `GET /v1/levels/:code/map` as `contextEn` and `descriptionEn` (null when absent), and shown on the unit page and in the map's part section.
- **Reason:** The owner chose to fill them now ("fill them now") rather than in Phase 6. Both are English learner copy, not lesson German, so the teacher-review rule (PRD-NFR-005) does not apply.
- **Affects:** Schema §8.2 and §8.3; Flow FLOW-LEARN-002; `packages/content/structure/a1.yaml`, packages/validation, packages/db (schema, migration 0005, seed, map repository), apps/api map service, apps/web map and unit page. The migration and re-seed are applied to the dev branch (which Production also uses, decision 0029) only with the owner's go.
