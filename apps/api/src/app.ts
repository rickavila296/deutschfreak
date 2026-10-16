import cors from 'cors';
import express, { type Express, type Router } from 'express';
import helmet from 'helmet';
import type { ApiConfig } from './config.ts';
import { errorHandler, notFound } from './error-handler.ts';
import { healthRouter, type DatabaseCheck } from './health.ts';
import { requestId } from './request-id.ts';
import { requestLog, stdoutSink, type LogSink } from './request-log.ts';

export interface AppOptions extends ApiConfig {
  /** Where log lines go; tests pass their own. */
  logSink?: LogSink;
  /** Used by `/health/ready`; server.ts passes the module-scope client's check. Without one, the database counts as unavailable. */
  checkDatabase?: DatabaseCheck;
  /** Extra routes, mounted after the API's own; tests use this to probe the middleware. */
  extraRoutes?: Router;
}

const noDatabaseCheck: DatabaseCheck = () => Promise.reject(new Error('No database check is configured.'));

/**
 * Builds the Express app. Middleware order (TRD-BE-08): request id, request log, helmet, CORS, JSON body parser,
 * the routes, then `not_found` and the single error handler, registered last (TRD-ERR-01).
 */
export function createApp({
  webOrigin,
  logSink = stdoutSink,
  checkDatabase = noDatabaseCheck,
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

  app.use(healthRouter(checkDatabase, logSink));
  if (extraRoutes) app.use(extraRoutes);

  app.use(notFound);
  app.use(errorHandler(logSink));
  return app;
}
