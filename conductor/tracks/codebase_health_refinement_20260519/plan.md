# Implementation Plan: Codebase Health & Architectural Refinement (Final Pass)

This plan addresses the technical debt, anti-patterns, and React 19 / Compiler optimizations identified in the final deep code review.

## Phase 1: Environment & Side Effects
- [x] Task 1.1: Fix `AppDialog` tree-shaking and remove `__AppDialog_keep` from `App.tsx`. 9b06514
- [ ] Task 1.2: Move localStorage cleanup and migrations from `gridStore` and `dialogContext` to a bootstrap utility.
- [ ] Task 1.3: Refactor `isSharedGrid` to be set during app initialization rather than module evaluation.
- [ ] Task 1.4: Gate E2E `window` exposures strictly behind `import.meta.env.VITE_E2E_TESTING`.
- [ ] Task 1.5: Fix `document.body` class mutation in `AppHeader.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Environment & Side Effects'

## Phase 2: Store Refactoring & Consolidation
- [ ] Task 2.1: Split `gridStore.ts` god module into `gridTypes.ts`, `gridFactories.ts`, `gridPersistence.ts`, and `gridStore.ts`. (Partially completed)
- [ ] Task 2.2: Refactor `TechState` to use `camelCase` for `max_bonus`, `solve_method`, and `solved_bonus`.
- [ ] Task 2.3: Collapse thin stores (`shakeStore`, `themeStore`, `techTreeLoadingStore`, `moduleSelectionDialogStore`) into a unified `uiStore`.
- [ ] Task 2.4: Narrow `restoreGridState` argument type to prevent action overwriting.
- [ ] Task 2.5: Remove redundant type checks in `gridStore.ts`.
- [ ] Task: Conductor - User Manual Verification 'Store Refactoring & Consolidation'

## Phase 3: Logic & Hygiene Improvements
- [ ] Task 3.1: Reduce `useStore.getState()` usage in hooks, replacing with selectors or event subscriptions.
- [ ] Task 3.2: Refactor `useOptimize` with `useLatest` and `useCallback` to prevent stale closure bugs. (Partially completed)
- [ ] Task 3.3: Implement `snake_case` to `camelCase` translation at the API boundary.
- [ ] Task 3.4: Fix nullish coalescing (`??`) bugs on numeric API fields (stats).
- [ ] Task 3.5: Inline trivial proxy hooks in `useMainAppContext.ts`.
- [ ] Task: Conductor - User Manual Verification 'Logic & Hygiene Improvements'

## Phase 4: Component & JSDoc Hygiene
- [ ] Task 4.1: Replace generic `Suspense fallback={null}` with more descriptive skeletons.
- [ ] Task 4.2: Audit and remove redundant `useMemo`/`useCallback` (React 19 Compiler).
- [ ] Task 4.3: Audit and resolve vestigial props in `TechTreeRow`.
- [ ] Task 4.4: Full JSDoc audit using `agentic-jsdoc` skill.
- [ ] Task 4.5: Add `global.d.ts` for window augmentation.
- [ ] Task: Conductor - User Manual Verification 'Component & Type Hygiene'

## Phase 5: Verification & Validation
- [ ] Task 5.1: Run full unit and integration test suites.
- [ ] Task 5.2: Execute E2E tests in local CI mode.
- [ ] Task 5.3: Verify production build and check for leaked globals.
- [ ] Task: Conductor - User Manual Verification 'Verification & Validation'
