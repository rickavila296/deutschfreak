import { z } from 'zod';

// The API's one error shape (TRD-API-20) and its fixed list of error codes (TRD §19, fixed in Phase 3 task 3.2).
// Each code has exactly one HTTP status. A new code is added here, and only with the owner's approval.

export const apiErrorStatus = {
  /** Params, query or body failed its Zod schema (TRD-BE-03, TRD-ERR-03). */
  validation_failed: 400,
  /** The request body is not valid JSON. */
  invalid_json: 400,
  /** A route that needs a session was called without one (FLOW-ERR-007). Used from Phase 5. */
  unauthorized: 401,
  /** No route matches the method and path. */
  not_found: 404,
  /** No level has this code (TRD-API-02). */
  level_not_found: 404,
  /** No lesson has this slug (TRD-API-03; the example in TRD-API-20). */
  lesson_not_found: 404,
  /** The request body is larger than the parser accepts. */
  payload_too_large: 413,
  /** Too many requests (FLOW-ERR-004, TRD-SEC-16). Used from Phase 5. */
  rate_limited: 429,
  /** Anything unexpected. The message never reveals the cause. */
  internal_error: 500,
  /** The database cannot be reached (TRD-API-01, `/health/ready`). */
  database_unavailable: 503,
} as const;

export type ApiErrorCode = keyof typeof apiErrorStatus;

export const apiErrorCodes = Object.keys(apiErrorStatus) as [ApiErrorCode, ...ApiErrorCode[]];

export const apiErrorCodeSchema = z.enum(apiErrorCodes);

/** `{ "error": { "code": "lesson_not_found", "message": "..." } }` (TRD-API-20). */
export const apiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: apiErrorCodeSchema,
    message: z.string().min(1),
  }),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
