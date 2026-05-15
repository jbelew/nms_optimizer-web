# Tooling Cleanup Recommendations

Follow-ups to consider after migrating from npm → Bun and Husky → Lefthook.
Items are ranked by impact / effort.

---

## 1. Remove unused dependencies (quick win) ✅ DONE

Both screenshot scripts (`scripts/screenshot.mjs`, `scripts/screenshot-blurred-background.js`)
already use Playwright's `chromium`. `puppeteer` and `puppeteer-core` appear unused.

```bash
# Verify nothing else imports them
rg -l "puppeteer" --glob '!node_modules' --glob '!bun.lock' --glob '!package.json'

# Remove
bun remove puppeteer puppeteer-core
```

---

## 2. Audit PostCSS / autoprefixer ✅ DONE

`postcss.config.mjs` is currently empty. Tailwind v4 + Lightning CSS handle
vendor prefixing internally, so the PostCSS pipeline is likely dead weight.

Candidates for removal:

- `postcss.config.mjs`
- `postcss`
- `autoprefixer`
- `@tailwindcss/postcss`

Keep `@tailwindcss/vite` (the v4 native Vite plugin path).
Verify with `bun run build` after removal.

---

## 3. CI: cache Bun's install store ✅ DONE

`oven-sh/setup-bun@v2` does **not** auto-cache. The composite action
`.github/actions/setup-node-env` runs `bun install --frozen-lockfile` every
job with no cache. Add an explicit cache step:

```yaml
- name: Cache Bun store
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: bun-${{ runner.os }}-
```

Typical savings: 30–60s per CI job.

---

## 4. CI: Bun-native test runner for `scripts/` ✅ DONE

`bun test scripts/` runs in CI via `bun run test:scripts`
(`.github/workflows/ci.yml`). Lefthook also runs it on `scripts/**` changes.

---

## 5. Drop Node.js from CI (if possible)

`setup-node-env` installs **both** Node 24 and Bun. Bun ships its own JS
runtime and an npm-compatible package manager. Keep Node only if a tool
shells out to it (Lighthouse CI, Playwright runtime, `wrangler`).

Test by removing the `actions/setup-node@v4` step from
`.github/actions/setup-node-env/action.yml`. Saves another ~10s per job.

---

## 6. Replace `commitizen` + AI plugin ✅ DONE

`commit-msg` Lefthook hook now enforces commitlint, so commitizen is only
needed if a developer interactively uses `cz`. If no one does, remove:

- `commitizen`
- `@elsikora/commitizen-plugin-commitlint-ai`
- The `config.commitizen` block in `package.json`

---

## 7. Consolidate Vitest configs ✅ DONE

Previously two configs:

- `vitest.config.ts` (Storybook + browser tests)
- `vitest.unit.config.ts` (jsdom unit tests)

Now collapsed into a single `vitest.config.ts` using Vitest 4's
`test.projects` field. Two named projects: `unit` and `storybook`.
Scripts updated to use `--project unit` / `--project storybook`.

---

## 8. Review `wrangler` ✅ KEEP

Confirmed in active use. No action needed.

---

## 9. Delete `.npmrc` ✅ DONE

Contents:

```
legacy-peer-deps=true
```

Bun ignores `.npmrc`. Either delete the file or migrate any genuinely
needed install behavior to `bunfig.toml`. Trapped npm-only behavior is a
classic source of "works locally, breaks in CI" bugs after a Bun migration.

---

## 10. `bun run` vs `bunx` for local binaries

Scripts already use `bunx` (good). A minor optimization: for binaries
declared in `dependencies` / `devDependencies`, `bun run <script>` adds
`node_modules/.bin` to PATH directly, so `bun run vite` is marginally
faster than `bunx vite` (which may consult the global cache first).

Not worth a sweep; useful to know.

---

## 11. Native parallelism with `bun run --parallel`

For CI orchestration scripts that currently chain commands with `&&`,
recent Bun versions support `bun run --parallel` for fan-out. Useful for
running `lint`, `typecheck`, and `test` concurrently when they're
independent.

---

## Summary

**Completed**

- ✅ Removed `puppeteer`, `puppeteer-core`
- ✅ Removed `commitizen`, `@elsikora/commitizen-plugin-commitlint-ai`
- ✅ Removed `postcss`, `autoprefixer`, `@tailwindcss/postcss`, `postcss.config.mjs`
- ✅ Removed `.npmrc`
- ✅ Added Bun install-cache step in CI
- ✅ Wired `bun test scripts/` into CI
- ✅ Consolidated Vitest configs into one workspace
- ✅ Confirmed `wrangler` is in active use (kept)

**Outstanding**

- ⏳ #5 — Investigate whether Node.js can be dropped from CI

---

## Round 2: New tooling added

- ✅ **Knip** ([knip.json](../knip.json)) — unused export/dep/file detection.
  CI runs `bun run lint:knip` (`continue-on-error: true` while the team
  works through the baseline findings).
- ✅ **Oxlint** ([.oxlintrc.json](../.oxlintrc.json)) — fast Rust-based
  pre-pass. Runs in `lint-js` lefthook command before ESLint and via
  `bun run lint`. Passes cleanly (15 real a11y findings flagged as warnings
  for later cleanup).
- ✅ **size-limit** ([.size-limit.json](../.size-limit.json)) — bundle
  size budgets enforced in CI after `build`. All chunks currently under
  budget; total app JS = ~486 KB brotli.
- ❌ **cspell** — installed and tested, then removed. Too many
  project-specific terms (NMS lore, bot UAs, language names) to maintain
  a curated dictionary; would have been net-friction.
- ⏸️ **act** — not installed (system tool). Install via package manager
  when needed: `apt install act` or `brew install act`.
