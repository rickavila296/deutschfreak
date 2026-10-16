# 0011 — Authoring A1.1.U01: voices, concept text, scope, phrases and payloads

- **ID:** Task 2b.3 gaps (no PLAN-DEC number)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** The owner accepted all five recommendations.
  1. Voices. Two synthetic voices are seeded with name and gender only: `voice:thorsten` (male, the Spec's example) and `voice:kerstin` (female). Both are Piper voices whose licences are unverified; they are checked before any audio is generated (CLAUDE.md fidelity rule 5).
  2. Concept text. All 50 A1 concepts are seeded (decision 0007). For now each concept's `title` is its name in the Curriculum Specification and its `explanation_en` is the Spec's own line, word for word: for grammar (§10) "what it lets the learner do", for sounds (§8) the typical English-speaker error. Full explanations are written when each concept's teaching lesson is authored. Grammar slugs are English; sound codes are short (`sound:ue`, `sound:ei-ie`, `sound:ich-laut`, …). Prerequisites follow the Spec's Requires column; "Numbers" (G13, G22) is not a concept and is left out.
  3. Scope. The pool gets all U01 vocabulary and phrases listed in Spec §4 for L01 to L05. Examples, dialogues and exercises are written only for L01; L02 to L05 get theirs with their lesson files in Phase 6.
  4. Words and phrases. The L01 greetings and farewells are phrases; *danke, bitte, ja, nein* are vocabulary items of word class `function_word`. Each greeting's register is set by Claude Code and logged for the teacher.
  5. Exercise payloads (provisional, decision 0010): choice and fill-in types carry a prompt, options and accepted answers; self-check types carry a prompt, a model answer and a checklist. Phase 8 may reshape them.
- **Herr and Frau (owner, option B):** The Spec lists *Herr, Frau* for L02 without articles. They are left out of the pool now and added with the L02 lesson file in Phase 6, where their articles are settled and reviewed.
- **Reason:** The Spec does not name voices, gives one line per concept rather than an explanation, and lists each lesson's language but not its sentences. These choices keep composed, unreviewed German and English to what L01 needs.
- **Affects:** `packages/content` (voices, topics, concepts, vocabulary, phrases, examples, dialogues, exercises, `lessons/A1.1.U01.L01.yaml`); `docs/content-review/A1.1.U01.md`; Plan §5 Phase 2b (task 2b.3) and Phase 6
