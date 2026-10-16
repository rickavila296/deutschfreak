# 0004 — Claude Code kit stays local; the content review log is tracked
- **ID:** none (Plan Phase 1, session 2 lists the kit's `CLAUDE.md` as an output)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** `CLAUDE.md`, `README-VIBECODING.md`, `.claude/`, `docs/bible/`, `docs/prompts/` and `docs/sources/` stay out of git and are backed up privately by the owner. `docs/content-review/` is tracked in git.
- **Reason:** The owner keeps the kit and Bible private. The content review log holds every composed German string awaiting the teacher (PRD-NFR-005, PLAN-DEC-13), so it must be versioned and backed up with the content it describes.
- **Affects:** `.gitignore`; Plan §5 Phase 1 session 2; CLAUDE.md fidelity rule 4
