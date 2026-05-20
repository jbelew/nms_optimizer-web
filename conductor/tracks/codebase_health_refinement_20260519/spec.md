# Specification: Codebase Health & Architectural Refinement (CODE_REVIEW.md)

## Overview
Address all issues identified in `docs/CODE_REVIEW.md` (dated 2026-05-19). This track focuses on improving state management hygiene, reducing cross-module coupling, eliminating module-level side effects on the `window` object, and refactoring monolithic modules like `gridStore.ts`. The goal is to reduce long-term maintenance burden and eliminate existing architectural risks.

## Functional Requirements
- **State Management:**
    - Reduce `useStore.getState()` usage in non-test code, favoring subscriptions or event-based communication.
    - Collapse thin, single-flag Zustand stores into a unified `uiStore` or co-locate with relevant features.
    - Narrow `restoreGridState` types to prevent action overwriting.
    - Fix stale closures in `useOptimize` by using `useLatest` or ref-based access.
    - Translate `snake_case` API responses to `camelCase` at the API boundary.
- **Module Refactoring:**
    - Split `gridStore.ts` god module into specialized modules: `gridTypes.ts`, `gridFactories.ts`, `gridPersistence.ts`, and a lean `gridStore.ts`.
    - Split `useGridDeserializer.tsx` into a pure `gridSerializer.ts` and a smaller hook.
    - Clean up `recomputeDerivedState` by removing redundant branches.
- **Environment & Side Effects:**
    - Remove module-level side effects on the `window` object (e.g., `__AppDialog_keep`).
    - Gate E2E-specific `window` exposures strictly behind `import.meta.env.VITE_E2E_TESTING`.
    - Move localStorage migrations and garbage collection out of initializers/getters into idempotent bootstrap tasks.
    - Fix URL search parsing at module initialization.
- **Component Hygiene:**
    - Replace imperative DOM mutations (e.g., `document.body.classList`) with React-controlled state or top-level effects.
    - Optimize named-export lazy loading with a `lazyNamed` helper.
    - Improve `Suspense` fallbacks from `null` to appropriate skeletons or spinners.
    - Resolve vestigial props and incorrect `useMemo`/`useCallback` usage in components like `TechTreeRow`.
    - Refactor `MainAppLayout.tsx` to reduce over-componentization of trivial wrappers.
- **Type Safety & Linting:**
    - Fix \"type smells\" including double casts (`as unknown as`) and global augmentation.
    - Address or document all existing ESLint disables (e.g., `react-hooks/exhaustive-deps`).
    - Fix incorrect nullish coalescing (`??`) on numeric API fields where `0` is a valid value.

## Non-Functional Requirements
- **Performance:** Ensure no regressions in bundle size or TBT; ideally improve bundle size by fixing tree-shaking issues.
- **Maintainability:** Significantly reduce the size and complexity of core store modules.
- **Reliability:** Eliminate potential race conditions in optimization and state restoration.

## Acceptance Criteria
- [ ] All 26 items in `docs/CODE_REVIEW.md` are addressed or explicitly mitigated with justification.
- [ ] `gridStore.ts` is refactored into smaller, single-responsibility files.
- [ ] `window` object is free of production-leaked globals (verify via browser console in production build).
- [ ] Optimization logic handles rapid user interactions without stale state errors.
- [ ] The app boots correctly with no console errors or warnings related to migrations.
- [ ] Full test suite passes (Unit, Integration, E2E).
- [ ] `npm run build` succeeds and produces an optimized bundle.

## Out of Scope
- Complete rewrite of the optimization algorithm (unless required to fix stale closures).
- Introduction of a new state management library (e.g., Redux, Recoil).
- Design or UI changes not required for accessibility or fallback improvements.
