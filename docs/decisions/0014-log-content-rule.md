# 0014 — What logs must never contain

- **ID:** TRD-LOG-03 (the recommendation in TRD §20 and the closing recommendation of the TRD)
- **Date:** 2026-10-16
- **Status:** decided
- **Decision:** TRD-LOG-03 is approved as written: logs never contain passwords, session tokens, connection strings or given answers tied to an identity beyond what the attempts table already stores. For Phase 3 this means a request log line holds no request body, no headers and no query string.
- **Reason:** Accepted recommendation: it costs nothing now and protects learner privacy (TRD §29, PRD privacy rules).
- **Affects:** TRD §20 (TRD-LOG-03 no longer awaiting approval; local Bible); Plan task 3.1; every later phase that adds logging (5, 8, 9)
