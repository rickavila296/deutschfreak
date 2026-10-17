import type { Db } from '@deutschfreak/db';
import cors from 'cors';
import express, { type Express, type Router } from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './error-handler.ts';
import { ApiError } from './errors.ts';
import { healthRouter, type DatabaseCheck } from './health.ts';
import { requestId } from './request-id.ts';
import { lessonsRouter } from './routes/lessons.ts';
import { levelsRouter } from './routes/levels.ts';
import { requestLog, stdoutSink, type LogSink } from './request-log.ts';

export interface AppOptions {
  /** The one browser origin CORS allows (TRD-SEC-15); false allows none. */
  webOrigin: string | false;
  /** True when the configuration could not be read (src/main.ts): /health answers, everything else is internal_error. */
  startupError?: boolean;
  /** Where log lines go; tests pass their own. */
  logSink?: LogSink;
  /** Used by `/health/ready`; src/main.ts passes the module-scope client's check. Without one, the database counts as unavailable. */
  checkDatabase?: DatabaseCheck;
  /** The database for the `/v1` routes; src/main.ts passes the module-scope client (task 3.4). Without it, `/v1` is not mounted. */
  db?: Db;
  /** Extra routes, mounted after the API's own; tests use this to probe the middleware. */
  extraRoutes?: Router;
}

const noDatabaseCheck: DatabaseCheck = () => Promise.reject(new Error('No database check is configured.'));
const notConfigured = () => new ApiError('internal_error', 'The API is not configured correctly.');

/**
 * Builds the Express app. Middleware order (TRD-BE-08): request id, request log, helmet, CORS, JSON body parser,
 * the routes, then `not_found` and the single error handler, registered last (TRD-ERR-01).
 */
export function createApp({
  webOrigin,
  logSink = stdoutSink,
  startupError = false,
  checkDatabase = noDatabaseCheck,
  db,
  extraRoutes,
}: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(requestLog(logSink));
  app.use(helmet());
  // TRD-SEC-15: only the web app's origin may call the API from a browser.
  app.use(cors({ origin: webOrigin }));
  app.use(express.json());

  // Review 3 finding 4: with a configuration error the process is up (/health) but not ready, and serves nothing else.
  app.use(healthRouter(startupError ? () => Promise.reject(notConfigured()) : checkDatabase, logSink));
  if (startupError) {
    app.use((_req, _res, next) => next(notConfigured()));
  }
  // TRD-API-22: every content route is versioned under /v1.
  if (db) app.use('/v1', levelsRouter(db), lessonsRouter(db));
  if (extraRoutes) app.use(extraRoutes);

  app.use(notFound);
  app.use(errorHandler(logSink));
  return app;
}
