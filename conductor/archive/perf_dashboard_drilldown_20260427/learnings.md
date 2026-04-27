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

## 2026-04-27 15:40 - Phase 3 Task 1-4: Detailed Chart & UX
- **Implemented:** Created `MetricDetailChart` using `ComposedChart` with `Bar` for p50-p90 range and `Line` for p75. Added logical clamping for outliers. Implemented overall score with Lighthouse-style log-normal distribution.
- **Files changed:** `src/components/AppDialog/Performance/PerformanceData.tsx`
- **Commit:** 184ad78
- **Learnings:**
  - Patterns: Recharts `ComposedChart` is excellent for mixed visual types (Bar + Line).
  - Patterns: Use a custom `Tooltip` content component when standard formatting isn't sufficient for multi-line complex layouts.
  - Gotchas: Radix UI `Text` doesn't support `color="accent"`; use standard theme colors like `blue`, `amber`, etc.
  - Gotchas: When clamping values for visual resolution, ensure tooltips still show the original value to maintain data integrity.

---

## 2026-04-27 15:50 - Phase 4: Modular Refactor & Documentation
- **Implemented:** Refactored monolithic `PerformanceData.tsx` into `PerformanceUtils.ts`, `PerformanceTypes.ts`, `PerformanceChart.tsx`, and `MetricDetailChart.tsx`. Added comprehensive Agentic JSDoc.
- **Files changed:** Multiple files in `src/components/AppDialog/Performance/`
- **Commit:** 184ad78
- **Learnings:**
  - Patterns: Extracting scoring logic and color maps to a `Utils` file significantly improves component readability and testability.
  - Patterns: Explicit interfaces for Recharts data points (`ChartDataPoint`) prevent property access errors.

---

## 2026-04-27 16:10 - Service Refactor
- **Implemented:** Moved analytics routes and BigQuery clients to a Flask Blueprint (`analytics_bp`) and data utility module. Added in-memory `SimpleCache` with 15-minute TTL.
- **Files changed:** `src/app.py`, `src/analytics_data.py`, `src/routes/analytics.py`
- **Commit:** 76327be, d230fa4
- **Learnings:**
  - Patterns: Flask Blueprints are essential for maintaining large `app.py` files.
  - Patterns: Simple in-memory caching for expensive BigQuery queries drastically improves API responsiveness and reduces costs.
---
