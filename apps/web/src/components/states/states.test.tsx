// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadErrorMessage } from './load-error-message.tsx';
import { NotFoundMessage } from './not-found-message.tsx';

afterEach(cleanup);

describe('not-found page (FLOW-ERR-001, DESIGN-UI-134)', () => {
  it('says plainly that the page does not exist and offers the German Map', () => {
    render(<NotFoundMessage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the German Map' }).getAttribute('href')).toBe('/learn');
  });
});

describe('load error page (FLOW-ERR-002, DESIGN-UI-130)', () => {
  it('is announced, says what happened in words with an icon in red-text, and has no error code', () => {
    const { container } = render(<LoadErrorMessage onRetry={() => {}} />);
    const alert = screen.getByRole('alert');
    const heading = screen.getByRole('heading', { level: 1, name: 'This page could not be loaded' });
    expect(heading.className).toContain('text-red-text');
    expect(heading.querySelector('svg')).toBeTruthy();
    expect(alert.textContent).not.toMatch(/\b\d{3}\b|internal_error|error code/i);
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/learn');
  });

  it('retries when the learner asks to', async () => {
    const onRetry = vi.fn();
    render(<LoadErrorMessage onRetry={onRetry} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
