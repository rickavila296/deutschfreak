import { routes } from '../../lib/routes.ts';

// The not-found page (FLOW-ERR-001, DESIGN-UI-134): says so plainly, in the brand voice, and offers the German Map.
// Browse and search join the links when those pages exist. Shown for unknown addresses and planned lessons
// (decision 0028), always with HTTP status 404.
export function NotFoundMessage() {
  return (
    <div className="flex max-w-prose flex-col gap-4">
      <h1 className="text-display text-ink">Page not found</h1>
      <p className="text-reading text-ink">
        There is no page at this address. It may be a lesson that is still planned, or the address may have a typo.
      </p>
      <a
        href={routes.learn}
        className="flex min-h-11 items-center self-start rounded-md bg-blue px-6 text-body font-semibold text-white hover:bg-blue-text"
      >
        Go to the German Map
      </a>
    </div>
  );
}
