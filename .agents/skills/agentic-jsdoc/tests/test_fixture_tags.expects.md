# test_fixture_tags.tsx — Expected Review Findings

Load `agentic-jsdoc`, then ask: **"Review the JSDoc in tests/test_fixture_tags.tsx"**

## Should Flag (5 violations)

1. **`fetchLegacyProfile` `@deprecated`** — Missing migration path; should state what to use instead (e.g., "Use `fetchProfile` instead.")
2. **`parseConfig`** — Missing `@remarks` category; missing `@throws {SyntaxError}` (from `JSON.parse`) and `@throws {TypeError}` (from the explicit guard)
3. **`mergeSources` `@param` / `@returns`** — Uses `{any}` and `{*}` types; should use `{unknown}` or a specific union type
4. **`usePageView`** — Missing `@remarks`, `@hook` tag, and `@returns {void} Side-effects only.` for a hook that returns nothing
5. **`formatDate` `@example`** — Missing output comment (should have `// returns "Nov 14, 2023"` or similar)

## Should NOT Flag

6. **`fetchLegacyProfile` `@example`** — Has a valid example with output comment ✅
7. **`parseConfig` `@example`** — Has a valid example with output comment ✅
8. **All `@param` tags** — Every `@param` includes a type and description ✅
9. **All `@category` tags** — Present on every export ✅
