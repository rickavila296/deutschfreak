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

## 2026-10-16 · Phase 1 · repo, packages/config, CI · Quality tooling

- **Phase:** 1 Repo and tooling
- **Module:** repo root, packages/config, .github/workflows
- **Update:** Task 1.2, session 2 quality tooling
- **Type:** feature
- **What was done:** Added ESLint (typescript-eslint recommended, `no-explicit-any` as error) and Prettier, with the shared configs in `packages/config` and root re-exports. Added the architecture rule 1 lint rule (`no-restricted-imports` for `@deutschfreak/db` and `packages/db` paths in `apps/web/**`) and a test proving it. Added the GitHub Actions workflow (install with frozen lockfile, lint, typecheck, test; Node from `.nvmrc`), `.gitattributes` (`* text=auto eol=lf`), `.env.example` (TRD §25 names, commented out as proposed), a README opening, `.gitignore` entries for build output, `packageManager: pnpm@12.9.1`, and root `lint` and `format` scripts. Versions resolved by pnpm: eslint 10, typescript-eslint 8, prettier 3; actions checkout v7, setup-node v7, pnpm/action-setup v6.
- **Files:** .gitattributes, .gitignore, .env.example, .prettierignore, README.md, eslint.config.js, prettier.config.js, package.json, pnpm-lock.yaml, packages/config/package.json, packages/config/eslint.config.js, packages/config/prettier.config.js, packages/config/eslint-boundaries.test.js, .github/workflows/ci.yml, PROGRESS.md
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 2 files, 6 tests passed. The rule test failed (2 of 3) with the rule disabled. CI on GitHub: run 38870691450 green on 80da577; run 38870806662 red at the typecheck step on 9929873 (deliberately broken type); run 38872310846 green on 6c85eb9 (revert).
- **Status:** passed
- **Notes:** Prettier ignores PROGRESS.md (append-only) and docs/; YAML keeps double quotes. CLAUDE.md stays local by owner choice and matches the scripts as built. `main` is not yet on GitHub and needs a branch protection rule requiring the `check` job (TRD-CI-02); both are owner steps. Owner asked to stop pushing for now; this entry is committed locally only.

## 2026-10-16 · Phase 1 · packages/validation, packages/content · Structure schema for content

- **Phase:** 1 Repo and tooling
- **Module:** packages/validation, packages/content, .github/workflows
- **Update:** Task 1.3, session 3 structure schema and `a1.yaml` validation
- **Type:** feature
- **What was done:** Added strict Zod schemas for `a1.yaml` (level, part, unit, lesson, objective; nine archetypes; optional `notes`) with code schemas for every tier, plus checks for unique codes and codes nested in their parent. Added `validateA1Structure` with the Spec §20 counts (4 parts, 24 units, 92 lessons). Moved `lessonCodeSchema` into `codes.ts` unchanged. Created `@deutschfreak/content` with a loader (YAML parsed with unique keys), the `validate` script, and tests on the real file. Added root `content:check` and a CI step for it. Added `allowImportingTsExtensions` to the shared tsconfig so Node 24 runs the script directly. Pinned `@types/node` to the 24 line on owner approval.
- **Files:** packages/validation/src/codes.ts, packages/validation/src/structure.ts, packages/validation/src/structure.test.ts, packages/validation/src/index.ts, packages/config/tsconfig.base.json, packages/content/package.json, packages/content/tsconfig.json, packages/content/src/structure.ts, packages/content/src/structure.test.ts, packages/content/scripts/validate-structure.ts, package.json, pnpm-lock.yaml, .github/workflows/ci.yml, PROGRESS.md
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 3 files, 22 tests passed; `pnpm content:check` reports 4 parts, 24 units, 92 lessons, 92 objectives, valid. The 13 structure tests failed before the schema existed. A deliberately broken lesson code made `content:check` exit 1 with 3 problems; the file was restored unchanged.
- **Status:** passed
- **Notes:** Not pushed (owner asked to hold pushes), so the CI step has not run on GitHub yet. Plan marks session 3 as R; the owner directed it to be built. No `skill` field yet (PLAN-DEC-02).

## 2026-10-16 · Phase 1 · packages/config, packages/content, docs/decisions · Phase 1 review fixes

- **Phase:** 1 Repo and tooling
- **Module:** packages/config, packages/content, docs/decisions, repo root
- **Update:** Fixes for the five notes of the independent Phase 1 review, all approved by the owner
- **Type:** fix
- **What was done:** (1) The architecture rule 1 lint check now also catches dynamic `import()` and `require()` of `@deutschfreak/db` or `packages/db` in `apps/web` (`no-restricted-syntax`), with four new tests. (2) `docs/content-review/` is now tracked in git; the kit stays local. (3) Logged decisions 0003 (build Phase 1 session 3 despite its R mark) and 0004 (kit local, content review tracked). (4) Reworded the A1.4.U06 L01 and L02 objective and mastery text from the first person into the specification's style; decision 0002 amended with the previous wording. (5) The duplicate-code test now removes its temp folder, and the objective count is asserted as exactly 92.
- **Files:** packages/config/eslint.config.js, packages/config/eslint-boundaries.test.js, packages/content/src/structure.test.ts, packages/content/structure/a1.yaml, .gitignore, docs/content-review/README.md, docs/decisions/0002-a1-4-u06-objectives.md, docs/decisions/0003-build-phase-1-session-3.md, docs/decisions/0004-kit-local-content-review-tracked.md, PROGRESS.md
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 3 files, 26 tests passed; `pnpm content:check` 4 parts, 24 units, 92 lessons, 92 objectives, valid. The three new dynamic-import and require tests failed before the rule change. Local half of gate M1: a fresh clone of b13246d passed install (frozen lockfile), lint, typecheck, test and content:check.
- **Status:** passed
- **Notes:** Review verdict was Pass with notes, nothing blocking. Rule 1 still covers only files under `apps/web/**`; a shared package that re-exports db would not be caught (review note, for Phase 4). Gate M1 stays open until a CI run on GitHub includes `content:check`; nothing is pushed by owner request. A fresh clone under a deep folder path fails on Windows path length (pnpm run-state file); use a short path.

## 2026-10-16 · Phase 1 · repo · Gate M1 reached

- **Phase:** 1 Repo and tooling
- **Module:** repo
- **Update:** Gate M1: a fresh clone passes install, lint, typecheck and test locally and in CI
- **Type:** test
- **What was done:** Checked M1. Locally: a fresh clone of phase-01/1.3-structure-schema (b13246d) passed `pnpm install --frozen-lockfile`, lint, typecheck, test and content:check. In CI: run 38878790744 on f9625ea passed install, lint, typecheck, test and content:check. Earlier, run 38870806662 failed at typecheck on a deliberately broken type. The independent Phase 1 review gave Pass with notes; all five notes were fixed in f9625ea. The owner confirmed the gate.
- **Files:** PROGRESS.md
- **Checks:** GitHub Actions run 38878790744 green; local fresh-clone checks passed
- **Status:** passed
- **Notes:** Next: the owner merges phase-01/1.3-structure-schema (all of Phase 1) into main once CI is green on this commit. main must exist on GitHub, be the default branch and require the `check` job (TRD-CI-02). Phase 2 starts in a new thread; PLAN-DEC-01 blocks it, and PLAN-DEC-02 blocks task 2a.4.

## 2026-10-16 · Phase 2 · docs/decisions · Decision 0005 (PLAN-DEC-01 schema recommendations)

- **Phase:** 2 Database v1
- **Module:** docs/decisions
- **Update:** PLAN-DEC-01 decided: DB-REC-01 to 12 confirmed; DB-OQ-15 answered
- **Type:** decision
- **What was done:** The owner accepted all twelve schema recommendations in Schema §12 as written. DB-OQ-15 was checked: drizzle-orm 0.45.4 and drizzle-kit 0.31.11 cannot declare or generate deferrable constraints, so the position unique constraints will be made deferrable in a hand-written custom migration; `code` uniqueness stays non-deferrable for upserts.
- **Files:** docs/decisions/0005-schema-recommendations.md, PROGRESS.md
- **Checks:** none (decision only); drizzle packages inspected for a `deferrable` constraint option, none found
- **Status:** passed
- **Notes:** PLAN-DEC-02 (a skill for every objective) still blocks 2a.4; PLAN-DEC-03 blocks 2b. Proposed Bible edit (local, not applied): mark Schema §12 rows as confirmed by 0005 and replace "that is unverified (DB-OQ-15)" in §9 with the finding.

## 2026-10-16 · Phase 2 · packages/content, packages/validation, docs/decisions · Decision 0006 (PLAN-DEC-02 objective skills)

