# 0008 — Unit and lesson slugs written in a1.yaml

- **ID:** Task 2a.4 gap (Schema DB-SLUG-02; no PLAN-DEC number)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** Option A. Every unit and lesson in `a1.yaml` carries a literal `slug`, made once from its title with the slug form of TRD-CNT-05 (lower case; ä → ae, ö → oe, ü → ue, ß → ss; spaces become hyphens; punctuation dropped). The structure schema requires it, checks its form (lower-case ASCII letters and digits in hyphenated words) and checks it is unique among units and among lessons. Two cases the rules do not cover: é becomes e (`im-cafe`), and a dot between digits becomes a hyphen (`a1-1-abschluss`, `a1-1-checkpoint`). As decided in 0001, "(Sound Check N)" is left out. The seed writes slugs from the file and never computes them.
- **Reason:** `units.slug` and `lessons.slug` are NOT NULL, and DB-SLUG-02 says slugs are written literally in the seed file, but `a1.yaml` had none. Title-based slugs are readable, and none of the 24 units or 92 lessons collide. Rejected: slugs built from codes (unreadable addresses) and slugs computed at seed time (against DB-SLUG-02; a title edit would silently change a public address).
- **Affects:** `packages/content/structure/a1.yaml` (116 slugs); `packages/validation` structure schema (`slugSchema`); Schema §10 slug requirements (é and digit-dot cases); Plan §5 Phase 2a (task 2a.4)
