# Specification: Performance Dashboard Drill-in Enhancement

## Overview
Improve the performance dashboard by allowing users to drill into specific Core Web Vitals (CWV) metrics. Clicking a metric card will reveal a detailed composed chart showing the p50-p90 range and the p75 trend line.

## Functional Requirements
1.  **Metric Card Selection:**
    *   Each metric card (TTFB, FCP, LCP, CLS, INP) should be selectable.
    *   Visual feedback for the selected card (e.g., border, shadow, or highlight).
2.  **Drill-in Chart:**
    *   When a card is selected, the main timeseries chart should switch to a "Detailed Composed Chart" for that specific metric.
    *   The chart must display:
        *   **Range:** An `Area` component representing the range between the 50th percentile (p50) and 90th percentile (p90).
        *   **Trend Line:** A `Line` component representing the 75th percentile (p75).
    *   The chart should maintain existing version markers and X-axis time scaling.
3.  **Data Support (Full-Stack):**
    *   Update the backend to provide p50 and p90 values alongside the existing p75 value.
    *   Update the frontend data transformation to handle these additional percentiles.
4.  **Default State:**
    *   Initially, no card is selected, and the dashboard shows the existing stacked AreaChart of all metrics (p75 only).
    *   Clicking a selected card again or clicking a "Back" button (if implemented) deselects it and returns to the global view.

## Non-Functional Requirements
*   **Accessibility:** Cards should be keyboard-navigable and have appropriate ARIA roles.
*   **Responsiveness:** The composed chart should remain responsive and fit within the dialog.
*   **Performance:** Lazy loading of Recharts should be maintained.

## Acceptance Criteria
*   User can click a metric card to see a detailed p50/p75/p90 chart for that metric.
*   The detailed chart shows a shaded area for p50-p90 and a distinct line for p75.
*   Version change reference lines are still visible on the detailed chart.
*   The user can switch between metrics by clicking different cards.
*   The user can return to the aggregate view.

## Out of Scope
*   Adding new metrics beyond the existing set (TTFB, FCP, LCP, CLS, INP).
*   Changing the data retention period (currently 30 days).
