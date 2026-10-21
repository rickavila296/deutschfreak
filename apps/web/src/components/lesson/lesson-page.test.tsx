// @vitest-environment jsdom
import type { LessonResponse, LessonResponseBlock } from '@deutschfreak/validation';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LessonPage } from './lesson-page.tsx';

afterEach(cleanup);

const base = { role: null, status: null, mode: null, textEn: null } as const;
const text = (code: string, textEn: string): LessonResponseBlock => ({ ...base, code, kind: 'text', textEn });
const phrase = (code: string, german: string, meaningEn: string): LessonResponseBlock => ({
  ...base,
  code,
  kind: 'phrase',
  phrase: { code: `phrase:${code}`, slug: 'p', german, meaningEn, register: 'informal' },
});

// One section per stage in the API's shape; stage 3 is light. Stage 7 holds a phrase whose translation must be hidden.
const lesson: LessonResponse = {
  lesson: {
    code: 'A1.1.U01.L01',
    slug: 'example-lesson',
    title: 'Lesson title',
    archetypes: ['conversation'],
    masteryTaskEn: 'Do the task',
    unit: { code: 'A1.1.U01', slug: 'unit-one', title: 'Unit one' },
  },
  sections: Array.from({ length: 9 }, (_, i) => {
    const stage = i + 1;
    const code = `A1.1.U01.L01.S${stage}`;
    const blocks: LessonResponseBlock[] = [text(`${code}.B01`, `Text of stage ${stage}`)];
    if (stage === 3 || stage === 7) blocks.push(phrase(`${code}.B02`, `German ${stage}`, `English ${stage}`));
    if (stage === 5) {
      blocks.push({
        ...base,
        code: `${code}.B02`,
        kind: 'exercise',
        exercise: {
          code: 'ex:one',
          type: 'multiple_choice',
          skill: 'reading',
          instructionEn: 'Choose the right one.',
          items: [{ code: 'ex:one:i01', prompt: 'Which one?', options: ['First', 'Second'] }],
        },
      });
    }
    return { code, stage, weight: stage === 3 ? 'light' : 'normal', blocks } as LessonResponse['sections'][number];
  }),
};

const visibleStage = () => screen.getByRole('heading', { level: 2 }).textContent;
// A rail step by stage number: the button or span inside its list item. Its accessible name is its text, with the
// number and state as visually hidden text (review 4 finding 7).
const railStep = (stage: number) => {
  const nav = screen.getAllByRole('navigation', { name: 'Lesson stages' })[0]!;
  return within(nav).getAllByRole('listitem')[stage - 1]!.firstElementChild as HTMLElement;
};

