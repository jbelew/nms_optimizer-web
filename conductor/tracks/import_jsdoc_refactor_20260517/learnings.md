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

## 2026-05-17 16:05 - Phase 2: Import Refactor (@ Alias)
- **Implemented:** Project-wide refactor of internal imports to use the '@/' alias for parent-directory references, following the Hybrid Approach (siblings remain relative).
- **Files changed:** Refactored over 30 files across src/components, src/hooks, src/context, and src/utils.
- **Learnings:**
  - Patterns: Automated import refactoring using a Python script (scripts/refactor_imports.py) is highly effective for large-scale alias migrations.
  - Gotchas: Always verify with 'bun run typecheck' after bulk refactoring to catch any missed edge cases or incorrect path resolutions.
---
