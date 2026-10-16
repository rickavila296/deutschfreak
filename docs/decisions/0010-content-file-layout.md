# 0010 — Content file layout and a provisional exercise payload

- **ID:** Task 2b.2 gaps (TRD-CNT-01, TRD-VAL-03; no PLAN-DEC number)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:**
  1. Layout. Besides the folders TRD-CNT-01 names (`concepts/`, `vocabulary/` with one file per topic, `phrases/`, `dialogues/`, `exercises/`, `lessons/`), `topics.yaml` and `voices.yaml` sit at the root of `packages/content`, and examples live in their own folder `examples/`. Each vocabulary file names its topic once at the top; every word in it is linked to that topic, and a word may list further topics.
  2. Exercise payload (option A). Until the payload union is designed in Phase 8 (TRD-VAL-03), an exercise item's `payload` is accepted as any JSON object. Phase 8 replaces it with the per-type schema, and items authored before then are adjusted if needed.
  3. File shapes follow Schema §8. Every row's code is written literally, including section codes (lesson + `.S` + stage) and block codes (section + `.B` + number); each code is checked against its format and its parent. A lesson file lists sections and, in each, blocks in order; order sets position. References are by code; a block's target code must match its kind, and an exercise target's table follows from its code prefix. Dialogue lines and exercise items are listed in order under their parent. All schemas are strict.
- **Reason:** The Bible gives the columns but no file samples. Option A keeps Phase 8's design open instead of pulling it forward.
- **Affects:** `packages/validation` (code and content file schemas); `packages/content` layout; TRD-CNT-01, TRD-VAL-03; Plan §5 Phase 2b (tasks 2b.2 to 2b.4) and Phase 8
