import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ApiErrorCode, ApiErrorResponse } from '@deutschfreak/validation';
import { ApiError } from './errors.ts';
import { errorLogLine, type LogSink } from './request-log.ts';

/** Registered after every route: a request no route answered is `not_found`. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError('not_found', `No route for ${req.method} ${req.path}.`));
};

/** The 4xx status Express or body-parser put on an error they raised because of the request, if any. */
function clientStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const { status, statusCode } = err as { status?: unknown; statusCode?: unknown };
  const value = typeof status === 'number' ? status : typeof statusCode === 'number' ? statusCode : undefined;
  return value !== undefined && value >= 400 && value <= 499 ? value : undefined;
}

/**
 * Turns an error into the ApiError to send, or undefined for an unexpected (server) error. Errors that Express or
 * body-parser raise because of the request carry a 4xx `status`; all of them are client errors (review 3 finding 2),
 * not only the two body-parser types named here. A ZodError is NOT a client error: request input is validated with
 * parseRequest, so a ZodError here comes from server-side data (review 3 finding 10).
 */
function toApiError(err: unknown): ApiError | undefined {
  if (err instanceof ApiError) return err;
  const status = clientStatus(err);
  if (status === undefined) return undefined;
  const type = (err as { type?: unknown }).type;
  if (type === 'entity.parse.failed') return new ApiError('invalid_json', 'The request body is not valid JSON.');
  if (status === 413) return new ApiError('payload_too_large', 'The request body is too large.');
  // Any other request fault (a malformed URL escape, an unsupported charset or encoding, an aborted upload):
  // decision 0015 has no closer code, so it is answered as invalid input.
  return new ApiError('validation_failed', 'The request could not be read.');
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
      logSink(errorLogLine(err, req.id));
      apiError = new ApiError('internal_error', 'Something went wrong on our side. Please try again.');
    }
    const code: ApiErrorCode = apiError.code;
    const body: ApiErrorResponse = { error: { code, message: apiError.message } };
    res.status(apiError.status).json(body);
  };
}
