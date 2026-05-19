# Implementation Plan: Codebase Health & Architectural Refinement

This plan addresses the technical debt and anti-patterns identified in `docs/CODE_REVIEW.md`.

## Phase 1: Environment & Side Effects
- [x] Task 1.1: Fix `AppDialog` tree-shaking and remove `__AppDialog_keep` from `App.tsx`. 9b06514
- [ ] Task 1.2: Move localStorage cleanup and migrations from `gridStore` and `dialogContext` to a bootstrap utility.
- [ ] Task 1.3: Refactor `isSharedGrid` to be set during app initialization rather than module evaluation.
- [ ] Task 1.4: Gate E2E `window` exposures strictly behind `import.meta.env.VITE_E2E_TESTING`.
- [ ] Task: Conductor - User Manual Verification 'Environment & Side Effects' (Protocol in workflow.md)

## Phase 2: Store Refactoring & Consolidation
- [ ] Task 2.1: Split `gridStore.ts` god module into `gridTypes.ts`, `gridFactories.ts`, `gridPersistence.ts`, and `gridStore.ts`.
- [ ] Task 2.2: Split `useGridDeserializer.tsx` into `gridSerializer.ts` and a lean hook.
- [ ] Task 2.3: Collapse thin stores (`shakeStore`, `themeStore`, `techTreeLoadingStore`, `moduleSelectionDialogStore`) into a unified `uiStore`.
- [ ] Task 2.4: Narrow `restoreGridState` argument type to prevent action overwriting.
- [ ] Task: Conductor - User Manual Verification 'Store Refactoring & Consolidation' (Protocol in workflow.md)

## Phase 3: Logic & Hygiene Improvements
- [ ] Task 3.1: Reduce `useStore.getState()` usage in hooks, replacing with selectors or event subscriptions.
- [ ] Task 3.2: Refactor `useOptimize` with `useLatest` and `useCallback` to prevent stale closure bugs.
- [ ] Task 3.3: Implement `snake_case` to `camelCase` translation at the API boundary.
- [ ] Task 3.4: Fix nullish coalescing (`??`) bugs on numeric API fields (stats).
- [ ] Task 3.5: Clean up `recomputeDerivedState` dead branches and redundant guards.
- [ ] Task: Conductor - User Manual Verification 'Logic & Hygiene Improvements' (Protocol in workflow.md)

## Phase 4: Component & Type Hygiene
- [ ] Task 4.1: Replace imperative `document.body` class mutations with React-controlled state.
- [ ] Task 4.2: Implement `lazyNamed` helper and improve `Suspense` fallbacks from `null`.
- [ ] Task 4.3: Audit and resolve vestigial props and incorrect `useMemo`/`useCallback` in `TechTreeRow`.
- [ ] Task 4.4: Inline trivial wrappers in `MainAppLayout.tsx`.
- [ ] Task 4.5: Fix type smells (double casts, global augmentations) and audit ESLint disables.
- [ ] Task: Conductor - User Manual Verification 'Component & Type Hygiene' (Protocol in workflow.md)

## Phase 5: Verification & Validation
- [ ] Task 5.1: Run full unit and integration test suites.
- [ ] Task 5.2: Execute E2E tests in local CI mode.
- [ ] Task 5.3: Verify production build and check for leaked globals.
- [ ] Task: Conductor - User Manual Verification 'Verification & Validation' (Protocol in workflow.md)
