# Code Review: Anti-Patterns and Code Smells

**Project:** NMS Optimizer Web
**Date:** 2026-05-18
**Scope:** `src/` directory (~24,700 LOC across ~250 TS/TSX files)

This review focuses on architectural smells, code organization, state-management
patterns, and React-specific anti-patterns. Findings are ordered roughly by
severity / impact. Each item includes representative file references and a
concrete suggestion.

---

## 1. God-Object Store — `gridStore.ts` (CRITICAL)

**File:** [src/store/grid/gridStore.ts](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts) (**1,038 lines**)

`useGridStore` is by far the largest module in the project and exhibits several
classic "god object" symptoms:

- **40+ public fields and actions** in a single `GridStore` type — grid state,
  tap/interaction tracking (`_lastTapTime`, `_lastTapCell`,
  `_initialCellStateForTap`), persisted build metadata (`buildName`,
  `isSharedGrid`), API results (`result`), derived caches
  (`_firstInactiveRowIndex`, `_totalSuperchargedCells`, `_hasModulesInGrid`,
  `_isGridFull`, `_lastActiveRowIndex`, `activeTechs`), and even row-activation
  helpers all coexist.
- **Mixed concerns**: UI gesture detection (`handleCellTap`,
  `handleCellDoubleTap`, `_initialCellStateForTap`) is colocated with
  pure data state. Gesture timing belongs in
  [`useGridCellInteraction`](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/useGridCellInteraction.ts),
  not the store.