- **Phase:** 2 Database v1
- **Module:** packages/content, packages/validation, docs/decisions
- **Update:** PLAN-DEC-02 decided: every learning objective in a1.yaml carries one skill, and the structure schema requires it
- **Type:** decision
- **What was done:** The owner approved PLAN-DEC-02 as drafted. Added `skillSchema` (the eight skills of Schema enum `skill`) and made `skill` required on objectives in the strict structure schema. Assigned one skill to each of the 92 objectives in a1.yaml. Gave the test fixtures a skill and added two tests: an objective with no skill is rejected; a skill outside the eight is rejected. Logged decision 0006.
- **Files:** packages/validation/src/structure.ts, packages/validation/src/structure.test.ts, packages/content/structure/a1.yaml, docs/decisions/0006-objective-skills.md, PROGRESS.md
- **Checks:** Red first: with structure.ts and a1.yaml stashed, `pnpm test` failed 2 of 18 validation tests ("accepts a well-formed tree" and "reports the counts and fails a tree that is too small", both because the old strict schema rejects the fixture's `skill` key). The two new tests passed vacuously in that state for the same reason, so the implementation was also broken on purpose: `skill` made optional failed "rejects an objective with no skill" (1 of 18); `skill` as any string failed "rejects a skill outside the eight" (1 of 18). After restoring: `pnpm lint` clean (prettier applied to structure.test.ts); `pnpm typecheck` passed; `pnpm test` 4 files, 28 tests passed (validation 18, content 3, config 7); `pnpm content:check` 4 parts, 24 units, 92 lessons, 92 objectives, valid.
- **Status:** passed
- **Notes:** PLAN-DEC-03 still blocks 2b. Owner prerequisites before 2a.1 are still open: a local `.env` with the Neon connection strings, and a Neon dev branch.

## 2026-10-16 · Phase 2 · docs/decisions · Decision 0007 (PLAN-DEC-03 knowledge pool rules)

- **Phase:** 2 Database v1
- **Module:** docs/decisions, docs/bible (local)
- **Update:** PLAN-DEC-03 decided: DB-OQ-06, 07, 12 and 13 answered; `lesson_blocks.mode` added to the Schema
- **Type:** decision
- **What was done:** The owner accepted all four rules and asked for the mode column. Irregular verb forms are separate vocabulary entries until A1.2.U04, with no columns for separability or concept links. All 50 A1 concepts are seeded in Phase 2b. Stage 7 recall mode is a nullable `mode` column of enum `review_mode` on `lesson_blocks` that reuses the authored exercises. Pronouns, numerals and similar classes stay under `function_word`. Local Bible edit to Schema v0.3 (no version change): §8.8 gains the `mode` row and a note; §15 marks DB-OQ-06, 07, 12, 13 resolved by 0007; from decision 0005, §12 notes DB-REC-01 to 12 confirmed and §9 states the DB-OQ-15 finding; change summary updated; `node docs/bible/build.mjs` rebuilt INDEX.md.
- **Files:** docs/decisions/0007-knowledge-pool-rules.md, PROGRESS.md; local and git-ignored: docs/bible/05-schema.md, docs/bible/INDEX.md, docs/bible/dist/DeutschFreak_Bible.md
- **Checks:** none (decision only); `pnpm lint` clean
- **Status:** passed
- **Notes:** All three Phase 2 blocking decisions are now recorded. The Bible is git-ignored, so its edit is not in a commit. The Schema does not say whether `mode` is allowed only on exercise blocks; no check was added. 2a.1 waits on the owner's `.env` and Neon dev branch.

## 2026-10-16 · Phase 2 · packages/db · Task 2a.1 db package and Neon connection

- **Phase:** 2 Database v1
- **Module:** packages/db
- **Update:** Task 2a.1: `packages/db` created and connected to the Neon dev branch with the direct connection string
- **Type:** feature
- **What was done:** Created `@deutschfreak/db` with drizzle-orm, the `pg` driver and drizzle-kit. `src/env.ts` loads the repo-root `.env` and reads `DATABASE_URL` or `DATABASE_URL_DIRECT`; a missing or non-PostgreSQL value fails with the variable name and never the value. `drizzle.config.ts` uses `DATABASE_URL_DIRECT` (TRD-DB-14), output folder `migrations`, strict mode; `src/schema.ts` is an empty placeholder until 2a.2. `scripts/check-connection.ts` connects with the direct string and prints only the database name, server version and region, and fails if the direct string is a pooled host. The owner created the Neon project (Frankfurt), the dev branch and `.env`.
- **Files:** packages/db/package.json, packages/db/tsconfig.json, packages/db/drizzle.config.ts, packages/db/src/env.ts, packages/db/src/env.test.ts, packages/db/src/index.ts, packages/db/src/schema.ts, packages/db/scripts/check-connection.ts, pnpm-lock.yaml, PROGRESS.md
- **Checks:** The four env tests failed before `env.ts` existed (module not found) and pass now. `pnpm --filter @deutschfreak/db check-connection`: connected, database neondb, PostgreSQL 18.6, region eu-central-1. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 5 files, 32 tests passed (db 4, validation 18, content 3, config 7); `pnpm content:check` 4 parts, 24 units, 92 lessons, 92 objectives, valid.
- **Status:** passed
- **Notes:** The Bible names no PostgreSQL driver; `pg` was chosen (owner informed). `@types/node` pinned to major 24 to match the runtime. pnpm blocked esbuild's build script (used by drizzle-kit); left blocked, ask the owner before allowing it if 2a.3 needs it. The connection check cannot tell which Neon branch is used; the owner confirms the endpoint matches the dev branch. Next: 2a.2 enums and tables 1 to 6.

## 2026-10-16 · Phase 2 · packages/db, packages/validation · Task 2a.2 enums and tables 1 to 6

- **Phase:** 2 Database v1
- **Module:** packages/db, packages/validation
- **Update:** Task 2a.2: Drizzle definitions of the enumerated types and tables 1 to 6
- **Type:** feature
- **What was done:** Defined the enums `skill`, `lesson_archetype`, `lesson_status` and `block_role`, with values taken from `packages/validation` (new `enums.ts` adds `lessonStatusSchema` and `blockRoleSchema`). Defined `levels`, `course_parts`, `units`, `lessons`, `learning_objectives` and `lesson_objectives` per Schema §8.1 to 8.6: standard columns (uuid id, code, timestamptz created_at and updated_at), unique code, slug and position constraints (DB-UQ-01 to 05), check `lessons_archetypes_check` (DB-CK-04), RESTRICT down the structure tree (DB-DEL-03), CASCADE from lesson and RESTRICT on objective in `lesson_objectives` (DB-DEL-02, 04), composite primary key on the link table (DB-REC-08), and an index on `lesson_objectives.objective_id`. No migration generated (2a.3).
- **Files:** packages/db/src/schema.ts, packages/db/src/schema.test.ts, packages/db/package.json, packages/validation/src/enums.ts, packages/validation/src/index.ts, pnpm-lock.yaml, PROGRESS.md
- **Checks:** 23 of the 27 db tests failed before `schema.ts` held the definitions; all 27 pass now. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 55 passed (db 27, validation 18, content 3, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Only the enums tables 1 to 6 use are defined; the others come with their tables in 2b. DB-IX-01 (lessons unit_id, position) is not added: it is R, not in decision 0005, and duplicates the index of `lessons_unit_id_position_key`. Tests that insert violating rows into the database, and making the position constraints deferrable, belong to 2a.3. Next: 2a.3 generate and apply the first migration.

## 2026-10-16 · Phase 2 · packages/db · Task 2a.3 first migration applied

- **Phase:** 2 Database v1
- **Module:** packages/db
- **Update:** Task 2a.3: first migration generated and applied to the Neon dev branch
- **Type:** feature
- **What was done:** `drizzle-kit generate` produced `0000_structure_tables.sql` (4 enums, tables 1 to 6, 5 foreign keys, 1 index). A hand-written `0001_deferrable_positions.sql` (`drizzle-kit generate --custom`) drops and re-adds the three position unique constraints as `DEFERRABLE INITIALLY DEFERRED` under the same names (decision 0005); PostgreSQL cannot change a unique constraint's deferrability in place. Code uniqueness stays non-deferrable. Applied with `drizzle-kit migrate` to the dev branch via `DATABASE_URL_DIRECT`, with owner approval. Added 13 database tests (`src/structure.db.test.ts`, run with `test:db`, each in a rolled-back transaction) and scripts `generate`, `migrate`, `test:db`; unit tests exclude `*.db.test.ts`.
- **Files:** packages/db/migrations/0000_structure_tables.sql, packages/db/migrations/0001_deferrable_positions.sql, packages/db/migrations/meta/_journal.json, packages/db/migrations/meta/0000_snapshot.json, packages/db/migrations/meta/0001_snapshot.json, packages/db/src/structure.db.test.ts, packages/db/vitest.config.ts, packages/db/vitest.db.config.ts, packages/db/package.json, packages/db/tsconfig.json, PROGRESS.md
- **Checks:** `drizzle-kit generate` after the custom migration: no schema changes; `drizzle-kit check`: fine. Before the migration, `test:db` failed 13 of 13 (relation "levels" does not exist); after it, 13 passed. Database inspected: 6 public tables, 2 migrations recorded, the three position constraints deferrable and initially deferred. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 55 passed (db 27, validation 18, content 3, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** The first `test:db` run after migrating failed 2 tests because they expected error 23503; PostgreSQL reports ON DELETE RESTRICT as 23001 (restrict_violation). The new tests were corrected; the database was right. `test:db` is not in CI (no database there). pg warns that `sslmode=require` will weaken in pg v9; the owner may switch `.env` to `sslmode=verify-full`. Next: 2a.4 seed runner.

## 2026-10-16 · Phase 2 · packages/db, packages/content, packages/validation · Task 2a.4 seed runner and slugs

- **Phase:** 2 Database v1
- **Module:** packages/db, packages/content, packages/validation, docs/decisions
- **Update:** Task 2a.4: seed runner for a1.yaml; decision 0008 adds literal unit and lesson slugs
- **Type:** feature
- **What was done:** Decision 0008 (owner chose option A): 116 slugs written literally into `a1.yaml` from the titles (TRD-CNT-05 form; é → e; a dot between digits → hyphen; "(Sound Check N)" left out per 0001). `slugSchema` added; `slug` required on units and lessons, unique within each. `loadA1Structure` in packages/content returns the validated file or throws with every problem. `packages/db/src/seed.ts`: `seedStructure` upserts levels, course_parts, units, lessons and learning_objectives on `code` with 1-based file-order positions, links each objective to its own lesson with role `introduces`, removes links no longer in the file (DB-IMP-06), and reports codes absent from the file without deleting them (DB-IMP-07); `seed` wraps it in one transaction (DB-IMP-02). Status and revision are not written, so a reseed never unpublishes a lesson. `scripts/seed.ts` and a `seed` script added (not run yet; 2a.5).
- **Files:** docs/decisions/0008-unit-and-lesson-slugs.md, packages/content/structure/a1.yaml, packages/content/src/structure.ts, packages/content/package.json, packages/validation/src/structure.ts, packages/validation/src/structure.test.ts, packages/db/src/seed.ts, packages/db/src/seed.db.test.ts, packages/db/scripts/seed.ts, packages/db/package.json, pnpm-lock.yaml, PROGRESS.md
- **Checks:** Red first: 4 new slug tests failed before the schema change; the 11 seed tests could not load before `seed.ts` existed. Disabling the link removal made the DB-IMP-06 test fail (1 of 24); restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 65 passed (validation 28, db 27, config 7, content 3); `pnpm --filter @deutschfreak/db test:db` 24 passed (all in rolled-back transactions); `pnpm content:check` 4 parts, 24 units, 92 lessons, 92 objectives, valid.
- **Status:** passed
- **Notes:** The dev branch still holds no content rows. Slugs were not logged in docs/content-review (derived from reviewed titles); the owner may ask for that. Next: 2a.5 seed twice and compare counts.

## 2026-10-16 · Phase 2 · packages/db · Task 2a.5 seed twice, identical counts

- **Phase:** 2 Database v1
- **Module:** packages/db
- **Update:** Task 2a.5: a1.yaml seeded twice into the Neon dev branch with identical row counts; Phase 2a acceptance met
- **Type:** test
- **What was done:** Added `scripts/counts.ts` and a `counts` script (row count per structure table and lessons by status). Ran counts, `seed`, counts, `seed`, counts on the dev branch, with owner approval. The dev branch now holds the A1 structure tree.
- **Files:** packages/db/scripts/counts.ts, packages/db/package.json, PROGRESS.md
- **Checks:** Counts before / after seed 1 / after seed 2: levels 0/1/1, course_parts 0/4/4, units 0/24/24, lessons 0/92/92 (all planned), learning_objectives 0/92/92, lesson_objectives 0/92/92. `pnpm --filter @deutschfreak/db test:db` 24 passed with the seeded data present. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 65 passed; `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Phase 2a acceptance met (Phase 2 brief). The full gate (migrate and seed twice on an empty branch) is best re-proved on a fresh Neon branch at the end of 2b. Before 2b.3 the owner must decide whether A1.1.U01 may be published before the teacher review (PRD-NFR-005 against Plan 2b and 6). Next: 2b.1 tables 7 to 24.

## 2026-10-16 · Phase 2 · packages/db, packages/validation, docs/decisions · Task 2b.1 tables 7 to 24

- **Phase:** 2 Database v1
- **Module:** packages/db, packages/validation, docs/decisions
- **Update:** Task 2b.1: enums and tables 7 to 24 defined, migrated and applied to the Neon dev branch; decision 0009; decision 0007 amended
- **Type:** feature
- **What was done:** Decision 0009: A1.1.U01 may be `published` before the teacher review; composed German still goes to docs/content-review. Added 13 enums to `packages/validation/src/enums.ts` (cefr_level, section_weight, block_kind, block_status, concept_type, word_class, noun_article, vocabulary_tier, register, audio_variant, production_method, exercise_type, review_mode) and the 18 tables of Schema §8.7 to 8.24 to `schema.ts`, with the checks DB-CK-01 to 08, unique rules DB-UQ-02 and 06 to 11 (partial unique indexes for audio and exercise targets), delete rules DB-DEL-01 to 07 and an index on every foreign key. `lesson_blocks.mode` (decision 0007) plus, at the owner's request, `lesson_blocks_mode_check` (only exercise blocks carry a mode; 0007 amended). Migrations: `0002_knowledge_tables` (generated), `0003_deferrable_positions_2b` (hand-written; block, dialogue line and exercise item positions deferrable), `0004_lesson_blocks_mode_check` (generated). Applied to the dev branch with owner approval. Schema test helpers moved to `src/testing/table-config.ts`. Local Bible: Schema §8.8 notes the mode check.
- **Files:** docs/decisions/0009-publish-u01-before-teacher-review.md, docs/decisions/0007-knowledge-pool-rules.md, packages/validation/src/enums.ts, packages/db/src/schema.ts, packages/db/src/schema.test.ts, packages/db/src/schema-knowledge.test.ts, packages/db/src/knowledge.db.test.ts, packages/db/src/testing/table-config.ts, packages/db/migrations/0002_knowledge_tables.sql, packages/db/migrations/0003_deferrable_positions_2b.sql, packages/db/migrations/0004_lesson_blocks_mode_check.sql, packages/db/migrations/meta/_journal.json, packages/db/migrations/meta/0002_snapshot.json, packages/db/migrations/meta/0003_snapshot.json, packages/db/migrations/meta/0004_snapshot.json, PROGRESS.md; local and git-ignored: docs/bible/05-schema.md, docs/bible/INDEX.md
- **Checks:** Red first: 41 new schema tests failed before the definitions; the mode-check schema test failed before the check; 32 database tests failed before the migration (tables missing). After applying: `test:db` 57 passed; database has 24 tables, 5 migrations, 6 deferrable position constraints; seeded 2a rows unchanged (1/4/24/92/92/92). `drizzle-kit check` fine. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 106 passed (db 68, validation 28, config 7, content 3); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Two new tests were corrected after a first run: an expected-row order in a schema test, and a database test that named one check where a block with no target breaks two (PostgreSQL may name either). DB-IX-03 and DB-IX-04 (browse-filter indexes) are R and not in decision 0005; not added, raise after G2. Next: 2b.2 Zod schemas for pool and lesson files.

## 2026-10-16 · Phase 2 · packages/validation, docs/decisions · Task 2b.2 content file schemas

- **Phase:** 2 Database v1
- **Module:** packages/validation, docs/decisions
- **Update:** Task 2b.2: Zod schemas for every pool file type and for lesson files; decision 0010 (file layout, provisional payload)
- **Type:** feature
- **What was done:** Decision 0010: `topics.yaml` and `voices.yaml` at the content root, an `examples/` folder, each vocabulary file names its topic (words may list more), and an exercise item's `payload` is any JSON object until Phase 8 (option A). `codes.ts` gains formats for section, block, concept (G, sound:, pattern:), vocab:, phrase:, eg:, dlg: and lines, ex: and items, topic: and voice: codes, plus `codeKind` (which table a code belongs to); `slugSchema` moved here from `structure.ts` unchanged. New `content-files.ts`: strict schemas for topics, voices, concepts, vocabulary, phrases, examples, dialogues, exercises and lesson files, mirroring Schema §8 with references by code and in-file checks (duplicate codes and slugs, concept type matches code, no self-requirement, article exactly for nouns, children inside their parent, section code = lesson + stage, one section per stage, block target matches its kind, text blocks without a target, mode only on exercise blocks, exercise targets only concepts, words, phrases or objectives).
- **Files:** docs/decisions/0010-content-file-layout.md, packages/validation/src/codes.ts, packages/validation/src/structure.ts, packages/validation/src/content-files.ts, packages/validation/src/content-files.test.ts, packages/validation/src/knowledge-codes.test.ts, packages/validation/src/index.ts, PROGRESS.md
- **Checks:** Red first: the 29 content-file tests could not load before `content-files.ts` existed. The code-format tests were written after the formats; loosening the slug pattern on purpose made 4 of them fail, then it was restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 174 passed (validation 96, db 68, config 7, content 3); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Cross-file reference checks (a referenced code exists) belong to the importer in 2b.4 (TRD-CNT-06). The TRD-VAL-05 content checks (examples use only words already introduced; active words reappear twice) need authored content and are not built yet. Next: 2b.3 author A1.1.U01.

## 2026-10-16 · Phase 2 · packages/content, docs/content-review, docs/decisions · Task 2b.3 A1.1.U01 authored

- **Phase:** 2 Database v1
- **Module:** packages/content, docs/content-review, docs/decisions
- **Update:** Task 2b.3: A1.1.U01 knowledge pool and the A1.1.U01.L01 lesson file authored; decision 0011
- **Type:** feature
- **What was done:** Decision 0011 (owner: all five recommendations, plus option B for Herr and Frau): two voices (`voice:thorsten`, `voice:kerstin`, licences unverified); all 50 concepts with title and one-line text word for word from Spec §10 and §8 and prerequisites from the Requires column ("Numbers" left out); all U01 words and phrases the Spec lists except Herr and Frau (no article in the Spec; added with L02 in Phase 6); examples, dialogues and exercises for L01 only. Files: `voices.yaml`, `topics.yaml` (greetings, personal-data), `concepts/grammar.yaml` (27), `concepts/pronunciation.yaml` (23), `vocabulary/greetings.yaml` (danke, bitte, ja, nein as function words), `vocabulary/personal-data.yaml` (der Vorname, der Nachname; no plurals), `phrases/greetings.yaml` (16), `phrases/names-and-spelling.yaml` (9), `examples/greetings.yaml` (4), `dialogues/erste-begegnung.yaml` (2 dialogues, 8 lines), `exercises/greetings.yaml` (6 exercises, 22 items), `lessons/A1.1.U01.L01.yaml` (nine sections, archetype C weights, stage 7 blocks in recall mode, stage 9 mastery task from the Spec). `src/pool.ts` loads and validates every pool and lesson file; `content:check` now runs it too. Every composed German string, every register and meaning call, and the English texts are logged in `docs/content-review/A1.1.U01.md`.
- **Files:** docs/decisions/0011-u01-authoring-scope.md, docs/content-review/A1.1.U01.md, packages/content/voices.yaml, packages/content/topics.yaml, packages/content/concepts/grammar.yaml, packages/content/concepts/pronunciation.yaml, packages/content/vocabulary/greetings.yaml, packages/content/vocabulary/personal-data.yaml, packages/content/phrases/greetings.yaml, packages/content/phrases/names-and-spelling.yaml, packages/content/examples/greetings.yaml, packages/content/dialogues/erste-begegnung.yaml, packages/content/exercises/greetings.yaml, packages/content/lessons/A1.1.U01.L01.yaml, packages/content/src/pool.ts, packages/content/src/pool.test.ts, packages/content/scripts/validate-pool.ts, packages/content/package.json, PROGRESS.md
- **Checks:** `pnpm content:check`: a1.yaml valid; pool 2 topics, 2 voices, 50 concepts, 6 words, 25 phrases, 4 examples, 2 dialogues (8 lines), 6 exercises (22 items), 1 lesson file, every file valid. An ad-hoc check resolved all 100 cross-file references. Hiding `concepts/pronunciation.yaml` made the concept-count test fail; restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 178 passed (validation 96, db 68, content 7, config 7).
- **Status:** passed
- **Notes:** 22 composed German strings logged for the teacher, plus register, word-class, tier and meaning calls and the English lesson and exercise texts. Unsure: registers of Bis später and Guten Tag (neutral), bitte glossed "please; you're welcome", stage 8 of L01 has a note only (nothing earlier to review). `topic:personal-data` added beside greetings (Spec A1.1 vocabulary domain). Nothing seeded yet. Next: 2b.4 extend the seed runner to the full seed order.

## 2026-10-16 · Phase 2 · packages/db, packages/content · Task 2b.4 full seed order

- **Phase:** 2 Database v1
- **Module:** packages/db, packages/content
- **Update:** Task 2b.4: the seed runner loads the knowledge pool and lesson files after a1.yaml, resolving codes to ids
- **Type:** feature
- **What was done:** New `packages/db/src/seed-content.ts` (`seedContent`): in the order of DB-IMP-04 / TRD-CNT-07 it upserts topics, voices, concepts (then prerequisites), vocabulary (then topics), phrases, examples (then word and concept links), dialogues (then lines), exercises (then items and targets) and lesson sections and blocks, all on `code`. Every reference is resolved from code to id; an unknown code throws "Unknown code …" and the transaction rolls back (TRD-CNT-06, DB-CODE-06). Link tables, including exercise targets, are rewritten to match the files (DB-IMP-06). Positions follow file order (TRD-CNT-08). A lesson whose file is imported becomes `published`, and its file must hold nine sections (DB-INT-08, decision 0009). Codes absent from the files are reported, never deleted (DB-IMP-07). `seed(db, structure, content)` runs structure and content in one transaction; `scripts/seed.ts` loads and validates the content files first. `packages/content` now exports the pool loader through `src/index.ts`.
- **Files:** packages/db/src/seed-content.ts, packages/db/src/seed-content.db.test.ts, packages/db/src/seed.ts, packages/db/scripts/seed.ts, packages/content/src/index.ts, packages/content/package.json, PROGRESS.md
- **Checks:** 13 new database tests (rolled back). Written before the code but first run after it; disabling the publish step and the nine-section check on purpose made 2 fail, then both were restored. `test:db` 70 passed; dev branch unchanged (structure only, 92 planned). `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 178 passed; `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Audio assets are not seeded here; the audio script writes them later. Sections or blocks removed from a lesson file are reported, not deleted; retiring them is an explicit step. Next: 2b.5 seed twice on the dev branch, the Phase 2 gate run.

## 2026-10-16 · Phase 2 · packages/db · Task 2b.5 Phase 2 gate run from an empty branch

- **Phase:** 2 Database v1
- **Module:** packages/db, docs/decisions
- **Update:** Task 2b.5: migrate and seed twice on an empty dev branch with identical counts; database tests moved to their own Neon branch (decision 0012)
- **Type:** test
- **What was done:** A first 2b.5 run found the dev branch not empty: during 2b.4, a deliberately broken run of a seed test that commits on success had saved L01 with 8 sections and no publish (rows at 12:03), and a 2a test that assumes no published lessons then failed. Decision 0012 (owner): database tests run on a separate Neon branch through a new `DATABASE_URL_TEST`; `src/testing/test-database.ts` refuses it when missing, pooled or on the dev host, and `src/testing/migrate-test-database.ts` (Vitest global setup) migrates it first. The owner reset the dev branch from its empty parent and created the test branch. Then on dev: `migrate` (5 migrations), `counts` (24 tables, all 0), `seed`, `counts`, `seed`, `counts`. `counts` now covers all 24 content tables and lists published lessons; new `show-refusals` shows both 2b refusals in a rolled-back transaction. `.env.example` lists `DATABASE_URL_TEST`; local TRD §25 has a row and a change-summary line for it.
- **Files:** docs/decisions/0012-test-database-branch.md, packages/db/src/env.ts, packages/db/src/testing/test-database.ts, packages/db/src/testing/test-database.test.ts, packages/db/src/testing/migrate-test-database.ts, packages/db/vitest.db.config.ts, packages/db/src/structure.db.test.ts, packages/db/src/knowledge.db.test.ts, packages/db/src/seed.db.test.ts, packages/db/src/seed-content.db.test.ts, packages/db/scripts/counts.ts, packages/db/scripts/show-refusals.ts, packages/db/package.json, .env.example, PROGRESS.md; local and git-ignored: docs/bible/02-trd.md, docs/bible/INDEX.md
- **Checks:** Gate on the reset dev branch: before, 0 tables; after migrating, every table 0 rows; after seed 1 and seed 2, identical (diff empty): levels 1, course_parts 4, units 24, lessons 92, learning_objectives 92, lesson_objectives 92, topics 2, voices 2, concepts 50, concept_prerequisites 32, vocabulary_items 6, vocabulary_topics 6, phrases 25, examples 4, example_vocabulary 6, example_concepts 1, dialogues 2, dialogue_lines 8, exercises 6, exercise_items 22, exercise_targets 21, lesson_sections 9, lesson_blocks 36, audio_assets 0; lessons planned 91, published 1 (A1.1.U01.L01 with 9 sections). `show-refusals`: a block with two targets refused by `lesson_blocks_one_target_check`; deleting vocab:danke refused by the `lesson_blocks` RESTRICT foreign key (its example and exercise links lifted first, rolled back); counts unchanged. The 4 guard unit tests failed before `test-database.ts` existed. `test:db` on the test branch 70 passed, the 2a test unchanged; dev data untouched. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 182 passed (validation 96, db 72, content 7, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Lesson learned: code is broken on purpose only in tests that run fully rolled back; tests that call `seed()` outside a transaction commit on success. All Phase 2 tasks are done. Next per the phase brief: `/review 2`, then `/gate` for the Phase 2 gate; the owner merges once CI is green (CI runs no database tests).

## 2026-10-16 · Phase 2 · packages/db, packages/content, packages/validation · Phase 2 review fixes

- **Phase:** 2 Database v1
- **Module:** packages/db, packages/content, packages/validation, docs/decisions
- **Update:** Fixes for the independent Phase 2 review (`/review 2`), findings 1, 3, 4, 5, 6, 8 and 10; decision 0013
- **Type:** fix
- **What was done:** Decision 0013 (owner: option A for finding 1, fix seven, log the rest). Finding 1: on import, the sections and blocks of a lesson, the lines of a dialogue and the items of an exercise that their file no longer has are deleted before the rest is written (no position clash, no leftover blocks); the seed lists them as removed; knowledge objects stay "report, never delete" (DB-IMP-07, exception noted in the local Schema §10). Finding 3: `loadContentFiles` reports a code or slug defined in two files of one table and a lesson file not named `<lesson code>.yaml`. Finding 4: the seed publishes only a `planned` lesson, never a retired one. Finding 5: `lessonFileSchema` requires all nine sections. Finding 6: `testDatabaseUrl` compares the test endpoint with both `DATABASE_URL_DIRECT` and `DATABASE_URL` (pooled suffix ignored) and refuses to run with neither set. Finding 8: shared seed helpers moved to `seed-helpers.ts`; no duplicates, no circular import. Finding 10: `show-refusals` rolls back only a transaction it started, so a connection failure is reported as itself. For finding 2, a failed seed now prints the database constraint and its detail.
- **Files:** docs/decisions/0013-review-2-fixes.md, packages/db/src/seed-helpers.ts, packages/db/src/seed.ts, packages/db/src/seed-content.ts, packages/db/src/seed-content.db.test.ts, packages/db/src/testing/test-database.ts, packages/db/src/testing/test-database.test.ts, packages/db/scripts/seed.ts, packages/db/scripts/show-refusals.ts, packages/content/src/pool.ts, packages/content/src/pool.test.ts, packages/validation/src/content-files.ts, packages/validation/src/content-files.test.ts, PROGRESS.md; local and git-ignored: docs/bible/05-schema.md, docs/bible/INDEX.md
- **Checks:** Red first, each before its fix: 3 seed tests (removed block, removed line and item, retired lesson), 1 schema test (8 sections), 3 content tests (duplicate code, duplicate slug, lesson file name), 2 guard tests (no DIRECT variable); all pass after. `show-refusals` with a wrong address printed "connect ECONNREFUSED". Dev reseeded twice: counts identical before and after both runs, nothing removed or absent, L01 published with 9 sections, both refusals hold. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 189 passed (validation 97, db 75, content 10, config 7); `test:db` 74 passed on the test branch; `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Approved test change: the lesson-file test fixture now holds all nine stages (seven empty) for finding 5; no assertion changed. Follow-ups for Phase 6 (decision 0013): finding 2 beyond the message (lessons removed from or moved within a1.yaml), finding 7 (one round-trip per row in link rewrites and absent checks), finding 9 (three versions of the link-rewrite rule). Next: `/gate` for Phase 2; owner GitHub steps 2 to 4 (default branch main, protection, Phase 1 pull request) still open.

## 2026-10-16 · Phase 2 · repo · Phase 2 gate reached

- **Phase:** 2 Database v1
- **Module:** repo
- **Update:** Phase 2 gate: migrate and seed, run twice on an empty database branch, give the same row counts
- **Type:** test
- **What was done:** Checked the Phase 2 gate and the 2a and 2b acceptance criteria of the phase brief. The empty-branch run is the 2b.5 entry (dev reset to empty, 5 migrations, seeded twice, identical counts); after the review fixes, the seed tests ran the full seed twice on the empty test branch, and a further real seed on dev left every count identical. 2a: 1 level, 4 parts, 24 units, 92 lessons, 92 objectives and links. 2b: U01 pool seeded; A1.1.U01.L01 published with 9 sections; a block with two targets refused by `lesson_blocks_one_target_check`; deleting vocab:danke refused by the `lesson_blocks` RESTRICT key. The independent review ran and its fixes are in (397ae5d). The owner checked L01 and its nine sections in the Neon console and confirmed the gate.
- **Files:** PROGRESS.md
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 189 passed; `test:db` 74 passed on the test branch; `pnpm content:check` valid; `counts` before and after a further seed identical (levels 1, course_parts 4, units 24, lessons 92, learning_objectives 92, lesson_objectives 92, topics 2, voices 2, concepts 50, concept_prerequisites 32, vocabulary_items 6, vocabulary_topics 6, phrases 25, examples 4, example_vocabulary 6, example_concepts 1, dialogues 2, dialogue_lines 8, exercises 6, exercise_items 22, exercise_targets 21, lesson_sections 9, lesson_blocks 36, audio_assets 0; planned 91, published 1); `show-refusals` both refused.
- **Status:** passed
- **Notes:** Phase 1 is merged into main (PR #1, 28aaf81); main is the default branch and requires the `check` job. Next: push phase-02/review-fixes (owner OK) and merge it into main by pull request once `check` is green; CI runs no database tests. Still open outside the gate: the teacher review of docs/content-review/A1.1.U01.md, and the Phase 6 follow-ups of decision 0013. Phase 3 starts in a new session.

## 2026-10-16 · Phase 2 · repo · CI install fix: esbuild build script declined

- **Phase:** 2 Database v1
- **Module:** repo
- **Update:** CI failed on the first push of Phase 2 at `pnpm install --frozen-lockfile`; fixed
- **Type:** fix
- **What was done:** Symptom: CI run 38931049775 on phase-02/review-fixes failed at install with ERR_PNPM_IGNORED_BUILDS ("Ignored build scripts: esbuild"). Root cause: esbuild, a dependency of drizzle-kit since 2a.1, has an install script; pnpm v12 refuses to install in CI until the script is allowed or declined (locally it only warns), and the decision had been left open (2a.1 notes). Fix, owner approved: `allowBuilds: esbuild: false` in `pnpm-workspace.yaml`, so the script is declined; esbuild's binary comes from its platform package.
- **Files:** pnpm-workspace.yaml, PROGRESS.md
- **Checks:** `CI=true pnpm install --frozen-lockfile` passed locally (failed before the change); `drizzle-kit check` fine and `drizzle-kit generate` reports no schema changes; `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 189 passed; `pnpm content:check` valid. CI result on GitHub follows the push.
- **Status:** passed
- **Notes:** Any new dependency with an install script must be listed under `allowBuilds` (true or false) or CI install fails.

## 2026-10-16 · Phase 3 · docs/decisions · Decision 0014: TRD-LOG-03 approved

- **Phase:** 3 API foundation
- **Module:** docs/decisions
- **Update:** The owner approved TRD-LOG-03 (option A) before task 3.1
- **Type:** decision
- **What was done:** Decision 0014: logs never contain passwords, session tokens, connection strings or given answers tied to an identity beyond what the attempts table stores. For Phase 3, request log lines carry no body, no headers and no query string.
- **Files:** docs/decisions/0014-log-content-rule.md, PROGRESS.md
- **Checks:** none (decision only)
- **Status:** passed
- **Notes:** The local TRD §20 row still shows "R" and the approval note in the TRD stays until a Bible edit is approved.

## 2026-10-16 · Phase 3 · apps/api · Task 3.1 Express app skeleton

- **Phase:** 3 API foundation
- **Module:** apps/api
- **Update:** Task 3.1: `apps/api` created: Express 5, middleware order, helmet, CORS for `WEB_ORIGIN`, JSON request log with a request id
- **Type:** feature
- **What was done:** New package `@deutschfreak/api`. `createApp` registers, in order (TRD-BE-08): request id (a fresh uuid per request, client ids ignored, sent back as `X-Request-Id`), request log, `helmet`, CORS allowing only `WEB_ORIGIN` (TRD-SEC-15), JSON body parser; `x-powered-by` off. The log writes one JSON line per request to stdout (level, time, requestId, method, path, status, durationMs; warn for 4xx, error for 5xx) and never the body, headers or query string (TRD-LOG-01, decision 0014). `readApiConfig` requires `WEB_ORIGIN` to be a bare http(s) origin and never echoes the value. `src/server.ts` is the local dev server (`PORT`, default 4000, owner kept it local-only); the Vercel entry comes with 3.8. `@types/node` aligned to 24 like `packages/db` (owner approved).
- **Files:** apps/api/package.json, apps/api/tsconfig.json, apps/api/vitest.config.ts, apps/api/src/app.ts, apps/api/src/app.test.ts, apps/api/src/config.ts, apps/api/src/config.test.ts, apps/api/src/request-id.ts, apps/api/src/request-log.ts, apps/api/src/server.ts, pnpm-lock.yaml, PROGRESS.md
- **Checks:** Opening CORS to every origin and logging the full URL on purpose made 4 tests fail; restored. Dev server smoke run: 404 with `X-Request-Id`, CSP header, one log line without the query. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 201 passed (api 12, validation 97, db 75, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Express type augmentation goes through the global `Express` namespace; `express-serve-static-core` is not a direct dependency under pnpm. No routes yet; 404s are Express's default until 3.2.

## 2026-10-16 · Phase 3 · apps/api, packages/validation · Task 3.2 error handler and error codes

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/validation, docs/decisions
- **Update:** Task 3.2: the single error-handling middleware, the one error shape and the fixed list of error codes (decision 0015)
- **Type:** feature
- **What was done:** Decision 0015 (owner approved): ten error codes, each with one status: validation_failed 400, invalid_json 400, unauthorized 401, not_found 404, level_not_found 404, lesson_not_found 404, payload_too_large 413, rate_limited 429, internal_error 500, database_unavailable 503. `packages/validation/src/api-errors.ts` holds the code-to-status map and the strict `apiErrorResponseSchema` (TRD-API-20). In `apps/api`: `ApiError(code, message)` takes its status from the map; `notFound` answers unmatched routes; `errorHandler`, registered last (TRD-ERR-01, TRD-BE-08), maps ApiError, ZodError (validation_failed, field paths only, TRD-ERR-03) and body-parser errors (invalid_json, payload_too_large); anything else becomes internal_error with a generic message, and one error log line (name, message, stack, request id) is written. `createApp` takes `extraRoutes`, mounted before the not-found handler.
- **Files:** docs/decisions/0015-api-error-codes.md, packages/validation/src/api-errors.ts, packages/validation/src/api-errors.test.ts, packages/validation/src/index.ts, apps/api/package.json, apps/api/src/app.ts, apps/api/src/app.test.ts, apps/api/src/errors.ts, apps/api/src/error-handler.ts, apps/api/src/error-handler.test.ts, apps/api/src/request-log.ts, pnpm-lock.yaml, PROGRESS.md
- **Checks:** Removing the error handler on purpose made 7 tests fail; disabling the Zod mapping made 1 fail; both restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 213 passed (api 20, validation 101, db 75, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Approved test change: `app.test.ts` now mounts its probe routes through `extraRoutes` (before the not-found handler); no assertion changed. Bible follow-up (owner): write the decision 0015 code list into TRD §19 / TRD-API-20 at the next Bible documentation update; also pending, the TRD-LOG-03 row (decision 0014). Open for 3.6: the code for a planned lesson.

## 2026-10-16 · Phase 3 · apps/api, packages/validation · Task 3.3 health routes

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/validation
- **Update:** Task 3.3: `GET /health` and `GET /health/ready`
- **Type:** feature
- **What was done:** `healthRouter` (outside `/v1`, no auth, `Cache-Control: no-store` on these two routes only). `/health` answers `{ status: 'ok' }` without touching the database. `/health/ready` runs an injected `DatabaseCheck` with a 3 s timeout and answers `{ status: 'ready', database: 'reachable' }`, or `database_unavailable` (503, decision 0015) with no cause in the response; the cause is logged with the request id (decision 0014). `createApp` takes `checkDatabase`; without one, readiness reports the database unavailable (the real check is wired in 3.4). Response schemas `healthResponseSchema` and `readyResponseSchema` in `packages/validation`.
- **Files:** apps/api/src/app.ts, apps/api/src/health.ts, apps/api/src/health.test.ts, packages/validation/src/health.ts, packages/validation/src/index.ts, PROGRESS.md
- **Checks:** Making ready skip the database check on purpose made 4 tests fail; restored. Dev server smoke run: `/health` 200, `/health/ready` 503 database_unavailable with one error log line. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 220 passed (api 27, validation 101, db 75, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** The 3 s timeout and the two response bodies are not in the Bible (owner approved them with 3.3). No database touched in this task.

## 2026-10-16 · Phase 3 · apps/api, packages/db · Task 3.4 database client

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/db
- **Update:** Task 3.4: the API's database client, created once at module scope with the pooled connection string
- **Type:** feature
- **What was done:** `packages/db/src/client.ts`: `createDatabase(url)` makes one `pg.Pool` (pg defaults, max 10) with Drizzle and the schema on top, `check()` (`select 1`) for readiness, `close()`, and a pool `error` listener so a lost idle connection is reported instead of crashing the process. `readPooledDatabaseUrl` reads `DATABASE_URL` and refuses a string whose host lacks `-pooler`, never echoing it (TRD-BE-07, TRD-DB-14). `apps/api/src/db.ts` creates the client at module scope (TRD-PERF-03); `server.ts` passes `database.check` to `/health/ready`. `apps/api` now depends on `@deutschfreak/db` (allowed: only apps/api talks to the database, TRD-BE-01).
- **Files:** packages/db/src/client.ts, packages/db/src/client.test.ts, packages/db/src/client.db.test.ts, packages/db/src/env.ts, packages/db/src/env.test.ts, packages/db/src/index.ts, apps/api/src/db.ts, apps/api/src/server.ts, apps/api/src/app.ts, apps/api/package.json, pnpm-lock.yaml, PROGRESS.md
- **Checks:** Switching off the pooled-string guard on purpose made 1 test fail; restored. `test:db` on the test branch: first run 2 failed (an existing seed test timed out at 30 s, the next failed with 25P02 in the aborted transaction), re-run 76 passed in 154 s; the new client test passed alone and in the suite (one pooled connection reused). Local dev server against `DATABASE_URL`, read-only: `/health/ready` 200 reachable twice. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 226 passed (db 81, api 27, validation 101, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** The seed test timeout looks like the per-row round trips of decision 0013 finding 7 (Phase 6) on a slow network; no seed code changed here. Pool settings on Vercel are to be checked against current Vercel docs in 3.8.

## 2026-10-16 · Phase 3 · apps/api, packages/db, packages/validation · Task 3.5 German Map endpoint

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/db, packages/validation, docs/decisions
- **Update:** Task 3.5: `GET /v1/levels/:code/map`; decision 0016 (database tests in CI)
- **Type:** feature
- **What was done:** Response and params schemas in `packages/validation/src/api-map.ts` (level, parts with tagline, units with slug and English subtitle, lessons with code, slug, title, archetypes, status and can-do objectives; strict; no uuid, TRD-API-21). Repository `packages/db/src/repositories/level-map.ts`: one joined query (levels, course_parts, units, lessons, lesson_objectives, learning_objectives) in part, unit, lesson position order. Service `apps/api/src/services/level-map.ts` builds the tree, checks it against the response schema (a mismatch is internal_error, not a client error) and answers `level_not_found` when there are no rows. Route `apps/api/src/routes/levels.ts` validates `:code` with `levelCodeSchema` (validation_failed) and is mounted under `/v1` when `createApp` gets a `db`. `apps/api` gains `test:db` (Supertest on the Neon test branch); its global setup, `@deutschfreak/db/testing` `seedTestDatabase`, migrates and seeds the test branch. Decision 0016 (owner, option A): CI will run `test:db` with a `DATABASE_URL_TEST` secret, wired in 3.7.
- **Files:** docs/decisions/0016-database-tests-in-ci.md, packages/validation/src/api-map.ts, packages/validation/src/index.ts, packages/db/src/repositories/level-map.ts, packages/db/src/index.ts, packages/db/src/testing/index.ts, packages/db/src/testing/seed-test-database.ts, packages/db/package.json, apps/api/src/app.ts, apps/api/src/server.ts, apps/api/src/routes/levels.ts, apps/api/src/routes/levels.db.test.ts, apps/api/src/services/level-map.ts, apps/api/src/services/level-map.test.ts, apps/api/src/testing/db-setup.ts, apps/api/vitest.config.ts, apps/api/vitest.db.config.ts, apps/api/tsconfig.json, apps/api/package.json, PROGRESS.md
- **Checks:** Removing the params check on purpose made 1 Supertest case fail; ordering by code and slug instead of position made 1 fail; both restored. `apps/api test:db` 5 passed (A1: 4 parts, 6 units each, 92 unique lessons, each with an objective; curriculum order; only L01 published; no uuid; B2 404 level_not_found; a1, A9, A1.1, xyz 400 validation_failed). Local server against dev: 200, 4 parts, 24 units, 92 lessons, published A1.1.U01.L01. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 229 passed (api 30, db 81, validation 101, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** Owner kept the defaults: every lesson is on the map whatever its status (retired not yet specified by the Bible), the level code is exact and case-sensitive, JSON fields are camelCase. The first map call on a cold connection took about 0.9 s.

## 2026-10-16 · Phase 3 · apps/api, packages/db, packages/validation · Task 3.6 lesson endpoint without answers

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/db, packages/validation, docs/decisions
- **Update:** Task 3.6: `GET /v1/lessons/:slug`, one joined query, answers stripped in the service; decision 0017
- **Type:** feature
- **What was done:** `packages/validation/src/api-lesson.ts`: strict response schema (lesson with unit; nine sections; blocks as a union on `kind`, each with its target: vocabulary, phrase, concept, example, dialogue with lines and voice codes, exercise with answer-free items) and `answerFreeItemSchema` (code, prompt, options, audio only). Repository `packages/db/src/repositories/lesson.ts`: one query joining lessons, units, sections, blocks, the six target tables, dialogue lines, voices and exercise items, in stage, block, line and item order. `apps/api/src/services/answer-free.ts`: allow-list stripping (written test first). `apps/api/src/services/lesson.ts` builds the tree, passes every item through the allow-list, checks the result against the strict schema (mismatch = internal_error) and answers `lesson_not_found` for an unknown slug and, per decision 0017, for a planned or retired lesson. Route `apps/api/src/routes/lessons.ts` validates `:slug`. Decision 0017 (owner: 1A, 2 keep).
- **Files:** docs/decisions/0017-lesson-endpoint-gaps.md, packages/validation/src/api-lesson.ts, packages/validation/src/index.ts, packages/db/src/repositories/lesson.ts, packages/db/src/index.ts, apps/api/src/app.ts, apps/api/src/routes/lessons.ts, apps/api/src/routes/lessons.db.test.ts, apps/api/src/services/answer-free.ts, apps/api/src/services/answer-free.test.ts, apps/api/src/services/lesson.ts, PROGRESS.md
- **Checks:** Red first: the 5 stripping tests could not load before `answer-free.ts` existed. Making the service copy the whole payload and loosening the item schema on purpose made the no-answer Supertest fail ("response has the key answers"); restored. `apps/api test:db` 12 passed (L01: 9 stages in order, 36 blocks, dialogue lines, exercise items; every item equals its code plus the prompt side of its stored payload; no answer key anywhere; exactly 1 query; no uuid; unknown and planned slugs 404; malformed slugs 400). Local server against dev: 200, no answers/model/checklist keys. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 234 passed (api 35, db 81, validation 101, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** A first version of the no-answer test compared stored model-answer strings with the whole response and failed on "Tschüss", which is lesson content (the title); it now compares each item with its stored payload. Query counting (TRD-LOG-02) is a test assertion here, not development logging yet.

## 2026-10-16 · Phase 3 · apps/api, packages/db, CI · Task 3.7 Supertest suite in CI

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/db, .github, docs/decisions
- **Update:** Task 3.7: the Supertest suite completed and run in CI against the Neon test branch; decision 0018
- **Type:** test
- **What was done:** New `apps/api/src/routes/health.db.test.ts`: `/health/ready` with the real client (200 reachable; 503 database_unavailable when unreachable), not_found for unknown `/v1` paths, wrong methods and unversioned paths, CORS on a real `/v1` route; its header lists the route coverage (TRD-TEST-02). With `levels.db.test.ts` and `lessons.db.test.ts` the suite has 16 cases. CI gains a `database` job (after `check`, concurrency group `neon-test-branch`) that checks the two secrets are set, then runs `@deutschfreak/db test:db` and `@deutschfreak/api test:db`; `DATABASE_URL` there is a host-only placeholder from `DATABASE_DEV_HOST` (decisions 0016, 0018). Root script `pnpm test:db` runs both suites. Two guard tests cover the CI placeholder form. Decision 0018 (owner, option A): the 2a test "seeds … 92 planned lessons" first sets A1 lessons back to planned inside its rolled-back transaction. The owner added the GitHub secrets `DATABASE_URL_TEST` and `DATABASE_DEV_HOST`.
- **Files:** docs/decisions/0018-shared-test-branch.md, apps/api/src/routes/health.db.test.ts, packages/db/src/seed.db.test.ts, packages/db/src/testing/test-database.test.ts, .github/workflows/ci.yml, package.json, PROGRESS.md
- **Checks:** Before the fix, `test:db` after the API suite had seeded content: 1 failed (the 2a planned-lessons test), 75 passed. Owner's `.env` re-checked with masked endpoints: dev `ep-gent…vm5d` (pooled and direct), test `ep-smal…uqj7` (direct), separate branches. After: `pnpm test:db` db 76 passed (195 s), api 16 passed. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 236 passed (db 83, api 35, validation 101, content 10, config 7); `pnpm content:check` valid. The CI job first runs when the branches are pushed.
- **Status:** passed
- **Notes:** Approved test change: one setup line in `seed.db.test.ts` (decision 0018); no assertion changed. A first version of the new CORS case expected no header for a foreign origin; `cors` always names the one allowed origin and the browser refuses the rest, as the 3.1 tests already assert, so the case now checks the header is neither the foreign origin nor `*`. The db suite takes about 3 minutes and once timed out on a slow network (decision 0013 finding 7, Phase 6).

## 2026-10-17 · Phase 3 · apps/api, repo · Task 3.8 API deployed on Vercel

- **Phase:** 3 API foundation
- **Module:** apps/api, repo, docs/decisions
- **Update:** Task 3.8: the API deployed as its own Vercel project; final environment variable names; decisions 0019 (previews use dev, TRD-OQ-18) and 0020 (longer database test limits in CI)
- **Type:** feature
- **What was done:** Vercel docs checked 2026-10-16 (Express on Vercel, `@vercel/functions`): Express runs as one function on Fluid compute (TRD-DEP-05 proven); the entry must be a fixed file name that imports express. Owner created the Vercel project (Root Directory `apps/api`, framework Express, `DATABASE_URL`, `DATABASE_URL_DIRECT`, `WEB_ORIGIN` for Preview and Production) and chose option A for TRD-OQ-18 (decision 0019). Code: `src/app.ts` renamed `create-app.ts`, `src/server.ts` renamed `dev-server.ts`; `src/main.ts` builds the configured app once at module scope; `scripts/bundle.ts` (esbuild) bundles `src/main.ts` with packages/db and packages/validation and their dependencies into `dist/app.js`, keeping this app's own npm dependencies external; `apps/api/index.js` is the Vercel entry (imports express, re-exports the bundle); `vercel.json` sets region `fra1` and build command `pnpm run build`; `db.ts` calls `attachDatabasePool`; `tsconfig.json` sets `typeRoots` relative to apps/api; `.env.example` lists the final names (DATABASE_URL, DATABASE_URL_DIRECT, WEB_ORIGIN, DATABASE_URL_TEST; PORT and NEXT_PUBLIC_API_URL commented). ESLint ignores `.vercel/`; `.gitignore` ignores `.vercel/`. CI database time limits raised (decision 0020) after the first database job timed out from the US runner.
- **Files:** apps/api/index.js, apps/api/scripts/bundle.ts, apps/api/src/main.ts, apps/api/src/main.test.ts, apps/api/src/create-app.ts (was app.ts), apps/api/src/create-app.test.ts (was app.test.ts), apps/api/src/dev-server.ts (was server.ts), apps/api/src/db.ts, apps/api/src/health.ts, apps/api/src/error-handler.test.ts, apps/api/src/health.test.ts, apps/api/src/routes/health.db.test.ts, apps/api/src/routes/lessons.db.test.ts, apps/api/src/routes/levels.db.test.ts, apps/api/vercel.json, apps/api/tsconfig.json, apps/api/package.json, apps/api/vitest.db.config.ts, packages/db/vitest.db.config.ts, packages/config/eslint.config.js, .env.example, .gitignore, pnpm-lock.yaml, docs/decisions/0019-preview-database.md, docs/decisions/0020-ci-database-test-timeouts.md, PROGRESS.md
- **Checks:** Five preview builds, each fixed from Vercel's logs: no entry importing express; TS2688 "node" types from Vercel's temporary tsconfig (fixed with typeRoots; a root @types/node attempt did not help and was removed); runtime ERR_MODULE_NOT_FOUND for `@deutschfreak/validation/src/index.ts` (fixed by the bundle). `npx vercel build` reproduced the build locally (function = index.js, dist/app.js, npm packages). The bundle run locally against dev: `/health/ready` reachable, map 92 lessons, lesson 0 answer keys. Deployed preview `deutschfreak-git-phase-03-38-vercel-deutschfreak.vercel.app` (6b76823), opened by the owner: `/health/ready` {"status":"ready","database":"reachable"}; `/v1/levels/A1/map` the A1 tree with L01 published. CI run 38953283422 (5b2aa1a) green: check job, then database job (db suite 15.5 min, API Supertest suite passed). `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 237 passed (db 83, api 36, validation 101, content 10, config 7); `pnpm content:check` valid.
- **Status:** passed
- **Notes:** M2 gate met: Supertest green in CI, and the API answers on a Vercel URL. Previews sit behind Vercel's login (Deployment Protection); Phase 4 must decide how the web app reaches the API. Production builds from main and fails until Phase 3 is merged; its DATABASE_URL is currently dev, and a production database is still to be decided before real learners. The owner signed the Vercel CLI in on this laptop; the CLI linked the repo (`.vercel/`, ignored) and generated an unused deployment-protection bypass token (owner may delete it). Bible follow-ups for the next documentation update: TRD §24 and §25 (Express on Vercel proven, bundled entry, fra1, final names), plus decisions 0014 and 0015.

## 2026-10-17 · Phase 3 · apps/api, packages/db, packages/validation, CI · Phase 3 review fixes

- **Phase:** 3 API foundation
- **Module:** apps/api, packages/db, packages/validation, .github, docs/decisions
- **Update:** Fixes for the ten findings of the Phase 3 code review (a4688d6..b097a71); decision 0021
- **Type:** fix
- **What was done:** (1) `answerFreeItem` and `answerFreeItemSchema` drop `audio`, which named the phrase being heard on listening items (the answer); items carry prompt and options only. (2) The error handler maps any Express/body-parser error with a 4xx status to a client error (413 payload_too_large, JSON parse invalid_json, otherwise validation_failed). (3) `createDatabase` sets `connectionTimeoutMillis` 5000 (`connectionTimeoutMs`). (4) `src/main.ts` builds the app inside try/catch; `createApiDatabase()` replaces the import-time client; on a configuration error one `startup` error line is logged and `createApp({ webOrigin: false, startupError: true })` serves `/health` and answers internal_error elsewhere. (5) `scripts/bundle.ts` uses `fileURLToPath`. (6) CI triggers: push to main, pull_request, workflow_dispatch. (7) The request log writes on `close` with `aborted`. (8) `errorLogLine` in request-log.ts used by health, the error handler and the idle-connection handler. (9) `readApiConfig` checks scheme, credentials, path, query and fragment separately and returns the normalised origin. (10) `parseRequest` in errors.ts turns request-input ZodErrors into validation_failed; the error handler no longer maps ZodError.
- **Files:** docs/decisions/0021-review-3-fixes.md, apps/api/src/services/answer-free.ts, apps/api/src/services/answer-free.test.ts, packages/validation/src/api-lesson.ts, apps/api/src/routes/lessons.db.test.ts, apps/api/src/error-handler.ts, apps/api/src/error-handler.test.ts, apps/api/src/errors.ts, apps/api/src/routes/lessons.ts, apps/api/src/routes/levels.ts, packages/db/src/client.ts, packages/db/src/client.test.ts, packages/db/src/index.ts, apps/api/src/main.ts, apps/api/src/db.ts, apps/api/src/create-app.ts, apps/api/src/create-app.test.ts, apps/api/src/startup.test.ts, apps/api/src/health.ts, apps/api/src/request-log.ts, apps/api/src/request-log.test.ts, apps/api/src/config.ts, apps/api/src/config.test.ts, apps/api/scripts/bundle.ts, .github/workflows/ci.yml, PROGRESS.md
- **Checks:** Red first for (1): the new audio unit test failed before the fix; re-adding `audio` to the allow-list and schema made the database no-answers test fail. Breaking fixes 2, 3, 4, 7, 9 and 10 one at a time made their new tests fail (2, 1, 1, 1, 1, 1); all restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 249 passed (api 47, db 84, validation 101, content 10, config 7); `pnpm content:check` valid; `pnpm test:db` 76 + 16 passed. `npx vercel build` succeeded; the bundle run locally against dev: `/health/ready` 200, lesson without answers/audio/model/checklist keys, `/v1/lessons/%E0` 400 validation_failed.
- **Status:** passed
- **Notes:** Approved test changes: the audio case now expects audio dropped; the request-log case expects `aborted: false`; the Zod probe route uses `parseRequest`. Listening items are not usable until Phase 7 provides an opaque audio reference. A branch without a pull request is no longer checked by CI automatically ("Run workflow" or open the pull request). Next: pull request phase-03/review-fixes → main, CI green, then the M2 gate re-run.

## 2026-10-17 · Phase 3 · apps/api · Phase 3 review notes N1 to N5

- **Phase:** 3 API foundation
- **Module:** apps/api, docs/reviews
- **Update:** The second review's notes on the review fixes (docs/reviews/phase-03-review-fixes.md), approved by the owner with the fixes
- **Type:** fix
- **What was done:** N1: decision 0021 written (previous entry). N2: CI runs on branches only through a pull request or "Run workflow" (in decision 0021). N3: the no-answers Supertest no longer lists code prefixes by hand; it collects every `code` and `voice` value in the response and fails if any string in an exercise item (other than its own code) equals one. N4: an aborted request is logged at `warn`, with status 499 when no response had been sent, instead of info/200. N5: listening items carry nothing playable until Phase 7 gives them an opaque audio reference; to carry into Phase 4 planning.
- **Files:** apps/api/src/routes/lessons.db.test.ts, apps/api/src/request-log.ts, apps/api/src/request-log.test.ts, docs/reviews/phase-03-review-fixes.md, PROGRESS.md
- **Checks:** Reverting N4 made the aborted-request test fail; leaking the stored audio code into an item's options with the equality check switched off made the new guard fail ("…:i01 names phrase:hallo"); both restored. `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 249 passed; `pnpm content:check` valid; `apps/api test:db` 16 passed.
- **Status:** passed
- **Notes:** docs/reviews/phase-03-review-fixes.md is the review record written by the owner's review session; committed as is. Next: pull request phase-03/review-fixes → main, CI green, M2 gate re-run.

## 2026-10-17 · Phase 3 · repo · Phase 3 gate M2 reached

- **Phase:** 3 API foundation
- **Module:** repo
- **Update:** Gate M2: Supertest covers success, 404 and invalid input; the API answers on a Vercel URL
- **Type:** test
- **What was done:** Checked the M2 gate and the Phase 3 acceptance criteria. Supertest: 16 cases cover every route for success, 404 and invalid input, the no-answers test (TRD-TEST-03) and one query per lesson; green in CI (run 38953283422, database job), then on the review fixes. Vercel: the preview answered `/health/ready` {"status":"ready","database":"reachable"} and `/v1/levels/A1/map` with the 92-lesson A1 tree (3.8). The independent review (`/review 3`) found that listening items leaked their answer through the stored audio code; that and the nine other findings and the review notes N1 to N5 were fixed (decision 0021, 5993437, 5797bd0). The owner re-ran the gate and confirmed M2.
- **Files:** PROGRESS.md
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed; `pnpm test` 249 passed; `pnpm content:check` valid; `pnpm test:db` 76 + 16 passed; CI on pull request #3 (phase-03/review-fixes → main) running at the time of this entry.
- **Status:** passed
- **Notes:** The owner merges pull request #3 into main once its check and database jobs are green; Vercel then builds Production from main. Carried forward: teacher review of 22 German strings (docs/content-review/A1.1.U01.md); Phase 6 follow-ups of decision 0013 (seed batching would also shorten CI); Piper voice licences before audio; Phase 4: how the web app reaches the protected API, listening items without playable audio until Phase 7, and a production database before real learners; Bible documentation update for decisions 0014, 0015, 0019, 0020, 0021 and TRD §24/§25. Phase 4 starts in a new session.

## 2026-10-17 · Phase 3 · docs · Bible aligned with decisions 0001 to 0022

- **Phase:** 3 API foundation (documentation, after gate M2)
- **Module:** docs/bible (local), docs/prompts (local), CLAUDE.md (local), docs/decisions
- **Update:** Bible documentation update for the decisions made in Phases 1 to 3
- **Type:** decision
- **What was done:** The owner approved all edits of the Bible alignment change set of 2026-10-17 ("all yes") and decided P4 (decision 0022: A1.1.U01 may be shown publicly before the teacher review). Applied to the local Bible: PRD v0.4 (OQ-03 resolved; NFR-005 exceptions 0009 and 0022), TRD v0.5 (error code list in §19; TRD-LOG-03 approved and the approval note removed; BE-05, BE-07, API-01, API-03, ERR-01, ERR-03, LOG-01, SEC-11; TRD-TEST-10; CI-01 triggers, CI-06, CI-07; DEP-05 proven with bundled entry and fra1; preview database; §25 final names with DATABASE_DEV_HOST and PORT; CNT-01, CNT-05, VAL-03; TRD-OQ-08 and 18 resolved), Flow v0.4 (FLOW-OQ-05 API side), Schema v0.4 (0001 subtitles, 0006 skills, 0008 slug rules, 0009 note, DB-OQ-07; the 0005, 0007 and 0013 edits were already present), Plan v0.5 (PLAN-DEC-01 to 03 decided, Phase 3 task notes, carry-overs into Phases 2b and 4 to 8, production database on the release checklist). Kit: CLAUDE.md fidelity rule 4 (decisions 0004, 0009, 0022); phase-03 brief updated; carry-overs added to the watch-outs of the phase-04 to phase-08 briefs. `node docs/bible/build.mjs` rebuilt INDEX.md and dist.
- **Files:** docs/decisions/0022-u01-public-before-teacher-review.md, PROGRESS.md; local and git-ignored: docs/bible/01-prd.md, 02-trd.md, 03-flow.md, 05-schema.md, 06-plan.md, INDEX.md, dist/, docs/prompts/phase-03.md to phase-08.md, CLAUDE.md
- **Checks:** every edit matched its anchor exactly once; build.mjs reports the six parts at their new versions
- **Status:** passed
- **Notes:** PLAN-OQ-05 (repository public from the first commit) left open pending the owner's answer. The docx copy of the Bible was not regenerated. This entry and decision 0022 are uncommitted; commit them on the next branch.

## 2026-10-17 · Phase 3 · repo · Decision 0023: repository private until launch

- **Phase:** 3 API foundation (documentation, after gate M2)
- **Module:** repo, docs/decisions, docs/bible (local)
- **Update:** PLAN-OQ-05 decided: the repository is private until launch
- **Type:** decision
- **What was done:** The owner decided to switch `rickavila296/deutschfreak` to private until launch; Plan task 18.4 makes it public. Local Bible: Plan §14 PLAN-OQ-05 marked resolved and the v0.5 change summary updated; `node docs/bible/build.mjs` rebuilt INDEX.md and dist.
- **Files:** docs/decisions/0023-repository-private-until-launch.md, PROGRESS.md; local and git-ignored: docs/bible/06-plan.md, INDEX.md, dist/
- **Checks:** none (decision only)
- **Status:** passed
- **Notes:** The owner changes the visibility in GitHub settings. On GitHub Free a private repository does not enforce branch protection, so "a red build blocks merging" (TRD-CI-02) is followed by hand, and Actions has 2,000 minutes a month. Uncommitted, with decision 0022 and the Bible alignment entry; commit on the next branch.

## 2026-10-17 · Phase 3 · repo · Decision 0024: repository stays public

- **Phase:** 3 API foundation (documentation, after gate M2)
- **Module:** repo, docs/decisions, docs/bible (local)
- **Update:** PLAN-OQ-05 re-decided: the repository stays public; decision 0023 superseded
- **Type:** decision
- **What was done:** After comparing both options, the owner withdrew decision 0023 (private until launch) before the visibility was changed and chose to keep the repository public (decision 0024). Decision 0023 marked superseded. Local Bible: Plan §14 PLAN-OQ-05 and the v0.5 change summary now cite 0024; `node docs/bible/build.mjs` rebuilt INDEX.md and dist.
- **Files:** docs/decisions/0023-repository-private-until-launch.md, docs/decisions/0024-repository-public.md, PROGRESS.md; local and git-ignored: docs/bible/06-plan.md, INDEX.md, dist/
- **Checks:** none (decision only)
- **Status:** passed
- **Notes:** No GitHub setting changes. Branch protection and unlimited Actions minutes stay as they are. Uncommitted with decisions 0022 and 0023 and the Bible alignment entry; commit on the next branch.

## 2026-10-17 · Phase 4 · apps/web · Task 4.1 web app with NEXT_PUBLIC_API_URL

- **Phase:** 4 Web shell
- **Module:** apps/web
- **Update:** Task 4.1: Next.js App Router app created; NEXT_PUBLIC_API_URL set up
- **Type:** feature
- **What was done:** New workspace package `@deutschfreak/web` (Next.js 16 App Router, React 19, TypeScript strict via packages/config/tsconfig.base.json, Vitest). `src/lib/config.ts` `readApiUrl()` reads NEXT_PUBLIC_API_URL and refuses a missing value, a non-http(s) URL, credentials, a query or a fragment, naming the variable and never echoing the value; a trailing slash is dropped. `next.config.ts` loads the repo-root `.env` (shared with apps/api) when it exists; checked once that the value is inlined into the build. Placeholder root layout and start page only (theme 4.2, shell 4.4, map 4.5). `.env.example` lists NEXT_PUBLIC_API_URL; `.gitignore` ignores the generated `next-env.d.ts`. No dependency on packages/db; the existing lint rule refuses such an import (shown once).
- **Files:** apps/web/package.json, tsconfig.json, next.config.ts, vitest.config.ts, src/app/layout.tsx, src/app/page.tsx, src/lib/config.ts, src/lib/config.test.ts; .env.example; .gitignore; pnpm-lock.yaml
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed (6 packages); `pnpm test` 254 passed (web 5, validation 101, config 7, content 10, db 84, api 47); `pnpm content:check` valid; `pnpm --filter @deutschfreak/web build` succeeded; eslint refused a test import of `@deutschfreak/db` in apps/web
- **Status:** passed
- **Notes:** `@types/node` resolved to ^26 for apps/web (apps/api has ^24; runtime is Node 24). Vercel Production of the API has no environment variables (only Preview has them): Production answers /health but /health/ready and /v1 return internal_error, which blocks gate M3 until a production database and WEB_ORIGIN are set. PLAN-DEC-04 (DESIGN-OQ-01) must be decided before task 4.2.

## 2026-10-17 · Phase 4 · docs/decisions · Decision 0025: design recommendations approved

- **Phase:** 4 Web shell
- **Module:** docs/decisions
- **Update:** PLAN-DEC-04 decided: the Design Brief's recommendations are approved as written (DESIGN-OQ-01 closed)
- **Type:** decision
- **What was done:** The owner approved the Design Brief values as written: type scale, text-variant hex values, neutrals, radius, spacing, grid, breakpoints, touch-target size, token names, rail layout and word-order tap model. Logged as decision 0025.
- **Files:** docs/decisions/0025-design-recommendations-approved.md, PROGRESS.md
- **Checks:** none (decision only)
- **Status:** passed
- **Notes:** The local Bible still lists PLAN-DEC-04 and DESIGN-OQ-01 as open; the edits marking them decided await the owner's approval. DESIGN-OQ-05 (icon set) is still open and is needed before icons are used.

## 2026-10-17 · Phase 4 · docs/bible · PLAN-DEC-04 marked decided in the Bible

- **Phase:** 4 Web shell
- **Module:** docs/bible (local)
- **Update:** Bible bookkeeping for decision 0025
- **Type:** docs
- **What was done:** With the owner's approval ("yes bible"): Plan §5 PLAN-DEC-04 marked "Decided 17 Oct 2026 (decision 0025)" and the v0.5 change summary updated; Design Brief raised to v0.4 (version, date, change summary) with DESIGN-OQ-01 marked resolved. `node docs/bible/build.mjs` rebuilt INDEX.md and dist.
- **Files:** PROGRESS.md; local and git-ignored: docs/bible/06-plan.md, 04-design.md, INDEX.md, dist/
- **Checks:** every edit matched its anchor exactly once; build.mjs reports design v0.4 and plan v0.5
- **Status:** passed
- **Notes:** The Rec labels in Design §9 to §15 were left as they are; decision 0025 and the change summary record that they are now approved.

## 2026-10-17 · Phase 4 · apps/web · Task 4.2 Tailwind theme and Inter

- **Phase:** 4 Web shell
- **Module:** apps/web
- **Update:** Task 4.2: Tailwind theme built from the Design Brief tokens; Inter served from the app's own files
- **Type:** feature
- **What was done:** Tailwind CSS 4 via @tailwindcss/postcss. `src/app/theme.css` holds the Design Brief section 11 tokens and only those (DESIGN-HAND-01, decision 0025): Tailwind's default colours, fonts, weights, type sizes, radii and shadows are cleared; colours ink, blue, teal, gold, red, paper, surface, muted, the five text variants, white and border (ink at 12%); the nine type-scale steps with mobile values, switched to the desktop values from Tailwind's lg breakpoint (1024 px), sizes in rem; weights 400 to 700; radius sm 4, md 8, lg 12 px. Spacing and breakpoints stay Tailwind's defaults (sections 12, 15). Inter: the variable latin woff2 from @fontsource-variable/inter (SIL OFL 1.1) through next/font/local, so the build serves and preloads it from the app's own origin with no font service (DESIGN-HAND-02), with a system sans-serif fallback (DESIGN-TYPE-05). The root layout applies font-sans, text-body and text-ink.
- **Files:** apps/web/package.json, postcss.config.mjs, src/app/theme.css, src/app/globals.css, src/app/fonts.ts, src/app/layout.tsx, src/theme.test.ts; pnpm-lock.yaml
- **Checks:** `pnpm lint` clean; `pnpm typecheck` passed (6 packages); `pnpm test` 260 passed (web 11, validation 101, config 7, content 10, db 84, api 47); `pnpm content:check` valid; web build succeeded, built CSS has the local @font-face and a woff2 preload, no Google font URL. The theme tests were shown to fail once with a wrong gold-text hex, a wrong h3 size and a hex in a source file.
- **Status:** passed
- **Notes:** Not specified by the Brief, so open: the value of the one shadow level (section 11; no shadow token is defined until a floating component needs it) and whether tablet widths use the mobile or desktop type sizes (section 9 gives two columns; desktop sizes start at 1024 px here). The focus outline (section 11) is applied in task 4.4.
