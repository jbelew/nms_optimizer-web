/**
 * @file Verification script for Cloudflare deployment.
 *
 * Runs against the live production site (or a preview URL) to verify static CDN caching,
 * SPA fallback routing, immutable hashed asset caching, and `Accept: text/markdown`
 * Agent Markdown Document content negotiation.
 *
 * Usage: bun scripts/verify-deployment.mjs [url]
 */

import { SUPPORTED_LANGUAGES } from "../shared/config.js";

const DEFAULT_TARGET = "https://nms-optimizer.app";
const BROWSER_ACCEPT = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
const EXPECTED_CONTENT_SIGNAL = "ai-train=yes, search=yes, ai-input=yes";

const MARKDOWN_NEGOTIATION_PATHS = [
	"/",
	"/about/",
	"/es/about/",
	"/fr/instructions/",
	"/de/changelog/",
	"/pt/translation/",
	"/it/privacy/",
];

const REQUIRED_FRONTMATTER_KEYS = ["title", "description", "url", "lang", "image"];

/**
 * Verifies live Cloudflare deployment headers, static CDN cache status, SPA fallback routing,
 * and `Accept: text/markdown` Agent Markdown Document negotiation against `target`.
 *
 * @remarks
 * Uses `redirect: "manual"` on HTTP probes so canonical `301` redirects and edge response
 * headers are inspected directly without silent redirect following.
 *
 * @param {Object} [options] - Verification options.
 * @param {typeof fetch} [options.fetchImpl] - Fetch implementation for live HTTP probes.
 * @param {{ error: (...args: unknown[]) => void, info: (...args: unknown[]) => void }} [options.logger] - Diagnostic logger.
 * @param {string} [options.target] - Base deployment origin URL (without trailing slash).
 * @returns {Promise<{ errors: number, failures: string[], ok: boolean }>} Verification summary.
 * @default { target: "https://nms-optimizer.app" }
 * @see {@link ./verify-deployment.test.mjs Unit Tests}
 */
