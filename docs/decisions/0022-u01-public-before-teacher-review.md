# 0022 — A1.1.U01 may be shown publicly before the teacher review

- **ID:** PRD OQ-16 as proposed in the Bible alignment of 2026-10-17 (follows decision 0009; no PLAN-DEC number)
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** The lessons of A1.1.U01 may be shown on a public deployment (the production site or a public preview) before the teacher review. This extends decision 0009, which allowed status `published` in the database but left public display open. Every German string composed for them is still logged in `docs/content-review/`, and lesson German still comes only from the Curriculum Specification. The teacher review stays required for launch: release checklist "A1.1 German and sequencing reviewed by a qualified teacher" and PRD-AC-26 are unchanged.
- **Reason:** The owner's call during the Bible alignment, so the deployed web app can show real lessons from Phase 4 onward without waiting for a reviewer.
- **Affects:** PRD-NFR-005 (exception noted, Bible v0.4); Plan Phase 2b note; CLAUDE.md fidelity rule 4; Phases 4, 6 and 7 deployments.
