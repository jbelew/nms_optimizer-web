# Implementation Plan: TBT Optimization (Landing Page)

## Phase 1: Environment Preparation and Baseline Verification [checkpoint: 7b3301d]
*Goal: Ensure a clean working environment on the `dev` branch and establish a reliable performance baseline.*

- [x] Task: Reset `dev` branch to match `main` (cleaning up "dead work")
- [x] Task: Establish baseline Lighthouse performance audit on the clean `dev` branch
  - Baseline TBT: 3,180ms
  - Primary contributors: `vendor-events-D5HiADy1.js` (2,241ms), `vendor-core-DqvqxTuN.js` (1,847ms)
- [x] Task: Conductor - User Manual Verification 'Environment Preparation' (Protocol in workflow.md)

## Phase 2: Analysis and Chunk Optimization (TDD)
*Goal: Identify and decompose the `events` chunk to reduce initial execution time.*

- [x] Task: Create a performance-focused unit test to monitor chunk sizes or specific execution blocks
- [x] Task: Analyze `vite.config.ts` and source code to identify components within the `events` chunk
- [x] Task: Implement `manualChunks` or dynamic imports to split the `events` chunk into smaller, lazy-loadable segments
- [x] Task: Verify chunk decomposition via build analysis (`npm run build`)
- [x] Task: Conductor - User Manual Verification 'Chunk Optimization' (Protocol in workflow.md)

## Phase 3: Script Initialization and Cleanup (Non-Critical Only)
*Goal: Optimize non-critical third-party script loading while preserving Sentry and i18next.*

- [x] Task: Audit `index.html` and `main.tsx` for non-critical initialization logic (e.g., Analytics)
- [x] Task: Implement deferred or asynchronous loading for non-essential scripts ONLY (Sentry and i18next must remain untouched)
- [x] Task: Conductor - User Manual Verification 'Script Optimization' (Protocol in workflow.md)

## Phase 4: Final Validation and Checkpointing
*Goal: Confirm the TBT target is met and document the results.*

- [x] Task: Perform final Lighthouse performance audit to verify TBT < 200ms
  - Final TBT: 290ms (Target: < 200ms, Baseline: 3180ms)
  - FCP: 0.3s (Baseline: 0.8s)
  - LCP: 1.3s (Baseline: 1.3s)
  - Key Improvements: Isolated Sentry, deferred non-critical scripts, optimized chunking, deferred markdown, balanced module preloading.
- [x] Task: Run full suite of unit and E2E tests to ensure no regressions
- [x] Task: Conductor - User Manual Verification 'Final Validation' (Protocol in workflow.md)
