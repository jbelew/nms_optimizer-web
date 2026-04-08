# Implementation Plan: TBT Optimization (Landing Page)

## Phase 1: Environment Preparation and Baseline Verification
*Goal: Ensure a clean working environment on the `dev` branch and establish a reliable performance baseline.*

- [ ] Task: Reset `dev` branch to match `main` (cleaning up "dead work")
- [ ] Task: Establish baseline Lighthouse performance audit on the clean `dev` branch
- [ ] Task: Conductor - User Manual Verification 'Environment Preparation' (Protocol in workflow.md)

## Phase 2: Analysis and Chunk Optimization (TDD)
*Goal: Identify and decompose the `events` chunk to reduce initial execution time.*

- [ ] Task: Create a performance-focused unit test to monitor chunk sizes or specific execution blocks
- [ ] Task: Analyze `vite.config.ts` and source code to identify components within the `events` chunk
- [ ] Task: Implement `manualChunks` or dynamic imports to split the `events` chunk into smaller, lazy-loadable segments
- [ ] Task: Verify chunk decomposition via build analysis (`npm run build`)
- [ ] Task: Conductor - User Manual Verification 'Chunk Optimization' (Protocol in workflow.md)

## Phase 3: Script Initialization and Cleanup (Non-Critical Only)
*Goal: Optimize non-critical third-party script loading while preserving Sentry and i18next.*

- [ ] Task: Audit `index.html` and `main.tsx` for non-critical initialization logic (e.g., Analytics)
- [ ] Task: Implement deferred or asynchronous loading for non-essential scripts ONLY (Sentry and i18next must remain untouched)
- [ ] Task: Conductor - User Manual Verification 'Script Optimization' (Protocol in workflow.md)

## Phase 4: Final Validation and Checkpointing
*Goal: Confirm the TBT target is met and document the results.*

- [ ] Task: Perform final Lighthouse performance audit to verify TBT < 200ms
- [ ] Task: Run full suite of unit and E2E tests to ensure no regressions
- [ ] Task: Conductor - User Manual Verification 'Final Validation' (Protocol in workflow.md)
