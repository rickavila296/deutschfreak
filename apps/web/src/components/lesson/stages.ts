// The nine stages of every lesson, in their fixed order (FLOW-LESSON-010, DESIGN-UI-070).
export const stageNames = [
  'Objective',
  'Discover',
  'Understand',
  'Hear',
  'Practice',
  'Use',
  'Recall',
  'Review',
  'Mastery',
] as const;

export const stageCount = stageNames.length;

export const stageName = (stage: number) => stageNames[stage - 1] ?? '';

/** How a translation is offered: on the page, behind a tap, or not at all. */
export type TranslationMode = 'shown' | 'reveal' | 'hidden';

/**
 * The translation schedule (TRD-FE-11, PRD FR-023): shown in A1.1, tap-to-reveal from A1.2, hidden in stages 7
 * (Recall) and 9 (Mastery) everywhere. The part comes from the lesson's unit code, A1.1.U01 → A1.1 (review 4
 * finding 8).
 */
export function translationMode(unitCode: string, stage: number): TranslationMode {
  if (stage === 7 || stage === 9) return 'hidden';
  return unitCode.startsWith('A1.1.') ? 'shown' : 'reveal';
}