describe('lesson page (Plan task 4.7, FLOW-LESSON-001)', () => {
  it('shows the lesson title in German and a link back to its unit', () => {
    render(<LessonPage lesson={lesson} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Lesson title' }).getAttribute('lang')).toBe('de');
    expect(screen.getByRole('link', { name: /A1\.1\.U01 Unit one/ }).getAttribute('href')).toBe(
      '/learn/units/unit-one',
    );
  });

  it('puts every stage in the page but shows only stage 1 at first (TRD-SEO-01, FLOW-LESSON-001)', () => {
    const { container } = render(<LessonPage lesson={lesson} />);
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(9);
    expect([...sections].filter((s) => !s.hidden)).toHaveLength(1);
    expect(container.textContent).toContain('Text of stage 9');
    expect(visibleStage()).toBe('Stage 1Objective');
  });

  it('shows nine named steps; ahead steps cannot be selected (FLOW-LESSON-010, 012, DESIGN-UI-070)', () => {
    render(<LessonPage lesson={lesson} />);
    const nav = screen.getAllByRole('navigation', { name: 'Lesson stages' })[0]!;
    for (const name of [
      'Objective',
      'Discover',
      'Understand',
      'Hear',
      'Practice',
      'Use',
      'Recall',
      'Review',
      'Mastery',
    ]) {
      expect(nav.textContent).toContain(name);
    }
    expect(within(nav).getAllByRole('listitem')).toHaveLength(9);
    expect(within(nav).queryAllByRole('button', { name: /not reached/ })).toHaveLength(0);
    expect(railStep(9).tagName).toBe('SPAN');
    expect(railStep(9).textContent).toBe('9Stage 9: Mastery, not reached yet');
    expect(railStep(1).getAttribute('aria-current')).toBe('step');
    expect(railStep(1).textContent).toContain('Stage 1: Objective, current stage');
  });

  it('continues one stage at a time and jumps back to any reached stage, never ahead (FLOW-LESSON-011, 012)', async () => {
    const user = userEvent.setup();
    render(<LessonPage lesson={lesson} />);
    await user.click(screen.getByRole('button', { name: 'Continue to Discover' }));
    await user.click(screen.getByRole('button', { name: 'Continue to Understand' }));
    expect(visibleStage()).toBe('Stage 3Understand');
    // Back to stage 1, then forward again up to the furthest stage reached (3), but not to 4.
    await user.click(screen.getAllByRole('button', { name: 'Stage 1: Objective, reached' })[0]!);
    expect(visibleStage()).toBe('Stage 1Objective');
    expect(railStep(3).tagName).toBe('BUTTON');
    expect(railStep(4).tagName).toBe('SPAN');
    expect(railStep(4).textContent).toContain('not reached yet');
    await user.click(railStep(3));
    expect(visibleStage()).toBe('Stage 3Understand');
  });

  it('marks a light stage with a smaller marker (DESIGN-UI-071)', () => {
    render(<LessonPage lesson={lesson} />);
    const marker = (stage: number) => railStep(stage).querySelector('[aria-hidden="true"]')!.className;
    expect(marker(3)).toContain('size-6');
    expect(marker(2)).toContain('size-8');
  });

  it('shows translations, except in stages 7 and 9 (TRD-FE-11)', () => {
    const { container } = render(<LessonPage lesson={lesson} />);
    expect(container.textContent).toContain('German 3');
    expect(container.textContent).toContain('English 3');
    expect(container.textContent).toContain('German 7');
    expect(container.textContent).not.toContain('English 7');
  });

  it('renders an exercise as text with nothing to answer, and has no audio (decision 0021)', () => {
    const { container } = render(<LessonPage lesson={lesson} />);
    const exercise = container.querySelector('[data-kind="exercise"]')!;
    expect(exercise.textContent).toContain('Choose the right one.');
    expect(exercise.textContent).toContain('Second');
    expect(exercise.querySelectorAll('input, textarea, select, button')).toHaveLength(0);
    expect(container.querySelectorAll('audio')).toHaveLength(0);
  });

  it('marks German with lang="de" and shows a noun with its article', () => {
    const noun: LessonResponse = {
      ...lesson,
      sections: [
        {
          code: 'A1.1.U01.L01.S1',
          stage: 1,
          weight: 'normal',
          blocks: [
            {
              ...base,
              code: 'A1.1.U01.L01.S1.B01',
              kind: 'vocabulary',
              vocabulary: {
                code: 'vocab:x',
                slug: 'x',
                lemma: 'Name',
                wordClass: 'noun',
                article: 'der',
                plural: null,
                meaningEn: 'name',
              },
            },
          ],
        },
      ],
    };
    render(<LessonPage lesson={noun} />);
    expect(screen.getByText('der Name').getAttribute('lang')).toBe('de');
  });
});

describe('review 4 fixes', () => {
  // Stage 1 and stage 3 missing from the data.
  const gappy: LessonResponse = { ...lesson, sections: lesson.sections.filter((s) => s.stage !== 1 && s.stage !== 3) };

  it('starts at the first stage present and continues over a missing stage, never to a blank one (finding 1)', async () => {
    const user = userEvent.setup();
    const { container } = render(<LessonPage lesson={gappy} />);
    expect(visibleStage()).toBe('Stage 2Discover');
    expect([...container.querySelectorAll('section')].filter((s) => !s.hidden)).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Continue to Hear' }));
    expect(visibleStage()).toBe('Stage 4Hear');
    // The missing stage is on the rail but can never be selected.
    expect(railStep(3).tagName).toBe('SPAN');
    expect(railStep(3).textContent).toContain('not available');
    expect(screen.queryByRole('button', { name: 'Continue to Understand' })).toBeNull();
  });

  it('gives rail steps no aria-label: the state is spoken as text (finding 7)', () => {
    render(<LessonPage lesson={lesson} />);
    const nav = screen.getAllByRole('navigation', { name: 'Lesson stages' })[0]!;
    expect(nav.querySelectorAll('[aria-label]')).toHaveLength(0);
    expect(nav.querySelectorAll('.sr-only').length).toBeGreaterThanOrEqual(18);
  });

  it('puts translations behind a tap outside A1.1, still hidden in stages 7 and 9 (TRD-FE-11, finding 8)', () => {
    const laterPart: LessonResponse = {
      ...lesson,
      lesson: {
        ...lesson.lesson,
        code: 'A1.2.U01.L01',
        unit: { code: 'A1.2.U01', slug: 'unit-two', title: 'Unit two' },
      },
    };
    const { container } = render(<LessonPage lesson={laterPart} />);
    const stage3 = container.querySelector('section[aria-labelledby="stage-3"]')!;
    expect(
      within(stage3 as HTMLElement)
        .getByText('Show translation')
        .closest('details')?.open,
    ).toBe(false);
    expect(stage3.textContent).toContain('English 3');
    expect(container.textContent).not.toContain('English 7');
  });
});

describe('translationMode (TRD-FE-11)', () => {
  it('is shown in A1.1, a tap from A1.2, and hidden in stages 7 and 9 everywhere', async () => {
    const { translationMode } = await import('./stages.ts');
    expect(translationMode('A1.1.U03', 3)).toBe('shown');
    expect(translationMode('A1.2.U01', 3)).toBe('reveal');
    expect(translationMode('A1.4.U02', 5)).toBe('reveal');
    for (const unit of ['A1.1.U01', 'A1.3.U02']) {
      expect(translationMode(unit, 7)).toBe('hidden');
      expect(translationMode(unit, 9)).toBe('hidden');
    }
  });
});

describe('review 4b fixes (lesson page)', () => {
  it('shows a plain empty state for a lesson with no stages, not a rail over a blank page (finding 2)', () => {
    render(<LessonPage lesson={{ ...lesson, sections: [] }} />);
    expect(screen.getByText('This lesson has no content yet.')).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Lesson stages' })).toBeNull();
  });

  it('renders repeated exercise options once each, without a duplicate-key warning (finding 3)', () => {
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args.join(' '));
    try {
      const repeated: LessonResponse = {
        ...lesson,
        sections: [
          {
            code: 'A1.1.U01.L01.S5',
            stage: 5,
            weight: 'normal',
            blocks: [
              {
                ...base,
                code: 'A1.1.U01.L01.S5.B01',
                kind: 'exercise',
                exercise: {
                  code: 'ex:articles',
                  type: 'multiple_choice',
                  skill: 'reading',
                  instructionEn: 'Choose the article.',
                  items: [{ code: 'ex:articles:i01', prompt: 'Which?', options: ['der', 'die', 'der'] }],
                },
              },
            ],
          },
        ],
      };
      const { container } = render(<LessonPage lesson={repeated} />);
      expect(container.querySelectorAll('[data-kind="exercise"] ul li')).toHaveLength(3);
      expect(errors.filter((e) => String(e).includes('same key'))).toEqual([]);
    } finally {
      console.error = original;
    }
  });
});
