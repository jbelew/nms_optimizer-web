---
name: agentic-jsdoc
description: "JSDoc standard for TypeScript, JavaScript, and React. Use when writing, updating, or reviewing JSDoc comments or documenting code."
license: AGPL-3.0-only
---

# Agentic JSDoc

Apply this standard to all **exported and top-level declarations**: functions, classes, methods, React components, custom hooks, contexts, validation schemas, and interfaces/types. Skip local variables inside functions unless non-obvious.

When writing or reviewing **React components, route components, context hooks, data-fetching hooks (React Query/SWR), Zustand stores, or Zod/Yup schemas**, also read [`reference/react.md`](reference/react.md).

## Block Specification

Focus JSDoc on contracts the TypeScript signature cannot express (rationale, invariants, thrown errors, defaults, deprecations, symbol/test links, and usage examples). Every JSDoc block follows this tag order; include every tag that applies:

1. **Summary** — One-sentence purpose on the opening line. Wrap inline code identifiers (`variables`, `types`, `functions`) in backticks.
2. **`@remarks`** — Rationale, constraints, and behavior details (the "why"). Required on exported functions, components, hooks, stores, and contexts.
3. **`@typedef`** — Inline object shape (`@typedef {Object} Name` and `@property {type} name - Description`) **only in plain `.js`/`.jsx` files**. In `.ts`/`.tsx` files, document the native TypeScript `interface` or `type` directly (summary block on the declaration plus inline `/** */` on every property).
4. **`@template`** — Generic type parameter description when non-obvious: `@template T - Description`.
5. **`@param`** — Parameter description:
   - **`.ts`/`.tsx`:** Omit `{type}` (the signature already carries it): `@param name - Description`. Omit `@param props` on React components (document the `Props` interface instead).
   - **Plain `.js`/`.jsx`:** Include a concrete TypeScript-flavor type: `@param {type} name - Description` (use unions or `{unknown}`, never `{any}` or `{*}`).
6. **`@returns`** — Return value description:
   - **`.ts`/`.tsx`:** Omit `{type}`: `@returns Description`. For side-effect-only hooks returning `void`, write `@returns Side-effects only.` Omit `@returns` on React components unless the render return is conditional/non-obvious.
   - **Plain `.js`/`.jsx`:** Include explicit return type (unwrapping Promises): `@returns {Promise<User[]>} Description`.
7. **`@throws`** — Every error thrown directly or by called APIs (e.g., `JSON.parse` → `@throws {SyntaxError}`, runtime guards → `@throws {TypeError}`, or `<Suspense>` boundaries): `@throws {ErrorType} Condition`. Always include `{ErrorType}` even in `.ts`/`.tsx` (TypeScript signatures do not type exceptions).
8. **`@deprecated`** — Always name the replacement: `@deprecated Use \`replacementSymbol\` instead.`
9. **`@default`** — Initial or fallback value on React contexts, config objects, or optional parameters: `@default { theme: "system" }`.
10. **`@see`** — Cross-references using TypeDoc `{@link}` syntax:
    - **Symbol links** for code dependencies (interfaces, types, schemas, contexts, stores, hooks, helpers): `@see {@link SymbolName}`.
    - **File links** only for `.test.*` and `.stories.*` files (which have no exported symbol): `@see {@link ./MyComponent.test.tsx Tests}`, `@see {@link ./MyComponent.stories.tsx Stories}`.
    - Always use `{@link ...}`, never Markdown `[Label](./path)` links or file paths for code symbols.
11. **`@component` / `@hook`** — Architecture marker on React components (`@component`) and custom or store hooks (`@hook`).
12. **`@category`** — TypeDoc grouping on public exports: `@category Components`, `@category Hooks`, or `@category Utilities`.
13. **`@example`** — Working usage snippet ending with an output or effect comment (`// returns { id: "123" }` or `// mounts PrimaryButton`). Required on exported functions, components, and hooks.

## Writing JSDoc

1. **Discover `@see` targets:** Search for sibling `.test.*` and `.stories.*` files, plus associated Props interfaces, Zod/Yup schemas, Context providers, and stores.
2. **Document declarations:** Write JSDoc on every exported and top-level declaration in scope (including inline `/** */` comments on every interface and schema property) matching the **Block Specification** and [`reference/react.md`](reference/react.md). See `examples/good_*` for reference templates.

**Done when:** Every exported and top-level declaration in target scope satisfies all applicable rules in the Block Specification and `reference/react.md`, with `@see` links verified against actual symbols and sibling test/story files.

## Reviewing JSDoc

1. **Audit declarations:** Check every exported and top-level declaration (including supporting interfaces, contexts, and schemas) against every rule in the **Block Specification** and [`reference/react.md`](reference/react.md).
2. **Report and fix:** Flag each violation by symbol and tag, and provide the corrected JSDoc block inline. Leave compliant blocks untouched.

