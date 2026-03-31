# TypeScript Style Guide: No Man's Sky Technology Layout Optimizer

This document defines the TypeScript coding standards and best practices for this project, as enforced by ESLint and the project's custom configuration.

## 1. Core Principles
- **TypeScript Strict Mode:** All code must pass under strict type checking.
- **`any` is Forbidden:** Use `unknown` or a specific type. `no-explicit-any` is enforced as an error.
- **Blank Line Structure:** Follow industry-standard spacing to group related logic and isolate blocks/returns.
- **Immutability:** Prefer `const` over `let`. Avoid `var` entirely.

## 2. JSDoc Standards (Agentic JSDoc)
This project adheres to the **Agentic JSDoc** pattern to improve maintainability and LLM comprehension.

### Rules:
- **Mandatory Documentation:** Every exported function, method, class, interface, and type must have JSDoc.
- **Hierarchical Block Structure:** Use a consistent order: Summary → `@remarks` → `@param` → `@returns` → `@example`.
- **Semantic Richness:** Every tag must carry a description, not just a type.
- **Markdown Formatting:** Use backticks for code references within descriptions.
- **Symbol Linking:** Use `{@link SymbolName}` instead of Markdown links for internal cross-references.
- **Architecture Primitives:** Use specialized tags like `@hook`, `@component`, `@store`, and `@category`.

### Example JSDoc:
```typescript
/**
 * Custom hook to calculate the adjacency bonus for a specific cell.
 *
 * @remarks
 * This hook uses the `useGridStore` to retrieve the cell's neighbors and
 * calculates the bonus based on the technology type and level.
 *
 * @param {number} rowIndex - The zero-based row index.
 * @param {number} colIndex - The zero-based column index.
 * @returns {number} The calculated adjacency bonus multiplier.
 *
 * @hook
 * @category Hooks
 * @see {@link useGridStore}
 *
 * @example
 * const bonus = useAdjacencyBonus(0, 5);
 * // returns 1.15
 */
```

## 3. Component & Hook Patterns
- **React 19 Primitives:** Leverage modern React patterns, including `useTransition` for performance-critical state updates.
- **Zustand for State:** Use `useGridStore` and other stores for global state. Use `useShallow` to minimize re-renders.
- **Tailwind CSS 4:** Use utility-first styling. Avoid complex inline styles unless dynamic.
- **Default Exports:** Are permitted for top-level components (e.g., `App`, `GridCell`).

## 4. Testing & Verification
- **TDD Preferred:** Write tests before implementation.
- **Coverage:** Aim for >80% code coverage.
- **Verification:** Run `npm run lint` and `npm run typecheck` before every commit.

## 5. File Naming
- **PascalCase.tsx:** For React components.
- **camelCase.ts:** For hooks and utility functions.
- **.test.ts/tsx:** For corresponding test files in the same directory.
- **.stories.tsx:** For Storybook stories.

---
*Last updated: 2026-03-31*
