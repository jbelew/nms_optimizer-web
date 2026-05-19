# Code Review – Anti-Patterns & Code Smells

_Date: 2026-05-19_
_Scope: `src/` (excluding tests where noted)_

This review documents recurring anti-patterns, code smells, and architectural risks found in the `nms_optimizer-web` codebase. Each finding includes severity, location(s), and a suggested remediation. The goal is to prioritise improvements that reduce long-term maintenance burden, not to rewrite working features.

Severity legend:
- 🔴 **High** – correctness, security, performance, or a serious maintenance hazard.
- 🟠 **Medium** – maintainability or developer-experience problem; fix opportunistically.
- 🟡 **Low** – nit / style / tightening.

---

## 1. Cross-store coupling via `useStore.getState()` (🔴 High)

`getState()` is called in non-test code in **57 places**, including 23 hits inside hooks and the `sessionCoordinator`. Using `getState()` outside of one-off event handlers couples modules together imperatively, side-steps React subscription tracking, and is a primary source of "I changed a store and these unrelated screens broke" bugs.

Examples:
- [src/hooks/useGridDeserializer/useGridDeserializer.tsx#L488-L547](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx#L488-L547) – callbacks read `useGridStore.getState().grid` and `usePlatformStore.getState().selectedPlatform` directly instead of subscribing.
- [src/hooks/useOptimize/useOptimize.tsx#L160-L161](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L160-L161) – pulls `setGrid` and `checkedModules` snapshot inside a handler.
- [src/store/sessionCoordinator.ts](file:///home/jbelew/projects/nms_optimizer-web/src/store/sessionCoordinator.ts) – the whole module is an `getState()`-style orchestrator. While it's a good idea to centralise multi-store transactions, the dependency direction is "store coordinator pulls from N stores" which is the textbook _shotgun coupling_ smell it sets out to avoid.

**Recommendation:** Prefer subscribing through `useStore(selector)` in hooks. Reserve `getState()` for top-of-handler reads where you genuinely need an out-of-render snapshot. Consider replacing `sessionCoordinator` with explicit events (e.g., a tiny event bus or per-store `subscribeWithSelector`) so stores listen for what they care about instead of being mutated from the outside.

---

## 2. `gridStore.ts` is a god module (🔴 High)

[src/store/grid/gridStore.ts](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts) is **932 lines** and combines:

- Public types (`Cell`, `Grid`, `ApiResponse`).
- Factories (`createEmptyCell`, `createGrid`, `createCellFromModuleData`).
- Mutating utility (`resetCellContent`).
- A bespoke debounced storage adapter for Zustand persist.
- A localStorage **garbage-collection sweep** triggered from inside `getItem` (lines 369–393).
- The full Zustand store with ~25 actions.
- Window-globals for E2E tests (lines 920–931).

Splitting concerns:
- Move types and factories to `gridTypes.ts` / `gridFactories.ts`.
- Move `debouncedStorage` and `debounceSetItem` to `gridPersistence.ts`.
- Move the E2E `window` exposure to a dedicated `e2eExpose.ts` module that is imported only when `VITE_E2E_TESTING` is on.

**Why this matters:** Touching anything in this file forces re-review of an enormous surface. The file already has multiple test files specifically because the store is too large to test in one suite.

---

## 3. Module-level side effects on `window` (🔴 High)

[src/App.tsx#L30-L32](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L30-L32):

```ts
if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__AppDialog_keep = _AppDialog;
}
```

This runs at import time, mutates `window`, and exists solely to defeat tree-shaking on a lazy-loaded chunk. It also uses an unsafe double cast.

Combined with [gridStore.ts#L920-L931](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L920-L931) (`useGridStore`, `handleCellDoubleTap` placed on `window` for E2E), the app leaks several writable globals in production builds. This is both a SSR/test ergonomics hazard and an actual API surface for browser extensions / users.

**Recommendation:**
- Investigate the root cause of the `AppDialog` tree-shake (likely a Rolldown `sideEffects: false` issue or a re-export removed by minifier). Fix it properly via the package's `sideEffects` field or by importing the symbol where it is genuinely used.
- Gate the E2E `window` block on `import.meta.env.VITE_E2E_TESTING` _at build time_ so the code is not shipped to end users.

---

## 4. Persist storage adapter performs destructive cleanup on read (🔴 High)

In [gridStore.ts#L366-L393](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L366-L393), `debouncedStorage.getItem`:

1. Enumerates **all** keys starting with `gridState` other than the requested key.
2. Removes them via `runWhenIdle`.

Problems:
- A read is performing a write. Storage adapters should be referentially transparent.
- If another tab or future migration writes a `gridStateXxx` key (versioned suffix is a common Zustand pattern), it will be deleted out from under it.
- Errors are swallowed with only a `Logger.warn`.

**Recommendation:** Move the cleanup to an idempotent migration that runs once during app bootstrap (after `onRehydrateStorage`), or simply do not delete unknown keys.

---

## 5. Mutating `Cell` and using `Object.assign` to "restore" Immer drafts (🟠 Medium)

[src/store/grid/gridStore.ts#L252-L256](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L252-L256):

```ts
export const resetCellContent = (cell: Cell) => {
    const { active, supercharged } = cell;
    const emptyCell = createEmptyCell(supercharged, active);
    Object.assign(cell, emptyCell);
};
```

…and [`restoreGridState`](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L747-L756):

```ts
restoreGridState: (savedState) =>
    set((state) => {
        Object.assign(state, savedState);
        recomputeDerivedState(state);
    }),
```

`Object.assign(draft, …)` is allowed by Immer but happily overwrites **action functions** if `savedState` contains keys that collide with the store's own methods. The action accepts a `Partial<GridStore>` which structurally includes the actions themselves. A corrupted localStorage payload or future serializer bug could replace `setGrid` with `null`.

**Recommendation:** Narrow the argument type to a `Partial<GridState>` (state only, no actions), or explicitly assign only known state keys.

---

## 6. `recomputeDerivedState` has dead/duplicated branches (🟡 Low)

[gridStore.ts#L543-L566](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L543-L566) clears all derived state twice — once for `!state.grid` and once for `!state.grid.cells` — with identical bodies. `grid` is always present (initialized with `createGrid(10, 6)`) and `cells` is non-nullable on the `Grid` type. Both guards can be removed (or unified into one), trimming the function and making the intent obvious.

---

## 7. Snake_case state shape leaks the Python backend across the app (🟠 Medium)

The `Cell` type and `TechStore` deliberately mix `camelCase` UI fields with `snake_case` API fields (`adjacency_bonus`, `solve_method`, `max_bonus`, `sc_eligible`, `group_adjacent`). This propagates the wire-format into every component that reads a cell.

**Recommendation:** Translate at the API boundary (one adapter function per response). Internal types use `camelCase`. Translation cost is negligible and prevents continued contamination.

---

## 8. `Cell` updates use `??` against falsy zeros (🟠 Medium)

[gridStore.ts#L624-L657](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L624-L657) `applyModulesToGrid` does e.g.:

```ts
adjacency_bonus: m.adjacency_bonus ?? cell.adjacency_bonus,
bonus: m.bonus ?? cell.bonus,
value: m.value ?? cell.value,
```

When the API legitimately returns `0` for `bonus` or `value`, the previous cell value is preserved instead of being overwritten — silently producing wrong totals. `??` is correct only when the field is allowed to be missing _and_ `0` is not meaningful. Since these are numeric stats, prefer explicit `m.bonus !== undefined ? m.bonus : cell.bonus` or, better, require the field on the type.

Same pattern lives at [gridStore.ts#L216-L233](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L216-L233) in `createCellFromModuleData`.

---

## 9. URL search parsed at module init time (🟠 Medium)

[gridStore.ts#L709](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L709):

```ts
isSharedGrid: new URLSearchParams(getWindowSearch()).has("grid"),
```

This runs the first time the store module is imported. In SSR/SSG (the project uses `scripts/generate-ssg.mjs`) `window` is undefined, which is why the helper exists, but it still ties initial state to wall-clock URL state at module evaluation. The same flag is also recomputed inside `merge` for persist.

**Recommendation:** Derive `isSharedGrid` once at app bootstrap (e.g., in `useUrlSync` or a router-level effect) and set it through a normal action.

---

## 10. Twelve separate Zustand stores + a coordinator (🟠 Medium)

The store layout is:

```diagram
╭───── store/ ─────╮
│ app/             │
│  ├ a11yStore     │
│  ├ errorStore    │
│  ├ optimizeStore │
│  ├ platformStore │
│  ├ sessionStore  │
│  ├ shakeStore    │
│  └ themeStore    │
│ grid/            │
│  ├ gridStore     │
│  └ interactionStore │
│ tech/            │
│  ├ moduleSelectionStore │
│  ├ techBonusStore │
│  ├ techStore     │
│  └ techTreeLoadingStore │
│ ui/              │
│  └ moduleSelectionDialogStore │
╰──────────────────╯
```

Several of these are extremely thin (`shakeStore`, `themeStore`, `techTreeLoadingStore`, `moduleSelectionDialogStore`). The proliferation forced the creation of `sessionCoordinator` to multi-mutate them, which is itself a smell (see §1).

**Recommendation:** Collapse tiny single-flag stores into a `uiStore` or co-locate flags with the feature that owns them. Reserve dedicated stores for state with non-trivial behaviour or persistence.

---

## 11. Imperative DOM mutation inside a React component (🟠 Medium)

[src/components/AppHeader/AppHeader.tsx#L30-L36](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppHeader/AppHeader.tsx#L30-L36):

```ts
useEffect(() => {
    if (a11yMode) {
        document.body.classList.add("a11y-font");
    } else {
        document.body.classList.remove("a11y-font");
    }
}, [a11yMode]);
```

A leaf-ish header component is reaching into `document.body`. If the component unmounts (route swap, dialog) the class remains stuck. Side effects on `document.body` belong either in a single top-level "global classes" effect, or as a `data-a11y` attribute on a wrapper element that React controls.

---

## 12. `BonusStatusIcon` API has an unused, underscore-prefixed prop (🟡 Low)

[src/components/TechTreeRow/TechTreeRow.tsx#L31-L67](file:///home/jbelew/projects/nms_optimizer-web/src/components/TechTreeRow/TechTreeRow.tsx#L31-L67):

```ts
interface BonusStatusIconProps {
    _techMaxBonus: number;
    tech: string;
    techSolvedBonus: number;
}
```

`_techMaxBonus` is documented, threaded through callers, but never read inside the component. Either remove the prop everywhere or actually use it. Vestigial parameters are landmines for future refactors.

---

## 13. `useMemo` used where `useCallback` is intended (🟡 Low)

[src/components/TechTreeRow/TechTreeRow.tsx#L247-L250](file:///home/jbelew/projects/nms_optimizer-web/src/components/TechTreeRow/TechTreeRow.tsx#L247-L250):

```ts
const handleOpenDialog = useMemo(
    () => () => openDialog({ tech, techColor, techImage }),
    [openDialog, tech, techColor, techImage]
);
```

`useMemo` returning a function is equivalent to `useCallback` and conventionally read as such. Use `useCallback` for intent clarity (and saves one wrapping closure tier).

---

## 14. String manipulation to derive CSS classes (🟡 Low)

[src/components/TechTreeRow/TechTreeRow.tsx#L110-L114](file:///home/jbelew/projects/nms_optimizer-web/src/components/TechTreeRow/TechTreeRow.tsx#L110-L114):

```ts
const icon = renderIcon(
    contentData.icon,
    contentData.iconClassName.replace("cursor-pointer", ""),
    contentData.iconStyle
);
```

Building one className that includes `cursor-pointer`, then stripping it back out at the call site, is an anti-pattern. Separate the icon's intrinsic classes from interaction classes from the start.

---

## 15. `useGridDeserializer` mixes I/O, parsing, validation, and store writes (🟠 Medium)

[src/hooks/useGridDeserializer/useGridDeserializer.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx) is 550 lines and contains:

- RLE compress/decompress (pure functions).
- The wire-format `serialize`/`deserialize` (string parsing + validation).
- The actual hook that pulls store setters and dispatches.

The pure functions and the hook should live in separate files (`gridSerializer.ts` vs `useGridDeserializer.ts`). The hook would then be small and trivially mockable.

The deserializer also hard-codes magic character codes (123 / 124 / 65) without named constants — the comments explain the intent but the constants don't carry the meaning into the code.

---

## 16. Welcome dialog state is derived but stored (🟠 Medium)

[src/App.tsx#L113-L130](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L113-L130):

```ts
const [showWelcome, setShowWelcome] = useState(!userVisited && !activeDialog && !isBot());

useEffect(() => {
    if (!userVisited && activeDialog) {
        markUserVisited();
    }
}, [activeDialog, userVisited, markUserVisited]);
```

`showWelcome` only depends on three other reactive values; freezing it on first render then mutating via `setShowWelcome` produces drift if any of those values change before the user dismisses the dialog (e.g., dialog opens via route navigation).

**Recommendation:** Compute `showWelcome` directly from props/state without `useState`, or model it explicitly in the dialog context.

---

## 17. Heavy use of `lazy(() => import(…).then((m) => ({ default: m.X })))` (🟡 Low)

Every named-export lazy import in [src/App.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx) and [src/components/MainAppContent/MainAppLayout.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx) repeats the same `.then((m) => ({ default: m.X }))` boilerplate. A 3-line `lazyNamed(import, "Name")` helper would remove the noise across ~10+ call sites.

---

## 18. `Suspense fallback={null}` is overused (🟠 Medium)

`fallback={null}` appears around almost every `Suspense` in the app shell (App, MainAppLayout, RoutedDialogs). This silently hides the loading state from users on slow networks. At minimum, use the existing `TechTreeSkeleton` / `MessageSpinner` for visible regions, or wrap the section to keep layout stable.

---

## 19. Disabled lint rules (🟡 Low)

```
src/components/ModuleSelectionDialog/SharedModuleSelectionDialog.tsx:123:  // eslint-disable-next-line react-hooks/exhaustive-deps
src/hooks/useBuildFileManager/useBuildFileManager.ts:77/189:               /* eslint-disable perfectionist/sort-objects */
src/routes.tsx:1:                                                          /* eslint-disable react-refresh/only-export-components */
src/utils/analytics/tracking.ts:43:                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
```

Each is a small wart, but `react-hooks/exhaustive-deps` disables in particular tend to mask real stale-closure bugs. Review and either fix or add a comment explaining why the rule is genuinely incorrect for that line.

---

## 20. `useOptimize` captures stale closure values inside `OptimizationManager` callbacks (🔴 High)

In [src/hooks/useOptimize/useOptimize.tsx#L151-L251](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useOptimize/useOptimize.tsx#L151-L251) the `handleOptimize` function:

1. Is **re-created every render** (not memoized) — every consumer of `useOptimize` receives a new function each render. Anything memoizing on it busts immediately.
2. Captures `patternNoFitTech`, `selectedShipType`, `isLarge`, `sendEvent`. The `manager.start()` lives across many subsequent renders, and its `onComplete` / `onError` / `onPatternNoFit` callbacks compare against the **render-time** value of `patternNoFitTech`. If the user clicks optimize while one is in flight, the comparison `patternNoFitTech === tech` may use a stale tech.

**Recommendation:**
- Wrap `handleOptimize` in `useCallback` with a `useLatest` (the project already has `useLatest`) for `patternNoFitTech` / `selectedShipType` to avoid recreating the manager closure on each render.
- Or have `OptimizationManager` re-read those values from the store at firing time instead of being closed over.

---

## 21. Type smells (🟡 Low)

- `as unknown as` double casts appear in `App.tsx`, `tracking.ts`, `monitoring.ts`, `idle.ts`, `ConditionalTooltip`. Most can be fixed with a narrow `interface` instead of round-tripping through `unknown`.
- `(window as unknown as { google_tag_manager?: object })` — declare a `globalThis` augmentation once in `src/types/`.
- `parseFloat(innerRadius_ as unknown as string)` in [src/components/AppDialog/UserStats/userStatsData.tsx#L93-L96](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppDialog/UserStats/userStatsData.tsx#L93-L96) — Recharts callback already provides the value as a number; the cast hides a real type mismatch.

---

## 22. `if (cell.active || !supercharged) cell.supercharged = supercharged;` (🟡 Low)

[gridStore.ts#L791-L801](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L791-L801). The condition is hard to read and means "set supercharged unless we are trying to set true on an inactive cell." Pull the predicate out as `const canSetSupercharged = cell.active || !supercharged;` or invert for clarity:

```ts
if (supercharged && !cell.active) return;
cell.supercharged = supercharged;
```

---

## 23. Migration logic embedded in `useState` initialiser (🟡 Low)

[src/context/dialogContext.tsx#L61-L77](file:///home/jbelew/projects/nms_optimizer-web/src/context/dialogContext.tsx#L61-L77) reads two localStorage keys, writes one, and deletes another, all inside a `useState` lazy initialiser. This works because it runs once, but the side effects (`safeSetItem` / `safeRemoveItem`) are surprising in an initializer. Move the migration to a dedicated `migrateTutorialKey()` called from a one-time bootstrap effect.

---

## 24. Boolean comparisons against `=== true` / `!== false` (🟡 Low)

`createCellFromModuleData` in `gridStore.ts`:

```ts
active: moduleData?.active !== false,
supercharged: moduleData?.supercharged === true,
```

Mixing the two forms inside the same factory invites bugs when the type allows `undefined`. Pick one convention (`Boolean(moduleData?.supercharged)` or `moduleData?.supercharged ?? false`) and stick to it.

---

## 25. `MainAppLayout.tsx` over-componentises trivial wrappers (🟡 Low)

[src/components/MainAppContent/MainAppLayout.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx) declares 10+ tiny single-render components (`BuildNameUtility`, `FilePickerUtility`, `OptimizationAlertUtility`, etc.) each of which:
- Calls one or two hooks.
- Returns one JSX node.
- Adds a `Suspense` boundary.

The result is more indirection than the components save. Several could be inlined; the genuine boundary is `MainAppBackgroundServices`. Aim for components that justify their existence with reuse, branching, or memoization.

---

## 26. Tests imported into production via re-exports (🟡 Low)

`gridStore.ts` carries `@see` JSDoc links to its own test files, which is fine, but the existence of `persistence_regression.test.ts` suggests at least one historical regression in the persist adapter that warrants the suggested split in §2.

---

## Summary of top-priority work

| # | Area | Effort | Payoff |
|---|------|--------|--------|
| 3 | Remove `window` side effects / fix tree-shake at the root | S | High (security + correctness) |
| 4 | Stop deleting localStorage inside `getItem` | S | High (correctness) |
| 20 | Memoize `handleOptimize` and capture latest store values via ref/selector | M | High (race-condition fix) |
| 1, 10 | Reduce `getState()` callsites; collapse trivial stores | M | High (maintainability) |
| 2 | Split `gridStore.ts` into types / factories / persistence / store | M | Medium |
| 8 | Replace `??` with explicit `=== undefined` for numeric API fields | S | Medium (correctness) |
| 7 | Translate snake_case API at the boundary | M | Medium |
| 15 | Split serializer from `useGridDeserializer` | S | Medium |
| 5 | Narrow `restoreGridState` type so actions can't be overwritten | S | Medium |

The architecture is fundamentally sound — single-page React + Zustand + Suspense + persist works well for this app — but most of the high-severity findings cluster around state management hygiene (cross-store `getState()` use, monolithic gridStore, side-effecting storage adapter) and the fragility of the lazy-loading / tree-shaking workarounds. Addressing those would noticeably reduce the "magic" the next contributor has to learn.
