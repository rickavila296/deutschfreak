import type { LessonResponse } from '@deutschfreak/validation';
import { routes } from '../../lib/routes.ts';
import { Block } from './block.tsx';
import { LessonStages, type StagePanel } from './stage-rail.tsx';
import { translationMode } from './stages.ts';

// The read-only lesson page (Plan task 4.7, FLOW-LESSON-001): lesson header, then the nine stages behind the rail.
// One page per lesson, the same component for every lesson (TRD-FE-03).
export function LessonPage({ lesson: response }: { lesson: LessonResponse }) {
  const { lesson, sections } = response;
  const panels: StagePanel[] = [...sections]
    .sort((a, b) => a.stage - b.stage)
    .map((section) => ({
      stage: section.stage,
      weight: section.weight,
      content: (
        <div className="flex flex-col gap-6">
          {section.blocks.map((block) => (
            <Block key={block.code} block={block} translation={translationMode(lesson.unit.code, section.stage)} />
          ))}
        </div>
      ),
    }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <a
          href={routes.unit(lesson.unit.slug)}
          className="flex min-h-11 items-center self-start rounded-sm text-small text-blue-text underline-offset-4 hover:underline"
        >
          <span>
            {lesson.unit.code} <span lang="de">{lesson.unit.title}</span>
          </span>
        </a>
        <span className="text-caption text-muted-text">{lesson.code}</span>
        <h1 lang="de" className="text-display text-ink">
          {lesson.title}
        </h1>
      </div>
      {panels.length > 0 ? (
        <LessonStages panels={panels} />
      ) : (
        // A lesson with no stages in the data gets a plain empty state, not a rail over a blank page (review 4b
        // finding 2; Design §29).
        <p className="max-w-prose text-reading text-ink">This lesson has no content yet.</p>
      )}
    </div>
  );
}
