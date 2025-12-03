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
- **Lint**: `npm run lint` and `npm run lint:fix`
- **Format**: `npm run format` (Prettier, src/ only)
- **Type check**: `npm run typecheck`

## Architecture

**Frontend**: React 19 + TypeScript + Zustand state management + React Router v7  
**Build**: Vite with PWA support, compression (gzip/brotli), and automatic code splitting  
**UI**: Radix UI + Tailwind CSS + Radix Colors  
**i18n**: i18next with translations via Crowdin  
**Server**: Node.js/Express (server/ directory) serves SSG + runtime assets  
**API**: External NMS Optimizer service (Python backend)  

**Key directories**:
- `src/`: React components, hooks, stores, utilities
- `src/components/`: Reusable UI components
- `src/store/`: Zustand stores (state management)
- `src/hooks/`: Custom React hooks
- `src/utils/`: Shared utilities
- `server/`: Express app for production serving
- `e2e-tests/`: Playwright tests

## Code Style

**Imports**: Types first → React/react-dom → Third-party → Internal (@/) → Relative (./). Use sort-imports plugin.  
**Formatting**: Tabs, 100 char line width, trailing commas (es5), double quotes, no semicolons omitted, arrow parens always.  
**Types**: Strict TypeScript, no any. Interfaces for React components; use discriminated unions for variants.  
**Naming**: camelCase files/vars, PascalCase components/types, UPPER_SNAKE_CASE constants.  
**React**: Functional components, hooks, avoid export components with state (react-refresh rule).  
**Testing**: Vitest + React Testing Library. Mock external dependencies (i18next, API calls). Use `vi.mock()` for modules.  
**Error handling**: Use try-catch in hooks, pass error state via context/store, display user-friendly toast messages.

## Prop Drilling Patterns

**Colocated Hook Pattern**: Use custom hooks to derive state in child components instead of passing calculated props through intermediate layers. This pattern is applied across:
- `TechTreeRow` hierarchy (uses `useTechTreeRow`)
- `GridRow` hierarchy (uses `useGridRowState`)
- `ModuleSelectionDialog` (uses `useModuleSelectionContext` pattern)

**When NOT to refactor**: Keep prop forwarding for minimal props (1-2), leaf components, Suspense boundaries, and prop decomposition patterns. See `PROP_DRILLING_REFACTORING.md` for detailed guidance on when to apply colocated hooks vs. other patterns.

**Documentation**: 
- `PROP_DRILLING_REFACTORING.md` - Implementation details, patterns applied, and best practices
- `PROP_DRILLING_OPPORTUNITIES.md` - Analysis of prop drilling opportunities and assessment of each hierarchy
