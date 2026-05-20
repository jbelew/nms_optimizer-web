# Track: Code Review Improvements Phase 4: UI Patterns & Modernization

## Overview
This track focuses on completing the final phase of the code review improvements initiated in `docs/CODE_REVIEW_FINDINGS.md`. Having already addressed urgent bugs, architectural decoupling, and code health (logging and store refactoring), this phase shifts focus to UI performance, component modularity, and modernizing the codebase for React 19 standards.

## Objectives
- **Component Modularity**: Refactor large components like `GridView` and `TechTreeSection` into smaller, more focused units.
- **React 19 Modernization**: Audit and update components to follow React 19 patterns (e.g., using `use` hook, `startTransition` for state updates, and optimizing hydration).
- **Responsive UX**: Improve interaction responsiveness through more granular `useTransition` and `useDeferredValue` usage.
- **UI Architecture**: Standardize common UI patterns (dialogs, tooltips, loaders) across the application.

## Phases

### Phase 4.1: Component Decomposition
- [ ] Refactor `GridView.tsx` to extract sub-components for the grid header, cell container, and status overlays.
- [ ] Refactor `TechTreeSection.tsx` to decouple category logic from item rendering.
- [ ] Implement a standardized "Empty State" component for grid and tech tree.

### Phase 4.2: React 19 & Performance
- [ ] Migrate `useFetchTechTreeSuspense` and `useFetchShipTypesSuspense` to use more granular `useTransition` for background updates.
- [ ] Audit all `useEffect` calls for potential replacement with `useMemo` or event-driven patterns.
- [ ] Optimize the `MainLayout` to reduce layout shifts during dynamic content loading.

### Phase 4.3: Standardized UI Patterns
- [ ] Review and consolidate dialog components under a unified factory pattern or base component.
- [ ] Audit tooltip usage to ensure consistent positioning and accessibility.
- [ ] Enhance loading skeletons for technology sections to match the final UI more closely.

## Final Review & Cleanup
- [ ] Verify no regressions in accessibility (A11y).
- [ ] Ensure all new/refactored components have 100% test coverage.
- [ ] Final bundle size review.

## References
- Code Review Findings: `docs/CODE_REVIEW_FINDINGS.md`
- Previous Improvements Plan: `/home/jbelew/.gemini/tmp/nms-optimizer-web/d3c8ccab-4f3b-4644-a611-e2f829ae77c9/plans/code-review-improvements.md`
- Tech Stack: `conductor/tech-stack.md`
