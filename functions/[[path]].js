/**
 * @file Cloudflare Pages Function for NMS Optimizer.
 * @remarks
 * Responsibilities:
 *  1. Unwrapping internal `/__md` Zone URL Rewrite prefixes before canonical redirects.
 *  2. Composing canonical host + trailing-slash + `/en/` strip + `?lng=` `301` redirects.
 *  3. RFC 9110 `Accept` quality-weight (`q=`) negotiation for Agent Markdown Documents
 *     on `/__md/*` routes without un-excluding SSG HTML paths from `public/_routes.json`.
 *  4. "Probe then fallback" routing: if a physical SSG file exists (`next()` returns
 *     non-404), serve it; otherwise, for known client-only Routed Dialogs, serve the
 *     localized PWA shell with `noindex,follow`.
 *
 * Recursion is broken by `public/_routes.json`, which excludes every locale shell
 * (e.g. `/index.html`, `/es/index.html`), all 42 SSG HTML routes, and `/*.md` from the
 * Function so static CDN traffic and internal `env.ASSETS.fetch()` calls bypass Function invocation.
 */

/**
 * Cloudflare Pages static asset binding interface exposed on `context.env.ASSETS`.
 *
 * @typedef {Object} PagesAssetBinding
 * @property {(input: Request | string | URL) => Promise<Response>} fetch - Fetches a static deployment asset.
 */

/**
 * Execution context passed to the Cloudflare Pages Function `onRequest` handler.
 *
 * @typedef {Object} PagesFunctionContext
 * @property {{ ASSETS: PagesAssetBinding }} env - Cloudflare Pages environment bindings.
 * @property {() => Promise<Response>} next - Advances to the default Cloudflare Pages static asset handler.
 * @property {Request} request - Incoming Fetch API request.
 */

/**
 * Parsed RFC 9110 media type parameter preceding `q=` in an `Accept` media range.
 *
 * @typedef {Object} AcceptMediaParam
 * @property {string} key - Lowercase media parameter name.
 * @property {string} value - Unquoted media parameter value.
 */

/**
 * Parsed RFC 9110 `Accept` media-range entry with media parameters and quality weight.
 *
 * @typedef {Object} AcceptMediaRange
 * @property {AcceptMediaParam[]} mediaParams - Media type parameters preceding `q=`.
 * @property {number} q - Quality weight in the inclusive range `[0, 1]`.
 * @property {string} subtype - Lowercase media subtype or `"*"`.
 * @property {string} type - Lowercase primary media type or `"*"`.
 */

/** Supported ISO 639-1 locale codes served by NMS Optimizer. */
const SUPPORTED_LANGS = ["en", "es", "fr", "de", "pt", "it"];
/** Non-default locales that get a path prefix (e.g. `/es/...`). */
const LOCALE_LANGS = SUPPORTED_LANGS.filter((l) => l !== "en");

/**
 * Client-only Routed Dialogs that have no SSG output and require the PWA shell.
 *
 * Must be a subset of `ROUTED_DIALOG_IDS` in `shared/page-registry.js`. The
 * `scripts/spa-routes.test.mjs` test asserts that every entry here is a
 * known page AND has no `dist/{page}/index.html`, and that any page lacking
 * SSG output is listed here.
 *
 * NOTE: Some routes may be "Hybrid" (have SSG output for the base path but
 * client-only sub-routes). These should also be listed here.
 */
const SPA_ROUTES = new Set(["performance"]);

/**
 * Handles incoming Cloudflare Pages edge requests for canonical redirects, `/__md/*`
 * Agent Markdown Document content negotiation, and client-only Routed Dialog SPA fallbacks.
 *
 * @remarks
 * Unwraps `/__md` before executing canonical `301` redirects so `Location` headers never leak
 * the internal rewrite prefix, evaluates RFC 9110 `Accept` quality weights (`q=`) between
 * `text/markdown` and HTML media types, serves pre-rendered `index.md` assets with
 * `x-markdown-tokens` and `Content-Signal` headers, and falls back cleanly on `performance`
 * SPA routes and `404` unknown paths.
 *
 * @param {PagesFunctionContext} context - Cloudflare Pages Function execution context.
 * @returns {Promise<Response>} Negotiated Markdown, canonical `301` redirect, static HTML/SPA shell, or `404` response.
 *
 * @see {@link ../scripts/cloudflare-function.test.mjs Unit Tests}
 *
 * @example
 * ```js
 * const response = await onRequest(context);
 * // returns Response (200 text/markdown, 200 text/html, 301 redirect, or 404)
 * ```
 */
