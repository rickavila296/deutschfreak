# 0024 — The repository stays public from the first commit

- **ID:** PLAN-OQ-05 (closes it); supersedes decision 0023
- **Date:** 2026-10-17
- **Status:** decided
- **Decision:** `rickavila296/deutschfreak` stays public, as it has been since the first push. Decision 0023 (private until launch) is withdrawn before the visibility was ever changed. Plan task 18.4 only checks that README, licences and contribution guide are in place at launch.
- **Reason:** The owner chose it after comparing both options. DeutschFreak is open source by design (PRD §28) and a portfolio project, so a visible build history is an asset. On GitHub Free a public repository keeps unlimited GitHub Actions minutes (the CI database job takes about 10 to 15 minutes per run) and enforced branch protection, so a red build blocks merging (TRD-CI-02). Little is exposed: secrets live in GitHub and Vercel settings, the Bible and the Claude Code kit are git-ignored (decision 0004), and A1.1.U01 lessons may be public anyway (decision 0022).
- **Affects:** Plan §14 PLAN-OQ-05 and task 18.4; TRD-CI-02 stays enforced by branch protection.
