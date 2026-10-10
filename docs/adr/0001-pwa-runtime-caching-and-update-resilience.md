# PWA Runtime Caching and Update Resilience

## Context

Previous iterations of our PWA setup used Workbox's `generateSW` to precache all hashed JavaScript and CSS build bundles into the Service Worker cache. Whenever a new deployment pruned previous chunk hashes from the CDN or clients opened tabs across deployments, clients suffered from stale chunk 404 errors (`vite:preloadError`), infinite update prompt loops, or stuck workers. Furthermore, because navigation requests were configured as `NetworkOnly` with `navigateFallback: undefined`, full bundle precaching caused severe operational churn without providing true zero-network offline navigation.

## Decision

We moved our PWA caching architecture from aggressive JavaScript/CSS bundle precaching to native browser HTTP immutable caching paired with Workbox runtime caching:

1. **Zero-Bundle Precache**: Workbox is configured with `globPatterns: ["**/*.{ico,png,svg,woff2}", "manifest.json"]` and explicitly ignores all `/build/**`, `.js`, and `.css` files. Build bundles are served with `Cache-Control: public, max-age=31536000, immutable` and cached by the browser's native HTTP disk cache in 0–2ms with zero Service Worker IPC overhead.
2. **Runtime Caching Only**: The Service Worker caches runtime static assets (images, fonts, translation files, and cached API responses) with appropriate expiration plugins.
3. **Two-Tier Client Self-Healing**: A synchronous script in `<head>` of `index.html` checks a milestone marker (`__pwa_healed_v804__`). If unset, it unregisters all active service workers, purges `CacheStorage`, and reloads cleanly. Additionally, runtime dynamic import failures (`vite:preloadError`) trigger service worker eviction before executing a cache-busted hard reload.
4. **Non-Disruptive Update Lifecycle**: The in-app update prompt dialog alerts active users without forcing page reloads. If dismissed or ignored, waiting service workers silently activate when the application tab transitions to hidden or idle.

## Considered Options

- **Full Offline Bundle Precaching**: Precache all JS/CSS files for offline usage. *Rejected*: Caused recurrent chunk 404 lockouts, update prompt loops, and heavy background thread/IO contention on mobile devices.
- **Manifest-Only / No Service Worker**: Retain web manifest for PWA installability without a service worker. *Rejected*: Loses offline asset caching for images, fonts, and locales, and eliminates in-app update notifications.
- **HTTP Immutable + Runtime Caching (Selected)**: Combines browser HTTP caching for hashed code bundles with Workbox runtime caching for static media and silent background updates.

## Consequences

- Hashed bundles are never locked in a Service Worker precache manifest, eliminating CDN-vs-precache desync bugs.
- Thread contention during startup is eliminated, improving Interaction to Next Paint (INP) and Total Blocking Time (TBT).
- E2E testing must include multi-version upgrade validation in Playwright to prevent regression of update lifecycle logic.
