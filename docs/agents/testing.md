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
