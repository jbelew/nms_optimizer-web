# Implementation Plan: Code Review Follow-up Pass

Addressing technical debt and newly exposed issues from the `docs/CODE_REVIEW_FOLLOWUP.md` report.

## Phase 1: Cleanup & Low-Hanging Fruit <!-- execution: parallel --> <!-- depends: -->
Focus on removing dead code and unused imports to clarify the dependency graph.

- [x] **Task 1: Cleanup - Remove dead `AppDialog` lazy import (NEW1)** <!-- files: src/App.tsx --> ab79a3c
  - Remove `lazy(() => import("./components/AppDialog/Base/AppDialog"))` from `App.tsx`.
  - Remove the corresponding `eslint-disable` comment.
- [x] **Task 2: Cleanup - Remove unused store imports in `gridStore.ts` (NEW2)** <!-- files: src/store/grid/gridStore.ts --> e66055d
  - Delete unused imports for `useModuleSelectionStore`, `useTechBonusStore`, and `useTechStore`.
- [x] **Task 3: Cleanup - Remove dead `version` field in `gridStore` (NEW10)** <!-- files: src/store/grid/gridStore.ts --> e66055d
  - Remove `version: 1` from `GridStore` type and initial state.
  - Remove `version: 1` from `persist` configuration in `gridStore.ts`.
- [x] **Task 4: Cleanup - Consolidate idle execution (P1, P2)** <!-- files: src/main.tsx, src/store/grid/gridStore.ts, src/utils/system/idle.ts --> be9664a
  - Extract `requestIdleCallback` polyfill to a shared utility `runWhenIdle(fn, { timeout })` in `src/utils/system/idle.ts`.
  - Migrate `main.tsx` and `gridStore.ts` cleanup logic to use this utility.
- [x] **Task 5: Conductor - User Manual Verification 'Phase 1: Cleanup & Low-Hanging Fruit' (Protocol in workflow.md)** fe10760

## Phase 2: Logic Improvements & Bug Fixes <!-- execution: parallel --> <!-- depends: -->
Fixing rounding issues, potential regressions, and brittle logic.

- [x] **Task 1: Fix - Replace scientific-notation rounding in `computeBonusStatus` (NEW5)** <!-- files: src/store/sessionCoordinator.ts, src/store/sessionCoordinator.test.ts --> 290018c
  - Replace scientific-notation hack with `Math.round(val * 100) / 100` or similar reliable method.
  - Add unit tests in `sessionCoordinator.test.ts`.
- [x] **Task 2: Fix - Ensure `switchPlatform` resets `result` (NEW6)** <!-- files: src/store/sessionCoordinator.ts, src/store/sessionCoordinator.test.ts --> e07ff8b
  - Add `setResult(null)` to `switchPlatform` in `sessionCoordinator.ts` or `gridStore.ts` to prevent stale optimization results.
- [x] **Task 3: Refactor - Consolidate Language Derivation (N2)** <!-- files: src/hooks/useSupportedLanguages.ts, src/context/dialogContext.tsx, src/components/Seo/Seo.tsx, src/hooks/useSeoAndTitle/useSeoAndTitle.ts, src/hooks/useLanguage.ts --> a5ddb97
  - Extract `useSupportedLanguages` hook or a shared utility to derive the language list dynamically from `i18n.services.resourceStore.data`.
  - Update `dialogContext.tsx`, `Seo.tsx`, `useSeoAndTitle.ts`, and `useLanguage.ts` to use this single source of truth.
- [x] **Task 4: Refactor - Optimize `dialogContext` type matching (N3)** <!-- files: src/context/dialogContext.tsx --> 44cf826
  - Replace the 7-clause `||` chain with a `Set<DialogType>` lookup.
- [x] **Task 5: Refactor - Improve `Seo` component structure (NEW7, NEW8, NEW9)** <!-- files: src/components/Seo/Seo.tsx --> 7af5edc
  - Hoist `normalizePath` to module scope.
  - Memoize `useSupportedLanguages` (or its keys) instead of the entire resource data.
  - Move `baseUrl` and image constants to module scope.
