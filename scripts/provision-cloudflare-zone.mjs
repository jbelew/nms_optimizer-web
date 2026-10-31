/**
 * @file Repeatable Cloudflare Free-tier Zone provisioning script.
 *
 * Configures the `http_request_transform` URL Rewrite Rule for `Accept: text/markdown`
 * Agent Markdown Document negotiation (`/__md/*`) and the `http_request_cache_settings`
 * Zone Cache Rules against the Cloudflare Rulesets API.
 *
 * Usage:
 *   CLOUDFLARE_ZONE_API_TOKEN=<token> bun scripts/provision-cloudflare-zone.mjs [--dry-run]
 */

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES, TARGET_HOST } from "../shared/config.js";

const DEFAULT_ZONE_ID = "0986bee940f1277db8e730912b3a27ae";
const MARKDOWN_REWRITE_REF = "agent_markdown_accept_rewrite";
const MARKDOWN_REWRITE_DESCRIPTION = "Rewrite Accept: text/markdown requests to /__md/*";

const EXCLUDED_PATH_PREFIXES = ["/__md/", "/build/", "/assets/", "/.well-known/"];

const EXCLUDED_STATIC_EXTENSIONS = [
	"md",
	"txt",
	"xml",
	"json",
	"js",
	"css",
	"ico",
	"png",
	"svg",
	"webp",
	"woff",
	"woff2",
	"html",
];

const EXCLUDED_EXTENSION_SET = new Set(EXCLUDED_STATIC_EXTENSIONS);

/**
 * Provisions Cloudflare Free-tier Zone URL Rewrite (`http_request_transform`) and
 * Cache Rules (`http_request_cache_settings`) for Agent Markdown Document content negotiation.
 *
 * @remarks
 * Executes `http_request_transform` prior to CDN cache-key calculation so `Accept: text/markdown`
 * requests rewrite to `/__md<path>` without poisoning static HTML CDN cache entries, and configures
 * a 300-second edge TTL on pure Markdown `/__md/*` requests under `http_request_cache_settings` while
 * bypassing edge cache on direct non-Markdown `/__md/*` visits and weighted/mixed `Accept` headers.
 *
 * @param {Object} [options] - Provisioning options.
 * @param {string} [options.apiToken] - Cloudflare Zone API token with Transform Rules and Cache Rules edit permissions.
 * @param {string} [options.domain] - Target zone apex domain.
 * @param {boolean} [options.dryRun] - When `true`, returns planned ruleset payloads without mutating Cloudflare.
 * @param {typeof fetch} [options.fetchImpl] - Fetch implementation for Cloudflare API requests.
 * @param {{ info: (...args: unknown[]) => void }} [options.logger] - Diagnostic logger.
 * @param {string} [options.zoneId] - Cloudflare Zone identifier.
 * @returns {Promise<{ cacheRuleset: { id?: string, rules: Record<string, unknown>[] }, transformRuleset: { id?: string, rules: Record<string, unknown>[] } }>} Provisioned or planned Cloudflare ruleset payloads.
 * @throws {Error} When `apiToken` is missing in live mode or the Cloudflare Rulesets API rejects a request.
 * @default { domain: "nms-optimizer.app", dryRun: false, zoneId: "0986bee940f1277db8e730912b3a27ae" }
 * @see {@link ./provision-cloudflare-zone.test.mjs Unit Tests}
 */
