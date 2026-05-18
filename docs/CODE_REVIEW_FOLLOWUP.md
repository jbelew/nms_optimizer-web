# Code Review: Follow-Up Pass

**Project:** NMS Optimizer Web
**Date:** 2026-05-18 (follow-up to `CODE_REVIEW_FINDINGS.md`)
**Scope:** Diff vs. first review

This pass verifies the fixes from the first review, flags items that were
partially addressed, and identifies new smells introduced (or exposed) by
the refactor.

---

## ✅ Successfully Resolved

| # | Item | Verification |
|---|------|--------------|
| 1 | God-object gridStore split | Interaction state extracted to [interactionStore.ts](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/interactionStore.ts); gridStore down from **1,038 → 968** lines. |
| 2 | Cross-store side effects in gridStore actions | All `useTechStore.getState()…` / `useTechBonusStore…` / `useModuleSelectionStore…` calls **removed from gridStore**. Now centralized in [sessionCoordinator.ts](file:///home/jbelew/projects/nms_optimizer-web/src/store/sessionCoordinator.ts) (`resetSession`, `switchPlatform`, `commitOptimizationResult`). |
| 3 | `window.useXStore` leak | Both [moduleSelectionStore.ts#L177-L183](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/moduleSelectionStore.ts#L177) and [techBonusStore.ts#L178-L182](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/techBonusStore.ts#L178) now gate the assignment on `import.meta.env.VITE_E2E_TESTING \|\| w.__E2E_EXPOSE__`. |
| 3a | localStorage cleanup prefix bug | Now uses `key.startsWith("gridState")` ([gridStore.ts#L387](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L387)), matching the persistence key. |
| 4 | Share-link codec versioning | `SERIALIZATION_VERSION = "v1"` is prepended ([useGridDeserializer.tsx#L16, #L190](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx#L16)), deserializer detects `vN:` prefix and falls back to `v0` for legacy links. `parseInt` digit-scan replaced with safer `'0'…'9'` range check ([#L91-L94](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx#L91)). Tech codes moved to a safer range (123+) skipping the `\|` delimiter ([#L139-L154](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useGridDeserializer/useGridDeserializer.tsx#L139)). |
| 9 | No-op migrate block | Removed entirely; `persist` no longer has a `migrate` field. |
| 10 | `console.*` cleanup | Now **zero** raw `console.*` calls in production source outside [monitoring.ts](file:///home/jbelew/projects/nms_optimizer-web/src/utils/system/monitoring.ts) (the Logger implementation itself, where they are correct). Remaining matches are in `*.stories.*` and JSDoc `@example` blocks. |
| 18 | Imperative DOM `<meta>` injection | Replaced with React 19 declarative [Seo.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx) component rendering `<title>`, `<meta>`, `<link>`, and `<script type="application/ld+json">` directly. `useSeoAndTitle` dropped from **356 → 61 lines**. |
| 18a | DOM cleanup `prerendered.remove()` | Removed from [App.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L247-L256) `useEffect`. |
| 20 | `toggleCellActive` null-check bug | Reordered correctly: null check now precedes `cell.supercharged` access; `Logger.error` used ([gridStore.ts#L868-L883](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L868)). |
| 22 | `useIdleMount` extraction | New hook at [useIdleMount.ts](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useIdleMount/useIdleMount.ts) — properly typed, cancels on unmount. (See remaining call site issue under "Partially Resolved.") |

---

## ⚠️ Partially Resolved

### P1 — `useIdleMount` exists but isn't adopted everywhere

The new hook is great, but the duplicated implementations weren't migrated:

- [main.tsx#L186-L194](file:///home/jbelew/projects/nms_optimizer-web/src/main.tsx#L186)
- [gridStore.ts#L402-L405](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L402) (storage cleanup)

Both still polyfill `requestIdleCallback` inline. The gridStore one is
non-React so naturally can't use the hook — but the cleanup logic should at
least be extracted to a shared utility `runWhenIdle(fn, { timeout })`.

### P2 — `MainAppBackgroundServices` may still be using the old inline pattern

Verify [MainAppLayout.tsx](file:///home/jbelew/projects/nms_optimizer-web/src/components/MainAppContent/MainAppLayout.tsx)
has been switched to the new hook. The file dropped from 474 → 317 lines, so
much was already removed, but confirm `useIdleMount()` replaces the local
`useEffect`/`setMount` block.

### P3 — Cross-store coupling reduced, not eliminated

`sessionCoordinator` cleaned up `gridStore`, but **`techStore` still
directly couples to `moduleSelectionStore`**:

- [techStore.ts#L197](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/techStore.ts#L197):
  `initializeTechTree` reads `useModuleSelectionStore.getState()`.
- [techStore.ts#L243](file:///home/jbelew/projects/nms_optimizer-web/src/store/tech/techStore.ts#L243):
  `setTechGroups` does the same.

Both should be pulled into `sessionCoordinator` (e.g.
`hydrateTechTreeFromApi(techGroups, activeGroups, colors)`).

---

## ❌ Not Addressed

### N1 — Whole-store destructuring still causes excess re-renders

Original review #6. **None of these were converted to per-field selectors:**

- [App.tsx#L101](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L101):
  `const { errorType, showError } = useOptimizeStore();`
- [App.tsx#L234](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L234):
  `const { showError } = useOptimizeStore();`
- [errorDialog.tsx#L37](file:///home/jbelew/projects/nms_optimizer-web/src/components/AppDialog/Error/errorDialog.tsx#L37):
  `const { setShowError, showError } = useOptimizeStore();`

Replace with `useOptimizeStore((s) => s.showError)` etc. — significant given
`<App>` and `<ErrorDialog>` sit near the root.

### N2 — `OTHER_LANGUAGES` hardcoded list

Original review #13. Still present at
[dialogContext.tsx#L11](file:///home/jbelew/projects/nms_optimizer-web/src/context/dialogContext.tsx#L11):

```ts
const OTHER_LANGUAGES = ["es", "fr", "de", "pt", "it"];
```

Meanwhile [Seo.tsx#L30](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx#L30),
[useSeoAndTitle.ts#L27](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useSeoAndTitle/useSeoAndTitle.ts#L27),
and [useLanguage.ts#L34](file:///home/jbelew/projects/nms_optimizer-web/src/hooks/useLanguage/useLanguage.ts#L34)
already derive the list dynamically from
`Object.keys(i18n.services.resourceStore.data)`. The drift is now actively
costly: adding a 6th locale will register everywhere except `dialogContext`,
silently breaking routed dialogs in that language.

**Fix:** Replace `OTHER_LANGUAGES.includes(langCand)` with the same dynamic
lookup, or extract a `useSupportedLanguages()` hook used by all four sites.

### N3 — 7-clause `||` chain for dialog type matching

[dialogContext.tsx#L77-L86](file:///home/jbelew/projects/nms_optimizer-web/src/context/dialogContext.tsx#L77):

```ts
const activeDialog: DialogType =
  dialogPath === "about" ||
  dialogPath === "instructions" ||
  dialogPath === "changelog" ||
  dialogPath === "translation" ||
  dialogPath === "userstats" ||
  dialogPath === "privacy" ||
  dialogPath === "performance"
    ? dialogPath
    : null;
```

Trivially replaceable with a `Set<DialogType>` lookup.

### N4 — Boolean-bag state on `OptimizeStore`

Original review #5. The shape is still:

```ts
error: Error | null;
errorType: ErrorType | null;
showError: boolean;
solving: boolean;
progressPercent: number;
patternNoFitTech: null | string;
```

…with the tri-arg setter `setShowError(show, type?, error?)`.

A discriminated union (`status: { kind: "idle" } | { kind: "solving"; progress } | { kind: "patternNoFit"; tech } | { kind: "error"; type; error }`) would eliminate invalid combinations and remove every "boolean + other field" coordination.

### N5 — gridStore still exposes 5 zero-arg getters

`isGridFull()`, `hasTechInGrid(tech)`, `selectFirstInactiveRowIndex()`,
`selectHasModulesInGrid()`, `selectLastActiveRowIndex()`,
`selectTotalSuperchargedCells()` ([#L306-L325](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L306))
still mirror the underscored cache fields. As before, every call goes
through a function and therefore can't participate in Zustand's
selector-based subscription model. Most consumers should use
`useGridStore((s) => s._isGridFull)` directly.

### N6 — Underscore-prefixed "private" fields still in the public type

Original review #8 — the convention-only "privacy" continues. `GridComputed`
exists ([#L329](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L329))
as an interface but `_firstInactiveRowIndex`, `_hasModulesInGrid`,
`_isGridFull`, `_lastActiveRowIndex`, `_totalSuperchargedCells`,
`activeTechs` are still on the public `GridStore` type and could
accidentally be persisted.

### N7 — Suspense pile in `App.tsx` unchanged

Original review #16. [App.tsx#L152-L201](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L152)
still has 4 separate `<Suspense fallback={null}>` wrappers gated by
overlapping conditions (`shareUrl`, `activeDialog !== "userstats" && !== "performance"`,
`activeDialog === "userstats"`, `activeDialog === "performance"`, `showWelcome`).
A single `<DialogPortal />` dispatcher would collapse this.

### N8 — Defensive `?.` chains on a typed `Module`

Original review #17. [gridStore.ts#L213-L226](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L213)
still has `moduleData?.field ?? default` on every field.

### N9 — Magic numbers untouched

Original review #11.

- `DOUBLE_TAP_THRESHOLD = 400` at
  [useGridCellInteraction.ts#L11](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/useGridCellInteraction.ts#L11).
- Debounce `1000` ([gridStore.ts#L468](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L468)).
- `setTimeout(performCleanup, 500)` ([gridStore.ts#L405](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L405)).
- `loading={rowIndex < 5 ? "eager" : "lazy"}` at
  [GridCell.tsx#L71](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L71) — why 5?

### N10 — Per-render string operations in `GridCell`

Original review #14. `ModuleContent` still does
`base1x.replace(/\.webp$/, "@2x.webp")` and template-literal concatenation
on every render ([GridCell.tsx#L57-L60](file:///home/jbelew/projects/nms_optimizer-web/src/components/GridCell/GridCell.tsx#L57)).

### N11 — Inconsistent file naming

Original review #19. Not touched:
- `languageSelector.tsx` (camelCase)
- `messageSpinner.tsx`
- `markdownContentRenderer.tsx`
- `tooltipContext.tsx`
- `createToastContext.ts`
- `errorDialog.tsx`
- `updatePromptWrapper.tsx`
- `shipSelection.tsx`

AGENTS.md mandates PascalCase for components.

### N12 — `Cell` field naming still mixed snake_case/camelCase

Original review #19. [gridStore.ts#L41-L70](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L41).
Acceptable if a deliberate API-boundary mirror, but should be documented as
such on the type.

### N13 — 901-line `PerformanceUtils.ts` and 751-line `performanceChart.tsx` remain test-free

Original review #21.

---

## 🆕 New / Newly Exposed Issues

### NEW1 — Dead lazy import preserved with an `eslint-disable`

[App.tsx#L43-L44](file:///home/jbelew/projects/nms_optimizer-web/src/App.tsx#L43):

```tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AppDialog = lazy(() => import("./components/AppDialog/Base/AppDialog"));
```

The dialog API was migrated to compound components (`AppDialogRoot`,
`AppDialogTitle`, `AppDialogBody`, `AppDialogFooter`) and `AppDialog` is no
longer used anywhere in the file. The fix is to **remove the import**, not
silence the linter. As-is, every page load pays the chunk-hint cost for a
component that never renders.

### NEW2 — Three unused store imports left behind in `gridStore.ts`

After the cross-store side effects were extracted to `sessionCoordinator`:

```ts
import { useModuleSelectionStore } from "@/store/tech/moduleSelectionStore";
import { useTechBonusStore } from "@/store/tech/techBonusStore";
import { useTechStore } from "@/store/tech/techStore";
```

([gridStore.ts#L8-L10](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L8))
are imported but never referenced. They (a) inflate the bundle's static
dependency graph, (b) preserve the *appearance* of coupling that the
refactor was meant to remove, and (c) will hide if any of those stores
moves modules around. Delete them.

### NEW3 — `sessionCoordinator` reaches into 5 stores via `getState()`

[sessionCoordinator.ts#L76-L94](file:///home/jbelew/projects/nms_optimizer-web/src/store/sessionCoordinator.ts#L76)
and [#L100-L121](file:///home/jbelew/projects/nms_optimizer-web/src/store/sessionCoordinator.ts#L100)
each call `useGridStore.getState()`, `useTechStore.getState()`,
`useTechBonusStore.getState()`, `useModuleSelectionStore.getState()`,
`useInteractionStore.getState()` in sequence. This is exactly the
god-object shape we just moved off `gridStore`, just relocated. It's an
acceptable home for orchestration, but watch the surface area: any new
"global" action will accrete here. Consider:

1. Defining a typed `OrchestratorContext` once at module load, so each
   action doesn't repeat the five `.getState()` calls.
2. Wrapping multi-store writes in a single immer/transition boundary so
   subscribers see one update instead of five cascading ones.

### NEW4 — `commitOptimizationResult` floats outside `useOptimize`'s React subscriptions

`useOptimize` reads `selectedShipType`/`isLarge`/`patternNoFitTech` reactively
but then calls `sessionCoordinator.commitOptimizationResult(data, tech)` —
which itself reads four stores via `getState()`. If the underlying
`useGridStore.setResult` ever needs to fire side effects in another store,
the only way to know is to read the coordinator. The trade-off is
documented (orchestration vs. coupling), but the function name should make
it obvious that it writes multiple stores. Consider exporting a typed
result like `{ touched: ["grid", "tech", "techBonus"] }` for traceability,
or at minimum keep the JSDoc enumerating every store it mutates.

### NEW5 — `computeBonusStatus` uses scientific-notation rounding hack

[sessionCoordinator.ts#L12-L13](file:///home/jbelew/projects/nms_optimizer-web/src/store/sessionCoordinator.ts#L12):

```ts
const rounded = Math.round(Number(maxBonus + "e" + 2)) + "e-" + 2;
const roundedMaxBonus = Number(rounded);
```

This is a known JS idiom for 2-decimal rounding, but:

1. It breaks for `NaN`, `Infinity`, and very large numbers.
2. It silently produces wrong results for numbers in scientific notation
   themselves (e.g. `1e10` → `"1e10e2"` → `NaN`).
3. It's less readable than `Math.round(maxBonus * 100) / 100`.

Replace with the multiplicative form, or use `toFixed(2)` + `Number()` if
banker's rounding isn't required.

### NEW6 — `sessionCoordinator.switchPlatform` no longer touches `superchargedFixed` / `gridFixed`

Compared to the old `setGridAndResetAuxiliaryState` in gridStore, the
extracted `switchPlatform` only calls `setGrid`, `setIsSharedGrid(false)`,
`setBuildName(null)`. The old action also implicitly reset `result` to
`null`. Verify the regression: does the optimization result from the
previous platform now persist briefly into the new one? If so, add
`gridStore.setResult(null)`.

### NEW7 — `Seo` component re-creates `normalizePath` twice

[Seo.tsx#L51-L52, #L89-L93](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx#L51)
defines the same `normalizePath` helper in two scopes. Hoist it to module
scope or a util file.

### NEW8 — `Seo`'s `useMemo` over-includes `i18n.services.resourceStore.data`

The whole nested data object is in the dependency array
([Seo.tsx#L73](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx#L73)).
If i18n hot-reloads or lazy-loads any new key, the memo recomputes and all
the `<meta>` tags re-render. Memoize on
`Object.keys(i18n.services.resourceStore.data).join(",")` or on
`i18n.language` alone (since locales are loaded at language switch).

### NEW9 — `Seo` mixes `useMemo` return values with values used only outside

`baseUrl`, `ogImageUrl`, `ogImageAlt` are computed below `useMemo`
([Seo.tsx#L75-L77](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx#L75)),
and `baseUrl` is duplicated inside the memo
([#L50](file:///home/jbelew/projects/nms_optimizer-web/src/components/Seo/Seo.tsx#L50)).
Extract the URL constant to module scope.

### NEW10 — `gridStore` `version: 1` field still on the type but no migration

[gridStore.ts#L914](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L914)
keeps `version: 1` in the state and
[#L951](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L951)
sets `version: 1` on the persist config. Now that the `migrate` callback is
gone, the in-state `version` field is dead. Either remove it from
`GridStore` and the persisted payload, or implement migrations and use it.

### NEW11 — `partialize` still pulls platform from another store

[gridStore.ts#L944](file:///home/jbelew/projects/nms_optimizer-web/src/store/grid/gridStore.ts#L944):
`selectedPlatform: usePlatformStore.getState().selectedPlatform`.

Acceptable as a quick mismatch-detection mechanism (`getItem` discards the
blob if platform changed), but: this is the **last cross-store call left in
gridStore** after the refactor. Move the check itself into a custom
storage adapter or into `sessionCoordinator.hydrate()` so the grid store
remains decoupled.

---

## 📊 Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| `gridStore.ts` LOC | 1,038 | 968 | −70 |
| `useSeoAndTitle.ts` LOC | 356 | 61 | −295 |
| `MainAppLayout.tsx` LOC | 474 | 317 | −157 |
| Total `src/` LOC | 24,721 | 24,807 | +86 (new files) |
| Production `console.*` calls | ~107 | 4 (all in `monitoring.ts`) | −103 ✅ |
| Non-test `.getState()` calls | 55 | 58 | +3 (relocated to coordinator) |
| Cross-store imports in `gridStore` | 4 actively used | 1 used + 3 dead | −3 ✅ (but dead imports remain) |
| Stores attached unguarded to `window` | 2 | 0 | ✅ |
| New colocated tests for stores? | — | — | unchanged |

---

## 🎯 Recommended Next Round (Effort vs. Impact)

| # | Item | Effort | Impact |
|---|------|--------|--------|
| NEW2 | Delete 3 unused imports in `gridStore.ts` | XS | Med (signals true decoupling) |
| NEW1 | Delete the dead `AppDialog` lazy import | XS | Low (correctness, bundle clarity) |
| N1 | Convert `useOptimizeStore()` destructures to per-field selectors (3 sites) | S | Med |
| N2/N3 | Replace `OTHER_LANGUAGES` + 7-clause `\|\|` chain with shared helpers/Sets | S | Med (drift risk) |
| NEW6 | Verify `switchPlatform` resets `result` | XS | High (potential regression) |
| NEW5 | Replace scientific-notation rounding in `computeBonusStatus` | XS | Med (correctness) |
| NEW10 | Remove dead `version` field or implement migrations | XS | Low |
| P3 | Move `techStore.initializeTechTree`'s moduleSelection coupling into `sessionCoordinator` | M | Med |
| N4 | Discriminated-union refactor of `OptimizeStore` | M | Med |
| N5/N6 | Drop zero-arg `selectXxx` getters, mark cache fields private | S | Low |
| N10 | Memoize precomputed `srcSet` strings on the cell model | S | Low |

---

## Net Assessment

The refactor decisively closed the **highest-severity** items from the
first review:

- The god-object pattern is meaningfully broken up (sessionCoordinator,
  interactionStore).
- Production logging is now disciplined.
- The hidden share-link codec hazards (no version, control-char
  collisions, `parseInt` digit scan) are repaired.
- Two real bugs (toggleCellActive ordering, localStorage prefix mismatch,
  unguarded window globals) are gone.
- The largest hook (`useSeoAndTitle`) shrank by 83% via the React 19 native
  approach.

The remaining work is mostly cosmetic / drift-prevention: per-field
selectors, single sources of truth for the language list, dead imports,
and a fresh look at the new `sessionCoordinator` to make sure it doesn't
quietly become the next god object.
