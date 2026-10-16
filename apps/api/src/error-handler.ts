import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorCode, ApiErrorResponse } from '@deutschfreak/validation';
import { ApiError } from './errors.ts';
import type { LogSink } from './request-log.ts';

/** Registered after every route: a request no route answered is `not_found`. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError('not_found', `No route for ${req.method} ${req.path}.`));
};

/** Turns body-parser, Zod and unexpected errors into an ApiError. */
function toApiError(err: unknown): ApiError | undefined {
  if (err instanceof ApiError) return err;
  if (err instanceof ZodError) {
    // TRD-ERR-03: a validation failure is a client error. Paths and Zod messages name the problem, never the value.
    const problems = err.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    return new ApiError('validation_failed', `Invalid request. ${problems.join('; ')}`);
  }
  const type = typeof err === 'object' && err !== null && 'type' in err ? err.type : undefined;
  if (type === 'entity.parse.failed') return new ApiError('invalid_json', 'The request body is not valid JSON.');
  if (type === 'entity.too.large') return new ApiError('payload_too_large', 'The request body is too large.');
  return undefined;
}

/**
 * The single error handler, registered last (TRD-ERR-01, TRD-BE-08). Every API error leaves here in the one shape.
 * An unexpected error is logged with the request id and answered with `internal_error`, never with its cause.
 */
export function errorHandler(logSink: LogSink): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    let apiError = toApiError(err);
    if (!apiError) {
      const error = err instanceof Error ? err : new Error(String(err));
      logSink({
        level: 'error',
        time: new Date().toISOString(),
        requestId: req.id,
        error: { name: error.name, message: error.message, stack: error.stack },
      });
      apiError = new ApiError('internal_error', 'Something went wrong on our side. Please try again.');
    }
    const code: ApiErrorCode = apiError.code;
    const body: ApiErrorResponse = { error: { code, message: apiError.message } };
    res.status(apiError.status).json(body);
  };
}
