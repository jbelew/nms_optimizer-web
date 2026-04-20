# Implementation Plan: GA4 Measurement Strategy & Event Standardization

## Phase 1: Audit & Baseline Verification [checkpoint: 19e8b1f]
- [x] Task: Audit existing tracking implementation in `src/utils/analytics.ts` and related components.
- [x] Task: Verify usage of `optimize_tech` to ensure it and its parameters (`platform`, `tech`, `supercharged`) remain unchanged.
- [x] Task: Map current events to proposed `snake_case` and GA4 recommended equivalents.
- [x] Task: Conductor - User Manual Verification 'Audit & Baseline Verification' (Protocol in workflow.md)

## Phase 2: Core Infrastructure & Standard Refactoring [checkpoint: f038fb5]
<!-- execution: parallel -->
- [x] Task: Refactor `analytics.ts` utility to enforce `snake_case` and support new parameter structures. <!-- files: src/utils/analytics.ts -->
- [x] Task: Implement `platform_type` user-scoped custom dimension. <!-- files: src/utils/analytics.ts, src/store/useStore.ts -->
- [x] Task: Update Platform Selection tracking to use `select_content` with `content_type: 'platform'`. <!-- files: src/components/Header/PlatformSelector.tsx -->
- [x] Task: Conductor - User Manual Verification 'Core Infrastructure & Standard Refactoring' (Protocol in workflow.md)

## Phase 3: Enhanced Action & Management Tracking [checkpoint: 9102300]
<!-- execution: parallel -->
- [x] Task: Update "Solve" event tracking with refined parameters (preserving `optimize_tech` as required). <!-- files: src/components/Solver/SolveButton.tsx -->
- [x] Task: Implement `method` parameter for `share_build`, `save_build`, `load_build`, and `screenshot_build`. <!-- files: src/components/BuildManagement/BuildActions.tsx, src/utils/sharing.ts -->
- [x] Task: Conductor - User Manual Verification 'Enhanced Action & Management Tracking' (Protocol in workflow.md)

## Phase 4: Performance Metrics & Web Vitals Refinement [checkpoint: 0a45971]
- [x] Task: Refine Web Vitals event payload to ensure numerical values are sent correctly for GA4 custom metrics.
- [x] Task: Update `LCP`, `CLS`, `INP`, `FCP`, and `TBT` (via performance trace utility) event structures.
- [x] Task: Conductor - User Manual Verification 'Performance Metrics & Web Vitals Refinement' (Protocol in workflow.md)

## Phase 5: Final Validation & Documentation
- [x] Task: Verify all events in GA4 Realtime reports (via browser manual verification).
- [x] Task: Document the final GA4 Event Schema in `learnings.md`.
- [x] Task: Conductor - User Manual Verification 'Final Validation & Documentation' (Protocol in workflow.md)
