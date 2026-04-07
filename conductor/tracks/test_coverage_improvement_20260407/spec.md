# Specification: Improving Test Coverage & App Stability

## Overview
This track aims to improve the overall stability and reliability of the No Man's Sky Technology Layout Optimizer by increasing test coverage for critical core modules. We will focus on Utilities and React Hooks that currently have 0% or low coverage.

## Functional Requirements
1.  **Increase Test Coverage**: Achieve >80% coverage for the following modules:
    -   **Utilities**: `apiPreload.ts`, `fetchWithTimeout.ts`, `filenameValidation.ts`, `hashUtils.ts`, `isTouchDevice.ts`, `socketManager.ts`.
    -   **React Hooks**: `useErrorDispatcher.ts`, `useCell.ts`, `useDebouncedValidation.ts`, `useUrlValidation.ts`.
    -   **Stores**: `ErrorStore.ts`, `SessionStore.ts`.
2.  **High-Quality Tests**:
    -   Use `vitest` for unit and integration tests.
    -   Mock external dependencies (e.g., `fetch`, `localStorage`, `navigator`, `Zustand` stores).
    -   Cover edge cases, error states, and boundary conditions.
    -   Ensure tests are non-flaky and performant.

## Non-Functional Requirements
-   **Stability**: Ensure that increasing coverage does not introduce regressions.
-   **Maintainability**: Test code should be clean, documented with JSDoc, and follow project patterns.

## Acceptance Criteria
-   All targeted modules have >80% line and branch coverage.
-   The full test suite passes (`npm test`).
-   New test files follow the `<filename>.test.ts` or `<filename>.test.tsx` naming convention.

## Out of Scope
-   End-to-End tests (Playwright).
-   UI Component testing (Storybook/Interaction tests).
-   Coverage for `main.tsx` or purely configuration files.
