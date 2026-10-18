# test_fixture.tsx — Expected Review Findings

Load `agentic-jsdoc`, then ask: **"Review the JSDoc in tests/test_fixture.tsx"**

## Should Flag (8 violations)

1. **`StatusBadgeProps`** — Missing interface-level JSDoc summary and inline property descriptions
2. **`StatusBadge` `@param`** — Boilerplate `@param props` without description on a React component (omit `@param props` and document `StatusBadgeProps` instead)
3. **`StatusBadge` `@returns`** — Empty boilerplate `@returns` on a React component (omit `@returns` on standard components)
4. **`StatusBadge` `@see`** — Uses Markdown-style links (`[StatusBadge Stories](./StatusBadge.stories.tsx)`); should use `{@link RelativePath Label}`
5. **`StatusBadge`** — Missing `@remarks`, `@example`, `@component`, and `@category`
6. **`useStatusColor` `@see`** — Uses Markdown-style link (`[useStatusColor Tests](./useStatusColor.test.ts)`); should use `{@link RelativePath Label}`
7. **`useStatusColor`** — Missing `@remarks` and `@hook` tag
8. **`statusSchema`** — Redundant `@typedef` duplicating the TypeScript `StatusPayload` type; and `@see` uses Markdown-style link (`[statusSchema Tests](./statusSchema.test.ts)`)

## Should NOT Flag (3 correct usages)

9. **`useStatusColor` `@see {@link StatusContext}`** — Correct; code symbol reference
10. **`StatusBadge` `@see {@link StatusBadgeProps}`** — Correct; code symbol reference
11. **`StatusPayload` `@see {@link statusSchema}`** — Correct; code symbol reference