export async function provisionCloudflareZone({
	apiToken = process.env.CLOUDFLARE_ZONE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || "",
	domain = process.env.CLOUDFLARE_DOMAIN || TARGET_HOST,
	dryRun = false,
	fetchImpl = globalThis.fetch,
	logger = { info: console.log },
	zoneId = process.env.CLOUDFLARE_ZONE_ID || DEFAULT_ZONE_ID,
} = {}) {
	const markdownRewriteRule = buildMarkdownTransformRule(domain);
	const cacheRules = buildCacheRules(domain);

	if (dryRun) {
		logger.info(`[dry-run] Planned Cloudflare Zone rulesets for ${domain} (${zoneId}).`);

		return {
			cacheRuleset: { rules: cacheRules },
			transformRuleset: { rules: [markdownRewriteRule] },
		};
	}

	if (!apiToken) {
		throw new Error(
			"Missing Cloudflare API token. Set CLOUDFLARE_ZONE_API_TOKEN (or CLOUDFLARE_API_TOKEN) with Zone -> Transform Rules -> Edit and Zone -> Cache Rules -> Edit permissions.",
		);
	}

	const baseUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}`;
	const headers = {
		Authorization: `Bearer ${apiToken}`,
		"Content-Type": "application/json",
	};

	const transformEntrypointUrl = `${baseUrl}/rulesets/phases/http_request_transform/entrypoint`;
	const preservedTransformRules = await fetchPreservedTransformRules(
		transformEntrypointUrl,
		headers,
		fetchImpl,
	);

	const transformRuleset = await putPhaseRuleset({
		baseUrl,
		domain,
		fetchImpl,
		headers,
		logger,
		phase: "http_request_transform",
		rules: [markdownRewriteRule, ...preservedTransformRules],
		zoneId,
	});

	const cacheRuleset = await putPhaseRuleset({
		baseUrl,
		domain,
		fetchImpl,
		headers,
		logger,
		phase: "http_request_cache_settings",
		rules: cacheRules,
		zoneId,
	});

	return {
		cacheRuleset,
		transformRuleset,
	};
}

/**
 * Evaluates whether Cache Rule 1 (`cache: false`) bypasses Cloudflare's URI-only edge cache
 * for a `/__md` or `/__md/*` request so direct browser `301` redirects and weighted/mixed
 * RFC 9110 `Accept` headers never collide with cached pure-Markdown `/__md/*` responses.
 *
 * @remarks
 * Mirrors the Wirefilter expression in `buildCacheRules` Rule 1.
 *
 * @param {string} pathname - Request pathname after `http_request_transform`.
 * @param {string} acceptHeader - Raw `Accept` request header value.
 * @returns {boolean} `true` when the request matches Rule 1 (`cache: false`) bypass conditions.
 * @see {@link ./provision-cloudflare-zone.test.mjs Unit Tests}
 */
export function shouldBypassMarkdownEdgeCache(pathname, acceptHeader) {
	if (pathname.startsWith("/__md/performance/")) {
		return true;
	}

	if (pathname !== "/__md" && !pathname.startsWith("/__md/")) {
		return false;
	}

	const lowerAccept = acceptHeader.toLowerCase();

	return (
		!lowerAccept.includes("text/markdown")
		|| lowerAccept.includes("text/html")
		|| lowerAccept.includes("application/xhtml+xml")
		|| lowerAccept.includes(";")
	);
}

/**
 * Evaluates whether the Cloudflare Zone `http_request_transform` URL Rewrite Rule
 * rewrites an incoming request URL to `/__md<path>`.
 *
 * @remarks
 * Mirrors the Wirefilter expression in `buildMarkdownTransformRule`.
 *
 * @param {URL} url - Incoming request URL prior to Zone URL Rewrite.
 * @param {string} acceptHeader - Raw `Accept` request header value.
 * @param {string} [domain] - Target zone apex domain.
 * @returns {boolean} `true` when the Zone Transform Rule rewrites `url.pathname` to `/__md${url.pathname}`.
 * @default domain = "nms-optimizer.app"
 * @see {@link ./provision-cloudflare-zone.test.mjs Unit Tests}
 */
export function shouldRewriteToMarkdownPrefix(url, acceptHeader, domain = TARGET_HOST) {
	if (url.hostname !== domain) {
		return false;
	}

	if (!acceptHeader.toLowerCase().includes("text/markdown")) {
		return false;
	}

	if (
		url.pathname === "/__md"
		|| EXCLUDED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
	) {
		return false;
	}

	const lastSegment = url.pathname.split("/").pop() ?? "";
	const dotIdx = lastSegment.lastIndexOf(".");
	const ext = dotIdx > 0 ? lastSegment.slice(dotIdx + 1).toLowerCase() : "";

	return !EXCLUDED_EXTENSION_SET.has(ext);
}

/**
 * Builds the ordered Cloudflare Zone Cache Rules (`http_request_cache_settings`) matching
 * `public/_headers` and including `/__md/*` in the 300-second edge TTL rule while bypassing
 * edge cache on direct non-Markdown `/__md/*` visits and weighted/mixed `Accept` headers.
 *
 * @param {string} domain - Apex domain name for the Cloudflare Zone.
 * @returns {Record<string, unknown>[]} Ordered Cloudflare `http_request_cache_settings` rule definitions.
 */
