# Implementation Plan - Improve Web App Observability

## Phase 1: Infrastructure & Centralized Logging
This phase focuses on setting up Sentry and the core logging utility that will feed both the internal dashboard and external services.

- [x] Task: Integrate Sentry SDK [e29ec69] (Enhanced with React Router V6 tracking)
    - [x] Install `@sentry/react`
    - [x] Configure Sentry in `src/main.tsx`
    - [x] Integrate React Router V6 instrumentation
    - [x] Verify Sentry is capturing errors and navigations
- [x] Task: Create Centralized Logger Utility [33e8b53]
    - [x] Define `LogLevel` (INFO, WARN, ERROR) and `LogEntry` interfaces
    - [x] Implement `Logger` class/utility that handles:
        - Console output (respecting current production filtering)
        - Sentry capture (for ERROR/WARN)
        - In-memory/LocalStorage storage for the internal dashboard
    - [x] Write tests for the `Logger` utility
- [~] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Centralized Logging' (Protocol in workflow.md)

## Phase 2: Observability Dashboard UI
This phase focuses on creating the hidden route and the UI for the observability dashboard.

- [ ] Task: Setup Hidden Route
    - [ ] Add `/observability` route to `src/routes.tsx` or `src/routeConfig.ts`
    - [ ] Ensure the route is lazy-loaded to minimize main bundle impact
- [ ] Task: Build Dashboard Component
    - [ ] Create `ObservabilityDashboard` component using Radix UI/Tailwind
    - [ ] Implement display for recent logs and errors from the `Logger` utility
    - [ ] Add "Clear Logs" functionality
    - [ ] Write unit tests for the dashboard component
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Observability Dashboard UI' (Protocol in workflow.md)

## Phase 3: Integration & Refinement
This phase integrates the logger into key application flows and performs final checks.

- [ ] Task: Instrument Key Application Events
    - [ ] Add logging to the optimization algorithm start/end/error
    - [ ] Add logging to grid interaction events
    - [ ] Add logging to equipment type changes
- [ ] Task: Final Verification & Cleanup
    - [ ] Verify GA is still functioning correctly
    - [ ] Ensure production console is clean
    - [ ] Verify hidden route is not linked anywhere in the UI
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Refinement' (Protocol in workflow.md)
