# Code Style Guidelines

Coding standards and patterns for TypeScript, React, state management, and styling.

## Tooling & Configuration

- **ESLint**: Version 10.x with Flat Config ([`eslint.config.js`](file:///home/jbelew/projects/nms_optimizer-web/eslint.config.js)). You are never allowed to disable eslint rules with "eslint-disable"!
- **Alphabetical Sorting (`eslint-plugin-perfectionist`)**: `perfectionist/recommended-natural` enforces natural alphabetical order on interface properties, object keys, and module declarations (`perfectionist/sort-modules`, `perfectionist/sort-interfaces`, `perfectionist/sort-objects`). Run `bunx eslint --fix <touched-files>` (or `bun run lint:fix`) to auto-fix sorting errors instead of reordering blocks manually. For TypeScript function overloads, declare overload signatures without `export` and export the symbol once via `export { fn };` at the bottom of the module to satisfy both `perfectionist/sort-modules` (no blank lines between overloads) and `padding-line-between-statements` (blank line before `export`).
- **TypeScript**: Strict TypeScript mode. The use of `any` is never permitted. Use interfaces for React component props; use discriminated unions for variants.
- **Naming Conventions**: `camelCase` for files/variables, `PascalCase` for React components/types, `UPPER_SNAKE_CASE` for constants.

## Zustand & Immer

- **Immer Middleware**: Use `immer` for stores with nested or complex state structures (e.g., `useGridStore`, `useTechStore`).
- **Standard Zustand**: Prefer raw Zustand for flat or simple stores to avoid Proxy-based overhead.
- **Deep Mutations**: Always use the functional `set` pattern for deep mutation safety inside Immer-wrapped stores:
    ```typescript
    set((state) => {
    	state.nested.property = newValue; // Safe via Immer
    });
    ```

## Tailwind v4

- **CSS-First Configuration**: Update theme variables (colors, spacing, fonts) in [`src/index.css`](file:///home/jbelew/projects/nms_optimizer-web/src/index.css) under the `:root` or `@layer theme` blocks. Avoid adding a `tailwind.config.js` unless legacy plugin support is required.

## React Hook Usage

- **Effects & Pre-Paint Layout Measurements**: Whenever a `ResizeObserver` drives layout-constraining inline styles (`height`, `width`, `maxWidth`), pair it with a synchronous `getBoundingClientRect()` read inside `useLayoutEffect` before first paint so initial frames do not render unconstrained and cause Cumulative Layout Shift (CLS). For non-layout side effects, use `useEffect` (and wrap state updates in `setTimeout` if "cascading renders" warnings occur in ESLint 10).

## Error Handling

- **Hooks**: Use try-catch blocks in custom hooks.
- **State Integration**: Pass error state via React Context or Zustand stores.
- **User Feedback**: Display user-friendly toast messages for error notifications.
