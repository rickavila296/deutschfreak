# 0006 — One skill for each learning objective
- **ID:** PLAN-DEC-02 (closes PRD OQ-03)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** Every objective in `a1.yaml` carries exactly one `skill` from the eight in Schema enum `skill`. The skill is the one the lesson's mastery task mainly measures. The assignments are recorded in `packages/content/structure/a1.yaml` (spoken_interaction 29, grammar 22, vocabulary 17, spoken_production 8, reading 5, listening 5, writing 4, pronunciation 2). The six whole-part objectives (A1.1.U06.L02, A1.2.U06.L02, A1.3.U06.L02 and A1.4.U06.L01 to L03) keep a placeholder skill; their per-skill results come from the skill tags of their exercises (Spec part checkpoint: 75% overall, no skill below 60%), not from the objective's skill. The structure schema now requires `skill` on every objective.
- **Reason:** `learning_objectives.skill` is a single NOT NULL enum (Schema §8.5), so the seed needs one value per objective. Keeping the six as single objectives preserves the Specification's 92 objectives; splitting them by skill was considered and not chosen.
- **Affects:** `a1.yaml`; `packages/validation` structure schema; PRD §34 OQ-03; Schema §8.5; Plan §5 Phase 2a (task 2a.4)
