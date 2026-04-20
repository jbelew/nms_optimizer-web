# Track Learnings: ga4_standardization_20260420

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- The Python backend relies on specific GA4 custom dimension names (`customEvent:platform`, `customEvent:tech`, `customEvent:supercharged`) for the `popular_data` endpoint.
- Existing `userStats` data is powered by the `optimize_tech` event.

## Final GA4 Event Schema

| Action / Event Name | Category | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `optimize_tech` | `ui` | `platform`, `tech`, `supercharged`, `solve_method` | Optimization results (Preserved for backend compatibility). |
| `select_content` | `ui` | `content_type`, `item_id` | Used for platform and language switching. |
| `screen_view` | `ui` | `firebase_screen`, `screen_class`, `tech` (optional) | Routed dialogs, welcome, error, user_stats, and module selection. |
| `share` | `ui` | `method: 'url'` | User clicks the share button. |
| `save_build` | `ui` | `method: 'nms_file'`, `build_name`, `shipType` | User saves build to file. |
| `load_build` | `ui` | `method: 'nms_file'`, `file_name`, `shipType` | User loads build from file. |
| `screenshot_build` | `ui` | `method: 'png'` | User captures a screenshot. |
| `performance_metric` | `performance` | `metric_name`, `value` (numeric) | Core Web Vitals (LCP, CLS, INP, FCP, TTFB) and TBT. |
| `earn_virtual_currency` | `ui` | `virtual_currency_name: 'easter_egg'` | User discovers the secret coordinates. |
| `not_found` | `navigation` | N/A | User lands on a 404 page. |

---

## [2026-04-20 21:10] - Phase 2 & 3 & 4: Core Implementation & Refinement
- **Implemented:** Refactored tracking infrastructure, standardized all events to snake_case and GA4 recommended names, implemented platform_type user property, and standardized performance metrics including TBT reporting.
- **Files changed:** `src/utils/analytics/tracking.ts`, `src/utils/analytics/reportWebVitals.ts`, `src/App.tsx`, `src/components/RoutedDialogs/RoutedDialogs.tsx`, `src/store/app/platformStore.ts`, etc.
- **Commit:** `0a45971`
- **Learnings:**
  - Patterns: Centralized `screen_view` tracking in orchestrator components (`App`, `RoutedDialogs`) avoids redundant triggers and captures direct URL entries.
  - Gotchas: Fuzzy matching during `replace` calls can lead to code corruption if not carefully monitored; always verify file contents after complex edits.
  - Context: Preserving `optimize_tech` is critical for existing backend analytics endpoints.

---

<!-- Learnings from implementation will be appended below -->
