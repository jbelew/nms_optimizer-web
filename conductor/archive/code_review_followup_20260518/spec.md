# Specification: Code Review Follow-up Pass

## Overview
This track addresses all remaining technical debt, partially resolved items, and new issues identified in the `docs/CODE_REVIEW_FOLLOWUP.md` report. The goal is to bring the codebase into full alignment with project standards (PascalCase naming, store decoupling, performance best practices) and fix logic smells introduced during the recent refactor.

## Functional Requirements
- **Store Refactoring**: 
    - Convert whole-store destructuring to per-field selectors in `App.tsx` and `errorDialog.tsx` (N1).
    - Refactor `OptimizeStore` state to a discriminated union to eliminate boolean-bag coordination (N4).
    - Remove zero-arg getters from `gridStore` and mark cache fields as private (N5, N6).
    - Decouple `techStore` from `moduleSelectionStore` by moving initialization logic to `sessionCoordinator` (P3).
    - Finalize `gridStore` decoupling by moving the `partialize` platform check (NEW11).
- **Bug Fixes & Logic Improvements**:
    - Replace scientific-notation rounding hack in `computeBonusStatus` with a reliable multiplicative form (NEW5).
    - Fix potential regression in `switchPlatform` by ensuring `result` is reset (NEW6).
    - Consolidate language derivation from a single dynamic source, removing `OTHER_LANGUAGES` hardcoded list (N2).
    - Replace 7-clause `||` chain in `dialogContext` with a `Set` or shared helper (N3).
    - Correct `Seo` component issues: hoist `normalizePath`, fix over-inclusive `useMemo` dependencies, and move constants to module scope (NEW7, NEW8, NEW9).
- **Cleanup**:
    - Remove dead `AppDialog` lazy import (NEW1) and unused store imports in `gridStore.ts` (NEW2).
    - Delete dead `version` field in `gridStore` (NEW10).
    - Eliminate duplicated `requestIdleCallback` polyfills in favor of `useIdleMount` or a shared `runWhenIdle` utility (P1, P2).

## Non-Functional Requirements
- **Naming Conventions**: Rename all identified components (N11) to PascalCase to comply with `AGENTS.md`.
- **Magic Numbers**: Extract all identified magic numbers (N9) to `constants.ts` or appropriate module-level constants.
- **Performance**: Reduce unnecessary re-renders in `<App>` and `<GridCell>` by fixing selectors and memoizing string operations (N1, N10).
- **Documentation**: Document the reasoning for mixed snake_case/camelCase in `Cell` fields if they remain (N12).

## Acceptance Criteria
- [ ] No raw `console.*` calls in production source (verified previously, must maintain).
- [ ] All identified component files renamed to PascalCase.
- [ ] `useOptimizeStore` state refactored to a discriminated union.
- [ ] `gridStore` is fully decoupled from other stores.
- [ ] `App.tsx` re-renders are minimized through specific selectors.
- [ ] Unit tests for `PerformanceUtils.ts` (N13) or at least a plan for them.
- [ ] `sessionCoordinator` usage is audited to prevent it from becoming a god object (NEW3).

## Out of Scope
- Large-scale architectural changes beyond the stores identified.
- UI/UX redesigns.
