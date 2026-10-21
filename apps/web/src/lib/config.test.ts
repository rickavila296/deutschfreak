import { describe, expect, it } from 'vitest';
import { readApiUrl } from './config.ts';

describe('readApiUrl', () => {
  it('returns the origin of a valid URL without a trailing slash', () => {
    expect(readApiUrl('http://localhost:4000')).toBe('http://localhost:4000');
    expect(readApiUrl('https://api.example.com/')).toBe('https://api.example.com');
    expect(readApiUrl('  https://api.example.com  ')).toBe('https://api.example.com');
  });

  it('keeps a base path without its trailing slash', () => {
    expect(readApiUrl('https://example.com/api/')).toBe('https://example.com/api');
  });

  it('refuses a missing or empty value and names the variable', () => {
    expect(() => readApiUrl(undefined)).toThrow(/NEXT_PUBLIC_API_URL is not set/);
    expect(() => readApiUrl('   ')).toThrow(/NEXT_PUBLIC_API_URL is not set/);
  });

  it('refuses a value that is not an http or https URL', () => {
    expect(() => readApiUrl('localhost:4000/v1 x')).toThrow(/not a URL|must start with/);
    expect(() => readApiUrl('ftp://example.com')).toThrow(/must start with https:\/\/ or http:\/\//);
  });

  it('refuses credentials, a query or a fragment, without echoing the value', () => {
    const secret = 'https://user:pa55word@example.com';
    expect(() => readApiUrl(secret)).toThrow(/user name or password/);
    expect(() => readApiUrl(secret)).not.toThrow(/pa55word/);
    expect(() => readApiUrl('https://example.com?x=1')).toThrow(/query or fragment/);
    expect(() => readApiUrl('https://example.com#top')).toThrow(/query or fragment/);
  });
});
