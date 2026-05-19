# Track Learnings: codebase_health_refinement_20260519

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- **Discriminated Store Unions:** Replace multiple booleans (e.g., loading, error) with a single status: { type: 'idle' | 'solving' | 'error' } union to prevent invalid states.
- **Centralized UI Timing:** Manage all interaction durations (thresholds, debounces, timeouts) in src/constants.ts under UI_TIMING.
- **Dynamic i18n Discovery:** Derive the supported language list directly from the i18n configuration to ensure the UI and router are always in sync.
- **Reactive Property Access:** Favor direct property access via selectors over zero-argument getter functions in Zustand stores for better performance and type safety.

---

<!-- Learnings from implementation will be appended below -->