export async function onRequest(context) {
	const { next, request } = context;
	const url = new URL(request.url);
	let isMarkdownRewrite = false;

	while (url.pathname === "/__md" || url.pathname.startsWith("/__md/")) {
		isMarkdownRewrite = true;
		url.pathname = (url.pathname.slice("/__md".length) || "/").replace(/^\/+/, "/");
	}

	let shouldRedirect = false;

	// 1. Canonical Host Redirect (www. -> apex)
	if (url.hostname === "www.nms-optimizer.app") {
		url.hostname = "nms-optimizer.app";
		shouldRedirect = true;
	}

	// 2. Trailing Slash Enforcement (e.g., /about -> /about/)
	// Skip for root, files with extensions, and paths already slashed.
	// We EXPLICITLY skip /404 and /500 to allow Cloudflare to map them to the .html files
	// without creating a loop with its internal "Pretty URLs" 308 redirects.
	const isReservedErrorPath = url.pathname === "/404" || url.pathname === "/500";

	if (
		url.pathname !== "/"
		&& !url.pathname.endsWith("/")
		&& !url.pathname.includes(".")
		&& !isReservedErrorPath
	) {
		url.pathname = `${url.pathname}/`;
		shouldRedirect = true;
	}

	// 3. Remove /en/ prefix (/en/about/ -> /about/)
	const initialParts = url.pathname.split("/").filter(Boolean);

	if (initialParts[0] === "en") {
		const subPath = initialParts.slice(1).join("/");
		url.pathname = `/${subPath}/`.replace(/\/+$/, "/");
		shouldRedirect = true;
	}

	// 4. Language Redirects (?lng=fr -> /fr/)
	const lng = url.searchParams.get("lng");

	if (lng) {
		const normalizedLng = lng.toLowerCase();
		const supportedLang = SUPPORTED_LANGS.includes(normalizedLng) ? normalizedLng : "en";
		url.searchParams.delete("lng");
		const strippedParts = url.pathname.split("/").filter(Boolean);
		const withoutLocale =
			LOCALE_LANGS.includes(strippedParts[0]) ? strippedParts.slice(1) : strippedParts;
		const cleanPath = withoutLocale.length > 0 ? `/${withoutLocale.join("/")}` : "";

		url.pathname =
			supportedLang === "en" ?
				`${cleanPath}/`.replace(/\/+$/, "/")
			:	`/${supportedLang}${cleanPath}/`.replace(/\/+$/, "/");
		shouldRedirect = true;
	}

	if (shouldRedirect) {
		return Response.redirect(url.toString(), 301);
	}

	const pathParts = url.pathname.split("/").filter(Boolean);
	const lastSegment = pathParts[pathParts.length - 1];
	const isExtensionless = Boolean(lastSegment && !lastSegment.includes("."));
	const lang = LOCALE_LANGS.includes(pathParts[0]) ? pathParts[0] : null;
	const routeName = lang ? pathParts[1] : pathParts[0];
	const isSpaRoute = isExtensionless && SPA_ROUTES.has(routeName);

	// 5. Agent Markdown Document negotiation on Zone-rewritten /__md/* requests.
	if (isMarkdownRewrite) {
		return handleMarkdownRewrite(context, url, lang, isSpaRoute);
	}

	// 6. Probe + Fallback for standard requests.
	// First, try to serve a physical SSG asset. If the disk has it, we're done.
	const response = await next();

	// If the asset exists OR the miss isn't a known SPA route, return as-is.
	// This preserves real 404s for genuinely missing pages (good for SEO) and assets.
	// Only fall back to the PWA shell for extensionless paths that match a known
	// client-only route. We deliberately do NOT blanket-rewrite all 404s: that
	// would mask broken links as soft-200s.
	if (response.status !== 404 || !isSpaRoute) {
		return response;
	}

	return serveSpaShell(context, url, lang);
}

/**
 * Ensures the `Vary` header includes `Accept` without duplicating tokens.
 *
 * @param {Headers} headers - Response headers instance to update in place.
 */
function ensureVaryAccept(headers) {
	const existing = headers.get("Vary");

	if (!existing) {
		headers.set("Vary", "Accept");

		return;
	}

	const tokens = existing
		.split(",")
		.map((token) => token.trim().toLowerCase())
		.filter(Boolean);

	if (!tokens.includes("accept") && !tokens.includes("*")) {
		headers.set("Vary", `${existing}, Accept`);
	}
}

