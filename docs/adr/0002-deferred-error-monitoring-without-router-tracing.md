# Deferred Error Monitoring Without Router Tracing

## Context

Previously, `@sentry/react` was statically imported in `src/utils/system/monitoring.ts`, eagerly preloaded in `index.html`, and initialized synchronously during the `BOOTING` phase before `createRoot().render()`. That synchronous initialization existed solely so `createAppRouter` could wrap `createBrowserRouter` with `reactRouterV7BrowserTracingIntegration` (`tracesSampleRate: 0.25`) at mount time. However, bundling Sentry's tracing runtime into the synchronous critical path added ~461 KB (~145 KB gzipped) of JavaScript before first paint—degrading Total Blocking Time (TBT) and Largest Contentful Paint (LCP)—while duplicating route and Web Vitals telemetry already collected via `reportWebVitals.ts` and GA4. Additionally, calling `Logger.error` alongside explicit `captureException` calls and Sentry's default `globalHandlersIntegration` produced duplicate error events for single crashes, while `Logger.warn` and user-input validation paths (`Build File` and `Shared Grid` deserialization) generated standalone Sentry warning/error issues.

## Decision

We scoped Sentry strictly to asynchronous error and exception monitoring and moved its initialization out of the critical rendering path:

1. **Error-Only Scope (No Router Tracing)**: We removed `reactRouterV7BrowserTracingIntegration`, `tracesSampleRate`, and `createAppRouter`. `Root.tsx` constructs its router directly with `createBrowserRouter(routes)`. Route and performance telemetry remain the sole responsibility of `reportWebVitals.ts` and GA4, matching our privacy policy.
2. **Deferred `IDLE` Initialization with Early-Error Queueing**: `@sentry/react` is loaded via dynamic `import("@sentry/react")` inside a deferred task (`sentry-monitoring`) registered on `LifecycleCoordinator` during the `IDLE` phase, and `vendor-monitoring` is excluded from `modulePreload.resolveDependencies` in `vite.config.ts`. If `Logger.error` or `captureException` is invoked before `IDLE`, the event is queued in memory and triggers an immediate on-demand `initializeSentry()` load; once initialized, buffered `INFO`/`WARN` log entries are replayed as Sentry breadcrumbs and queued errors are flushed.
3. **Single-Owner Error Capture & Breadcrumb Hierarchy**: `Logger.info` and `Logger.warn` record in-memory logs and attach Sentry breadcrumbs (`addBreadcrumb`) without creating standalone Sentry issues. `Logger.error` is the single canonical exception reporter (accepting optional `tags` and `level` context so `ErrorBoundary` and `LifecycleCoordinator` never double-call `captureException`). Sentry's built-in `globalHandlersIntegration` is disabled (`onerror: false, onunhandledrejection: false`) so `bootApp`'s global `error` and `unhandledrejection` listeners remain the single owner of uncaught global errors. User-input validation failures (`Build File` and `Shared Grid` parsing), intermediate rethrowing network helpers, and client-side timeout/storage quota exceptions (`ignoreErrors`) do not create standalone Sentry error issues.
4. **Bounded Flush Before Fatal Redirect**: We removed the outdated, un-gated Sentry v8 CDN script from `public/500.html` and updated `handleFatalBootstrapError` to await `flushSentry(1500)` before redirecting to `/500.html`.
5. **Hidden Production Source Maps & Bundle Tree-Shaking**: `vite.config.ts` defines `__SENTRY_DEBUG__: false` and `__SENTRY_TRACING__: false` for dead-code elimination, generates `"hidden"` sourcemaps only when `sentryEnabled && sentryEnv === "production" && Boolean(sentryAuthToken)`, deletes `./dist/**/*.map` after upload via `@sentry/vite-plugin`, and enforces a `35 KB` size-limit budget on `vendor-monitoring` (with `NODE_ENV=production` on `perf:*` scripts so Bun does not override `.env.production` with `.env.development`).

## Considered Options

- **Synchronous Pre-Mount Init with Router Tracing**: Statically import `@sentry/react` and wrap `createBrowserRouter` before mounting React. _Rejected_: Pulls the full Sentry SDK and tracing instrumentation into the critical rendering path, hurting mobile LCP/TBT and duplicating Web Vitals telemetry.
- **Deferred `IDLE` Error Monitoring with Early-Error Buffering (Selected)**: Dynamically import `@sentry/react` during browser idle cycles (or on-demand upon an early crash), replay early logs as breadcrumbs, and omit router tracing.

## Consequences

- Enabling `VITE_SENTRY_ENABLED=true` in `.env.production` has zero impact on initial critical-path bundle size, `<link rel="modulepreload">`, or Lighthouse cold-start performance.
- Do **not** re-introduce static `@sentry/react` imports, `createAppRouter`, or `reactRouterV7BrowserTracingIntegration` in `monitoring.ts` or `Root.tsx`.
