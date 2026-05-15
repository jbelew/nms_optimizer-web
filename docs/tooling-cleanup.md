# Tooling Cleanup Recommendations

Follow-ups to consider after migrating from npm → Bun and Husky → Lefthook.
Items are ranked by impact / effort.

---

## 1. Remove unused dependencies (quick win)

Both screenshot scripts (`scripts/screenshot.mjs`, `scripts/screenshot-blurred-background.js`)
already use Playwright's `chromium`. `puppeteer` and `puppeteer-core` appear unused.

```bash
# Verify nothing else imports them
rg -l "puppeteer" --glob '!node_modules' --glob '!bun.lock' --glob '!package.json'

# Remove
bun remove puppeteer puppeteer-core
```

---

## 2. Audit PostCSS / autoprefixer

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

## 3. CI: cache Bun's install store

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

## 4. CI: Bun-native test runner for `scripts/`

`bun test scripts/` is already wired into `package.json` and Lefthook now runs
it on `scripts/**` changes. Mirror this in CI and consider dropping the
separate `vitest.scripts.config.ts` if Bun's test runner covers it fully.

---

## 5. Drop Node.js from CI (if possible)

`setup-node-env` installs **both** Node 24 and Bun. Bun ships its own JS
runtime and an npm-compatible package manager. Keep Node only if a tool
shells out to it (Lighthouse CI, Playwright runtime, `wrangler`).

Test by removing the `actions/setup-node@v4` step from
`.github/actions/setup-node-env/action.yml`. Saves another ~10s per job.

---

## 6. Replace `commitizen` + AI plugin

`commit-msg` Lefthook hook now enforces commitlint, so commitizen is only
needed if a developer interactively uses `cz`. If no one does, remove:

- `commitizen`
- `@elsikora/commitizen-plugin-commitlint-ai`
- The `config.commitizen` block in `package.json`

---

## 7. Consolidate Vitest configs

Currently four configs:

- `vitest.config.ts`
- `vitest.unit.config.ts`
- `vitest.scripts.config.ts`
- `vitest.server.config.ts`

Vitest 4 supports **workspaces** natively (`vitest.workspace.ts` or
`test.projects` in a single config). Collapsing gives:

- Single `bunx vitest` run for everything
- Shared transform / coverage setup
- Easier navigation in `--ui`

---

## 8. Review `wrangler`

`wrangler` is in `devDependencies`, plus there's a `.wrangler/` cache, a
`functions/` directory, and `scripts/cloudflare/`. Production deploys via
Heroku (`Procfile`). If Cloudflare Pages/Workers is no longer used, this is
dead weight. If used in parallel, leave it alone — just confirm.

---

## 9. Delete `.npmrc`

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

**Remove**

- `puppeteer`, `puppeteer-core`
- `commitizen`, `@elsikora/commitizen-plugin-commitlint-ai`
- `postcss`, `autoprefixer`, `@tailwindcss/postcss`, `postcss.config.mjs`
- `.npmrc`

**Add**

- Bun install-cache step in CI

**Consolidate**

- Four Vitest configs → one workspace

**Verify**

- `wrangler` is still needed
- Node.js can be dropped from CI
