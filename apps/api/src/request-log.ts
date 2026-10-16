import type { RequestHandler } from 'express';

// Structured JSON log lines (TRD-LOG-01). What a line must never hold (decision 0014, TRD-LOG-03): the body, the
// headers (cookies and session tokens travel there) and the query string. Only the path is logged.

/** One line per request. */
export interface RequestLogLine {
  level: 'info' | 'warn' | 'error';
  time: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
}

/** One line per unexpected error, written by the error handler before it answers `internal_error`. */
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

export function requestLog(sink: LogSink): RequestHandler {
  return (req, res, next) => {
    const start = process.hrtime.bigint();
    // req.path loses its mount point inside routers, so the path comes from originalUrl without the query.
    const path = req.originalUrl.split('?', 1)[0] ?? '';
    res.on('finish', () => {
      const status = res.statusCode;
      sink({
        level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
        time: new Date().toISOString(),
        requestId: req.id,
        method: req.method,
        path,
        status,
        durationMs: Number((process.hrtime.bigint() - start) / 1000n) / 1000,
      });
    });
    next();
  };
}
