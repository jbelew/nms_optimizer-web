# Architecture Guidelines

Guidelines and technical decisions regarding the system architecture of the NMS Optimizer Web codebase.

## Tech Stack

- **Frontend**: React 19 + TypeScript 6.0+ + Zustand (state management) + React Router v7
- **Compiler**: React Compiler enabled via Babel/Rolldown
- **Build**: Vite 8 with PWA support, build-time SSG, and automatic code splitting
- **UI**: Radix UI + Tailwind CSS v4 + Radix Colors + Lightning CSS (for minification/transpilation)
- **i18n**: i18next with translations via Crowdin
- **Edge Runtime**: Cloudflare Pages static CDN + Pages Functions ([`functions/[[path]].js`](file:///home/jbelew/projects/nms_optimizer-web/functions/[[path]].js)) + Cloudflare Zone Transform & Cache Rules
- **API**: External NMS Optimizer service (Python backend)

## Hybrid Rendering Flow

- **SSG (Build Time)**: [`scripts/generate-ssg.mjs`](file:///home/jbelew/projects/nms_optimizer-web/scripts/generate-ssg.mjs) pre-renders localized markdown files, navigation links, structured metadata into **Static SEO Fallback** blocks (`.ssg-fallback`), and standalone `index.md` **Agent Markdown Documents** across all 42 localized public routes.
- **Client Runtime**: When the React application boots, `lifecycleCoordinator.ts` removes `.ssg-fallback` and `#ssg-fallback-styles` on `READY`, and **Routed Dialogs** render markdown via `LazyReactMarkdown` from the lazy `virtual:markdown-bundle` chunk.
- **Verification**: Run `bun run build`, `bun run verify:routes`, and `bun run verify:ssg` (or `bun run serve:ssg` for local static inspection). `bun run dev` bypasses pre-rendering.

## Cloudflare Pages & Edge Rules

- **Token Separation**:
    - `CLOUDFLARE_API_TOKEN`: Scoped to Zone Cache Purge only (used by GitHub Actions post-deploy cache purge).
    - `CLOUDFLARE_PAGES_TOKEN`: Scoped to Cloudflare Pages deployments (`wrangler pages deploy dist`).
    - `CLOUDFLARE_ZONE_API_TOKEN`: Scoped to `Zone -> Transform Rules -> Edit` and `Zone -> Cache Rules -> Edit` for provisioning Zone Rulesets via `bun run provision:cloudflare` ([`scripts/provision-cloudflare-zone.mjs`](file:///home/jbelew/projects/nms_optimizer-web/scripts/provision-cloudflare-zone.mjs), supports `--dry-run`).
- **Local `workerd` Verification (Wrangler)**:
    - After `bun run build`, run `bunx wrangler pages dev dist --ip 127.0.0.1 --port 8788` to test `dist/_headers`, `dist/_routes.json`, and [`functions/[[path]].js`](file:///home/jbelew/projects/nms_optimizer-web/functions/[[path]].js) on Cloudflare's `workerd` runtime.
    - Zone `http_request_transform` rules execute upstream of Pages in production; when probing negotiated **Agent Markdown Documents** against local `wrangler pages dev`, request `/__md/<route>/` directly with `-H "Accept: text/markdown"`.
- **Cloudflare Free-Tier Ruleset Invariants**:
    - **Wirefilter Header Arrays**: `lower(http.request.headers["accept"][*])` returns an array of strings and requires a second `[*]` index inside `any(...)`: `any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")`.
    - **URI-Only Cache Keys**: Free-tier CDN cache keys ignore `Accept`. Keep all 42 SSG HTML routes excluded in [`public/_routes.json`](file:///home/jbelew/projects/nms_optimizer-web/public/_routes.json) and isolate negotiated Markdown onto `/__md/*` via `http_request_transform` (see [`docs/adr/0004-agent-markdown-content-negotiation.md`](file:///home/jbelew/projects/nms_optimizer-web/docs/adr/0004-agent-markdown-content-negotiation.md)).
    - **Last-Match-Wins Cache Rules**: Cloudflare evaluates _all_ matching rules in `http_request_cache_settings` top-to-bottom. Place `cache: false` bypass rules at the **end** of the ruleset so earlier `cache: true` prefix rules cannot override them.

## Bundle Strategy

- **Code Splitting**: `vite.config.ts` uses Rolldown's `codeSplitting.groups` to group tracking-related libraries (`vendor-telemetry` for GA4, and a generic `build/chunk-[hash].js` group for Sentry that avoids `monitoring` or `sentry` in the filename) to improve resilience against strict ad-blockers and iOS content filters. **Preserve this chunking structure.**
- **Dynamic Import Tree-Shaking (`recharts`)**: Rolldown's static AST scanner only tree-shakes dynamic imports against barrel libraries when `await import("...")` is immediately destructured via an `ObjectPattern` (`const { Cell, Pie, ... } = await import("recharts")` in `UserStatsDialog.tsx`). Assigning the module namespace to an intermediate variable (`const mod = await import("recharts")`) disables tree-shaking and inflates `vendor-charts` by ~146 KB.
- **Mode Environment Resolution under Bun**: Bun automatically preloads `.env.development` into `process.env` whenever `NODE_ENV` is not `"production"` or `"test"` (affecting custom Vite modes like `--mode docker` and `--mode e2e`). `vite.config.ts` calls `resolveModeEnv(mode, process.cwd())` from [`scripts/resolve-mode-env.mjs`](file:///home/jbelew/projects/nms_optimizer-web/scripts/resolve-mode-env.mjs) so `.env.development` and empty CI secret strings never shadow `.env.<mode>`.

## Directory Structure

- [`src/`](file:///home/jbelew/projects/nms_optimizer-web/src/): React components, hooks, stores, utilities
- [`functions/`](file:///home/jbelew/projects/nms_optimizer-web/functions/): Cloudflare Pages Functions edge routing, canonical redirects, and `Accept: text/markdown` negotiation
- [`shared/`](file:///home/jbelew/projects/nms_optimizer-web/shared/): Isomorphic route, locale, and SEO metadata shared across client, SSG scripts, and Pages Functions
- [`scripts/`](file:///home/jbelew/projects/nms_optimizer-web/scripts/): Build-time SSG, Cloudflare provisioning, deployment verification, and performance checks
- [`e2e-tests/`](file:///home/jbelew/projects/nms_optimizer-web/e2e-tests/): Playwright tests (Required CI release gate; see [`docs/agents/testing.md`](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/testing.md))
