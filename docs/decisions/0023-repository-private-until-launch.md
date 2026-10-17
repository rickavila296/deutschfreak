# 0023 — The repository is private until launch

- **ID:** PLAN-OQ-05 (closes it)
- **Date:** 2026-10-17
- **Status:** superseded by 0024 (same day, before the visibility was changed)
- **Decision:** `rickavila296/deutschfreak` is switched to private now and made public at launch by Plan task 18.4, with README, licences and contribution guide in place. The owner changes the visibility in GitHub (Settings → General → Danger Zone → Change visibility).
- **Reason:** The owner's call during the Bible alignment: keep the code, build log, decisions and unreviewed German drafts out of public view until launch.
- **Consequences:** On GitHub Free, a private repository gets 2,000 GitHub Actions minutes a month; the CI database job takes about 10 to 15 minutes per run, so seed batching (decision 0013 finding 7, Phase 6) matters more. Branch protection and rulesets are not enforced on private repositories on GitHub Free, so TRD-CI-02 ("a red build blocks merging") becomes a rule the owner follows by hand until launch or a GitHub Pro plan. Vercel deployments and the GitHub Actions secrets are unaffected.
- **Affects:** Plan §14 PLAN-OQ-05 and task 18.4; TRD-CI-02; Phase 6 seed batching priority.
