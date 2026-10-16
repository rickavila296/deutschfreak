# 0007 — Knowledge pool rules for Phase 2b

- **ID:** PLAN-DEC-03 (closes DB-OQ-06, DB-OQ-07, DB-OQ-12, DB-OQ-13)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** The owner accepted all four rules and the column that rule 3 needs.
  1. DB-OQ-06: until the verb-forms entity arrives (A1.2.U04), A1.1 stores a verb's irregular present forms as separate vocabulary entries. No columns are added for separability or for a function word's link to a grammar concept.
  2. DB-OQ-07: all 50 A1 concepts (grammar G01 to G27 and the 23 pronunciation concepts) are seeded in Phase 2b, not only those A1.1.U01 uses.
  3. DB-OQ-12: stage 7 "exercises in recall mode" is a mode on the lesson block that reuses the same authored exercises. Recall exercises are not authored separately. `lesson_blocks` gets a nullable `mode` column of the existing enum `review_mode` (recognise, recall, produce); stage 7 blocks set it to `recall`, and NULL means the exercise's normal mode.
  4. DB-OQ-13: pronouns, numerals and similar classes stay under `function_word`. No new word classes are added now.
- **Reason:** Each rule is the smallest choice that fits Schema v1. Rule 3 reuses an existing enum, so it adds one column and no enum value. Rejected: authoring recall exercises twice, seeding concepts again later, and changing the `word_class` enum before content needs it. All four can be revisited before Phase 2b content exists.
- **Affects:** Schema §8.8 `lesson_blocks` (rule 3, new `mode` column), §8.9 `concepts` (rule 2), §8.11 `vocabulary_items` (rules 1 and 4), enum `word_class` in §8 (rule 4), §10 seed data requirements (rule 2), §15 open questions; Plan §5 Phase 2b (tasks 2b.1 to 2b.4).