/**
 * Computes the effective RFC 9110 quality weight (`0` to `1`) for a target UTF-8 media type
 * across parsed `Accept` media ranges, giving precedence to the most specific match.
 *
 * @param {AcceptMediaRange[]} ranges - Parsed media ranges.
 * @param {string} targetType - Lowercase primary media type (e.g., `"text"`).
 * @param {string} targetSubtype - Lowercase media subtype (e.g., `"markdown"`).
 * @returns {number} Resolved quality weight between `0` and `1`.
 */
function getMediaTypeQuality(ranges, targetType, targetSubtype) {
	let bestSpecificity = 0;
	let bestQ = 0;

	for (const range of ranges) {
		// Our representations only expose charset=utf-8; per RFC 9110 §12.5.1,
		// any media range stipulating other media parameters (or another charset) does not match.
		const paramsMatch = range.mediaParams.every(
			(param) => param.key === "charset" && param.value.toLowerCase() === "utf-8",
		);

		if (!paramsMatch) {
			continue;
		}

		let specificity;

		if (range.type === targetType && range.subtype === targetSubtype) {
			specificity = 3 + range.mediaParams.length;
		} else if (range.type === targetType && range.subtype === "*") {
			specificity = 2;
		} else if (range.type === "*" && range.subtype === "*") {
			specificity = 1;
		} else {
			continue;
		}

		if (specificity > bestSpecificity) {
			bestSpecificity = specificity;
			bestQ = range.q;
		} else if (specificity === bestSpecificity && range.q > bestQ) {
			bestQ = range.q;
		}
	}

	return bestQ;
}

/**
 * Negotiates `/__md/*` requests between pre-rendered Agent Markdown Documents, HTML representations,
 * canonical `301` browser redirects, client-only SPA fallbacks, and `404` responses.
 *
 * @param {PagesFunctionContext} context - Cloudflare Pages Function execution context.
 * @param {URL} url - Public unwrapped canonical URL.
 * @param {string | null} lang - Non-default locale code prefix, or `null` for English.
 * @param {boolean} isSpaRoute - Whether the unwrapped path targets a client-only Routed Dialog.
 * @returns {Promise<Response>} Negotiated HTTP response.
 */
async function handleMarkdownRewrite(context, url, lang, isSpaRoute) {
	const acceptHeader = context.request.headers.get("Accept") ?? "";

	if (!acceptHeader.toLowerCase().includes("text/markdown")) {
		return Response.redirect(url.toString(), 301);
	}

	if (isSpaRoute) {
		return withVaryAccept(await serveSpaShell(context, url, lang));
	}

	const pathname = url.pathname;

	if (prefersMarkdownAccept(acceptHeader)) {
		if (!pathname.endsWith("/")) {
			return context.env.ASSETS.fetch(new Request(url, { method: "GET" }));
		}

		const mdAssetUrl = new URL(`${pathname}index.md`, url.origin);
		const mdResponse = await context.env.ASSETS.fetch(
			new Request(mdAssetUrl, { method: "GET" }),
		);

		if (!mdResponse.ok) {
			return mdResponse;
		}

		const bodyBuffer = await mdResponse.arrayBuffer();
		const headers = new Headers(mdResponse.headers);
		headers.set("Content-Type", "text/markdown; charset=utf-8");
		ensureVaryAccept(headers);
		headers.set("x-markdown-tokens", String(Math.ceil(bodyBuffer.byteLength / 4)));
		headers.set("Content-Signal", "ai-train=no, search=yes, ai-input=no");
		headers.set("Cache-Control", "no-cache, must-revalidate, max-age=0");

		return new Response(bodyBuffer, {
			headers,
			status: 200,
		});
	}

	const htmlResponse = await context.env.ASSETS.fetch(new Request(url, { method: "GET" }));

	return withVaryAccept(htmlResponse);
}

/**
 * Parses an HTTP `Accept` header string into RFC 9110 media ranges with quality weights.
 *
 * @param {string} acceptHeader - Raw `Accept` header value.
 * @returns {AcceptMediaRange[]} Parsed media ranges.
 */
