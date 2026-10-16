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
