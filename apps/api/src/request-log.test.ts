import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { Router } from 'express';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from './create-app.ts';
import type { LogLine, RequestLogLine } from './request-log.ts';

// Review 3 finding 7: a request whose client goes away before the response is complete still gets its log line.
let server: http.Server | undefined;

afterEach(() => {
  server?.close();
  server = undefined;
});

describe('request log for an aborted request (TRD-LOG-01)', () => {
  it('writes one line, marked aborted, when the client disconnects first', async () => {
    const lines: LogLine[] = [];
    const logged = new Promise<void>((resolve) => {
      const routes = Router();
      routes.get('/slow', () => {
        // Never answers: the client gives up first.
      });
      const app = createApp({
        webOrigin: 'https://deutschfreak.com',
        logSink: (line) => {
          lines.push(line);
          resolve();
        },
        extraRoutes: routes,
      });
      server = app.listen(0);
    });
    await once(server!, 'listening');
    const { port } = server!.address() as AddressInfo;
    const req = http.get({ port, path: '/slow?secret=1' });
    req.on('error', () => {});
    await new Promise((resolve) => setTimeout(resolve, 100));
    req.destroy();
    await logged;
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ path: '/slow', method: 'GET', aborted: true } satisfies Partial<RequestLogLine>);
  });
});
