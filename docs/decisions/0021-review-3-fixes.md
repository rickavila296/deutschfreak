# 0021 — Phase 3 review fixes

- **ID:** Phase 3 review findings 1 to 10 (no PLAN-DEC number); amends decision 0017 (2) and decision 0016
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** The owner approved fixes for all ten findings of the Phase 3 review:
  1. The lesson response sends an exercise item's `prompt` and `options` only. The stored `audio` value is withheld: it is the code of the phrase being heard, which the lesson's own phrase block links to its meaning, the correct option. Audio returns in Phase 7 as an opaque reference that does not name the phrase. (Amends decision 0017 (2), which allowed `audio`.)
  2. Any error Express or body-parser raise with a 4xx status is a client error: 413 is `payload_too_large`, a JSON parse failure is `invalid_json`, every other one is `validation_failed` (400). No new error code (decision 0015 unchanged).
  3. The pool's connection timeout is 5 s.
  4. A configuration error at startup is logged once; `/health` still answers, everything else answers `internal_error`.
  5. The bundle script resolves its folder with `fileURLToPath`.
  6. CI runs on pushes to `main`, on pull requests and on demand (`workflow_dispatch`), so the database job runs once per commit of an open pull request; a branch without a pull request is checked with "Run workflow". (Narrows the triggers decision 0016 relied on.)
  7. The request log line is written on `close`, with `aborted: true` when the client left first.
  8. One `errorLogLine` helper builds every error log line.
  9. `WEB_ORIGIN` is checked part by part and normalised (upper-case host, default port accepted).
  10. Only request input becomes `validation_failed`, through `parseRequest`; a ZodError anywhere else is `internal_error`.
- **Reason:** Review finding 1 broke Phase 3's goal ("a lesson without answers", architecture rule 3), so the M2 gate was not reached; the owner asked for all known issues to be fixed.
- **Affects:** TRD-API-03, TRD-SEC-11, TRD-ERR-01/03, TRD-LOG-01, TRD-API-01, TRD-BE-07 (local Bible, next documentation update); Plan Phase 7 (audio reference) and Phase 8 (payload); `.github/workflows/ci.yml`.
