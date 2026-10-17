import { apiErrorStatus, type ApiErrorCode } from '@deutschfreak/validation';
import type { z } from 'zod';

/** An error the API means to send. The error handler turns it into the one error shape (TRD-API-20). */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = apiErrorStatus[code];
  }
}

/**
 * Validates request input (params, query or body) with its shared schema (TRD-BE-03). A failure is the client's:
 * `validation_failed`, naming the field paths and Zod's message, never the value (TRD-ERR-03). Only request input goes
 * through here; a schema failure anywhere else is a server fault and stays `internal_error` (review 3 finding 10).
 */
export function parseRequest<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const problems = result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
  throw new ApiError('validation_failed', `Invalid request. ${problems.join('; ')}`);
}