- **Cross-store side effects baked into actions.** `resetGrid` and
  `setGridAndResetAuxiliaryState` reach across four foreign stores
  (`useTechStore`, `useTechBonusStore`, `useModuleSelectionStore`,
  `usePlatformStore`) and also call `safeRemoveItem("techBonusState")` /
  `safeRemoveItem("moduleSelectionState")` directly — see
  [gridStore.ts#L778-L785](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L778-L785)
  and [#L888-L894](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L888-L894).
  This is shotgun coupling and makes the grid store nearly impossible to
  use in isolation.
- **Reach-out persistence**: `partialize` reads
  `usePlatformStore.getState().selectedPlatform` so the grid blob silently
  carries data owned by another store
  ([#L1014](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L1014)).
- **Redundant selectors**: every `_xxx` cache field also has a
  `selectXxx()` method that simply returns it (`selectFirstInactiveRowIndex`,
  `selectHasModulesInGrid`, `selectLastActiveRowIndex`,
  `selectTotalSuperchargedCells`, `isGridFull`, `hasTechInGrid`). Consumers
  should subscribe via Zustand selectors directly instead of calling
  zero-arg functions on the store — the function-wrapping defeats
  fine-grained subscriptions.

**Recommendation**

1. Extract `interactionStore` (tap timing, last-tap cell, initial-state
   snapshot) from `gridStore`.
2. Move "reset cascade" logic into a coordinating hook or `resetSession()`
   utility that explicitly orchestrates the four stores, instead of letting the
   grid store know about every other store.
3. Replace `selectXxx`/`isGridFull`/`hasTechInGrid` zero-arg getters with
   plain selectors used at call sites:
   `useGridStore((s) => s._isGridFull)`.

---

## 2. Cross-Store Coupling and `getState()` Sprawl

**Evidence:** 55 non-test `getState()` calls across 17 files.

Stores import each other and components/hooks frequently bypass React's
subscription model by calling `useXStore.getState()` directly. Hot spots:

- [`gridStore.ts`](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts)
  imports `useTechStore`, `useTechBonusStore`, `useModuleSelectionStore`,
  `usePlatformStore`.
- [`techStore.ts`](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/techStore.ts)
  imports `useModuleSelectionStore`.
- [`useGridCellInteraction.ts`](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/useGridCellInteraction.ts#L74-L76)
  uses `useShakeStore.getState().triggerShake()` and several other
  `.getState()` lookups.
- [`useOptimize.tsx`](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L155-L156)
  reads `useGridStore.getState()` and `useTechStore.getState()` inside
  `handleOptimize`.

`.getState()` inside event handlers is fine, but using it as a substitute for
real subscriptions hides data dependencies and makes refactors brittle. The
cyclical-feeling graph (grid ↔ tech ↔ moduleSelection ↔ techBonus) is a
"big ball of mud" smell.

**Recommendation**

- Introduce a small **mediator/orchestrator layer** (e.g. a
  `sessionCoordinator` module) that owns multi-store transactions like
  "reset session" or "switch platform." Stores then only contain their own
  state.
- Audit every non-handler `getState()` and convert to a selector subscription.

---

## 3. Eight Persisted Stores with Ad-Hoc localStorage Cleanup

The app has 11+ Zustand stores (`grid`, `tech`, `techBonus`, `techTreeLoading`,
`moduleSelection`, `platform`, `optimize`, `session`, `shake`, `theme`, `a11y`,
`error`, `moduleSelectionDialog`). Several persist independently, and the grid
store contains a hand-rolled cleanup pass that enumerates *all* `localStorage`
keys on every read:

[gridStore.ts#L388-L418](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L388-L418)

```ts
for (let i = 0; i < len; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith("app-state") && key !== name) {
    keysToRemove.push(key);
  }
}
```

The cleanup is keyed to a prefix (`app-state`) that doesn't match the store's
actual persistence name (`gridState`), so it may be dead code — or worse,
unintentionally deleting unrelated entries from other consumers in the future.
This is a latent bug.

**Recommendation**

- Verify the prefix in the cleanup routine; align with the canonical
  persistence key.
- Centralize storage hygiene in one module (`src/utils/browser/storage.ts`) so
  every persisted store uses the same wrapper.

---

## 4. Manual Run-Length Encoding for URL Sharing

**File:** [src/hooks/useGridDeserializer/useGridDeserializer.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx#L32-L95)

The codec hand-rolls RLE plus a 6-field pipe-separated format with two
embedded char→key maps. Problems:

- `decompressRLE` uses `!isNaN(parseInt(input[i]))` to consume digits —
  fragile and slow.
- Single-character codes obtained via `String.fromCharCode(nextTechCode++)`
  starting at `3` can collide with delimiter or whitespace characters and
  produce control characters in URLs.
- No version byte: a future change to the format breaks every shared link
  silently.

**Recommendation**

- Adopt a well-known compact codec (e.g. `lz-string`, `msgpack` + base64url)
  and **prefix with a version tag**.
- If keeping RLE, replace `parseInt` digit-scan with a tight regex pass and
  guard against codes < 0x20 or in `|`, `,`, `:`, `%`.

---

## 5. Boolean-Bag State on the Optimize / Error Stores

[App.tsx#L91-L141](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L91-L141)
shows a classic discriminated-state smell:

```ts
const { errorType, showError } = useOptimizeStore();
...
if (showError && errorType === "fatal") return null;
```

Then later: `setShowError(true, "recoverable", err)` — a tri-arg setter,
with a boolean + string + Error.

This is exactly what discriminated unions are for. A single field
`status: { kind: "idle" } | { kind: "recoverable"; error } | { kind: "fatal"; error }`
makes invalid states unrepresentable. Same applies to `solving` +
`progressPercent` + `patternNoFitTech` in
[useOptimize.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L85-L92).

---

## 6. Destructuring Whole Stores Causes Excess Re-renders

Selectors that return the entire store re-render on *any* state change:

- [App.tsx#L93](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L93):
  `const { errorType, showError } = useOptimizeStore();`
- [App.tsx#L226](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L226):
  `const { showError } = useOptimizeStore();`
- [errorDialog.tsx#L37](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppDialog/Error/errorDialog.tsx#L37):
  `const { setShowError, showError } = useOptimizeStore();`

`useOptimize.tsx` does it correctly with per-field selectors — apply the same
discipline everywhere. Add an ESLint rule (`zustand/no-store-destructure` or
custom) to prevent regressions.

---

## 7. Mutable Action Names with Side Effects Across Stores

`setResult(result, tech)` in
[gridStore.ts#L917-L929](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L917-L929)
both sets local state and writes three fields on `useTechStore`. A reader of
the type signature has no idea. Either:

- Rename to something honest (`commitOptimizationResult`) and document the
  multi-store write, **or**
- Decouple by emitting an event/observer that each interested store handles.

The pattern repeats in `resetGrid` and `setGridAndResetAuxiliaryState`.

---

## 8. `_`-Prefixed "Private" Fields Are Part of the Public Type

`GridStore` exposes `_firstInactiveRowIndex`, `_hasModulesInGrid`,
`_initialCellStateForTap`, `_isGridFull`, `_lastActiveRowIndex`,
`_lastTapCell`, `_lastTapTime`, `_totalSuperchargedCells` — all on the public
exported interface. The underscore is a fig leaf; TypeScript doesn't enforce
it, and the persisted blob can leak them.

**Recommendation:** Split into `GridState` (public) and `GridInternal`
(combined inside the store closure, not exported). Move tap-tracking fields
to a separate interaction store (see #1).

---

## 9. Dead/Confused Migration Code

[gridStore.ts#L992-L1000](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L992-L1000):

```ts
migrate: (persistedState: unknown, version: number) => {
  const state = persistedState as Partial<GridStore>;
  if (version === 0) {
    return state;
  }
  return state;
},
```

Both branches return the same value. Either remove or implement real
versioning. As-is it's noise that suggests a TODO without warning.

---

## 10. Inconsistent Logging — `console.*` Mixed with `Logger`

107 raw `console.log/warn/error` calls remain in `src/`, alongside
[`Logger`](file:///home/jbelew/projects/nms_optimizer-web/src/utils/system/monitoring.ts)
usage in
[useOptimize.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L150)
and elsewhere. Mixing both means:

- Some output is captured by monitoring, some isn't.
- Production builds may ship debug logs through the bare `console` path.

**Recommendation:** Replace all `console.*` with `Logger` (which can no-op in
production) and add an `eslint:no-console` rule with explicit overrides where
truly needed.

---

## 11. Magic Numbers Scattered in Logic

Examples:

- `DOUBLE_TAP_THRESHOLD = 400` in
  [useGridCellInteraction.ts#L10](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/useGridCellInteraction.ts#L10)
- Debounced storage `1000` in
  [gridStore.ts#L479](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L479)
- `requestIdleCallback(..., { timeout: 2000 })` in
  [gridStore.ts#L414](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L414)
  and
  [MainAppLayout.tsx#L161](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx#L161)
- `loading={rowIndex < 5 ? "eager" : "lazy"}` in
  [GridCell.tsx#L71](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L71)
  — why 5?

A `constants/timings.ts` or `constants/perf.ts` would document intent and
make tuning easier.

---

## 12. SSR-Adjacent Defensive Code in Browser-Only Paths

`gridStore.ts` repeatedly checks `typeof window === "undefined"`
([#L391, #L493, #L1027](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L391)).
The project is SPA + SSG (per AGENTS.md — pre-render happens at build time via
`scripts/generate-ssg.mjs`), so most React-runtime stores never execute under
SSR. If the guards aren't needed, remove them; if they are, document the
contract. Mixed signals make future SSR work risky.

---

## 13. Hard-Coded Language List

[dialogContext.tsx#L11](file:///home/jbelew/projects/nms_optimizer-web/src/context/dialogContext.tsx#L11):

```ts
const OTHER_LANGUAGES = ["es", "fr", "de", "pt", "it"];
```

Same list almost certainly exists in i18n config and `LanguageSelector`. A
single source of truth (e.g. `src/i18n/locales.ts`) prevents the inevitable
drift when a 6th language ships.

The dialog-name check immediately below is a 6-clause `||` chain that should
be a `Set<DialogType>` lookup:

```ts
const DIALOG_PATHS = new Set([...]);
const activeDialog = DIALOG_PATHS.has(dialogPath) ? dialogPath : null;
```

---

## 14. Inline RegExp Recompiled per Render/Cell

[GridCell.tsx#L24-L28](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L24-L28):

```ts
const stripLabel = (label) => label.replace(/\[[^\]]+\]|\([^)]+\)/g, "").trim();
```

The regex literal is hoisted, but the function still runs on *every*
`GridCell` render for tooltip text. With memoization on the parent already in
place, the cost is trivial — but worth hoisting and memoizing if tooltip
recompute ever shows up in profiling. Similarly,
[GridCell.tsx#L58](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L58)
does string `.replace(/\.webp$/, "@2x.webp")` per render of every module
image; precompute in the cell data model.

---

## 15. Window-Globals as Backdoor APIs

Several stores attach themselves to `window` for E2E or debugging:

- [moduleSelectionStore.ts#L179](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/moduleSelectionStore.ts#L179):
  `window.useModuleSelectionStore = useModuleSelectionStore`
- [techBonusStore.ts#L186](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/techBonusStore.ts#L186):
  `window.useTechBonusStore = useTechBonusStore`
- [gridStore.ts#L1027-L1037](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L1027-L1037):
  guarded by `import.meta.env.VITE_E2E_TESTING || w.__E2E_EXPOSE__`.

The grid store does it correctly (guarded by env flag). The other two do it
**unconditionally**, leaking internals into every production bundle. Wrap
them in the same `if (import.meta.env.VITE_E2E_TESTING)` guard.

---

## 16. Suspense + Conditional Mounting Spam in `App.tsx`

[App.tsx#L144-L194](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L144-L194)
contains five separate `<Suspense fallback={null}>` wrappers in a single JSX
tree, each guarded by a different boolean (`shareUrl`, `activeDialog`,
`activeDialog === "userstats"`, `activeDialog === "performance"`,
`showWelcome`). Each is also guarded by `!isDockerBuild` for two of them.

The `activeDialog === "..."` checks duplicate routing logic already present
in `RoutedDialogs`. A single `<DialogPortal />` that internally lazy-loads
the right component would collapse this surface to one element.

---

## 17. Optional-Chaining-of-Already-Typed Fields

[gridStore.ts#L213-L226](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L213-L226)
defends against `undefined` on every field of a `Module`:

```ts
adjacency: moduleData?.adjacency ?? "none",
adjacency_bonus: moduleData?.adjacency_bonus ?? 0.0,
...
```

If `Module` is typed correctly, most `?.` chains are dead weight. If the
input is genuinely `unknown`, the parameter type should be `Partial<Module>`
or `unknown`, and validation should run once at the boundary. This is
defensive programming masking a type-system gap.

---

## 18. Imperative DOM Mutation Outside React's Model

`useSeoAndTitle` ([file](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useSeoAndTitle/useSeoAndTitle.ts#L28-L67))
manually creates/updates `<meta>` and `<link>` tags. `App.tsx` also
`querySelector('[data-prerendered-markdown="true"]').remove()`
on mount ([App.tsx#L250-L254](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L250-L254)).
React 19 supports `<title>`, `<meta>`, and `<link>` as first-class JSX
(automatically hoisted to `<head>`), eliminating the need for the helper
functions and the cleanup ref dance.

---

## 19. Inconsistent Naming

- Some files use PascalCase (`AppDialog.tsx`), others camelCase
  (`languageSelector.tsx`, `messageSpinner.tsx`, `markdownContentRenderer.tsx`,
  `tooltipContext.tsx`, `createToastContext.ts`, `errorDialog.tsx`,
  `updatePromptWrapper.tsx`, `shipSelection.tsx`). AGENTS.md states
  "PascalCase components." Drift exists.
- Field names mix snake_case and camelCase in the same type — `Cell` has
  `adjacency_bonus`, `sc_eligible`, `group_adjacent` next to `active`,
  `supercharged`, `label` ([gridStore.ts#L40-L69](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L40-L69)).
  Likely mirroring the Python API; a mapping layer at the boundary would let
  the frontend stay idiomatic.

---

## 20. Wrong-Identity `null` Check Pattern

[gridStore.ts#L937-L945](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L937-L945):

```ts
toggleCellActive: (rowIndex, columnIndex) => {
  set((state) => {
    const cell = state.grid.cells[rowIndex]?.[columnIndex];
    if (cell.supercharged) { ... }       // unguarded
    if (cell && (!cell.active || ...)) { ... } else {
      console.error(`Cell not found ...`);  // unreachable if cell missing
    }
  });
}
```

The `if (cell.supercharged)` runs **before** the null-check, defeating the
purpose. The `else` branch logs "cell not found" when in fact the
condition that failed was `!cell.active || !cell.module`, which is a logic
error, not a missing cell. Both bugs in one block.

---

## 21. Test-Free Files Among the Largest Modules

The two largest application files have **no colocated tests**:

- [PerformanceUtils.ts](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppDialog/Performance/PerformanceUtils.ts) (901 lines)
- [performanceChart.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppDialog/Performance/performanceChart.tsx) (751 lines)

Given that the project otherwise maintains good test coverage (gridStore has
9 test files), these stand out. Either split them into testable units or
add fixtures.

---

## 22. Lots of `useEffect` for Mount-Time Initialization

111 `useEffect` calls in source. Several common smells:

- `App.tsx` runs **three** `useEffect`s with effectively `[]` deps for
  splash, prefetch, and document cleanup
  ([App.tsx#L232-L255](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L232-L255)).
  These are top-level imperative bootstrap; consider running them in
  [main.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/main.tsx)
  outside React's render cycle.
- `MainAppLayout` polyfills `requestIdleCallback` inside a component
  ([#L154-L179](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx#L154-L179)).
  Extract into `useIdleMount(timeout)` utility hook — it appears at least
  twice (also in `gridStore` and likely elsewhere).

---

## 23. Minor Items

- **Empty line in interface body** —
  [GridCell.tsx#L47](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L47)
  has a stray blank line inside `interface GridCellProps`.
- **`as unknown as number` cast** for `setTimeout` return —
  [MainAppLayout.tsx#L163](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx#L163).
  Use `ReturnType<typeof setTimeout>` typed locally instead.
- **`_isPending` unused** —
  [useGridCellInteraction.ts#L49](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/useGridCellInteraction.ts#L49)
  destructures `_isPending` and never reads it; if the `useTransition` is
  only used to schedule, the boolean is moot. Confirm the purpose.
- **String-keyed style attribute escape hatches** — `style={cellElementStyle
  as React.CSSProperties}` in
  [GridCell.tsx#L163](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L163).
  Tighten the return type of `useGridCellStyle` to remove the cast.

---

## Positive Observations

The review wouldn't be balanced without noting strengths:

- **Strict TypeScript discipline** — only **2** non-test `any` annotations
  across the whole codebase.
- **Only 1 TODO/FIXME comment** in source; tech debt is mostly architectural,
  not commented-but-ignored.
- **Excellent JSDoc coverage** on stores and hooks, with cross-links to
  tests.
- **Strong test colocation** for stores (gridStore has 9 dedicated test
  files).
- **Good use of lazy boundaries** in `App.tsx` and `MainAppLayout.tsx` —
  reduces initial bundle.
- **`immer` middleware** is used consistently per AGENTS.md guidance.
- **Per-field Zustand selectors** are used correctly in
  [useOptimize.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L86-L92)
  and others — when applied. Just not universal yet (see #6).

---

## Prioritized Action List

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Split `gridStore` (extract interaction state + reset orchestrator) | L | High |
| 2 | Remove cross-store side effects from store actions | M | High |
| 3 | Guard `window.useXStore` assignments behind env flag | XS | High (security/bundle) |
| 6 | Replace whole-store destructuring with per-field selectors | S | Med |
| 10 | Migrate `console.*` to `Logger` + add ESLint rule | S | Med |
| 4 | Version-tag the share-link codec | M | Med |
| 18 | Adopt React 19 native `<title>`/`<meta>` instead of imperative DOM | S | Low |
| 20 | Fix `toggleCellActive` null-check ordering bug | XS | Med (correctness) |
| 9 | Remove the no-op `migrate` block or implement it | XS | Low |
| 11/13 | Centralize constants and language list | S | Low |
