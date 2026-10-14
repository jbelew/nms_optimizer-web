# PWA Runtime Caching and Update Resilience

## Context

Previous iterations of our PWA setup used Workbox's `generateSW` to precache all hashed JavaScript and CSS build bundles into the Service Worker cache. Whenever a new deployment pruned previous chunk hashes from the CDN or clients opened tabs across deployments, clients suffered from stale chunk 404 errors (`vite:preloadError`), infinite update prompt loops, or stuck workers. Furthermore, because navigation requests were configured as `NetworkOnly` with `navigateFallback: undefined`, full bundle precaching caused severe operational churn without providing true zero-network offline navigation.

## Decision

We moved our PWA caching architecture from aggressive JavaScript/CSS bundle precaching to native browser HTTP immutable caching paired with Workbox runtime caching:

1. **Zero-Bundle Precache & Release Stamping**: Workbox is configured with `globPatterns: ["**/*.{ico,png,svg,woff2}"]`, `includeAssets: ["robots.txt"]`, and `includeManifestIcons: false`, while explicitly ignoring `/build/**`, `.js`, `.css`, HTML entry points, marketing screenshots (`assets/img/screenshots/**`), and legacy manifest icons (`assets/img/manifest/**`). Build bundles are served with `Cache-Control: public, max-age=31536000, immutable` and cached by the browser's native HTTP disk cache in 0–2ms with zero Service Worker IPC overhead. A post-build hook stamps `dist/sw.js` with a `// Release: <version> (<buildDate>)` comment so code-only deployments produce a distinct Service Worker byte hash and trigger **Staged Worker** detection without invalidating unchanged precache entries.
2. **Runtime Caching for Dynamic & On-Demand Assets**: The Service Worker caches runtime assets on demand—including WebP images, fonts, active locale translation JSON files (`StaleWhileRevalidate`), and API responses (`NetworkFirst` with 3s timeout)—with expiration plugins.
3. **Client Self-Healing (`PWA Self-Healing`)**: Runtime dynamic import failures (`vite:preloadError`) and `/build/` script load errors in `index.html` (as well as failed update activations via `evictStaleServiceWorkers()`) automatically unregister active service workers and purge `CacheStorage` before executing a cache-busted reload. (The temporary `v8.0.4` one-time migration marker `__pwa_healed_v804__` was retired after the migration window completed.)
4. **Non-Disruptive Multi-Tab Update Lifecycle**: The in-app update prompt dialog verifies version freshness against `/version.json` (`NetworkOnly`) before alerting active users. If the running client already matches `/version.json`, the **Staged Worker** is activated with `reload = false` so `onNeedReload` suppresses an unnecessary page reload. If dismissed or ignored, **Silent Background Activation** occurs when a tab transitions to hidden or idle, while active foreground tabs that did not initiate the reload are protected from mid-session reloads when another tab claims control.

## Considered Options

- **Full Offline Bundle Precaching**: Precache all JS/CSS files for offline usage. *Rejected*: Caused recurrent chunk 404 lockouts, update prompt loops, and heavy background thread/IO contention on mobile devices.
- **Manifest-Only / No Service Worker**: Retain web manifest for PWA installability without a service worker. *Rejected*: Loses offline asset caching for images, fonts, and locales, and eliminates in-app update notifications.
- **HTTP Immutable + Runtime Caching (Selected)**: Combines browser HTTP caching for hashed code bundles with Workbox runtime caching for static media and silent background updates.

## Consequences

- Hashed bundles are never locked in a Service Worker precache manifest, eliminating CDN-vs-precache desync bugs.
- Thread contention during startup is eliminated, improving Interaction to Next Paint (INP) and Total Blocking Time (TBT).
- E2E testing must include multi-version upgrade validation in Playwright to prevent regression of update lifecycle logic.
