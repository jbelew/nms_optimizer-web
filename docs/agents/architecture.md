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
- **SSG (Build Time)**: `scripts/generate-ssg.mjs` pre-renders markdown files into static HTML wrapped in `<noscript>` blocks for SEO.
- **Client Fallback**: `MarkdownContentRenderer.tsx` checks for `data-prerendered-markdown` in the DOM. If found, it uses `PrerenderedMarkdownRenderer` to inject the static HTML.
- **Verification**: Use `bun run build` then `bun run serve:ssg` to verify pre-rendered content. `bun run dev` bypasses pre-rendering.

## Bundle Strategy
- **Code Splitting**: `vite.config.ts` uses Rolldown's `codeSplitting.groups` to group tracking-related libraries (`vendor-telemetry` for GA4, `vendor-monitoring` for Sentry) to improve resilience against strict ad-blockers. **Do not rename or break this chunking logic.**

## Directory Structure
- [`src/`](file:///home/jbelew/projects/nms_optimizer-web/src/): React components, hooks, stores, utilities
- [`src/components/`](file:///home/jbelew/projects/nms_optimizer-web/src/components/): Reusable UI components
- [`src/store/`](file:///home/jbelew/projects/nms_optimizer-web/src/store/): Zustand stores (state management)
- [`src/hooks/`](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/): Custom React hooks
- [`src/utils/`](file:///home/jbelew/projects/nms_optimizer-web/src/utils/): Shared utilities
- [`server/`](file:///home/jbelew/projects/nms_optimizer-web/server/): Express app for production serving
- [`e2e-tests/`](file:///home/jbelew/projects/nms_optimizer-web/e2e-tests/): Playwright tests (Note: Legacy/Unstable)
