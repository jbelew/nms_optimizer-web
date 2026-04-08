# Specification: TBT Optimization (Landing Page)

## Overview
Optimize the Total Blocking Time (TBT) for the initial landing page load to improve the user experience and Core Web Vitals. The current baseline is approximately 400ms, and the target is to reduce this to under 200ms.

## Functional Requirements
- **Branch Management**: Perform all work on the `dev` branch, ensuring it is first reset to match `main` to remove legacy/dead code.
- **Chunk Splitting**: Analyze and decompose the `events` JavaScript chunk to reduce the execution time during the main thread's initial busy period.
- **Third-party Audit (Excluding Sentry/i18next)**: Review and optimize the initialization of non-critical third-party scripts (Analytics, etc.) to minimize blocking.
- **Critical Path Preservation**: 
  - **Sentry**: Initialization MUST NOT be modified, deferred, or moved, as it needs to capture early lifecycle errors effectively.
  - **i18next**: Remains available on entry as it is required for the initial UI render.

## Non-Functional Requirements
- **Performance**: Lighthouse TBT score < 200ms on the initial landing page load.
- **Stability**: No regressions in application functionality or initial load reliability.

## Acceptance Criteria
- [ ] `dev` branch is identical to `main` at the start of implementation (excluding performance-related changes).
- [ ] Successful Lighthouse audit showing TBT < 200ms for `http://127.0.0.1:4173/`.
- [ ] Sentry initialization remains in its original position and configuration.
- [ ] All unit and E2E tests pass.

## Out of Scope
- Optimization of Sentry or i18next initialization.
- Optimization of the grid interaction algorithm (unless directly impacting initial TBT).
- Backend or API response time optimizations.
