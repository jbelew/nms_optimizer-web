# Specification: GA4 Measurement Strategy & Event Standardization

## Overview
This track focuses on reviewing and refining the Google Analytics 4 (GA4) implementation within the NMS Optimizer. The goal is to align with GA4 best practices, ensure consistent `snake_case` naming, and capture high-value event parameters and user properties while strictly preserving existing custom events and dimensions that power the `userStats` (popular data) feature.

## Functional Requirements
- **Event Standardization:**
    - Audit all existing events and rename to `snake_case`.
    - Map custom events to GA4 recommended event names where applicable (e.g., `select_content`, `generate_lead`, `share`).
- **Critical Event Preservation (`userStats`):**
    - **Maintain `optimize_tech`:** This event must NOT be renamed, and its key parameters (`platform`, `tech`, `supercharged`) must remain exactly as they are currently to ensure compatibility with the Python backend's `popular_data` endpoint.
- **Enhanced Tracking Areas:**
    - **Navigation & Platforms:** Track platform switches (Starship, Multitool, etc.) and route changes with specific parameters.
    - **Optimization Actions:** Track successful "Solve" events with context (platform, tech type).
    - **Build Management:** Track `save_build`, `load_build`, `share_build`, and `screenshot_build` with granular `method` parameters.
- **Performance Data (Web Vitals):**
    - Refine the existing Web Vitals tracking to ensure numerical values (TBT, LCP, CLS, FCP) are captured as event parameters suitable for percentile analysis in GA4.
- **Custom Dimensions:**
    - Implement `platform_type` as a user-scoped custom dimension to persist the user's current equipment context across all events in a session.

## Non-Functional Requirements
- **Data Privacy:** Ensure no PII or overly complex application state (grid results) is sent to GA4.
- **Performance:** GA4 event dispatching must not block the main thread or significantly impact TBT.

## Acceptance Criteria
- [ ] **Audit Pass:** Existing `optimize_tech` event and its dimensions (`platform`, `tech`, `supercharged`) are verified as preserved.
- [ ] All GA4 events use `snake_case` naming.
- [ ] Platform selection events successfully update the `platform_type` user property/dimension.
- [ ] Build management events (Save/Load/Share/Screenshot) include a `method` parameter.
- [ ] Web Vitals events send numerical values that are correctly interpreted by GA4.
- [ ] Documentation (in `learnings.md`) maps the new event schema for future reference.

## Out of Scope
- Tracking the specific layout/results of the grid (too complex/noisy).
- Tracking "Reset" actions.
