import { describe, expect, it } from 'vitest';
import { isCurrentSection } from '../lib/routes.ts';
import { metadata } from './page.tsx';

describe('home shows the German Map (decision 0028; review 4b finding 5)', () => {
  it('names /learn as the canonical address of /', () => {
    expect(metadata.alternates?.canonical).toBe('/learn');
  });

  it('marks Learn as the current section on /', () => {
    expect(isCurrentSection('/', '/learn')).toBe(true);
    expect(isCurrentSection('/', '/germany')).toBe(false);
  });
});
