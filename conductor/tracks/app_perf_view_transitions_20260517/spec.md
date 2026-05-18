# Specification: Application Optimization & Patterns Review

## Overview
This track focuses on a three-staged optimization of the application. First, completing the transition to **Vercel Composition Patterns** to simplify the component tree. Second, applying **React Best Practices** to resolve performance bottlenecks (specifically targeting high INP and LCP). Finally, implementing **View Transitions** to provide a polished, native-feeling user experience.

## Functional Requirements
- **Architecture Finalization**: Complete remaining refactors to eliminate boolean prop proliferation and improve component reusability.
- **Performance Optimization**: 
  - Diagnose and fix high **Interaction to Next Paint (INP)** by breaking up long tasks.
  - Optimize **Largest Contentful Paint (LCP)** through better hydration and asset strategies.
  - Reduce redundant re-renders in the main optimizer views.
- **Motion Design**: Once performance is stabilized, implement the React View Transition API across major routes.

## Non-Functional Requirements
- **Performance Budget**: Target INP < 200ms and LCP < 2.5s.
- **Code Quality**: Strictly adhere to `vercel-composition-patterns` for any new or refactored components.
- **Stability**: Performance must be validated via profiling *before* transitions are added to ensure motion doesn't mask underlying jank.

## Acceptance Criteria
- [ ] Remaining "prop-drilling" or "boolean-heavy" components are refactored.
- [ ] Profiling shows no "Long Tasks" exceeding 50ms during core interactions.
- [ ] Lighthouse scores for Performance are improved (target > 90).
- [ ] Smooth view transitions are implemented and validated on all primary routes.

## Out of Scope
- Backend infrastructure changes.
- Creating new functional features outside of optimization.
