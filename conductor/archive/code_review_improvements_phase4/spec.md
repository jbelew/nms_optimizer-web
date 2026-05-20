# Spec: Code Review Improvements Phase 4: UI Patterns & Modernization

## 1. Component Decomposition
### 1.1 GridView/GridTable
- Extract `GridTableHeader` (A-J, 1-6 labels).
- Extract `GridTableOverlay` for loading/solving states.
- Modularize `MainAppGridSection` from `MainAppLayout.tsx`.

### 1.2 TechTreeSection
- Separate `TechTreeSectionHeader` (Category icon + title).
- Separate `TechTreeSectionList` (Technology rows).

## 2. React 19 Modernization
- Use `useTransition` for all asynchronous updates (optimization, tech tree fetching).
- Replace `useEffect` where possible with `useMemo` or event handlers.
- Ensure compatibility with React 19 hydration.

## 3. UI Patterns
- Standardize "Empty State" across Grid and Tech Tree.
- Consolidate Dialog components.
- Enhance loading skeletons.
