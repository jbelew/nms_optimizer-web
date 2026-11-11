# Testing Guidelines

Best practices for unit, component, and integration tests in the NMS Optimizer Web project.

## Test Environment

- **Application Tests (`src/`)**: Vitest + React Testing Library (configured in [`vitest.config.ts`](file:///home/jbelew/projects/nms_optimizer-web/vitest.config.ts)).
- **Build & Utility Script Tests (`scripts/*.test.mjs`)**: Bun test runner (`bun run test:scripts` using `bun:test`).

## Testing Conventions

- **Mocking**: Mock external dependencies (`@/i18n/i18n`, `virtual:markdown-bundle`, and `virtual:pwa-register` are already stubbed globally for unit tests in [`vitest.setup.ts`](file:///home/jbelew/projects/nms_optimizer-web/vitest.setup.ts)). Use `vi.mock()` for module-level mocks and `vi.mocked(fn)` or typed `vi.fn<...>()` for mock access (casting with `as Mock` is disallowed by ESLint). For partial `vi.mock` overrides, declare a top-level `import type * as Mod from "..."` and type `importOriginal<typeof Mod>()` to satisfy `@typescript-eslint/consistent-type-imports`. For partial test fixtures, narrow parameter types with `Pick<T, ...>` or typed factory helpers (or install `@total-typescript/shoehorn` per [`.agents/skills/migrate-to-shoehorn/SKILL.md`](../../.agents/skills/migrate-to-shoehorn/SKILL.md) when migrating suites).
- **Console Logs**: Avoid using console logs in test files to prevent RPC teardown errors during parallel runs.

## Storybook Testing & Builds

- **Storybook Builds**: Storybook builds previously failed due to a large bundle exceeding the service worker cache size.
- **Safeguards**:
    - `maximumFileSizeToCacheInBytes` is set to 5MB in [`vite.config.ts`](file:///home/jbelew/projects/nms_optimizer-web/vite.config.ts) to accommodate large assets.
    - The `generate-version-json` plugin is conditionally disabled during Storybook builds (when `process.env.STORYBOOK_BUILD` is truthy).

## End-to-End (E2E) Testing (Playwright)

- **Execution Policy (CI-First)**: Do **not** run E2E tests locally during routine development or pre-push verification due to execution time. Rely on GitHub CI ([`ci.yml`](file:///home/jbelew/projects/nms_optimizer-web/.github/workflows/ci.yml)) to run the full suite.
- **Local Debugging Only**: Only execute E2E tests locally when actively investigating or diagnosing CI failures:
    - **CI Parity**: Run `bun run test:e2e:ci` to emulate GitHub Actions (builds E2E bundle, runs all browser targets, disables dirty server reuse).
    - **Targeted Specs**: Prefer running single spec files to minimize run time: `bunx playwright test e2e-tests/<spec-file>.spec.ts`.
- **Server & Port 4173 Lifecycle**:
    - Playwright manages its own `webServer` (`bun run preview` on `http://127.0.0.1:4173`).
    - Do not leave background preview servers running when debugging E2E tests to avoid port collisions and testing against stale build artifacts. Ensure port 4173 is free before test runs.

## Live Chrome Debugging & Lighthouse Audits (WSL2)

- **Direct Lighthouse CLI in WSL2**: Prefer `bun run perf:baseline` and `bun run perf:compare` ([`scripts/performance-check.mjs`](file:///home/jbelew/projects/nms_optimizer-web/scripts/performance-check.mjs)). When invoking `lighthouse` directly, always run `unset LOCALAPPDATA APPDATA` and pass an isolated `--user-data-dir=/tmp/lh-profile` so `chrome-launcher` does not create Windows-path folders in the repo root or reuse a cached Workbox Service Worker.
- **Connecting `chrome-devtools-mcp` (`browser` subagent) to Windows Chrome in WSL2**:
    - `chrome-devtools-mcp` (`--autoConnect`) reads `/home/jbelew/.config/google-chrome/DevToolsActivePort` on Linux, whereas Windows Chrome writes `/mnt/c/Users/John Belew/AppData/Local/Google/Chrome/User Data/DevToolsActivePort`.
    - Copy the file as a regular file before invoking the `browser` subagent (a symlink is rejected by `chrome-devtools-mcp`):

        ```bash
        mkdir -p ~/.config/google-chrome && cp "/mnt/c/Users/John Belew/AppData/Local/Google/Chrome/User Data/DevToolsActivePort" ~/.config/google-chrome/DevToolsActivePort
        ```
