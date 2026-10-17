import type { MapLesson, MapPart, MapUnit } from '@deutschfreak/validation';

/** Only published lessons can be opened (FR-012); planned and retired ones are shown as planned. */
export const isLive = (lesson: MapLesson) => lesson.status === 'published';

/** A part is "Available now" when it has at least one live lesson (DESIGN-UI-082). */
export const isPartLive = (part: MapPart) => part.units.some((unit) => unit.lessons.some(isLive));

/** Checkpoint lessons carry the `checkpoint` archetype (DESIGN-UI-085). */
export const isCheckpointLesson = (lesson: MapLesson) => lesson.archetypes.includes('checkpoint');

/** The sixth unit of each part is its close-out (PRD unit pattern), marked as a checkpoint (DESIGN-UI-085). */
export const isCloseOutUnit = (unit: MapUnit) => unit.code.endsWith('.U06');

/** The part open by default when the map loads (DESIGN-UI-084). */
export const defaultOpenPart = 'A1.1';

/** The archetype as a word: `spoken_interaction`-style codes are not used here, so capitalising is enough. */
export const archetypeLabel = (archetype: string | undefined) =>
  archetype ? archetype.charAt(0).toUpperCase() + archetype.slice(1) : '';
