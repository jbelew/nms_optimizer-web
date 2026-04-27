# Implementation Plan: Performance Dashboard Drill-in

## Phase 1: Backend Data Enhancement (`nms_optimizer-service`) [checkpoint: a0d7d92]
- [x] Task: Update BigQuery query in `src.app.py` to calculate p50, p75, and p90 percentiles.
- [x] Task: Update `/analytics/performance_data` endpoint to return the new percentile fields.
- [x] Task: Add/Update tests for the analytics endpoint to verify the new data structure.
- [x] Task: Conductor - User Manual Verification 'Backend Data Enhancement' (Protocol in workflow.md) [a0d7d92]

## Phase 2: Frontend State & Card UI (`nms_optimizer-web`)
- [x] Task: Update `PerformanceMetric` type and data transformation in `src/hooks/usePerformanceData/usePerformanceData.ts` and `src/components/AppDialog/Performance/PerformanceData.tsx`.
- [x] Task: Implement selection state (Zustand or local state) in `PerformanceData` to track the active metric.
- [x] Task: Enhance `Card` components in `PerformanceData.tsx` to be interactive and display the selected state visually.
- [ ] Task: Add unit tests for the updated state logic and Card interactions.
- [ ] Task: Conductor - User Manual Verification 'Frontend State & Card UI' (Protocol in workflow.md)

## Phase 3: Detailed Chart Implementation (`nms_optimizer-web`)
- [ ] Task: Create a new `MetricDetailChart` component (or enhance `PerformanceChart`) to render the p50-p90 Area and p75 Line.
- [ ] Task: Integrate the toggle logic to switch between the aggregate stacked chart and the detailed metric chart.
- [ ] Task: Verify responsive behavior and tooltips for the new composed chart.
- [ ] Task: Conductor - User Manual Verification 'Detailed Chart Implementation' (Protocol in workflow.md)

## Phase 4: Final Validation & Polish
- [ ] Task: Run full suite of performance audits (Lighthouse) to ensure no regressions.
- [ ] Task: Verify accessibility (ARIA labels, keyboard navigation) for the new selectable cards.
- [ ] Task: Conductor - User Manual Verification 'Final Validation & Polish' (Protocol in workflow.md)
