import type { MapLesson } from '@deutschfreak/validation';
import { routes } from '../../lib/routes.ts';
import { archetypeLabel, isCheckpointLesson, isLive } from './map-rules.ts';
import { Tag } from './tag.tsx';

// A lesson row (DESIGN-UI-081): ID, title, can-do objective and primary archetype. A live lesson is a link to its
// page; a planned one is muted, says "Planned" and is not interactive (DESIGN-UI-082, FLOW-LEARN-001).
export function LessonRow({ lesson }: { lesson: MapLesson }) {
  const live = isLive(lesson);
  const title = (
    <span lang="de" className="text-german-md">
      {lesson.title}
    </span>
  );
  return (
    <li className="flex flex-col gap-1 border-t border-border py-4 md:flex-row md:items-start md:gap-6">
      <span className="text-caption text-muted-text md:w-32 md:shrink-0 md:pt-1">{lesson.code}</span>
      <div className="flex flex-1 flex-col gap-1">
        {live ? (
          <a
            href={routes.lesson(lesson.slug)}
            className="self-start rounded-sm text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {title}
          </a>
        ) : (
          <span className="text-muted-text">{title}</span>
        )}
        {lesson.objectives.map((objective) => (
          <p key={objective.code} className={`text-body ${live ? 'text-ink' : 'text-muted-text'}`}>
            {objective.canDoEn}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end md:pt-1">
        {/* A checkpoint lesson's primary archetype is `checkpoint`, so its archetype tag is its checkpoint mark. */}
        <Tag tone={isCheckpointLesson(lesson) ? 'checkpoint' : 'archetype'}>
          {isCheckpointLesson(lesson) ? 'Checkpoint' : archetypeLabel(lesson.archetypes[0])}
        </Tag>
        {!live && <Tag tone="planned">Planned</Tag>}
      </div>
    </li>
  );
}
