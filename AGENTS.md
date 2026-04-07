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

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
