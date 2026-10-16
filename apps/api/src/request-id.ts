import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express request types are extended through this namespace.
  namespace Express {
    interface Request {
      /** Generated per request; carried by the log line and the `X-Request-Id` response header (TRD-LOG-01). */
      id: string;
    }
  }
}

/** Gives every request a fresh id. An id sent by the client is ignored, so log lines cannot be forged. */
export const requestId: RequestHandler = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
