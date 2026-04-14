# Implementation Plan: INP Regression Fix

## Phase 1: Baseline & Sentry Restoration (Hypothesis 1)
- **Hypothesis:** Restoring synchronous Sentry initialization (best practice) will fix reporting data loss and potentially reduce INP if `requestIdleCallback` was interfering with the main thread during interaction.
- [x] Task: Measure baseline INP on mobile (4x throttle) and verify current Sentry reporting state. 132219
- [x] Task: Revert `main.tsx` to synchronous Sentry initialization using optimized named imports. 132219
- [x] Task: Test: Measure INP and verify Sentry reporting data is flowing. 132219
- [x] Task: Conductor - User Manual Verification 'Phase 1: Baseline & Sentry Restoration' (Protocol in workflow.md) [checkpoint: 132219]

## Phase 2: Preload Waterfall Analysis (Hypothesis 2)
- **Hypothesis:** The exclusion of `vendor-ui-utils` (Radix primitives) from `modulePreload` in `vite.config.ts` causes a loading waterfall when the ship selection menu is triggered, spiking INP.
- [x] Task: Update `vite.config.ts` to re-include `vendor-ui-utils` in `modulePreload`. 132219
- [x] Task: Test: Measure INP on mobile (4x throttle) and verify preload in the Network tab. 132219
- [x] Task: Conductor - User Manual Verification 'Phase 2: Preload Waterfall Analysis' (Protocol in workflow.md) [checkpoint: 132219]

## Phase 3: Compositor Layer Evaluation (Hypothesis 3)
- **Hypothesis:** The removal of `will-change: opacity` in `GridCell.scss` increased presentation delay (observed at 612ms) by preventing the browser from promoting cells to compositor layers.
- [x] Task: Restore `will-change: opacity` to `.grid-cell` in `GridCell.scss`. 132219
- [x] Task: Test: Measure INP and specifically check the "Presentation Delay" phase in the performance trace. 132219
- [x] Task: Conductor - User Manual Verification 'Phase 3: Compositor Layer Evaluation' (Protocol in workflow.md) [checkpoint: 132219]

## Phase 4: Cleanup & Final Validation
- **Goal:** Remove redundant manual optimizations and confirm the final performance state.
- [x] Task: Remove manual `useMemo` calls from `GridCell.tsx` (redundant with React Compiler). 132219
- [x] Task: Run a final comprehensive performance trace and `lhci autorun`. 132219
- [x] Task: Document all findings and the final verified baseline in `learnings.md`. 132219
- [x] Task: Conductor - User Manual Verification 'Phase 4: Cleanup & Final Validation' (Protocol in workflow.md) [checkpoint: 132219]
