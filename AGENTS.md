# Agent Guidelines

## Build & Test Commands

- **Dev**: `npm run dev` (http://localhost:5173, expects API at http://127.0.0.1:5000)
- **Build**: `npm run build` (production, includes SSG)
- **Test all**: `npm run test` (Vitest unit/component tests with coverage)
- **Test single file**: `npm run test -- src/path/to/file.test.tsx`
- **Test watch**: `npm run test -- --watch`
- **Storybook tests**: `npm run test:storybook` (runs story-based tests with Vitest)
- **Storybook watch**: `npm run test:storybook:watch`
- **Storybook a11y**: `npm run test:storybook:a11y` (accessibility violations via CLI)
- **Lint**: `npm run lint` (ESLint 10) and `npm run lint:fix`
- **Format**: `npm run format` (Prettier, src/ only)
- **Type check**: `npm run typecheck` (TypeScript 5.9+)

## Architecture

**Frontend**: React 19 + TypeScript 5.9 + Zustand state management + React Router v7
**Compiler**: React Compiler enabled via Babel/Rolldown
**Build**: Vite 8 with PWA support, compression (gzip/brotli), and automatic code splitting
**UI**: Radix UI + Tailwind CSS v4 + Radix Colors + Lightning CSS (for minification/transpilation)
**i18n**: i18next with translations via Crowdin
**Server**: Node.js/Express (server/ directory) serves SSG + runtime assets
**API**: External NMS Optimizer service (Python backend)

**Hybrid Rendering Flow**:
- **SSG (Build Time)**: `scripts/generate-ssg.mjs` pre-renders markdown files into static HTML wrapped in `<noscript>` blocks for SEO.
- **Client Fallback**: `MarkdownContentRenderer.tsx` checks for `data-prerendered-markdown` in the DOM. If found, it uses `PrerenderedMarkdownRenderer` to inject the static HTML.
- **Verification**: Use `npm run build` then `npm run serve:ssg` to verify pre-rendered content. `npm run dev` bypasses pre-rendering.

**Bundle Strategy**:
- `vite.config.ts` uses `manualChunks` to group tracking-related libraries (Sentry, GA4) into a neutral `vendor-events` chunk to improve resilience against strict ad-blockers. **Do not rename or break this chunking logic.**

**Key directories**:
- `src/`: React components, hooks, stores, utilities
- `src/components/`: Reusable UI components
- `src/store/`: Zustand stores (state management)
- `src/hooks/`: Custom React hooks
- `src/utils/`: Shared utilities
- `server/`: Express app for production serving
- `e2e-tests/`: Playwright tests (Note: Legacy/Unstable)

## Code Style

**ESLint**: Version 10.x with Flat Config (`eslint.config.js`).
**Imports**: Types first → React/react-dom → Third-party → Internal (@/) → Relative (./). Use sort-imports plugin.
**Formatting**: Tabs, 100 char line width, trailing commas (es5), double quotes, no semicolons omitted, arrow parens always.
**Types**: Strict TypeScript, no any. Interfaces for React components; use discriminated unions for variants.
**Naming**: camelCase files/vars, PascalCase components/types, UPPER_SNAKE_CASE constants.

**Zustand & Immer**:
Always use the `immer` middleware. Updates should use the functional `set` pattern for deep mutation safety:
```typescript
set((state) => {
  state.nested.property = newValue; // Safe via Immer
});
```

**Tailwind v4**:
Configuration is **CSS-first**. Update theme variables (colors, spacing, fonts) in `src/index.css` under the `:root` or `@layer theme` blocks. Avoid adding a `tailwind.config.js` unless explicitly required for legacy plugin support.

**React**:
Functional components, hooks. Prefer `useLayoutEffect` only when DOM measurements are needed before paint, otherwise use `useEffect` (with `setTimeout` for state updates if "cascading renders" warnings occur in ESLint 10).

**Testing**:
Vitest + React Testing Library. Mock external dependencies (i18next, API calls). Use `vi.mock()` for modules. Avoid console logs in tests to prevent RPC teardown errors.

**Error handling**:
Use try-catch in hooks, pass error state via context/store, display user-friendly toast messages.

## Prop Drilling Patterns

**Colocated Hook Pattern**: Use custom hooks to derive state in child components instead of passing calculated props through intermediate layers. This pattern is applied across:
- `TechTreeRow` hierarchy (uses `useTechTreeRow`)
- `GridRow` hierarchy (uses `useGridRowState`)
- `ModuleSelectionDialog` (uses `useModuleSelectionContext` pattern)

## Project-Specific Memories & Preferences

- **CRITICAL: iOS Safari rendering failures**. Never add GPU acceleration properties (`translateZ(0)`, `translate3d()`, `will-change`, `contain: layout`, etc.) to this project without verified performance problems and real iOS device testing. Simple, clean CSS with explicit image dimensions works better.
- **Storybook Builds**: Storybook builds were failing due to a large file exceeding the service worker's cache limit. The fix involved increasing `maximumFileSizeToCacheInBytes` in `vite.config.ts` and conditionally disabling the `generate-version-json` plugin during Storybook builds.
- **SEO**: Do not shorten the meta description in `index.html`.
- **Commits**: Follow the Angular convention for commit messages (enforced by Commitlint).