function buildCacheRules(domain) {
	const nonDefaultLocales = SUPPORTED_LANGUAGES.filter((lang) => lang !== "en");
	const subShellPrefixes = [
		"/__md/",
		...nonDefaultLocales.map((lang) => `/${lang}/`),
		...KNOWN_DIALOGS.map((dialogId) => `/${dialogId}/`),
	];
	const subShellExpression = [
		'http.request.uri.path eq "/404"',
		'http.request.uri.path eq "/500"',
		'http.request.uri.path eq "/index.md"',
		...subShellPrefixes.map((prefix) => `starts_with(http.request.uri.path, "${prefix}")`),
	].join(" or ");

	const markdownDynamicBypassExpression = [
		'(http.request.uri.path eq "/__md" or starts_with(http.request.uri.path, "/__md/"))',
		"("
			+ [
				'not any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")',
				'any(lower(http.request.headers["accept"][*])[*] contains "text/html")',
				'any(lower(http.request.headers["accept"][*])[*] contains "application/xhtml+xml")',
				'any(lower(http.request.headers["accept"][*])[*] contains ";")',
			].join(" or ")
			+ ")",
	].join(" and ");

	const alwaysFreshExpression = [
		'http.request.uri.path in {"/" "/index.html" "/sw.js" "/version.json"}',
		'starts_with(http.request.uri.path, "/performance/")',
		'starts_with(http.request.uri.path, "/__md/performance/")',
		`(${markdownDynamicBypassExpression})`,
	].join(" or ");

	return [
		{
			action: "set_cache_settings",
			action_parameters: {
				cache: false,
			},
			description: "Always Fresh Assets (Shells / Service Worker / Version)",
			expression: `(${alwaysFreshExpression})`,
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 300, mode: "override_origin" },
			},
			description:
				"Entry Points, PWA Sub-Shells, and Agent Markdown Documents (revalidate on every request)",
			expression: `(${subShellExpression})`,
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 604800, mode: "override_origin" },
			},
			description: "Translation Locales (Cache on Edge, short on browser)",
			expression: '(starts_with(http.request.uri.path, "/assets/locales/"))',
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { mode: "respect_origin" },
			},
			description: "Immutable Build Assets (Vite hashes)",
			expression: '(starts_with(http.request.uri.path, "/build/"))',
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 604800, mode: "override_origin" },
			},
			description: "Mutable Static Assets (Images/Fonts)",
			expression: '(starts_with(http.request.uri.path, "/assets/"))',
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 604800, mode: "override_origin" },
			},
			description: "Root Static Assets (Favicons/Robots/Sitemap/Manifest/Well-Known)",
			expression:
				'(http.request.uri.path in {"/favicon.ico" "/logo.svg" "/robots.txt" "/sitemap.xml" "/apple-touch-icon.png" "/apple-touch-icon-precomposed.png" "/manifest.json"} or starts_with(http.request.uri.path, "/.well-known/"))',
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 86400, mode: "override_origin" },
			},
			description: "Maintenance and Error Pages",
			expression: '(http.request.uri.path in {"/404.html" "/500.html" "/maintenance.html"})',
		},
		{
			action: "set_cache_settings",
			action_parameters: {
				browser_ttl: { mode: "respect_origin" },
				cache: true,
				edge_ttl: { default: 3600, mode: "override_origin" },
			},
			description: "API Cache (Optimized)",
			expression: `(http.host eq "api.${domain}" and http.request.method eq "GET")`,
		},
	];
}

/**
 * Builds the Cloudflare Free-tier `http_request_transform` URL Rewrite Rule for
 * `Accept: text/markdown` requests.
 *
 * @param {string} domain - Apex domain name for the Cloudflare Zone.
 * @returns {Record<string, unknown>} Cloudflare `http_request_transform` rule object.
 */
function buildMarkdownTransformRule(domain) {
	const extensionList = EXCLUDED_STATIC_EXTENSIONS.map((ext) => `"${ext}"`).join(" ");
	const expression = [
		`http.host eq "${domain}"`,
		'any(lower(http.request.headers["accept"][*])[*] contains "text/markdown")',
		'http.request.uri.path ne "/__md"',
		...EXCLUDED_PATH_PREFIXES.map(
			(prefix) => `not starts_with(http.request.uri.path, "${prefix}")`,
		),
		`not http.request.uri.path.extension in {${extensionList}}`,
	].join(" and ");

	return {
		action: "rewrite",
		action_parameters: {
			uri: {
				path: {
					expression: 'concat("/__md", http.request.uri.path)',
				},
			},
		},
		description: MARKDOWN_REWRITE_DESCRIPTION,
		enabled: true,
		expression: `(${expression})`,
		ref: MARKDOWN_REWRITE_REF,
	};
}

