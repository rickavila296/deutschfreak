import type { LessonResponseBlock } from '@deutschfreak/validation';
import type { ReactNode } from 'react';
import type { TranslationMode } from './stages.ts';

// The one generic block renderer (TRD-FE-03): it picks a component by the block's kind, never by lesson. Phase 4 is
// read-only: every block is text. Exercises show their instruction, prompts and options with nothing to answer, and
// there is no audio yet (decision 0021). Content is rendered as text, never as HTML (TRD-FE-07).

interface BlockProps {
  block: LessonResponseBlock;
  /** Shown, behind a tap, or hidden, by part and stage (TRD-FE-11). */
  translation: TranslationMode;
}

export function Block({ block, translation }: BlockProps) {
  return (
    <div className="flex flex-col gap-2" data-kind={block.kind}>
      {block.textEn && <p className="max-w-prose text-reading text-ink">{block.textEn}</p>}
      <BlockBody block={block} translation={translation} />
    </div>
  );
}

function BlockBody({ block, translation }: BlockProps): ReactNode {
  switch (block.kind) {
    case 'text':
      return null;
    case 'vocabulary': {
      const { article, lemma, plural, meaningEn } = block.vocabulary;
      return (
        <German
          // Nouns always appear with their article (Design Brief, web rules).
          german={article ? `${article} ${lemma}` : lemma}
          note={plural ? `plural: ${plural}` : undefined}
          translation={meaningEn}
          mode={translation}
        />
      );
    }
    case 'phrase':
      return (
        <German
          german={block.phrase.german}
          note={block.phrase.register === 'neutral' ? undefined : block.phrase.register}
          translation={block.phrase.meaningEn}
          mode={translation}
        />
      );
    case 'example':
      return <German german={block.example.german} translation={block.example.meaningEn} mode={translation} />;
    case 'concept':
      return (
        <div className="flex flex-col gap-1 rounded-lg bg-surface p-4 md:p-6">
          <h3 className="text-h3 text-ink">{block.concept.title}</h3>
          <p className="max-w-prose text-reading text-ink">{block.concept.explanationEn}</p>
        </div>
      );
    case 'dialogue':
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-h3 text-ink">{block.dialogue.title}</h3>
          <ol className="flex flex-col gap-3">
            {block.dialogue.lines.map((line) => (
              <li key={line.code} className="flex flex-col gap-1">
                <span className="text-caption text-muted-text">{line.speakerRole}</span>
                <span lang="de" className="text-german-lg text-ink">
                  {line.german}
                </span>
                <Translation text={line.meaningEn} mode={translation} />
              </li>
            ))}
          </ol>
        </div>
      );
    case 'exercise':
      return (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4 md:p-6">
          <p className="text-body font-semibold text-ink">{block.exercise.instructionEn}</p>
          <ol className="flex list-decimal flex-col gap-3 pl-6">
            {block.exercise.items.map((item) => (
              <li key={item.code} className="text-body text-ink">
                {item.prompt && <p>{item.prompt}</p>}
                {item.options && (
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {/* Keyed by position: options may repeat, e.g. der, die, der (review 4b finding 3). */}
                    {item.options.map((option, index) => (
                      <li key={index} className="rounded-md border border-muted px-3 py-1 text-small text-ink">
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      );
  }
}

/** German set one step larger than the English beside it (Design Brief §9), marked lang="de". */
function German({
  german,
  note,
  translation,
  mode,
}: {
  german: string;
  note?: string;
  translation: string;
  mode: TranslationMode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex flex-wrap items-baseline gap-x-3">
        <span lang="de" className="text-german-md text-ink">
          {german}
        </span>
        {note && <span className="text-small text-muted-text">{note}</span>}
      </span>
      <Translation text={translation} mode={mode} />
    </div>
  );
}

/** The English beside German: on the page, behind a native disclosure (no client code), or left out (TRD-FE-11). */
function Translation({ text, mode }: { text: string; mode: TranslationMode }) {
  if (mode === 'hidden') return null;
  if (mode === 'shown') return <span className="text-small text-muted-text">{text}</span>;
  return (
    <details className="text-small text-muted-text">
      <summary className="flex min-h-11 cursor-pointer items-center text-blue-text">Show translation</summary>
      {text}
    </details>
  );
}