- [~] **Task 6: Conductor - User Manual Verification 'Phase 2: Logic Improvements & Bug Fixes' (Protocol in workflow.md)**


## Phase 3: Store Refactoring & Performance <!-- execution: parallel --> <!-- depends: Phase 1, Phase 2 -->
Deeper structural changes to state management for better performance and decoupling.

- [x] **Task 1: Performance - Convert `useOptimizeStore` to per-field selectors (N1)** <!-- files: src/App.tsx, src/components/AppDialog/Error/errorDialog.tsx --> f241c5c
  - Update `App.tsx` and `errorDialog.tsx` to use `useOptimizeStore((s) => s.showError)` style selectors.
- [x] **Task 2: Refactor - Discriminated Union for `OptimizeStore` (N4)** <!-- files: src/store/app/optimizeStore.ts --> bc7ce2a
  - Refactor `OptimizeStore` to use a `status` field with a discriminated union (idle/solving/error/etc.).
  - Update consumers to handle the new state shape.
- [~] **Task 3: Refactor - Clean up `gridStore` public API (N5, N6)** <!-- files: src/store/grid/gridStore.ts -->
  - Remove zero-arg getters like `isGridFull()` in favor of direct state access or dedicated selectors.
  - Ensure cache fields (starting with `_`) are not part of the public `GridStore` interface.
- [ ] **Task 4: Refactor - Finalize `techStore` and `gridStore` decoupling (P3, NEW11)** <!-- files: src/store/tech/techStore.ts, src/store/grid/gridStore.ts, src/store/sessionCoordinator.ts --> <!-- depends: Task 3 -->
  - Move `techStore` initialization logic that depends on `moduleSelectionStore` into `sessionCoordinator`.
  - Move the `partialize` platform check from `gridStore` to a more appropriate location (e.g., storage adapter or coordinator).
- [ ] **Task 5: Performance - Memoize `GridCell` string operations (N10)** <!-- files: src/components/GridCell/GridCell.tsx -->
  - Memoize `srcSet` and other string operations in `GridCell` or `ModuleContent`.
- [ ] **Task 6: Conductor - User Manual Verification 'Phase 3: Store Refactoring & Performance' (Protocol in workflow.md)**

## Phase 4: Standards & Naming Consistency <!-- depends: Phase 3 -->
Final pass for naming conventions, magic numbers, and documentation.

- [ ] **Task 1: Standards - Extract Magic Numbers (N9)** <!-- files: src/constants.ts, src/components/GridCell/useGridCellInteraction.ts, src/store/grid/gridStore.ts -->
  - Identify and move magic numbers (e.g., 400ms tap threshold, 1000ms debounce, 500ms cleanup) to `src/constants.ts` or appropriate module constants.
- [ ] **Task 2: Standards - PascalCase Renaming (N11)** <!-- files: src/components/LanguageSelector/LanguageSelector.tsx, src/components/MessageSpinner/MessageSpinner.tsx, src/components/MarkdownContentRenderer/MarkdownContentRenderer.tsx, src/context/TooltipContext.tsx, src/context/CreateToastContext.ts, src/components/AppDialog/Error/ErrorDialog.tsx, src/components/UpdatePrompt/UpdatePromptWrapper.tsx, src/components/ShipSelection/ShipSelection.tsx -->
  - Rename identified files to PascalCase.
  - Update all import references.
- [ ] **Task 3: Documentation - `Cell` field naming (N12)** <!-- files: src/types/grid.ts -->
  - Add JSDoc to `Cell` type explaining the mix of snake_case/camelCase (e.g., API compatibility).
- [ ] **Task 4: Testing - Unit tests for `PerformanceUtils.ts` (N13)** <!-- files: src/utils/PerformanceUtils.ts, src/utils/PerformanceUtils.test.ts -->
  - Add unit tests for `PerformanceUtils.ts` to ensure reliability.
- [ ] **Task 5: Conductor - User Manual Verification 'Phase 4: Standards & Naming Consistency' (Protocol in workflow.md)**

