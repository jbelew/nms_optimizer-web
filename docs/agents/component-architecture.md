# Component Architecture

Design patterns for React component composition, prop management, and local/global state integration.

## Prop Drilling Prevention
- **Colocated Hook Pattern**: Use custom hooks to derive state in child components instead of passing calculated props through intermediate layers.
- **Reference Implementations**:
  - `TechTreeRow` hierarchy (utilizes `useTechTreeRow` hook)
  - `GridRow` hierarchy (utilizes `useGridRowState` hook)
  - `ModuleSelectionDialog` (utilizes the `useModuleSelectionContext` pattern)
