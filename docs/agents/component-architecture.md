# Component Architecture

Design patterns for React component composition, prop management, and local/global state integration.

## Prop Drilling Prevention

- **Colocated Hook Pattern**: Use custom hooks to derive state in child components instead of passing calculated props through intermediate layers.
- **Reference Implementations**:
    - `TechTreeRow` (connects directly to `useGridStore`, `useTechStore`, `useModuleSelectionDialogStore`, and `sessionCoordinator`)
    - `GridCell` (connects directly to `useGridStore` and `useTechStore` and encapsulates roving focus and slot interaction)
    - `GridControlButtons` (selects precomputed row indices from `useGridStore` and evaluates `getRowControlEligibility`)
    - `ModuleSelectionDialog` (store-connected via `useModuleSelectionDialogStore` and `useTechStore`)

## Dialog Directory Layout

- Application modal dialogs live under `src/components/AppDialog/<DialogType>/` (`Base`, `BuildName`, `Error`, `Markdown`, `OptimizationAlert`, `ShareLink`, `UpdatePrompt`, `UserStats`, `Welcome`), where the folder omits the `Dialog` suffix (e.g., `src/components/AppDialog/OptimizationAlert/OptimizationAlertDialog.tsx`).
- `ModuleSelectionDialog` is located at the top level under `src/components/ModuleSelectionDialog/`.