function parseAcceptRanges(acceptHeader) {
	const ranges = [];

	for (const entry of splitOutsideQuotes(acceptHeader, ",")) {
		const segments = splitOutsideQuotes(entry, ";");
		const mediaType = segments[0]?.trim().toLowerCase();

		if (!mediaType) {
			continue;
		}

		const slashParts = mediaType.split("/");

		if (slashParts.length !== 2) {
			continue;
		}

		const type = slashParts[0].trim();
		const subtype = slashParts[1].trim();

		if (!type || !subtype) {
			continue;
		}

		const mediaParams = [];
		let q = 1;

		for (const rawParam of segments.slice(1)) {
			const eqIdx = rawParam.indexOf("=");

			if (eqIdx <= 0) {
				continue;
			}

			const key = rawParam.slice(0, eqIdx).trim().toLowerCase();
			const rawValue = rawParam.slice(eqIdx + 1).trim();

			if (key === "q") {
				q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(rawValue) ? Number(rawValue) : 0;
				break;
			}

			const value =
				rawValue.length >= 2 && rawValue.startsWith('"') && rawValue.endsWith('"') ?
					rawValue.slice(1, -1).replace(/\\(.)/g, "$1")
				:	rawValue;

			mediaParams.push({ key, value });
		}

		ranges.push({ mediaParams, q, subtype, type });
	}

	return ranges;
}

/**
 * Evaluates whether an `Accept` header selects `text/markdown` over HTML representations
 * according to RFC 9110 media-range quality weights (`q=`).
 *
 * @param {string} acceptHeader - Raw `Accept` header string.
 * @returns {boolean} `true` when `q(text/markdown) > 0` and `q(text/markdown) >= max(q(text/html), q(application/xhtml+xml))`.
 */
function prefersMarkdownAccept(acceptHeader) {
	const ranges = parseAcceptRanges(acceptHeader);
	const markdownQ = getMediaTypeQuality(ranges, "text", "markdown");
	const htmlQ = Math.max(
		getMediaTypeQuality(ranges, "text", "html"),
		getMediaTypeQuality(ranges, "application", "xhtml+xml"),
	);

	return markdownQ > 0 && markdownQ >= htmlQ;
}

/**
 * Fetches the localized PWA HTML shell for client-only Routed Dialogs and injects
 * `noindex,follow` robot metadata.
 *
 * @param {PagesFunctionContext} context - Cloudflare Pages Function execution context.
 * @param {URL} url - Unwrapped request URL.
 * @param {string | null} lang - Non-default locale code prefix, or `null` for English.
 * @returns {Promise<Response>} Rewritten `200 OK` HTML SPA fallback response.
 */
async function serveSpaShell(context, url, lang) {
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
	headers.set("Cache-Control", "no-cache, must-revalidate, max-age=0");
	headers.set("Pragma", "no-cache");
	headers.set("Expires", "0");

	// SEO guard: the shell we just fetched carries the *homepage* canonical and
	// metadata, not the SPA route's. Inject `noindex,follow` so crawlers that
	// don't execute JS (and any that ignore robots.txt) won't index the route
	// under the wrong canonical. Client-side React updates the meta after hydrate.
	return new HTMLRewriter()
		.on("head", {
			element(el) {
				el.prepend(
					'<meta name="robots" content="noindex,follow" data-spa-fallback="true">',
					{ html: true },
				);
			},
		})
		.transform(new Response(shellResponse.body, { headers, status: 200 }));
}

/**
 * Splits a header string on `delimiter` while ignoring delimiters enclosed in double quotes.
 *
 * @param {string} value - Input header string.
 * @param {string} delimiter - Single-character delimiter (`,` or `;`).
 * @returns {string[]} Split segments.
 */
function splitOutsideQuotes(value, delimiter) {
	const parts = [];
	let current = "";
	let inQuotes = false;
	let escaped = false;

	for (const ch of value) {
		if (escaped) {
			current += ch;
			escaped = false;
			continue;
		}

		if (ch === "\\" && inQuotes) {
			current += ch;
			escaped = true;
			continue;
		}

		if (ch === '"') {
			inQuotes = !inQuotes;
			current += ch;
			continue;
		}

		if (ch === delimiter && !inQuotes) {
			parts.push(current);
			current = "";
			continue;
		}

		current += ch;
	}

	parts.push(current);

	return parts;
}

/**
 * Clones a `Response` while ensuring `Vary: Accept` is present on its headers.
 *
 * @param {Response} response - Source asset response.
 * @returns {Response} Response carrying `Vary: Accept`.
 */
function withVaryAccept(response) {
	const headers = new Headers(response.headers);
	ensureVaryAccept(headers);

	return new Response(response.body, {
		headers,
		status: response.status,
	});
}
