# Project Patterns

This file documents reusable patterns, architectural decisions, and "gotchas" discovered across different tracks.

## Frontend Patterns

### Mixed Visual Charts (Recharts)
- **Pattern:** Use `ComposedChart` when you need to combine different visual primitives (e.g., `Bar` for ranges, `Line` for trends, `Area` for aggregates).
- **Benefit:** Provides a rich, information-dense visualization that standard single-type charts cannot achieve.
- **Context:** Used in the Performance Dashboard to show p50-p90 ranges with a p75 trend line.

### Multi-line Custom Tooltips
- **Pattern:** Avoid the standard `formatter` prop in Recharts `Tooltip` when displaying multiple related metrics. Instead, use the `content` prop with a custom React component.
- **Benefit:** Allows full control over layout (e.g., separate lines, custom colors, icons) and avoids the confusing "list" default behavior.
- **Context:** Implemented in `MetricDetailChart` to show p90, p75, and p50 on distinct lines with metric-specific coloring.

### Visual Clamping for Outliers
- **Pattern:** When a timeseries has extreme outliers that squash the Y-axis resolution, clamp the *visual* data point to a logical threshold but preserve the *original* value in the tooltip.
- **Benefit:** Keeps the chart readable for the 95% case while still providing accurate data on hover.
- **Context:** Applied to P90 performance metrics in the detailed view.

### Lighthouse-style Scoring
- **Pattern:** For "health" metrics, use a log-normal distribution for scoring (0-100) instead of linear interpolation.
- **Benefit:** Replicates real-world user perception where improvements at the "good" end are more valuable than at the "extremely bad" end.
- **Context:** Used for the "OVERALL" performance score.

## Backend Patterns

### Modular Flask Blueprints
- **Pattern:** Once `app.py` exceeds ~500 lines or starts handling multiple domains (e.g., optimization and analytics), refactor logically related routes into `Blueprint` files.
- **Benefit:** Improves navigability, reduces merge conflicts, and allows for isolated testing of sub-modules.
- **Context:** Moved all BigQuery and GA4 analytics to `analytics_bp`.

### Simple In-memory Caching
- **Pattern:** For expensive/slow queries (like BigQuery) where data doesn't change rapidly, implement a simple in-memory `SimpleCache` with a TTL (e.g., 15 minutes).
- **Benefit:** Drastically reduces API latency and cloud computation costs.
- **Context:** Added to the performance data endpoint to protect BigQuery quotas.


## Performance & State Patterns
- **Discriminated Store Unions:** Replace multiple booleans (e.g., loading, error) with a single status: { type: 'idle' | 'solving' | 'error' } union to prevent invalid states.
- **Centralized UI Timing:** Manage all interaction durations (thresholds, debounces, timeouts) in src/constants.ts under UI_TIMING.
- **Dynamic i18n Discovery:** Derive the supported language list directly from the i18n configuration to ensure the UI and router are always in sync.
- **Reactive Property Access:** Favor direct property access via selectors over zero-argument getter functions in Zustand stores for better performance and type safety.
