# Proposed Performance Fixes (FPS Drop Investigation)

This document outlines the optimizations identified and implemented during the profiling session to address the FPS drop (from 60fps to ~35fps) when the grid is full. These changes were reverted due to session complications but are documented here for future application.

## 1. Flattening the Grid (Removing `GridRow`)

**Problem:** The `GridRow` component used `display: contents` to allow its children (`GridCell`) to participate in the `GridTable` CSS grid. This property is a known layout bottleneck in some browsers when many elements are involved, as it flattens the box model and can trigger massive layout recalculations.

**Proposed Implementation:**

- **`GridTable.tsx`**: Remove the `GridRow` component. Instead, iterate through rows and columns within `GridTable` and render a flat list of `GridCell` and `GridControlButtons` components directly into the grid container.
- **`GridTable.scss`**: Remove the `[role="row"] { display: contents; }` style.
- **Refactoring**: Move `useGridRowState.ts` to `src/components/GridControlButtons/` and update the import in `GridControlButtons.tsx`.

## 2. Lazy `ConditionalTooltip` Rendering

**Problem:** Having ~160 active Radix `Tooltip` instances (even when hidden) causes significant overhead during app-wide re-renders. Every instance re-evaluates its internal hooks, event listeners, and context, leading to high "Other Time" in profiling.

**Proposed Implementation:**

- **`ConditionalTooltip.tsx`**:
    - Wrap the content in a `span` with `style={{ display: "contents" }}` to preserve the CSS grid/flex layout.
    - Add a local `isHovered` state triggered by `onMouseEnter` and `onMouseLeave`.
    - Only render the Radix `<Tooltip>` component when `isHovered` is true.
- **Result:** This reduces the number of active Radix tooltip instances from ~160 to exactly 1 (the one currently being hovered), drastically lowering re-render overhead.

## 3. Technical Integrity & Type Safety

When re-applying these fixes, ensure the following to avoid build breakages:

- **Grid Element Types:** In `GridTable.tsx`, use `React.ReactElement[]` for the flat list of elements to ensure compatibility with the build tool and TypeScript configuration.
- **Hook Dependencies:** Maintain the `useShallow` optimizations in `useMainAppLogic` and `useAppLayout` to prevent the "MainAppContent" from re-rendering unnecessarily on every grid store update.
