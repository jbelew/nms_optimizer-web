# Plan: Improve TTFB (Time to First Byte)

## Objective
Reduce TTFB (P75) from >500ms to <100ms by optimizing Cloudflare edge caching and reducing Express server overhead.

## Key Files & Context
- `server/app.js`: Main Express application and middleware.
- `server/seoMiddleware.js`: SEO tag injection and caching for SPA routes.
- `scripts/cloudflare/update_cf_rules.py`: Cloudflare Cache Rules configuration.

## Background & Motivation
The current high TTFB is caused by:
1.  **Cloudflare Cache Misses:** Every ship build has a unique query string (`?platform=...`), leading to a unique cache entry on Cloudflare. This causes a low cache hit rate.
2.  **Origin Revalidation:** The server sends `Cache-Control: no-cache`, forcing Cloudflare to revalidate every request with Heroku, even if the content hasn't changed.
3.  **Heroku Latency:** Requests reaching Heroku suffer from network latency (US-East) and middleware overhead (compression, `fs.stat`).

## Proposed Solution

### 1. Cloudflare Cache Rule Optimization
-   **Ignore Query String:** Configure Cloudflare to ignore all query strings in the cache key for HTML pages. Since the app uses JS to load content based on the URL, the HTML itself can be identical for all ship builds. This will drastically increase the cache hit rate.
-   **Long Edge TTL:** Set `edge_ttl` to 1 year with `override_origin`.
-   **Stale-While-Revalidate:** Enable `serve_stale` to allow Cloudflare to serve stale content while updating it in the background.

### 2. Express Server Optimization
-   **SSG Path Caching:** Scan the `dist` directory once at startup and store the paths of pre-rendered `index.html` files in a `Set`. This removes an IO operation (`fs.stat`) from every request.
-   **Remove Global Compression:** Offload Brotli/Gzip compression to Cloudflare by removing the `compression` middleware from Express for HTML responses.
-   **Better Cache-Control Headers:** Use `public, max-age=0, s-maxage=31536000, stale-while-revalidate=60` for HTML.
-   **Clean up Middleware:** Remove redundant `expressStaticGzip` calls.

## Implementation Steps

### Phase 1: Express Server Updates
1.  **Modify `server/app.js`**:
    *   Add a function to scan and cache SSG paths at startup.
    *   Update the SPA fallback handler to use the cached SSG paths.
    *   Remove the global `compression` middleware.
    *   Clean up redundant static middleware.
    *   Update the `setCacheHeaders` function and SPA handler to use the new `Cache-Control` strategy.
2.  **Modify `server/seoMiddleware.js`**:
    *   Update `seoTagInjectionMiddleware` to use the new `Cache-Control` headers.

### Phase 2: Cloudflare Configuration Updates
1.  **Modify `scripts/cloudflare/update_cf_rules.py`**:
    *   Update the "HTML Pages" rule to include `cache_key` settings that ignore the query string.
    *   Increase `edge_ttl`.
    *   Ensure `serve_stale` is enabled.
2.  **Modify `scripts/cloudflare/get_cf_settings.py`**:
    *   Add checks for `tiered_caching` to ensure it's enabled (crucial for maximizing cache hit rates).

## Verification & Testing
-   **Header Verification:** Check that `Cache-Control` headers are correctly set in the response.
-   **Path Matching:** Verify that SSG files are still served correctly and that fallback to dynamic injection works for non-SSG routes.
-   **Cloudflare Simulation:** Confirm that different query parameters (e.g., `/?platform=starship` vs `/?platform=multitool`) should result in the same HTML and be cached under the same key.

## Rollback Strategy
-   The changes in `app.js` and `seoMiddleware.js` can be reverted by checking out the previous git commit.
-   The Cloudflare rules can be reverted by running the original `update_cf_rules.py` script (if a backup is made) or by manually modifying the rule in the Cloudflare dashboard.
