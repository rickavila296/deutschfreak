import type { MapPart, MapUnit } from '@deutschfreak/validation';
import { routes } from '../../lib/routes.ts';
import { LessonRow } from './lesson-row.tsx';
import { isCloseOutUnit } from './map-rules.ts';
import { Tag } from './tag.tsx';

// The unit page (FLOW-LEARN-003): title and subtitle, then the unit's lessons in order with objective and archetype,
// the checkpoint lesson marked. Planned lessons are shown but not openable, as on the map (DESIGN-UI-082).
// The context says which situation the unit is set in (decision 0030); close-out units have none.
export function UnitPage({ part, unit }: { part: MapPart; unit: MapUnit }) {
  return (
    <div className="flex flex-col gap-8">
      <a
        href={routes.part(part.code)}
        className="flex min-h-11 items-center self-start rounded-sm text-small text-blue-text underline-offset-4 hover:underline"
      >
        {part.code} {part.title}
      </a>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-caption text-muted-text">{unit.code}</span>
          {isCloseOutUnit(unit) && <Tag tone="checkpoint">Checkpoint</Tag>}
        </div>
        <h1 lang="de" className="text-display text-ink">
          {unit.title}
        </h1>
        <p className="text-reading text-muted-text">{unit.subtitleEn}</p>
        {unit.contextEn && <p className="max-w-prose text-reading text-ink">{unit.contextEn}</p>}
      </div>
      <section aria-labelledby="unit-lessons" className="flex flex-col gap-2">
        <h2 id="unit-lessons" className="text-h2 text-ink">
          Lessons
        </h2>
        <ol>
          {unit.lessons.map((lesson) => (
            <LessonRow key={lesson.code} lesson={lesson} />
          ))}
        </ol>
      </section>
    </div>
  );
}
