# Plan: Fix localStorage SecurityError in Safari Private Browsing

## Objective
Prevent `SecurityError` (DOM Exception 18) in Safari Private Browsing by ensuring all `localStorage` access is wrapped in `try-catch` blocks, primarily by using the existing `src/utils/storage.ts` utilities.

## Key Files & Context
- `src/context/DialogContext.tsx`: Initialized state using `localStorage` directly in `useState`.
- `src/store/GridStore.ts`: Enumerated `localStorage` keys directly.
- `src/components/InstallPrompt/InstallPrompt.tsx`: Accessed `localStorage` directly in `useRef` and `useEffect`.
- `src/utils/storage.ts`: Contains `safeGetItem`, `safeSetItem`, etc.

## Background & Motivation
In Safari Private Browsing, `window.localStorage` exists but throws a `SecurityError` whenever any of its methods or properties are accessed. Direct access in React component initialization or effects causes the entire application to crash.

## Proposed Solution
Refactor all direct `localStorage` access in production code to use the safe wrappers provided in `src/utils/storage.ts`. These wrappers gracefully handle `SecurityError` and return `null` or a default value instead of crashing.

## Implementation Steps
1.  **Refactor `DialogContext.tsx`**: Replace direct `localStorage` calls with `safeGetItem`, `safeSetItem`, and `safeRemoveItem`.
2.  **Refactor `GridStore.ts`**: Wrap key enumeration in a `try-catch` block.
3.  **Refactor `InstallPrompt.tsx`**: Replace direct `localStorage` calls with safe utilities.
4.  **Audit other stores**: Ensure `A11yStore`, `PlatformStore`, `ModuleSelectionStore`, and `TechBonusStore` are already using safe utilities (Verified: they are).
5.  **Audit analytics**: Ensure `analyticsClient.ts` is using safe utilities (Verified: it is).

## Verification & Testing
- **Unit Tests**: Run existing tests for modified components to ensure functionality remains unchanged in standard environments.
- **Manual Verification**: Verify that the application loads without errors in environments where `localStorage` is restricted (simulated via Safari Private Browsing or by disabling cookies).

## Rollback Strategy
- Revert changes via git. The logic is identical but wrapped in safety blocks, so regressions are unlikely.
