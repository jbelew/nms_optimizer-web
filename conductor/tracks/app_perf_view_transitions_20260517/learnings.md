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

<!-- Learnings from implementation will be appended below -->
