# Implementation Plan - Decouple Performance Summary Cards from Chart Resolution

Decouple the performance summary cards (OVERALL and per-metric) from the chart's sampling resolution. Ensure they always reflect the absolute last hour and trend vs. the prior hour.

## Phase 1: Core Decoupling

- [x] Task: Test: Create unit tests in `PerformanceUtils.test.ts` to verify `transformPerformanceData` returns high-res summary data independent of sampling.
- [x] Task: Implementation: Refactor `transformPerformanceData` in `PerformanceUtils.ts` to return both `chartData` (sampled) and `fullSummary` (derived from unsampled `fullChartData`).
- [x] Task: Conductor - User Manual Verification 'Core Decoupling' (Protocol in workflow.md)

## Phase 2: UI Integration & Validation

- [x] Task: Test: Update `PerformanceChart.test.tsx` to verify summary cards remain stable across range changes (3d, 7d, 14d).
- [x] Task: Implementation: Update `PerformanceChart.tsx` to consume the decoupled summary data from the `transformPerformanceData` result.
- [x] Task: Conductor - User Manual Verification 'UI Integration & Validation' (Protocol in workflow.md)
