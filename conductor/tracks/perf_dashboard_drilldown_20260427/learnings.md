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

## 2026-04-27 10:45 - Phase 2 Task 1-4: Frontend State & Card UI
- **Implemented:** Updated `PerformanceMetric` type, updated `transformData` to handle p50/p75/p90, added `selectedMetric` state, and made `Card` components interactive. Added unit tests.
- **Files changed:** `src/hooks/usePerformanceData/usePerformanceData.ts`, `src/components/AppDialog/Performance/PerformanceData.tsx`, `src/components/AppDialog/Performance/PerformanceData.test.tsx`
- **Commit:** 47c5eb2
- **Learnings:**
  - Patterns: Managed selection state locally within `PerformanceChart` for simplicity.
  - Gotchas: Recharts dynamic import requires careful mocking in unit tests if testing chart internals, but here we focused on card interaction.
---
