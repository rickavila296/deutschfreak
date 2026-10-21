'use client';

import type { LessonResponse } from '@deutschfreak/validation';
import { Check, ChevronDown } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { stageCount, stageName } from './stages.ts';

type Weight = LessonResponse['sections'][number]['weight'];

export interface StagePanel {
  stage: number;
  weight: Weight;
  /** The stage's blocks, rendered on the server so the whole lesson text is in the HTML (TRD-SEO-01). */
  content: ReactNode;
}

type StepState = 'current' | 'reached' | 'ahead';

const stepState = (stage: number, current: number, furthest: number): StepState =>
  stage === current ? 'current' : stage <= furthest ? 'reached' : 'ahead';

/**
 * The lesson's stages behind the nine-step rail (FLOW-LESSON-010 to 013, DESIGN-UI-070 to 076). One stage shows at a
 * time; Continue moves on one stage; the rail selects any stage already reached and nothing beyond the furthest.
 * A visitor starts at stage 1 and nothing is stored (Phase 4 has no accounts).
 */
export function LessonStages({ panels }: { panels: readonly StagePanel[] }) {
  const [current, setCurrent] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [railOpen, setRailOpen] = useState(false);
  const headingRefs = useRef<Record<number, HTMLHeadingElement | null>>({});
  const railId = useId();
  const weights = new Map(panels.map((panel) => [panel.stage, panel.weight]));

  const goTo = (stage: number) => {
    setCurrent(stage);
    setFurthest((value) => Math.max(value, stage));
    setRailOpen(false);
    // Move focus to the new stage's heading so keyboard and screen-reader users land on it.
    requestAnimationFrame(() => headingRefs.current[stage]?.focus());
  };

  const rail = (
    <ol className="flex flex-col gap-1">
      {Array.from({ length: stageCount }, (_, index) => index + 1).map((stage) => (
        <RailStep
          key={stage}
          stage={stage}
          state={stepState(stage, current, furthest)}
          light={weights.get(stage) === 'light'}
          onSelect={() => goTo(stage)}
        />
      ))}
    </ol>
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
      <nav aria-label="Lesson stages" className="lg:sticky lg:top-6 lg:w-56 lg:shrink-0">
        {/* Mobile and tablet: a compact rail, expandable to the full list (DESIGN-UI-073). */}
        <div className="lg:hidden">
          <button
            type="button"
            aria-expanded={railOpen}
            aria-controls={railId}
            onClick={() => setRailOpen((value) => !value)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-muted px-4 text-body font-semibold text-ink"
          >
            Stage {current} of {stageCount}: {stageName(current)}
            <ChevronDown
              aria-hidden="true"
              size={20}
              className={`transition-transform motion-reduce:transition-none ${railOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <div id={railId} hidden={!railOpen} className="mt-2">
            {rail}
          </div>
        </div>
        {/* Desktop: the full rail, vertical beside the content, in view while scrolling. */}
        <div className="hidden lg:block">{rail}</div>
      </nav>
      <div className="min-w-0 flex-1">
        {panels.map((panel) => (
          <section key={panel.stage} hidden={panel.stage !== current} aria-labelledby={`stage-${panel.stage}`}>
            <div className="flex flex-col gap-6">
              <h2
                id={`stage-${panel.stage}`}
                ref={(element) => {
                  headingRefs.current[panel.stage] = element;
                }}
                tabIndex={-1}
                className="text-h2 text-ink"
              >
                <span className="block text-caption text-muted-text">Stage {panel.stage}</span>
                {stageName(panel.stage)}
              </h2>
              {panel.content}
              {panel.stage < stageCount && (
                <button
                  type="button"
                  onClick={() => goTo(panel.stage + 1)}
                  className="flex min-h-11 items-center self-start rounded-md bg-blue px-6 text-body font-semibold text-white hover:bg-blue-text"
                >
                  Continue to {stageName(panel.stage + 1)}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// A rail step (DESIGN-UI-071, 072): current is blue, filled and bold; reached has an ink outline and a check mark and
// can be selected; ahead has a muted outline, is not selectable and shows no padlock; a light stage has a smaller
// marker. Each state differs in shape or mark as well as colour.
function RailStep({
  stage,
  state,
  light,
  onSelect,
}: {
  stage: number;
  state: StepState;
  light: boolean;
  onSelect: () => void;
}) {
  const size = light ? 'size-6' : 'size-8';
  const marker = {
    current: 'bg-blue text-white',
    reached: 'border-2 border-ink text-ink',
    ahead: 'border border-muted text-muted-text',
  }[state];
  const label = `${stage} ${stageName(stage)}`;
  const content = (
    <>
      <span
        aria-hidden="true"
        className={`flex ${size} shrink-0 items-center justify-center rounded-full text-caption ${marker}`}
      >
        {state === 'reached' ? <Check size={light ? 14 : 16} /> : stage}
      </span>
      <span
        className={state === 'current' ? 'font-bold text-ink' : state === 'reached' ? 'text-ink' : 'text-muted-text'}
      >
        {stageName(stage)}
      </span>
    </>
  );
  const row = 'flex min-h-11 w-full items-center gap-3 rounded-md px-2 text-body';
  return (
    <li>
      {state === 'reached' ? (
        <button type="button" onClick={onSelect} aria-label={`${label}, reached`} className={`${row} hover:bg-surface`}>
          {content}
        </button>
      ) : (
        <span
          aria-current={state === 'current' ? 'step' : undefined}
          aria-label={state === 'current' ? `${label}, current stage` : `${label}, not reached yet`}
          className={row}
        >
          {content}
        </span>
      )}
    </li>
  );
}
