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

describe('readApiConfig origin normalisation (review 3 finding 9)', () => {
  it('accepts an origin with upper-case letters or a default port and returns it as browsers send it', () => {
    expect(readApiConfig({ WEB_ORIGIN: 'https://DeutschFreak.com' })).toEqual({
      webOrigin: 'https://deutschfreak.com',
    });
    expect(readApiConfig({ WEB_ORIGIN: 'https://deutschfreak.com:443' })).toEqual({
      webOrigin: 'https://deutschfreak.com',
    });
    expect(readApiConfig({ WEB_ORIGIN: 'http://localhost:3000' })).toEqual({ webOrigin: 'http://localhost:3000' });
  });

  it('names the actual problem', () => {
    expect(() => readApiConfig({ WEB_ORIGIN: 'ftp://x.org' })).toThrow(/must start with https:\/\/ or http:\/\//);
    expect(() => readApiConfig({ WEB_ORIGIN: 'https://user:pw@x.org' })).toThrow(/user name or password/);
    expect(() => readApiConfig({ WEB_ORIGIN: 'https://x.org?a=1' })).toThrow(/bare origin/);
    expect(() => readApiConfig({ WEB_ORIGIN: 'https://x.org#top' })).toThrow(/bare origin/);
  });
});
