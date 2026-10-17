# Phase 3 review (/review 3, 2026-10-17): findings and proposed fixes

Source: independent review of a4688d6..b097a71 (phase-03/3.8-vercel). Unverified findings; confirm each before fixing.
Approve with a typed line, e.g. "go review fixes 1-10" (or list numbers to skip). One branch: phase-03/review-fixes, stacked on 3.8.

1. answer-free.ts:17 — `audio` sends the phrase code (e.g. phrase:hallo) on listening_selection items; with the phrase block it reveals the answer. FIX: do not send content phrase codes as `audio`. Until the audio phase defines opaque media ids (Piper), omit `audio` from the learner payload. Extend the no-answers test to fail if any item field equals/links to the correct option. Log as decision 0021.
2. error-handler.ts:23 — Express/body-parser 4xx errors become 500. FIX: map any error with numeric status 400-499 to a client code (bad URL param -> validation_failed 400; 413/415 -> existing codes or validation_failed); no new code without Rick's OK (decision 0015).
3. packages/db/src/client.ts:25 — no connectionTimeoutMillis. FIX: set connectionTimeoutMillis (e.g. 5000) and keep the 3 s readiness timeout.
4. main.ts:8 / db.ts — config read at module load, so a bad env breaks /health too. FIX: read config lazily (first DB use / first request) so /health stays up and config errors return the standard error shape on DB routes and log once.
5. scripts/bundle.ts:15 — URL.pathname + drive regex. FIX: use fileURLToPath.
6. ci.yml:4 — push + pull_request both run DB job. FIX: `push` only on main; pull_request for branches.
7. request-log.ts:39 — no line for aborted requests. FIX: log on `close` when !res.writableFinished (with "aborted": true).
8. health.ts:37 + error-handler.ts:38 + db.ts:12 — duplicated error log lines. FIX: single errorLogLine(err, requestId) helper in request-log.ts (TRD-LOG-03 in one place).
9. config.ts:18 — url.origin !== value rejects valid normalised origins. FIX: check parsed parts (no path/query/hash, no trailing slash) and store url.origin.
10. error-handler.ts:15 — any ZodError -> 400. FIX: only route-param/query parsing (parseParams helper) yields validation_failed; other ZodErrors -> internal_error.

After fixes: lint, typecheck, all tests, content check, `pnpm test:db`, a local `npx vercel build`, push, CI green, recheck the preview URLs. Then /gate M2.

## Second review notes (2026-10-17, on uncommitted phase-03/review-fixes): pass with notes. Rick approved "review fixes, see notes" at 08:41Z.

- N1. Decision 0021 is cited in answer-free.ts and api-lesson.ts but the file doesn't exist yet: write it (audio withheld until Phase 7, 4xx -> validation_failed, CI push only on main).
- N2. CI on push now runs only for main, so phase branches get no CI until a PR is open. Note it in 0021.
- N3. Leak guard regex in lessons.db.test.ts:99 lists code prefixes by hand and misses `topic:` and `voice:`. FIX: assert no string value inside any exercise item equals any code present anywhere in the response.
- N4. request-log.ts logs aborted requests as info with status 200. FIX: log them at level warn (and don't report a misleading 200).
- N5. Listening items have nothing playable until Phase 7: carry into Phase 4 planning (note in PROGRESS).
