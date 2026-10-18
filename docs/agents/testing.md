# Testing Guidelines

Best practices for unit, component, and integration tests in the NMS Optimizer Web project.

## Test Environment

- **Framework**: Vitest + React Testing Library (configured in [`vitest.config.ts`](file:///home/jbelew/projects/nms_optimizer-web/vitest.config.ts)).

## Testing Conventions

- **Mocking**: Mock external dependencies (such as `i18next` and API calls). Use `vi.mock()` for module-level mocks.
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

- **Refactor Baseline & Validation Gate**:
    - Before starting a significant UI, layout, routing, or bundle refactor, build the production bundle (`bun run build`), start the preview server (`bun run preview -- --host 127.0.0.1 --port 4173`), and capture a baseline Lighthouse / Web Vitals audit (desktop and mobile) in Chrome.
    - Upon completing the refactor, rebuild (`bun run build`), purge the preview Service Worker and Cache Storage, and run a validation Lighthouse audit to confirm zero regressions in Performance score, CLS (`0`), LCP, and TBT before committing. Only stop the preview server after validation completes.
- **Connecting `chrome-devtools-mcp` (`browser` subagent) to Windows Chrome in WSL2**:
    - `chrome-devtools-mcp` (`--autoConnect`) reads `/home/jbelew/.config/google-chrome/DevToolsActivePort` on Linux, whereas Windows Chrome writes `/mnt/c/Users/John Belew/AppData/Local/Google/Chrome/User Data/DevToolsActivePort`.
    - Copy the file as a regular file before invoking the `browser` subagent (a symlink is rejected by `chrome-devtools-mcp`):
        ```bash
        mkdir -p ~/.config/google-chrome && cp "/mnt/c/Users/John Belew/AppData/Local/Google/Chrome/User Data/DevToolsActivePort" ~/.config/google-chrome/DevToolsActivePort
        ```
- **Purging Service Worker & Cache Storage Between Rebuilds**:
    - `http://127.0.0.1:4173/` registers a Workbox Service Worker (`workbox-precache-v2`). After any `bun run build`, unregister all Service Workers (`navigator.serviceWorker.getRegistrations()`) and delete all `caches.keys()` in the preview tab before reloading so Chrome audits the fresh bundle rather than precached assets.
