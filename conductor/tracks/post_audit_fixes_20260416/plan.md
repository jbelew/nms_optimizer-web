# Implementation Plan: post_audit_fixes_20260416

## Phase 1: Core Logic & Stability
- [x] Task: Implementation - Refactor `useOptimize` recursive retry logic for testability
- [x] Task: Test - Write unit tests for `useOptimize` (Retry limits, backoff, recovery)
- [x] Task: Implementation - Centralize `techTree` module-map extraction into `src/utils/techTreeUtils.ts`
- [x] Task: Implementation - Update `useRecommendedBuild`, `useGridDeserializer`, and `useTechTree` to use the new utility
- [x] Task: Conductor - User Manual Verification 'Core Logic & Stability' (Protocol in workflow.md)

## Phase 2: Testing Infrastructure
- [x] Task: Test - Implement unit tests for `src/utils/storage.ts`
- [x] Task: Test - Implement unit tests for `src/utils/buildFileValidation.ts`
- [x] Task: Test - Enhance Playwright `recommended-build.test.ts` with state verification
- [x] Task: Conductor - User Manual Verification 'Testing Infrastructure' (Protocol in workflow.md)

## Phase 3: UI & A11y Polish
- [x] Task: Implementation - Update `AppHeader.tsx` logo to `alt=""`
- [/] Task: Implementation - Audit and fix empty cell icon contrast (Skipped: Preserve game-accurate styling)
- [x] Task: Conductor - User Manual Verification 'UI & A11y Polish' (Protocol in workflow.md)
