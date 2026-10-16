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
