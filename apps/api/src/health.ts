import type { HealthResponse, ReadyResponse } from '@deutschfreak/validation';
import { Router } from 'express';
import { ApiError } from './errors.ts';
import type { LogSink } from './request-log.ts';

/** Resolves when the database answers a trivial query; rejects otherwise. Wired to the real client in src/index.ts. */
export type DatabaseCheck = () => Promise<void>;

/** How long `/health/ready` waits for the database before reporting it unavailable. */
export const readyTimeoutMs = 3000;

function withTimeout(promise: Promise<void>, ms: number): Promise<void> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Database check timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** `GET /health` and `GET /health/ready` (TRD-API-01). No auth, outside `/v1`, never cached. */
export function healthRouter(checkDatabase: DatabaseCheck, logSink: LogSink, timeoutMs = readyTimeoutMs): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const body: HealthResponse = { status: 'ok' };
    res.json(body);
  });

  router.get('/health/ready', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      await withTimeout(checkDatabase(), timeoutMs);
    } catch (err) {
      // The cause is logged for the operator; the response never carries it (decision 0014).
      const error = err instanceof Error ? err : new Error(String(err));
      logSink({
        level: 'error',
        time: new Date().toISOString(),
        requestId: req.id,
        error: { name: error.name, message: error.message, stack: error.stack },
      });
      throw new ApiError('database_unavailable', 'The database cannot be reached.');
    }
    const body: ReadyResponse = { status: 'ready', database: 'reachable' };
    res.json(body);
  });

  return router;
}
