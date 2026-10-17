import type { RequestHandler } from 'express';

// Structured JSON log lines (TRD-LOG-01). What a line must never hold (decision 0014, TRD-LOG-03): the body, the
// headers (cookies and session tokens travel there) and the query string. Only the path is logged.

/** One line per request. `aborted` is true when the client went away before the response was complete. */
export interface RequestLogLine {
  level: 'info' | 'warn' | 'error';
  time: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  aborted: boolean;
}

/** One line per unexpected error. Built only by errorLogLine, so what an error line may hold is decided once. */
export interface ErrorLogLine {
  level: 'error';
  time: string;
  requestId: string;
  error: { name: string; message: string; stack: string | undefined };
}

export type LogLine = RequestLogLine | ErrorLogLine;

export type LogSink = (line: LogLine) => void;

/** Writes each line to stdout, where Vercel's built-in logs collect it (TRD-DEC-03). */
export const stdoutSink: LogSink = (line) => {
  process.stdout.write(`${JSON.stringify(line)}\n`);
};

/**
 * The one error log line (review 3 finding 8). `requestId` is the request's id, or a label such as "startup" for
 * errors outside a request. Any trimming or redaction an error line needs (decision 0014) belongs here.
 */
export function errorLogLine(err: unknown, requestId: string): ErrorLogLine {
  const error = err instanceof Error ? err : new Error(String(err));
  return {
    level: 'error',
    time: new Date().toISOString(),
    requestId,
    error: { name: error.name, message: error.message, stack: error.stack },
  };
}

export function requestLog(sink: LogSink): RequestHandler {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    // req.path loses its mount point inside routers, so the path comes from originalUrl without the query.
    const path = req.originalUrl.split('?', 1)[0] ?? '';
    // 'close' fires once for every response, finished or not; 'finish' alone misses requests whose client went away
    // first, which are often the slow or failing ones (review 3 finding 7).
    res.on('close', () => {
      const status = res.statusCode;
      sink({
        level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
        time: new Date().toISOString(),
        requestId: req.id,
        method: req.method,
        path,
        status,
        durationMs: Number((process.hrtime.bigint() - start) / 1000n) / 1000,
        aborted: !res.writableFinished,
      });
    });
    next();
  };
}
