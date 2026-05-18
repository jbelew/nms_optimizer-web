# Track Learnings: app_perf_view_transitions_20260517

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

### Mixed Visual Charts (Recharts)
- **Pattern:** Use `ComposedChart` when you need to combine different visual primitives.

### Multi-line Custom Tooltips
- **Pattern:** Use the `content` prop with a custom React component for complex tooltips.

### Visual Clamping for Outliers
- **Pattern:** Clamp visual data points but preserve original values in tooltips.

### Lighthouse-style Scoring
- **Pattern:** Use log-normal distribution for scoring health metrics.

### Modular Flask Blueprints
- **Pattern:** Refactor logically related routes into `Blueprint` files.

### Simple In-memory Caching
- **Pattern:** Implement `SimpleCache` with TTL for slow queries.

---

## [2026-05-17 19:55] - Phase 1 Task 1: Audit and Refactor Layout Components
- **Implemented:** Refactored AppHeader and AppFooter into compound components using shared context.
- **Files changed:** src/components/AppHeader/AppHeader.tsx, src/components/AppFooter/AppFooter.tsx, src/components/MainAppContent/MainAppLayout.tsx, plus 6 new context/provider files.
- **Commit:** c42d4f7
- **Learnings:**
  - Patterns: Context-Provider Split. To support React Fast Refresh, split context definition/hooks into `.ts` and providers into `.tsx`.
  - Gotchas: Perfectionist linting rules (sorting) triggered on new files.
  - Context: Granular compound components allow for more flexible layout control.

## [2026-05-17 13:20] - Phase 1 Task 2: Refactor Grid/Optimizer Components to Compound Pattern
- **Implemented:** Refactored GridTable, TechTree, ShipSelection, and RecommendedBuild into compound components.
- **Files changed:** src/components/GridTable/GridTable.tsx, src/components/TechTree/TechTree.tsx, src/components/ShipSelection/shipSelection.tsx, src/components/RecommendedBuild/RecommendedBuild.tsx, plus 18 new sub-component and provider files.
- **Commit:** fe23fcfe
- **Learnings:**
  - Patterns: Compound Component File Splitting. To maintain Fast Refresh compatibility, every exported React component should live in its own file if the aggregator file uses `Object.assign` or other non-component exports.
  - Gotchas: Refactoring core layout components can easily break Suspense boundaries and conditional rendering logic (e.g. breakpoint-based visibility).
  - Context: Granular Suspense boundaries (e.g. only around the Sidebar content) are crucial for maintaining a good UX and avoiding unnecessary CLS.
## [2026-05-17 14:15] - Phase 2 Task 1: INP Profiling and Long Task Mitigation
- **Implemented:** Wrapped expensive grid state updates in `useOptimize` and `useRecommendedBuild` with `startTransition`.
- **Files changed:** `src/hooks/useOptimize/useOptimize.tsx`, `src/hooks/useRecommendedBuild/useRecommendedBuild.tsx`, `src/hooks/useBuildFileManager/useBuildFileManager.ts`
- **Commit:** fdfef43
- **Learnings:**
  - Patterns: State Update Transitions. Using React 18's `startTransition` around synchronous, heavy state updates (like replacing a 10x6 grid of objects) yields the main thread to the browser, significantly reducing INP.
  - Gotchas: Ensure `startTransition` is actually imported from `react`.

---

<!-- Learnings from implementation will be appended below -->
