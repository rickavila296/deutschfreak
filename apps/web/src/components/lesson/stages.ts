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

/** Translations are shown in A1.1 except in stages 7 (Recall) and 9 (Mastery) (TRD-FE-11, PRD FR-023). */
export const showsTranslation = (stage: number) => stage !== 7 && stage !== 9;
