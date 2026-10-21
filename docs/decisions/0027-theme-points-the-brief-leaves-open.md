# 0027 — Tablet type sizes and the shadow level

- **ID:** none; two points the Design Brief does not specify, found in task 4.2
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** (1) The type scale of Design Brief §9 uses its Mobile column below 1024 px, tablets included, and its Desktop column from 1024 px (Tailwind's `lg`, where §15's Desktop starts). (2) The single shadow level of §11 gets no token until the first component that floats above the page (word card or menu) is built; its value is decided and recorded then. Until then the theme defines no shadow at all.
- **Reason:** The owner approved applying the choices proposed in the task 4.2 report: §9 has only Mobile and Desktop columns, and no Phase 4 page has a floating element.
- **Affects:** Design Brief §9 and §11; apps/web/src/app/theme.css (already built this way in task 4.2).
