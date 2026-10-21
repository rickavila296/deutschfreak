// DESIGN-UI-006: the first focusable element on every page; hidden until it receives keyboard focus.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-md bg-white px-4 py-3 text-body font-semibold text-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
    >
      Skip to content
    </a>
  );
}
