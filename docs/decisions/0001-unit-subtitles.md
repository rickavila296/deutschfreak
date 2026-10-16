# 0001 — English subtitles for units the spec leaves without one
- **ID:** none (spec gap; Schema §8.3 `units.subtitle_en` is NOT NULL)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** A1.1.U01 is title "Hallo!" with subtitle_en "First contact" (the spec heading "Hallo! First contact" splits at "!", not ". "). A1.1.U06, A1.2.U06 and A1.3.U06 get subtitle_en "Part review and checkpoint". A1.4.U06 gets "Final review and assessment". The U06 lesson titles follow §20, including the "(Sound Check N)" suffix; that suffix is left out of slugs.
- **Reason:** The Curriculum Specification (§4–§7 headings, §20 tree) gives no English subtitle for the four close-out units, and the Schema requires one. The wording follows Spec §3 ("a short close-out: one integrated skills lesson with a Sound Check, then the part checkpoint").
- **Affects:** `packages/content/structure/a1.yaml`; Schema §8.3; Phase 2a seed
