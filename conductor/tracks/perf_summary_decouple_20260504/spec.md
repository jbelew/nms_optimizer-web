# Specification: Decouple Performance Summary Cards from Chart Resolution

## Overview
The summary cards at the top of the Performance Dialog currently reflect trends based on the chart's data resolution (3d, 7d, 14d). As the range increases, the chart data is sub-sampled, causing the "prior point" comparison in the summary cards to reflect increasingly large time gaps (e.g., ~5 hours for 14d). This track will ensure the summary cards always reflect the most recent hour and the trend against the absolute prior hour (T vs T-1h).

## Functional Requirements
1. **Latest Value:** Summary cards must always display the value from the most recent available hour of telemetry.
2. **Prior Hour Trend:** Trend indicators (arrows) must compare the most recent hour (T) against the hour immediately preceding it (T-1h).
3. **Resolution Independence:** The values and trends in the summary cards must remain identical regardless of whether the user has selected the 3d, 7d, or 14d range for the chart.

## Technical Requirements
1. Refactor `transformPerformanceData` in `PerformanceUtils.ts` to return both the sampled `chartData` for the visualization and a high-resolution `summary` object.
2. `getPerformanceSummary` should be updated to operate on the full, unsampled `fullChartData` timeseries before sampling occurs.
3. Verify that the "Prior Hour" comparison handles gaps in telemetry (e.g., if T-1h is missing, it should look for the most recent valid preceding hour).

## Acceptance Criteria
- [ ] Select 3d range: Note the summary card values and trends.
- [ ] Switch to 14d range: Verify the summary card values and trends do NOT change.
- [ ] Verify that the trend arrow logic explicitly compares the last two valid hours in the full dataset.