/**
 * Formats an actionable error when a Cloudflare Rulesets API call fails.
 *
 * @param {string} phase - Ruleset phase name (`http_request_transform` or `http_request_cache_settings`).
 * @param {number} status - HTTP status code returned by Cloudflare.
 * @param {unknown} payload - Parsed JSON response payload.
 * @returns {Error} Formatted error instance.
 */
function createCloudflareApiError(phase, status, payload) {
	const apiErrors =
		payload && typeof payload === "object" && "errors" in payload ?
			JSON.stringify(payload.errors)
		:	"unknown error";
	const permissionHint =
		status === 401 || status === 403 ?
			" Ensure CLOUDFLARE_ZONE_API_TOKEN (or CLOUDFLARE_API_TOKEN) grants Zone -> Transform Rules -> Edit and Zone -> Cache Rules -> Edit permissions."
		:	"";

	return new Error(
		`Cloudflare Rulesets API failed for phase "${phase}" (HTTP ${status}): ${apiErrors}.${permissionHint}`,
	);
}

/**
 * Fetches existing unrelated rules from the zone's `http_request_transform` entrypoint so
 * re-provisioning updates the Agent Markdown rewrite rule idempotently without dropping sibling rules.
 *
 * @param {string} entrypointUrl - Cloudflare `http_request_transform` entrypoint URL.
 * @param {Record<string, string>} headers - Request headers containing the Bearer token.
 * @param {typeof fetch} fetchImpl - Fetch implementation.
 * @returns {Promise<Record<string, unknown>[]>} Sanitized existing non-Markdown transform rules.
 */
async function fetchPreservedTransformRules(entrypointUrl, headers, fetchImpl) {
	const response = await fetchImpl(entrypointUrl, { headers, method: "GET" });

	if (response.status === 404) {
		return [];
	}

	const payload = await response.json();

	if (!response.ok || !payload?.success) {
		throw createCloudflareApiError("http_request_transform", response.status, payload);
	}

	const existingRules = Array.isArray(payload.result?.rules) ? payload.result.rules : [];

	return existingRules
		.filter(
			(rule) =>
				rule.ref !== MARKDOWN_REWRITE_REF
				&& rule.description !== MARKDOWN_REWRITE_DESCRIPTION,
		)
		.map((rule) => {
			const preserved = {
				action: rule.action,
				action_parameters: rule.action_parameters,
				description: rule.description,
				enabled: rule.enabled ?? true,
				expression: rule.expression,
			};

			if (rule.id) {
				preserved.id = rule.id;
			}

			if (rule.ref) {
				preserved.ref = rule.ref;
			}

			return preserved;
		});
}

/**
 * Replaces the entrypoint ruleset for a given Cloudflare Rulesets `phase`.
 *
 * @param {Object} params - Phase update parameters.
 * @param {string} params.baseUrl - Cloudflare Zone API base URL.
 * @param {string} params.domain - Target zone apex domain for log output.
 * @param {typeof fetch} params.fetchImpl - Fetch implementation.
 * @param {Record<string, string>} params.headers - Authenticated request headers.
 * @param {{ info: (...args: unknown[]) => void }} params.logger - Diagnostic logger.
 * @param {string} params.phase - Cloudflare ruleset phase (`http_request_transform` or `http_request_cache_settings`).
 * @param {Record<string, unknown>[]} params.rules - Ordered rule definitions to deploy.
 * @param {string} params.zoneId - Cloudflare Zone identifier.
 * @returns {Promise<{ id?: string, rules: Record<string, unknown>[] }>} Updated ruleset result from Cloudflare.
 * @throws {Error} When Cloudflare rejects the `PUT` request.
 */
async function putPhaseRuleset({
	baseUrl,
	domain,
	fetchImpl,
	headers,
	logger,
	phase,
	rules,
	zoneId,
}) {
	const entrypointUrl = `${baseUrl}/rulesets/phases/${phase}/entrypoint`;
	logger.info(`Provisioning ${phase} ruleset for ${domain} (${zoneId})...`);
	const response = await fetchImpl(entrypointUrl, {
		body: JSON.stringify({ rules }),
		headers,
		method: "PUT",
	});
	const payload = await response.json();

	if (!response.ok || !payload?.success) {
		throw createCloudflareApiError(phase, response.status, payload);
	}

	logger.info(
		`✓ Provisioned ${phase} ruleset (${payload.result?.rules?.length ?? rules.length} rule(s)).`,
	);

	return payload.result;
}

if (import.meta.main) {
	const dryRun = process.argv.includes("--dry-run");

	try {
		const result = await provisionCloudflareZone({ dryRun });

		if (dryRun) {
			console.log(JSON.stringify(result, null, 2));
		}
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
