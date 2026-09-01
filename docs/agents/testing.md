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
