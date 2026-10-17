# 0026 — The icon set is Lucide

- **ID:** DESIGN-OQ-05 (icon set part)
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** Interface icons come from Lucide (open source, ISC licence), used through its React package and imported icon by icon so only the icons used are shipped. Icons take their colour from the theme tokens (currentColor), never from a hex value, and follow the Design Brief's colour rules (DESIGN-COLOR-04, 05). The package is added when the first icon is used. Whether mock-ups are made before coding, the other half of DESIGN-OQ-05, stays open.
- **Reason:** The owner accepted the recommendation: an open-source set with a consistent, calm line style that fits the Brief, and per-icon imports keep the bundle small.
- **Affects:** Design Brief §40 handoff note and DESIGN-OQ-05; Phase 4 tasks 4.4 onward.
