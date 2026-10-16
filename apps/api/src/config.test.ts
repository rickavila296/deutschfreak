import { describe, expect, it } from 'vitest';
import { readApiConfig } from './config.ts';

describe('readApiConfig', () => {
  it('returns the web origin', () => {
    expect(readApiConfig({ WEB_ORIGIN: 'https://deutschfreak.com' })).toEqual({
      webOrigin: 'https://deutschfreak.com',
    });
    expect(readApiConfig({ WEB_ORIGIN: 'http://localhost:3000' })).toEqual({ webOrigin: 'http://localhost:3000' });
  });

  it('refuses a missing or empty WEB_ORIGIN', () => {
    expect(() => readApiConfig({})).toThrow('WEB_ORIGIN is not set');
    expect(() => readApiConfig({ WEB_ORIGIN: '  ' })).toThrow('WEB_ORIGIN is not set');
  });

  it('refuses anything that is not a bare http(s) origin, without echoing the value', () => {
    for (const value of [
      'not a url',
      'https://deutschfreak.com/',
      'https://deutschfreak.com/app',
      'ftp://x.org',
      '*',
    ]) {
      expect(() => readApiConfig({ WEB_ORIGIN: value })).toThrow(/WEB_ORIGIN/);
      try {
        readApiConfig({ WEB_ORIGIN: value });
      } catch (error) {
        expect((error as Error).message).not.toContain(value);
      }
    }
  });
});
