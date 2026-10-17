// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { isCurrentSection, primaryNav, routes } from '../lib/routes.ts';
import { MobileMenu } from './mobile-menu.tsx';
import { NavList } from './nav-list.tsx';
import { SiteFooter } from './site-footer.tsx';
import { SkipLink } from './skip-link.tsx';

afterEach(cleanup);

describe('routes (decision 0028)', () => {
  it('builds the recorded page addresses', () => {
    expect(routes.learn).toBe('/learn');
    expect(routes.part('A1.1')).toBe('/learn#a1-1');
    expect(routes.unit('im-cafe')).toBe('/learn/units/im-cafe');
    expect(routes.lesson('example-lesson')).toBe('/learn/lessons/example-lesson');
  });

  it('marks a section current on its own page and on pages below it only', () => {
    expect(isCurrentSection('/learn', '/learn')).toBe(true);
    expect(isCurrentSection('/learn/lessons/x', '/learn')).toBe(true);
    expect(isCurrentSection('/learning', '/learn')).toBe(false);
    expect(isCurrentSection('/learn', '/')).toBe(false);
    expect(isCurrentSection('/', '/')).toBe(true);
  });
});

describe('primary navigation', () => {
  it('follows the launch order and has no Practice item (FLOW-NAV-001, DESIGN-UI-002)', () => {
    const launchOrder = ['Learn', 'Browse', 'Vocabulary', 'Pronunciation', 'Germany', 'Progress'];
    const labels = primaryNav.map((item) => item.label);
    expect(labels).not.toContain('Practice');
    expect(labels).toEqual(launchOrder.filter((label) => labels.includes(label)));
  });

  it('marks the current section with aria-current and weight, not colour alone (DESIGN-UI-003)', () => {
    render(
      <NavList
        items={[
          { label: 'Learn', href: '/learn' },
          { label: 'Germany', href: '/germany' },
        ]}
        currentPath="/learn/lessons/x"
        layout="row"
      />,
    );
    const current = screen.getByRole('link', { name: 'Learn' });
    const other = screen.getByRole('link', { name: 'Germany' });
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.className).toContain('font-semibold');
    expect(current.className).toContain('underline');
    expect(other.getAttribute('aria-current')).toBeNull();
    expect(other.className).not.toContain('font-semibold');
  });
});

describe('mobile menu', () => {
  it('opens and closes by keyboard and Escape returns focus to the button (TRD-A11Y-02)', async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu openIcon={null} closeIcon={null}>
        <a href="/learn">Learn</a>
      </MobileMenu>,
    );
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('link', { name: 'Learn' })).toBeNull();

    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard('{Enter}');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('link', { name: 'Learn' })).toBeTruthy();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Learn' }));
    await user.keyboard('{Escape}');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});

describe('skip link (DESIGN-UI-006)', () => {
  it('points to the main content', () => {
    render(<SkipLink />);
    expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#main');
  });
});

describe('footer (DESIGN-UI-005)', () => {
  it('carries the line and only groups that have links', () => {
    render(<SiteFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText('Open-source German learning')).toBeTruthy();
    expect(within(footer).getByRole('heading', { name: 'DeutschFreak' })).toBeTruthy();
    expect(within(footer).getByRole('heading', { name: 'Project' })).toBeTruthy();
    expect(within(footer).queryByRole('heading', { name: 'Community' })).toBeNull();
    expect(within(footer).getByRole('link', { name: 'Report an issue' }).getAttribute('href')).toBe(
      'https://github.com/rickavila296/deutschfreak/issues',
    );
    expect(within(footer).queryByRole('link', { name: 'Practice' })).toBeNull();
  });
});
