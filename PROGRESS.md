# DeutschFreak — PROGRESS.md

Append-only build log, newest entry at the bottom. Never rewrite or remove an earlier entry.

**Who writes it.** Claude Code appends one entry for each task, decision, debug or gate, but only **after the owner approves the result**. It commits the entry together with the code. The owner may also add entries by hand, for example for steps done outside Claude Code.

**Status values.** `passed` means the checks passed and the owner approved. `failed` means it was attempted, did not pass, and is recorded for the trail. `pending confirmation` appears only on entries written outside Claude Code that have not been verified yet.

**Before any debugging:** read this file first and name the entries that touch the failing module.

The entry format is in `CLAUDE.md`, under "PROGRESS.md entry".

---

## 2026-10-07 · Phase 0 · docs · Documentation baseline at v0.3

- **Phase:** 0 Decide and spike (documentation)
- **Module:** docs
- **Update:** Six project documents drafted and reviewed
- **Type:** docs
- **What was done:** Produced and cross-checked the Product Requirement Document, Technical Requirement Document, Web App Flow Document, Design Brief, Backend Schema Document and Development and Implementation Plan, all at v0.3. Zero code exists.
- **Files:** none in the repo (documents are held outside it)
- **Status:** pending confirmation
- **Notes:** No document is approved as v1.0 yet. Earliest blocking decisions: schema recommendations and a skill per learning objective before Phase 2; design values before Phase 4; the rule for when a lesson becomes "completed" before Phase 8.

## 2026-10-16 · Phase 0 · docs · Vibecoding adaptation

- **Phase:** 0 Decide and spike (documentation)
- **Module:** docs, repo kit
- **Update:** Project converted to a vibecoding workflow with Claude Code
- **Type:** decision
- **What was done:** The owner decided that Claude Code builds, runs and tests all code, and that the owner directs and approves with short explanations. TRD and Plan were raised to v0.4: TRD-DEC-04 was added, and Plan section 4 now holds the ten-step workflow, PLAN-VIBE-01 to 10 and PLAN-RISK-11 to 15. The stack, the architecture rules, the phases and the gates did not change. The Bible was split into `docs/bible/` with an index, and the Claude Code kit was added: `CLAUDE.md`, path rules, skills, settings and 19 phase prompts. The Curriculum Specification was added as `docs/sources/`.
- **Files:** CLAUDE.md, README-VIBECODING.md, PROGRESS.md, .claude/settings.json, .claude/rules/*.md, .claude/skills/*/SKILL.md, docs/bible/*, docs/prompts/phase-00.md to phase-18.md, docs/sources/a1-curriculum-specification.md, docs/decisions/README.md, docs/content-review/README.md
- **Checks:** `node docs/bible/build.mjs` reports six parts (PRD, Flow, Design and Schema at v0.3; TRD and Plan at v0.4)
- **Status:** pending confirmation
- **Notes:** `docs/bible/` is now the master copy of the Bible. Open tension to decide at Phase 2: Plan Phases 2 and 6 publish A1.1.U01 before the Phase 10 teacher review, but PRD-NFR-005 forbids publishing unreviewed German.

## 2026-10-16 · Phase 1 · repo, packages/validation, packages/content · Workspace skeleton

- **Phase:** 1 Repo and tooling
- **Module:** repo root, packages/config, packages/validation, packages/content/structure
- **Update:** Task 1.1, session 1 workspace skeleton
- **Type:** feature
- **What was done:** Created the pnpm workspace (apps/*, packages/*) with root `typecheck` and `test` scripts, the shared strict tsconfig base, and `@deutschfreak/validation` with `lessonCodeSchema`, the `LessonCode` type and three tests. Created `a1.yaml` with the full A1 tree (1 level, 4 parts, 24 units, 92 lessons, one objective per lesson) by script-parsing Curriculum Specification §3 to §7 and §20, not from memory. Titles follow §20. Objectives carry no skill (PLAN-DEC-02 open). Package versions resolved by `pnpm add`: zod 4.6.7, typescript 7.0.2, vitest 5.0.4. Added `node_modules/` to `.gitignore`.
- **Files:** .nvmrc, pnpm-workspace.yaml, package.json, pnpm-lock.yaml, .gitignore, packages/config/package.json, packages/config/tsconfig.base.json, packages/validation/package.json, packages/validation/tsconfig.json, packages/validation/src/index.ts, packages/validation/src/index.test.ts, packages/content/structure/a1.yaml, PROGRESS.md
- **Checks:** `pnpm install` ok; `pnpm typecheck` passed; `pnpm test` 1 file, 3 tests passed. The 3 tests failed before the schema existed; a deliberately broken type failed `pnpm typecheck`.
- **Status:** passed
- **Notes:** Three U06 lesson titles carry "(Sound Check N)" in §20 but not in the §4 to §6 tables; §20 was used. Slugs and `context_en` are not in `a1.yaml` yet and are needed before the Phase 2a seed. `lessonCodeSchema` accepts CEFR levels A–C 1–2, not only A1.

## 2026-10-16 · Phase 1 · packages/content · Decisions 0001 and 0002 (a1.yaml spec gaps)

- **Phase:** 1 Repo and tooling
- **Module:** packages/content/structure, docs/decisions
- **Update:** Owner decisions filling two gaps in the Curriculum Specification
- **Type:** decision
- **What was done:** The owner approved 0001: A1.1.U01 is title "Hallo!" with subtitle_en "First contact"; A1.1.U06, A1.2.U06 and A1.3.U06 get "Part review and checkpoint"; A1.4.U06 gets "Final review and assessment". The owner approved 0002: A1.4.U06 L01 to L03 each get one objective (`.O1`) and a mastery task, derived from Spec §7 Purpose and Content and §12. `a1.yaml` was edited to match.
- **Files:** docs/decisions/0001-unit-subtitles.md, docs/decisions/0002-a1-4-u06-objectives.md, packages/content/structure/a1.yaml
- **Checks:** `pnpm typecheck` passed; `pnpm test` 1 file, 3 tests passed; `a1.yaml` has 92 lessons and 92 objectives
- **Status:** passed
- **Notes:** PLAN-DEC-02 (a skill for every learning objective) is still open and blocks task 2a.4 (the Phase 2a seed).
