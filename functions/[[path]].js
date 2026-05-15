/**
 * @file Cloudflare Pages Function for NMS Optimizer.
 * @remarks
 * Responsibilities:
 *  1. Canonical host + trailing-slash + ?lng= + /en/ strip redirects.
 *  2. "Probe then fallback" routing: if a physical SSG file exists (next() returns
 *     non-404), serve it; otherwise, for known client-only PWA routes, serve the
 *     localized shell.
 *
 * Recursion is broken by `public/_routes.json`, which excludes every locale shell
 * (e.g. `/index.html`, `/es/index.html`) from the Function so internal
 * `env.ASSETS.fetch()` calls hit the CDN directly.
 */

const SUPPORTED_LANGS = ["en", "es", "fr", "de", "pt", "it"];
/** Non-default locales that get a path prefix (e.g. /es/...). */
const LOCALE_LANGS = SUPPORTED_LANGS.filter((l) => l !== "en");

/**
 * Client-only routes that have no SSG output and require the PWA shell.
 *
 * Must be a subset of `pages` in `src/routeConfig.ts`. The
 * `scripts/spa-routes.test.mjs` test asserts that every entry here is a
 * known page AND has no `dist/{page}/index.html`, and that any page lacking
 * SSG output is listed here.
 *
 * NOTE: Some routes may be "Hybrid" (have SSG output for the base path but
 * client-only sub-routes). These should also be listed here.
 */
const SPA_ROUTES = new Set(["performance"]);

export async function onRequest(context) {
	const { next, request } = context;
	const url = new URL(request.url);
	const pathname = url.pathname;
	const searchParams = url.searchParams;

	// 1. Canonical Host Redirect (www. -> apex)
	if (url.hostname === "www.nms-optimizer.app") {
		url.hostname = "nms-optimizer.app";
		return Response.redirect(url.toString(), 301);
	}

	// 2. Trailing Slash Enforcement (e.g., /about -> /about/)
	// Skip for root, files with extensions, and paths already slashed.
	// We EXPLICITLY skip /404 and /500 to allow Cloudflare to map them to the .html files
	// without creating a loop with its internal "Pretty URLs" 308 redirects.
	const isReservedErrorPath = pathname === "/404" || pathname === "/500";
	if (
		pathname !== "/" &&
		!pathname.endsWith("/") &&
		!pathname.includes(".") &&
		!isReservedErrorPath
	) {
		url.pathname = pathname + "/";
		return Response.redirect(url.toString(), 301);
	}

	// 3. Language Redirects (?lng=fr -> /fr/)
	const lng = searchParams.get("lng");
	if (lng) {
		const normalizedLng = lng.toLowerCase();
		const supportedLang = SUPPORTED_LANGS.includes(normalizedLng) ? normalizedLng : "en";
		const newUrl = new URL(url);
		newUrl.searchParams.delete("lng");
		const cleanPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "");

		if (supportedLang === "en") {
			newUrl.pathname = `${cleanPath}/`.replace(/\/+$/, "/");
		} else {
			newUrl.pathname = `/${supportedLang}${cleanPath}/`.replace(/\/+$/, "/");
		}
		return Response.redirect(newUrl.toString(), 301);
	}

	// 4. Remove /en/ prefix (/en/about/ -> /about/)
	const pathParts = pathname.split("/").filter(Boolean);
	if (pathParts[0] === "en") {
		const newUrl = new URL(url);
		const subPath = pathParts.slice(1).join("/");
		newUrl.pathname = `/${subPath}/`.replace(/\/+$/, "/");
		return Response.redirect(newUrl.toString(), 301);
	}

	// 5. Probe + Fallback.
	// First, try to serve a physical SSG asset. If the disk has it, we're done.
	const response = await next();

	// If the asset exists OR the miss isn't a known SPA route, return as-is.
	// This preserves real 404s for genuinely missing pages (good for SEO) and assets.
	if (response.status !== 404) {
		return response;
	}

	// Only fall back to the PWA shell for extensionless paths that match a known
	// client-only route. We deliberately do NOT blanket-rewrite all 404s: that
	// would mask broken links as soft-200s.
	const lastSegment = pathParts[pathParts.length - 1];
	const isExtensionless = lastSegment && !lastSegment.includes(".");
	if (!isExtensionless) {
		return response;
	}

	// Strip locale prefix to identify the route name.
	const routeName = LOCALE_LANGS.includes(pathParts[0]) ? pathParts[1] : pathParts[0];
	if (!SPA_ROUTES.has(routeName)) {
		return response;
	}

	const lang = LOCALE_LANGS.includes(pathParts[0]) ? pathParts[0] : null;
	const shellPath = lang ? `/${lang}/index.html` : "/index.html";
	const shellUrl = new URL(shellPath, url.origin);
	// Always append an internal cache-buster for the asset fetch to ensure we
	// get the latest index.html from the deployment, bypassing any stale internal edge cache.
	shellUrl.searchParams.set("__cf_shell_cb", Date.now().toString());
	// Also preserve any user-provided query params (like ?_cb= from the recovery script)
	for (const [key, val] of url.searchParams) {
		shellUrl.searchParams.set(key, val);
	}

	// Because `_routes.json` excludes locale shells, this fetch goes straight
	// to the CDN and does NOT re-invoke this Function.
	const shellResponse = await context.env.ASSETS.fetch(new Request(shellUrl, { method: "GET" }));

	// Re-wrap so any 308/redirect from the asset pipeline cannot leak to the browser.
	const headers = new Headers(shellResponse.headers);
	headers.set("X-SPA-Fallback", "true");
	// Match `_headers` for / and other shells exactly, including `max-age=0`,
	// so SPA-fallback responses can never be cached or heuristically aged by
	// browsers/intermediaries.
	headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	headers.set("Pragma", "no-cache");
	headers.set("Expires", "0");

	// SEO guard: the shell we just fetched carries the *homepage* canonical and
	// metadata, not the SPA route's. Inject `noindex,follow` so crawlers that
	// don't execute JS (and any that ignore robots.txt) won't index the route
	// under the wrong canonical. Client-side React updates the meta after hydrate.
	const rewritten = new HTMLRewriter()
		.on("head", {
			element(el) {
				el.prepend(
					'<meta name="robots" content="noindex,follow" data-spa-fallback="true">',
					{ html: true }
				);
			},
		})
		.transform(new Response(shellResponse.body, { headers, status: 200 }));

	return rewritten;
}