export async function verifyDeployment({
	fetchImpl = globalThis.fetch,
	logger = { error: console.error, info: console.log },
	target = DEFAULT_TARGET,
} = {}) {
	const baseUrl = target.replace(/\/+$/, "");
	const failures = [];

	/**
	 * Records a verification failure message and logs it.
	 *
	 * @param {string} message - Human-readable failure description.
	 */
	const fail = (message) => {
		failures.push(message);
		logger.error(`✗ ${message}`);
	};

	/**
	 * Performs an HTTP GET against `path` with optional headers and returns the response or `null` on network failure.
	 *
	 * @param {string} path - Root-relative request path.
	 * @param {Record<string, string>} [headers] - Request headers.
	 * @returns {Promise<Response | null>} HTTP response or `null`.
	 */
	const probe = async (path, headers = {}) => {
		const url = `${baseUrl}${path}`;

		try {
			return await fetchImpl(url, {
				headers,
				method: "GET",
				redirect: "manual",
			});
		} catch (error) {
			fail(
				`Failed to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`,
			);

			return null;
		}
	};

	logger.info(`\n🚀 Verifying deployment at ${baseUrl}\n`);

	// 1. Check for duplicate Cache-Control headers on translations
	logger.info("--- 1. Header Overlap Check ---");
	const translationResponse = await probe("/assets/locales/en/translation.json");

	if (translationResponse) {
		const cc = translationResponse.headers.get("cache-control") ?? "";
		const matches = cc.match(/public/g) ?? [];

		if (matches.length > 1) {
			fail(
				`/assets/locales/en/translation.json - DUPLICATE CACHE-CONTROL HEADERS FOUND (${cc})`,
			);
		} else {
			logger.info("✓ /assets/locales/en/translation.json - Clean Cache-Control");
		}
	}

	// 1.1 Check SSG sub-path no-cache
	logger.info("\n--- 1.1 SSG Sub-path No-Cache Check ---");
	const esAboutResponse = await probe("/es/about/", { Accept: BROWSER_ACCEPT });

	if (esAboutResponse) {
		const cc = esAboutResponse.headers.get("cache-control") ?? "";

		if (cc.includes("no-cache") || cc.includes("max-age=0")) {
			logger.info("✓ /es/about/ - Correctly returning no-cache / max-age=0");
		} else {
			fail(`/es/about/ - MISSING NO-CACHE HEADER (${cc})`);
		}
	}

	// 2. Check SSG Cache Status (Should be static CDN status, never DYNAMIC)
	logger.info("\n--- 2. SSG Cache Status (Pages Function Bypass) ---");

	for (const lang of SUPPORTED_LANGUAGES) {
		const path = lang === "en" ? "/about/" : `/${lang}/about/`;
		await probe(path, { Accept: BROWSER_ACCEPT });
		const response = await probe(path, { Accept: BROWSER_ACCEPT });

		if (response) {
			const status = response.headers.get("cf-cache-status") ?? "";

			if (status === "DYNAMIC") {
				fail(`${path} - cf-cache-status is DYNAMIC (hitting Pages Function)`);
			} else if (status) {
				logger.info(`✓ ${path} - Status: ${status}`);
			} else {
				fail(`${path} - Missing cf-cache-status header`);
			}
		}
	}

	// 3. Check SPA Fallback
	logger.info("\n--- 3. SPA Fallback Check ---");
	const spaPath = "/es/performance/";
	const spaResponse = await probe(spaPath, { Accept: BROWSER_ACCEPT });

	if (spaResponse) {
		if (spaResponse.headers.get("x-spa-fallback") === "true") {
			logger.info(`✓ ${spaPath} - X-SPA-Fallback: true`);
		} else {
			fail(`${spaPath} - X-SPA-Fallback header missing`);
		}
	}

	// 4. Check Hashed Asset Immutability
	logger.info("\n--- 4. Build Asset Immutability ---");
	const rootHtmlResponse = await probe("/", { Accept: BROWSER_ACCEPT });

	if (rootHtmlResponse) {
		const html = await rootHtmlResponse.text();
		const assetMatch = html.match(/\/build\/[^"'\s>]+\.js/);

		if (!assetMatch) {
			fail("/ - Could not locate hashed /build/*.js asset in root HTML");
		} else {
			const assetPath = assetMatch[0];
			const assetResponse1 = await probe(assetPath);

			if (assetResponse1) {
				const cc = assetResponse1.headers.get("cache-control") ?? "";

				if (cc.includes("immutable") && cc.includes("max-age=31536000")) {
					logger.info(`✓ ${assetPath} - Cache-Control: immutable, max-age=31536000`);
				} else {
					fail(`${assetPath} - MISSING IMMUTABLE HEADERS (${cc})`);
				}

				const assetResponse2 = await probe(assetPath);

				if (assetResponse2) {
					const assetCacheStatus = assetResponse2.headers.get("cf-cache-status") ?? "";

					if (assetCacheStatus === "HIT") {
						logger.info(`✓ ${assetPath} - cf-cache-status: HIT`);
					} else {
						fail(`${assetPath} - cf-cache-status: ${assetCacheStatus} (Expected HIT)`);
					}
				}
			}
		}
	}

	// 5. Check Agent Markdown Document Negotiation (Accept: text/markdown)
	logger.info("\n--- 5. Agent Markdown Document Content Negotiation ---");

	for (const path of MARKDOWN_NEGOTIATION_PATHS) {
		const mdResponse = await probe(path, { Accept: "text/markdown" });

		if (!mdResponse) {
			continue;
		}

		if (mdResponse.status !== 200) {
			fail(`${path} (Accept: text/markdown) - Expected 200 OK, got ${mdResponse.status}`);
			continue;
		}

		const contentType = (mdResponse.headers.get("content-type") ?? "").toLowerCase();

		if (contentType !== "text/markdown; charset=utf-8") {
			fail(
				`${path} (Accept: text/markdown) - Expected Content-Type "text/markdown; charset=utf-8", got "${mdResponse.headers.get("content-type")}"`,
			);
		}

		if (!hasVaryAccept(mdResponse.headers.get("vary"))) {
			fail(
				`${path} (Accept: text/markdown) - Expected Vary to include Accept, got "${mdResponse.headers.get("vary")}"`,
			);
		}

		const tokensHeader = mdResponse.headers.get("x-markdown-tokens") ?? "";

		if (!/^[1-9]\d*$/.test(tokensHeader)) {
			fail(
				`${path} (Accept: text/markdown) - Expected positive integer x-markdown-tokens, got "${tokensHeader}"`,
			);
		}

		const contentSignal = mdResponse.headers.get("content-signal") ?? "";

		if (contentSignal !== EXPECTED_CONTENT_SIGNAL) {
			fail(
				`${path} (Accept: text/markdown) - Expected Content-Signal "${EXPECTED_CONTENT_SIGNAL}", got "${contentSignal}"`,
			);
		}

		const body = await mdResponse.text();
		const frontmatterCheck = validateYamlFrontmatter(body);

		if (!frontmatterCheck.ok) {
			fail(
				`${path} (Accept: text/markdown) - Invalid YAML frontmatter (${frontmatterCheck.reason})`,
			);
		} else {
			logger.info(
				`✓ ${path} - 200 text/markdown (${tokensHeader} tokens, valid YAML frontmatter)`,
			);
		}
	}

	// 6. Check Cache Isolation, RFC 9110 Quality-Weight Fallback, and Canonical Redirects
	logger.info("\n--- 6. Cache Isolation & RFC 9110 Compliance ---");

	for (const cachedPath of ["/about/", "/es/about/"]) {
		// Warm the Markdown cache key first, then immediately issue a standard browser request.
		await probe(cachedPath, { Accept: "text/markdown" });
		const browserAfterMd = await probe(cachedPath, { Accept: BROWSER_ACCEPT });

		if (browserAfterMd) {
			const htmlContentType = (
				browserAfterMd.headers.get("content-type") ?? ""
			).toLowerCase();
			const htmlCacheStatus = browserAfterMd.headers.get("cf-cache-status") ?? "";
			const htmlBody = await browserAfterMd.text();

			if (browserAfterMd.status !== 200 || !htmlContentType.includes("text/html")) {
				fail(
					`${cachedPath} (browser request after Accept: text/markdown) - Expected 200 text/html, got ${browserAfterMd.status} "${browserAfterMd.headers.get("content-type")}"`,
				);
			} else if (!htmlCacheStatus || htmlCacheStatus === "DYNAMIC") {
				fail(
					`${cachedPath} (browser request after Accept: text/markdown) - Expected non-DYNAMIC static CDN cache status, got "${htmlCacheStatus}"`,
				);
			} else if (!htmlBody.toLowerCase().includes("<html")) {
				fail(
					`${cachedPath} (browser request after Accept: text/markdown) - Expected HTML document body`,
				);
			} else {
				logger.info(
					`✓ ${cachedPath} - Unpoisoned browser text/html (${htmlCacheStatus}) after Markdown request`,
				);
			}
		}
	}

	const qFallbackHeader = "text/html, text/markdown;q=0.5";

	for (const qFallbackPath of ["/", "/about/"]) {
		const qFallbackResponse = await probe(qFallbackPath, { Accept: qFallbackHeader });

		if (qFallbackResponse) {
			const qContentType = (
				qFallbackResponse.headers.get("content-type") ?? ""
			).toLowerCase();

			if (qFallbackResponse.status !== 200 || !qContentType.includes("text/html")) {
				fail(
					`${qFallbackPath} (Accept: ${qFallbackHeader}) - Expected 200 text/html fallback, got ${qFallbackResponse.status} "${qFallbackResponse.headers.get("content-type")}"`,
				);
			} else {
				logger.info(`✓ ${qFallbackPath} - RFC 9110 q=0.5 fallback returned text/html`);
			}
		}
	}

	for (const unslashedPath of ["/about", "/es/instructions"]) {
		const redirectResponse = await probe(unslashedPath, { Accept: "text/markdown" });

		if (redirectResponse) {
			const location = redirectResponse.headers.get("location") ?? "";
			const expectedLocation = `${baseUrl}${unslashedPath}/`;

			if (redirectResponse.status !== 301) {
				fail(
					`${unslashedPath} (Accept: text/markdown) - Expected 301 redirect, got ${redirectResponse.status}`,
				);
			} else if (location.includes("/__md") || location !== expectedLocation) {
				fail(
					`${unslashedPath} (Accept: text/markdown) - Expected clean Location "${expectedLocation}" without /__md, got "${location}"`,
				);
			} else {
				logger.info(`✓ ${unslashedPath} - Clean 301 Location -> ${location}`);
			}
		}
	}

	const directRewriteResponse = await probe("/__md/about/", { Accept: BROWSER_ACCEPT });

	if (directRewriteResponse) {
		const directLocation = directRewriteResponse.headers.get("location") ?? "";
		const expectedPublicUrl = `${baseUrl}/about/`;

		if (directRewriteResponse.status !== 301 || directLocation !== expectedPublicUrl) {
			fail(
				`/__md/about/ (direct browser request) - Expected 301 Location "${expectedPublicUrl}", got ${directRewriteResponse.status} "${directLocation}"`,
			);
		} else {
			const mdAfterDirect = await probe("/about/", { Accept: "text/markdown" });

			if (mdAfterDirect) {
				const mdAfterDirectCt = (
					mdAfterDirect.headers.get("content-type") ?? ""
				).toLowerCase();

				if (
					mdAfterDirect.status !== 200
					|| mdAfterDirectCt !== "text/markdown; charset=utf-8"
				) {
					fail(
						`/about/ (Accept: text/markdown after direct /__md/about/ browser probe) - Expected unpoisoned 200 text/markdown, got ${mdAfterDirect.status} "${mdAfterDirect.headers.get("content-type")}"`,
					);
				} else {
					logger.info(
						"✓ /__md/about/ - Direct browser request returned 301 without poisoning /__md/about/ Markdown cache",
					);
				}
			}
		}
	}

	logger.info(`\n${"=".repeat(40)}`);

	if (failures.length === 0) {
		logger.info("\n✅ ALL DEPLOYMENT CHECKS PASSED");
	} else {
		logger.info(`\n❌ ${failures.length} CHECKS FAILED`);
	}

	return {
		errors: failures.length,
		failures,
		ok: failures.length === 0,
	};
}

/**
 * Checks whether a `Vary` header value includes the `Accept` field-name token.
 *
 * @param {string | null} varyHeader - Raw `Vary` response header string.
 * @returns {boolean} `true` when `Accept` (or `*`) is listed in `Vary`.
 */
function hasVaryAccept(varyHeader) {
	if (!varyHeader) {
		return false;
	}

	return varyHeader
		.split(",")
		.map((token) => token.trim().toLowerCase())
		.some((token) => token === "accept" || token === "*");
}

/**
 * Validates that a Markdown payload begins with a well-formed YAML frontmatter block
 * containing all required Agent Markdown Document metadata scalars.
 *
 * @param {string} body - Raw response body text.
 * @returns {{ ok: boolean, reason?: string }} Frontmatter validation result.
 */
function validateYamlFrontmatter(body) {
	if (!body.startsWith("---\n")) {
		return { ok: false, reason: "missing opening YAML frontmatter delimiter (---)" };
	}

	const closingIndex = body.indexOf("\n---\n", 4);

	if (closingIndex === -1) {
		return { ok: false, reason: "missing closing YAML frontmatter delimiter (---)" };
	}

	const frontmatterBlock = body.slice(4, closingIndex);
	const lines = frontmatterBlock.split("\n").filter((line) => line.trim().length > 0);
	const parsedKeys = new Map();

	for (const line of lines) {
		const match = line.match(/^([a-z_][a-z0-9_-]*):\s*(.+)$/i);

		if (!match) {
			return { ok: false, reason: `malformed YAML frontmatter line: ${line}` };
		}

		const [, key, rawVal] = match;
		const trimmedVal = rawVal.trim();

		if (
			(trimmedVal.startsWith('"') && !trimmedVal.endsWith('"'))
			|| (trimmedVal.startsWith("'") && !trimmedVal.endsWith("'"))
		) {
			return { ok: false, reason: `unclosed quoted YAML scalar for key "${key}"` };
		}

		const unquoted = trimmedVal.replace(/^["']|["']$/g, "").trim();

		if (!unquoted) {
			return { ok: false, reason: `empty YAML frontmatter value for key "${key}"` };
		}

		parsedKeys.set(key, unquoted);
	}

	for (const requiredKey of REQUIRED_FRONTMATTER_KEYS) {
		if (!parsedKeys.has(requiredKey)) {
			return { ok: false, reason: `missing required YAML frontmatter key "${requiredKey}"` };
		}
	}

	const bodyAfterFrontmatter = body.slice(closingIndex + 5).trimStart();

	if (!bodyAfterFrontmatter.startsWith("# ")) {
		return {
			ok: false,
			reason: "missing top-level Markdown heading (# ) after YAML frontmatter",
		};
	}

	return { ok: true };
}

if (import.meta.main) {
	const targetArg = process.argv[2] || DEFAULT_TARGET;
	const result = await verifyDeployment({ target: targetArg });

	if (!result.ok) {
		process.exit(1);
	}
}
