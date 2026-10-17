import { describe, expect, it } from 'vitest';
import { apiErrorCodes, apiErrorResponseSchema, apiErrorStatus } from './api-errors.ts';

describe('API error codes (TRD §19)', () => {
  it('are snake_case and each has a client or server error status', () => {
    for (const code of apiErrorCodes) {
      expect(code).toMatch(/^[a-z]+(_[a-z]+)*$/);
      expect(apiErrorStatus[code]).toBeGreaterThanOrEqual(400);
      expect(apiErrorStatus[code]).toBeLessThan(600);
    }
  });

  it('include the code of the TRD-API-20 example', () => {
    expect(apiErrorStatus.lesson_not_found).toBe(404);
  });
});

describe('apiErrorResponseSchema (TRD-API-20)', () => {
  it('accepts the one error shape', () => {
    const body = { error: { code: 'lesson_not_found', message: 'No lesson has this slug.' } };
    expect(apiErrorResponseSchema.parse(body)).toEqual(body);
  });

  it('refuses unknown codes, empty messages and extra fields', () => {
    for (const body of [
      { error: { code: 'teapot', message: 'x' } },
      { error: { code: 'not_found', message: '' } },
      { error: { code: 'not_found', message: 'x', stack: 'at …' } },
      { error: { code: 'not_found', message: 'x' }, status: 404 },
      { code: 'not_found', message: 'x' },
    ]) {
      expect(apiErrorResponseSchema.safeParse(body).success).toBe(false);
    }
  });
});
