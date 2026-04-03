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

<!-- BEGIN BEADS INTEGRATION -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update <id> --claim --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Use `bd dolt push`/`bd dolt pull` for remote sync
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
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
Use 'bd' for task tracking
