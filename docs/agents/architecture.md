# Architecture Guidelines

Guidelines and technical decisions regarding the system architecture of the NMS Optimizer Web codebase.

## Tech Stack

- **Frontend**: React 19 + TypeScript 6.0+ + Zustand (state management) + React Router v7
- **Compiler**: React Compiler enabled via Babel/Rolldown
- **Build**: Vite 8 with PWA support, compression (gzip/brotli), and automatic code splitting
- **UI**: Radix UI + Tailwind CSS v4 + Radix Colors + Lightning CSS (for minification/transpilation)
- **i18n**: i18next with translations via Crowdin
- **Server**: Node.js/Express (`server/` directory) serves SSG + runtime assets
- **API**: External NMS Optimizer service (Python backend)

## Hybrid Rendering Flow

- **SSG (Build Time)**: `scripts/generate-ssg.mjs` pre-renders localized markdown files, navigation links, and structured metadata into Static SEO Fallback blocks (`.ssg-fallback`) across all static route entry points for crawlers and JavaScript-disabled clients.
- **Client Runtime**: When the React application boots, `lifecycleCoordinator.ts` removes `.ssg-fallback` and `#ssg-fallback-styles` on `READY`, and Routed Dialogs render markdown via `LazyReactMarkdown` from the lazy `virtual:markdown-bundle` chunk.
- **Verification**: Use `bun run build` then `bun run serve:ssg` to verify pre-rendered content. `bun run dev` bypasses pre-rendering.

## Bundle Strategy

- **Code Splitting**: `vite.config.ts` uses Rolldown's `codeSplitting.groups` to group tracking-related libraries (`vendor-telemetry` for GA4, and a generic `build/chunk-[hash].js` group for Sentry that avoids `monitoring` or `sentry` in the filename) to improve resilience against strict ad-blockers and iOS content filters. **Do not rename or break this chunking logic.**
- **Dynamic Import Tree-Shaking (`recharts`)**: Rolldown's static AST scanner only tree-shakes dynamic imports against barrel libraries when `await import("...")` is immediately destructured via an `ObjectPattern` (`const { Cell, Pie, ... } = await import("recharts")` in `UserStatsDialog.tsx`). Assigning the module namespace to an intermediate variable (`const mod = await import("recharts")`) disables tree-shaking and inflates `vendor-charts` by ~146 KB.
- **Mode Environment Resolution under Bun**: Bun automatically preloads `.env.development` into `process.env` whenever `NODE_ENV` is not `"production"` or `"test"` (affecting custom Vite modes like `--mode docker` and `--mode e2e`). `vite.config.ts` calls `resolveModeEnv(mode, process.cwd())` from [`scripts/resolve-mode-env.mjs`](file:///home/jbelew/projects/nms_optimizer-web/scripts/resolve-mode-env.mjs) so `.env.development` and empty CI secret strings never shadow `.env.<mode>`.

## Directory Structure

- [`src/`](file:///home/jbelew/projects/nms_optimizer-web/src/): React components, hooks, stores, utilities
- [`src/components/`](file:///home/jbelew/projects/nms_optimizer-web/src/components/): Reusable UI components
- [`src/store/`](file:///home/jbelew/projects/nms_optimizer-web/src/store/): Zustand stores (state management)
- [`src/hooks/`](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/): Custom React hooks
- [`src/utils/`](file:///home/jbelew/projects/nms_optimizer-web/src/utils/): Shared utilities
- [`server/`](file:///home/jbelew/projects/nms_optimizer-web/server/): Express app for production serving
- [`e2e-tests/`](file:///home/jbelew/projects/nms_optimizer-web/e2e-tests/): Playwright tests (Required CI release gate; see [`docs/agents/testing.md`](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/testing.md))
