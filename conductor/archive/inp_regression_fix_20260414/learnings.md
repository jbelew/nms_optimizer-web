# Track Learnings: inp_regression_fix_20260414

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:35] - Phase 3: Compositor Layer Evaluation
- **Implemented:** Temporarily restored `will-change: opacity` to `.grid-cell`.
- **Files changed:** `src/components/GridCell/GridCell.scss`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Promoting many small elements to compositor layers (like 64 grid cells) can sometimes *increase* overhead if not carefully managed, or have negligible effect if the bottleneck is elsewhere.
  - Gotchas: Restoring `will-change: opacity` actually saw INP increase to 522ms (Bad) in the trace, mainly due to high processing duration (435ms) in Radix positioning logic, not presentation delay.
  - Context: Reverted the change as it did not yield the expected performance benefit.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:25] - Phase 2: Preload Waterfall Analysis
- **Implemented:** Re-included `vendor-ui-utils` in Vite's `modulePreload`.
- **Files changed:** `vite.config.ts`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Critical vendor chunks (like Radix primitives) should be preloaded to avoid interaction delays caused by on-demand fetching.
  - Gotchas: Re-including the preload didn't significantly reduce INP in this specific trace (450ms vs 375ms/414ms), suggesting the bottleneck is likely JS execution or presentation delay.
  - Context: Verified `vendor-ui-utils` is now preloaded in the Network tab.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:35] - Phase 3: Compositor Layer Evaluation
- **Implemented:** Temporarily restored `will-change: opacity` to `.grid-cell`.
- **Files changed:** `src/components/GridCell/GridCell.scss`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Promoting many small elements to compositor layers (like 64 grid cells) can sometimes *increase* overhead if not carefully managed, or have negligible effect if the bottleneck is elsewhere.
  - Gotchas: Restoring `will-change: opacity` actually saw INP increase to 522ms (Bad) in the trace, mainly due to high processing duration (435ms) in Radix positioning logic, not presentation delay.
  - Context: Reverted the change as it did not yield the expected performance benefit.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:15] - Phase 1: Baseline & Sentry Restoration
- **Implemented:** Restored synchronous Sentry initialization using named imports.
- **Files changed:** `src/main.tsx`, `src/utils/sentry.ts`, `src/utils/logger.ts`, `src/components/ErrorBoundary/errorHandler.ts`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Always use named imports for Sentry to allow better tree-shaking and follow project style.
  - Gotchas: `requestIdleCallback` for Sentry initialization might interfere with initial user interactions on mobile if it fires during interaction.
  - Context: Verified Sentry reporting is functional after restoring sync initialization. Baseline INP improved slightly from ~414ms to 375ms (Needs Improvement).
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:35] - Phase 3: Compositor Layer Evaluation
- **Implemented:** Temporarily restored `will-change: opacity` to `.grid-cell`.
- **Files changed:** `src/components/GridCell/GridCell.scss`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Promoting many small elements to compositor layers (like 64 grid cells) can sometimes *increase* overhead if not carefully managed, or have negligible effect if the bottleneck is elsewhere.
  - Gotchas: Restoring `will-change: opacity` actually saw INP increase to 522ms (Bad) in the trace, mainly due to high processing duration (435ms) in Radix positioning logic, not presentation delay.
  - Context: Reverted the change as it did not yield the expected performance benefit.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:25] - Phase 2: Preload Waterfall Analysis
- **Implemented:** Re-included `vendor-ui-utils` in Vite's `modulePreload`.
- **Files changed:** `vite.config.ts`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Critical vendor chunks (like Radix primitives) should be preloaded to avoid interaction delays caused by on-demand fetching.
  - Gotchas: Re-including the preload didn't significantly reduce INP in this specific trace (450ms vs 375ms/414ms), suggesting the bottleneck is likely JS execution or presentation delay.
  - Context: Verified `vendor-ui-utils` is now preloaded in the Network tab.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---

## [2026-04-14 17:35] - Phase 3: Compositor Layer Evaluation
- **Implemented:** Temporarily restored `will-change: opacity` to `.grid-cell`.
- **Files changed:** `src/components/GridCell/GridCell.scss`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Promoting many small elements to compositor layers (like 64 grid cells) can sometimes *increase* overhead if not carefully managed, or have negligible effect if the bottleneck is elsewhere.
  - Gotchas: Restoring `will-change: opacity` actually saw INP increase to 522ms (Bad) in the trace, mainly due to high processing duration (435ms) in Radix positioning logic, not presentation delay.
  - Context: Reverted the change as it did not yield the expected performance benefit.
---

## [2026-04-14 17:45] - Phase 4: Cleanup & Final Validation
- **Implemented:** Removed manual `useMemo` calls from `GridCell.tsx` and verified final performance state.
- **Files changed:** `src/components/GridCell/GridCell.tsx`
- **Commit:** 132219 (manual update)
- **Learnings:**
  - Patterns: Trust the React Compiler for basic memoization; manual `useMemo` can clutter code without providing additional benefits when the compiler is active.
  - Gotchas: INP remains at ~444ms (Needs Improvement) on 4x throttled mobile. The primary remaining bottleneck is Radix Themes' positioning and layout recalculation logic (specifically the `ge` function in `vendor-ui-themes`), which is triggered when opening the "Select ship type" menu.
  - Context: Sentry data loss was fixed by restoring synchronous initialization. Preloading was optimized by re-including `vendor-ui-utils`.
---
