# Specification: Post-Audit Fixes & Stability Improvements

## Overview
Implement all findings from the `app_final_review_20260416` audit to resolve identified bugs, improve code maintainability through logic centralization, and enhance overall test coverage and reliability.

## Functional Requirements
1. **WebSocket Stability (useOptimize):**
   - Refactor recursive retry logic for clarity and testability.
   - Implement unit tests covering retry limits, exponential backoff, error propagation, and successful recovery.
2. **Logic Centralization (TechTree):**
   - Create a shared utility/selector for extracting the `modulesMap` from the `techTree`.
   - Update `useRecommendedBuild`, `useGridDeserializer`, and `useTechTree` to use this shared utility.
3. **Enhanced E2E Testing:**
   - Update `recommended-build.test.ts` to verify grid state (module counts and positions) after applying a build.
4. **UI Cleanup & A11y Polish:**
   - Set logo `alt=""` in `AppHeader.tsx`.
   - Verify and adjust contrast for empty cell icons in "A11y Mode".
5. **Utility Coverage:**
   - Add unit tests for `src/utils/storage.ts` and `src/utils/buildFileValidation.ts`.

## Acceptance Criteria
- [ ] `useOptimize` retry recursion is fully unit-tested with 100% path coverage.
- [ ] `techTree` module-map logic is centralized and used across all relevant hooks.
- [ ] Playwright tests for recommended builds include functional state verification.
- [ ] `AppHeader` logo is marked as decorative for screen readers.
- [ ] `storage.ts` and `buildFileValidation.ts` have >80% unit test coverage.
