# Track Learnings: import_jsdoc_refactor_20260517

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

### Frontend Patterns
- **Mixed Visual Charts (Recharts):** Use `ComposedChart` when you need to combine different visual primitives.
- **Multi-line Custom Tooltips:** Use the `content` prop with a custom React component for complex tooltips.
- **Visual Clamping for Outliers:** Clamp visual points but preserve original values in tooltips.
- **Lighthouse-style Scoring:** Use log-normal distribution for health scores.

### Backend Patterns
- **Modular Flask Blueprints:** Refactor logically related routes into `Blueprint` files.
- **Simple In-memory Caching:** Implement `SimpleCache` with TTL for slow queries.

---

<!-- Learnings from implementation will be appended below -->
