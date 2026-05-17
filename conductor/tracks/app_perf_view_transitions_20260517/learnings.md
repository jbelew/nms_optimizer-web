# Track Learnings: app_perf_view_transitions_20260517

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

### Mixed Visual Charts (Recharts)
- **Pattern:** Use `ComposedChart` when you need to combine different visual primitives.

### Multi-line Custom Tooltips
- **Pattern:** Use the `content` prop with a custom React component for complex tooltips.

### Visual Clamping for Outliers
- **Pattern:** Clamp visual data points but preserve original values in tooltips.

### Lighthouse-style Scoring
- **Pattern:** Use log-normal distribution for scoring health metrics.

### Modular Flask Blueprints
- **Pattern:** Refactor logically related routes into `Blueprint` files.

### Simple In-memory Caching
- **Pattern:** Implement `SimpleCache` with TTL for slow queries.

---

## [2026-05-17 19:55] - Phase 1 Task 1: Audit and Refactor Layout Components
- **Implemented:** Refactored AppHeader and AppFooter into compound components using shared context.
- **Files changed:** src/components/AppHeader/AppHeader.tsx, src/components/AppFooter/AppFooter.tsx, src/components/MainAppContent/MainAppLayout.tsx, plus 6 new context/provider files.
- **Commit:** c42d4f7
- **Learnings:**
  - Patterns: Context-Provider Split. To support React Fast Refresh, split context definition/hooks into `.ts` and providers into `.tsx`.
  - Gotchas: Perfectionist linting rules (sorting) triggered on new files.
  - Context: Granular compound components (like `AppHeader.LogoText` and `AppHeader.Subtitle`) allow for more flexible layout control in parent components while maintaining the compound pattern.
---

<!-- Learnings from implementation will be appended below -->
