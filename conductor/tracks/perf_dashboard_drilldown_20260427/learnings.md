# Track Learnings: perf_dashboard_drilldown_20260427

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- Recharts is lazy-loaded to optimize performance.
- Core Web Vitals are tracked hourly using BigQuery.
- Radix UI Themes is used for consistent styling.

---

## 2026-04-27 10:30 - Phase 1 Task 1-3: Backend Data Enhancement
- **Implemented:** Updated BigQuery query in `src/app.py` to calculate p50 and p90 using `APPROX_QUANTILES`. Updated result processing to return these fields. Added unit tests in `test_app_endpoints.py`.
- **Files changed:** `src/app.py`, `src/tests/test_app_endpoints.py`
- **Commit:** beb49af
- **Learnings:**
  - Patterns: Used `APPROX_QUANTILES(column, 100)[OFFSET(N)]` for percentile calculation in BigQuery.
  - Gotchas: `unittest.mock.patch` was used to mock the BigQuery client for local testing.
---
