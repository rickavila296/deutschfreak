import type { LevelMapResponse, MapPart, MapUnit } from '@deutschfreak/validation';
import { ChevronDown } from 'lucide-react';
import { routes } from '../../lib/routes.ts';
import { LessonRow } from './lesson-row.tsx';
import { defaultOpenPart, isCloseOutUnit, isPartLive } from './map-rules.ts';
import { OpenPartFromHash } from './open-part-from-hash.tsx';
import { Tag } from './tag.tsx';

// The German Map (FLOW-LEARN-001, DESIGN-UI-080 to 085): the whole level as an outline of parts, units and lessons.
// Parts are native <details> elements, so they collapse with keyboard and mouse without client code; A1.1 is open.
// Rendered on the server with its full text in the HTML (TRD-FE-01, TRD-SEO-01).
export function GermanMap({ map }: { map: LevelMapResponse }) {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-display text-ink">German Map</h1>
        <p className="text-reading text-muted-text">{map.level.title}</p>
      </div>
      <div className="flex flex-col gap-6">
        {map.parts.map((part) => (
          <PartSection key={part.code} part={part} />
        ))}
      </div>
      <OpenPartFromHash />
    </div>
  );
}

function PartSection({ part }: { part: MapPart }) {
  const live = isPartLive(part);
  const anchor = routes.part(part.code).split('#')[1];
  return (
    <details id={anchor} open={part.code === defaultOpenPart} className="group rounded-lg border border-border">
      <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-lg p-4 md:p-6">
        <h2 className="text-h2 text-ink">
          {part.code} {part.title}
        </h2>
        <ChevronDown
          aria-hidden="true"
          size={24}
          className="row-span-2 text-ink transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
        <span className="flex flex-wrap items-center gap-3">
          <span className="text-body text-muted-text">{part.tagline}</span>
          <Tag tone={live ? 'live' : 'planned'}>{live ? 'Available now' : 'Planned'}</Tag>
        </span>
      </summary>
      <div className="flex flex-col gap-8 px-4 pb-6 md:px-6">
        {part.units.map((unit) => (
          <UnitSection key={unit.code} unit={unit} />
        ))}
      </div>
    </details>
  );
}

function UnitSection({ unit }: { unit: MapUnit }) {
  return (
    <section aria-labelledby={`unit-${unit.slug}`} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-caption text-muted-text">{unit.code}</span>
        <h3 id={`unit-${unit.slug}`} className="text-h3">
          <a
            href={routes.unit(unit.slug)}
            lang="de"
            className="rounded-sm text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {unit.title}
          </a>
        </h3>
        {isCloseOutUnit(unit) && <Tag tone="checkpoint">Checkpoint</Tag>}
      </div>
      <p className="text-body text-muted-text">{unit.subtitleEn}</p>
      <ol className="mt-2">
        {unit.lessons.map((lesson) => (
          <LessonRow key={lesson.code} lesson={lesson} />
        ))}
      </ol>
    </section>
  );
}
