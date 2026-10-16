# 0015 — The API's error codes

- **ID:** TRD §19 "the code list during Phase 3" (Plan task 3.2); closes the open code list
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** Every API error uses the one shape `{ "error": { "code", "message" } }` (TRD-API-20) with exactly one of these codes, each tied to one HTTP status:

  | Status | Code | When |
  |---|---|---|
  | 400 | `validation_failed` | Params, query or body fail their Zod schema (TRD-BE-03, TRD-ERR-03). The message names the field, never the value |
  | 400 | `invalid_json` | The request body is not valid JSON |
  | 401 | `unauthorized` | A route that needs a session is called without one (FLOW-ERR-007); used from Phase 5 |
  | 404 | `not_found` | No route matches the method and path |
  | 404 | `level_not_found` | No level has this code (TRD-API-02) |
  | 404 | `lesson_not_found` | No lesson has this slug (TRD-API-03; the TRD-API-20 example) |
  | 413 | `payload_too_large` | The body exceeds the JSON parser's limit (Express default, 100 kB) |
  | 429 | `rate_limited` | Too many requests (FLOW-ERR-004, TRD-SEC-16); used from Phase 5 |
  | 500 | `internal_error` | Anything unexpected. The message never reveals the cause; the cause is logged with the request id |
  | 503 | `database_unavailable` | The database cannot be reached (`/health/ready`, TRD-API-01) |

  The list lives in `packages/validation/src/api-errors.ts` (`apiErrorStatus`, `apiErrorResponseSchema`), shared by the API and the web app. A new code is added there only with the owner's approval and a new decision.
- **Reason:** The Bible names only `lesson_not_found` and leaves the list to Phase 3. The owner approved the proposed list in task 3.2. The 401 and 429 codes come from FLOW-ERR-007 and FLOW-ERR-004 so later phases need no new codes.
- **Affects:** TRD §19 and TRD-API-20 (the code list should be written into the Bible at the next Bible update; owner asked for this to be carried into the documentation build later); Flow §9 error states; Phases 3, 5, 8, 9. Still open: whether a planned lesson answers `lesson_not_found` or its own code (asked in task 3.6).
