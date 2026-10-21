import { CircleAlert } from 'lucide-react';
import { routes } from '../../lib/routes.ts';

// The whole-page error (FLOW-ERR-002, DESIGN-UI-130, 131): used only when the page itself cannot load, for example
// when the API cannot be reached. It says what happened and what the learner can do, in plain English, with an icon
// and red-text, without error codes or blame. The header and navigation stay usable around it.
export function LoadErrorMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex max-w-prose flex-col gap-4">
      <h1 className="flex items-center gap-3 text-h2 text-red-text">
        <CircleAlert aria-hidden="true" size={28} />
        This page could not be loaded
      </h1>
      <p className="text-reading text-ink">
        Something went wrong while loading it. Please try again in a moment. If it keeps happening, the German Map may
        still work.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="flex min-h-11 items-center rounded-md bg-blue px-6 text-body font-semibold text-white hover:bg-blue-text"
        >
          Try again
        </button>
        <a
          href={routes.learn}
          className="flex min-h-11 items-center rounded-sm text-body text-blue-text underline-offset-4 hover:underline"
        >
          Go to the German Map
        </a>
      </div>
    </div>
  );
}
