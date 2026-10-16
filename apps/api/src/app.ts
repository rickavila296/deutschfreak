import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { ApiConfig } from './config.ts';
import { requestId } from './request-id.ts';
import { requestLog, stdoutSink, type LogSink } from './request-log.ts';

export interface AppOptions extends ApiConfig {
  /** Where request log lines go; tests pass their own. */
  logSink?: LogSink;
}

/**
 * Builds the Express app. Middleware order (TRD-BE-08): request id, request log, helmet, CORS, JSON body parser,
 * then the routes. The single error handler is registered last (task 3.2).
 */
export function createApp({ webOrigin, logSink = stdoutSink }: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(requestId);
  app.use(requestLog(logSink));
  app.use(helmet());
  // TRD-SEC-15: only the web app's origin may call the API from a browser.
  app.use(cors({ origin: webOrigin }));
  app.use(express.json());

  return app;
}
