/**
 * @file Unit tests for the live Cloudflare deployment verification script.
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "bun:test";

import { generateAgentMarkdown, initI18n } from "./generate-ssg.mjs";
import {
	shouldBypassMarkdownEdgeCache,
	shouldRewriteToMarkdownPrefix,
} from "./provision-cloudflare-zone.mjs";
import { verifyDeployment } from "./verify-deployment.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FN_URL = `file://${path.join(__dirname, "../functions/[[path]].js")}`;
const { onRequest } = await import(FN_URL);

const SILENT_LOGGER = {
	error: () => {},
	info: () => {},
};

/**
 * Builds a simulated live Cloudflare edge `fetch` handler supporting optional fault overrides.
 *
 * @param {Object} [overrides] - Fault-injection overrides keyed by scenario.
 * @param {(context: { accept: string, count: number, pathname: string, url: string }) => Response | null} [overrides.intercept] - Custom response interceptor.
 * @returns {typeof fetch} Simulated edge fetch function.
 */
function createEdgeFetchFake({ intercept } = {}) {
	const counts = new Map();

	return async (input, init = {}) => {
		const urlObj = new URL(String(input));
		const pathname = urlObj.pathname;
		const reqHeaders = new Headers(init.headers);
		const accept = reqHeaders.get("accept") ?? "*/*";
		const key = `${pathname}::${accept}`;
		const count = (counts.get(key) ?? 0) + 1;
		counts.set(key, count);

		if (intercept) {
			const custom = intercept({ accept, count, pathname, url: urlObj.toString() });

			if (custom) {
				return custom;
			}
		}

		if (pathname === "/assets/locales/en/translation.json") {
			return new Response("{}", {
				headers: {
					"cache-control": "public, max-age=60, stale-while-revalidate=300",
					"cf-cache-status": count > 1 ? "HIT" : "MISS",
					"content-type": "application/json",
				},
				status: 200,
			});
		}

		if (pathname.startsWith("/build/") && pathname.endsWith(".js")) {
			return new Response("export {};", {
				headers: {
					"cache-control": "public, max-age=31536000, immutable",
					"cf-cache-status": count > 1 ? "HIT" : "MISS",
					"content-type": "application/javascript",
				},
				status: 200,
			});
		}

		if (pathname === "/es/performance/") {
			return new Response("<!doctype html><html><head></head><body></body></html>", {
				headers: {
					"cache-control": "no-cache, must-revalidate, max-age=0",
					"cf-cache-status": "DYNAMIC",
					"content-type": "text/html; charset=utf-8",
					"x-spa-fallback": "true",
				},
				status: 200,
			});
		}

		if (pathname.startsWith("/__md/") && !accept.toLowerCase().includes("text/markdown")) {
			const unwrappedPath = pathname.slice("/__md".length) || "/";

			return new Response(null, {
				headers: {
					location: `${urlObj.origin}${unwrappedPath}`,
				},
				status: 301,
			});
		}

		if (!pathname.endsWith("/") && !pathname.includes(".")) {
			return new Response(null, {
				headers: {
					location: `${urlObj.origin}${pathname}/`,
				},
				status: 301,
			});
		}

		const prefersMarkdown =
			accept.toLowerCase().includes("text/markdown")
			&& !accept.toLowerCase().includes("text/markdown;q=0.5")
			&& !accept.toLowerCase().includes("text/markdown;q=0");

		if (prefersMarkdown) {
			const langMatch = pathname.match(/^\/(es|fr|de|pt|it)\//);
			const lang = langMatch ? langMatch[1] : "en";
			const markdownBody = [
				"---",
				'title: "NMS Optimizer"',
				'description: "Optimize No Man\'s Sky technology layouts."',
				`url: "${urlObj.origin}${pathname}"`,
				`lang: "${lang}"`,
				`image: "${urlObj.origin}/assets/img/screenshots/screenshot.png"`,
				"---",
				"",
				"# No Man's Sky Technology Layout Optimizer",
				"",
				"Clean Agent Markdown Document body.",
				"",
				"## Navigation",
				"",
				`- [About](${urlObj.origin}/about/) - About NMS Optimizer`,
			].join("\n");

			return new Response(markdownBody, {
				headers: {
					"cache-control": "no-cache, must-revalidate, max-age=0",
					"cf-cache-status": count > 1 ? "HIT" : "MISS",
					"content-signal": "ai-train=yes, search=yes, ai-input=yes",
					"content-type": "text/markdown; charset=utf-8",
					vary: "Accept",
					"x-markdown-tokens": String(
						Math.ceil(Buffer.byteLength(markdownBody, "utf-8") / 4),
					),
				},
				status: 200,
			});
		}

		return new Response(
			'<!doctype html><html lang="en"><head><script type="module" src="/build/index-abc123.js"></script></head><body></body></html>',
			{
				headers: {
					"cache-control": "no-cache, must-revalidate, max-age=0",
					"cf-cache-status": count > 1 ? "HIT" : "MISS",
					"content-type": "text/html; charset=utf-8",
				},
				status: 200,
			},
		);
	};
}

describe("verifyDeployment (verify-deployment.mjs)", () => {
	it("passes when static CDN caching and Accept: text/markdown negotiation headers and YAML frontmatter are valid across root and localized Routed Dialogs", async () => {
		const result = await verifyDeployment({
			fetchImpl: createEdgeFetchFake(),
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(result.ok).toBe(true);
		expect(result.errors).toBe(0);
		expect(result.failures).toEqual([]);
	});

	it("fails when Accept: text/markdown returns invalid headers or lacks valid YAML frontmatter", async () => {
		const missingTokensResult = await verifyDeployment({
			fetchImpl: createEdgeFetchFake({
				intercept({ accept, pathname }) {
					if (pathname === "/" && accept === "text/markdown") {
						return new Response(
							'---\ntitle: "X"\ndescription: "Y"\nurl: "https://nms-optimizer.app/"\nlang: "en"\nimage: "https://nms-optimizer.app/og.png"\n---\n\n# Heading\n',
							{
								headers: {
									"content-signal": "ai-train=yes, search=yes, ai-input=yes",
									"content-type": "text/markdown; charset=utf-8",
									vary: "Accept",
									"x-markdown-tokens": "0",
								},
								status: 200,
							},
						);
					}

					return null;
				},
			}),
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(missingTokensResult.ok).toBe(false);
		expect(missingTokensResult.failures.some((msg) => msg.includes("x-markdown-tokens"))).toBe(
			true,
		);

		const badFrontmatterResult = await verifyDeployment({
			fetchImpl: createEdgeFetchFake({
				intercept({ accept, pathname }) {
					if (pathname === "/es/about/" && accept === "text/markdown") {
						return new Response(
							"<!doctype html><html><body>HTML instead of Markdown</body></html>",
							{
								headers: {
									"content-signal": "ai-train=yes, search=yes, ai-input=yes",
									"content-type": "text/markdown; charset=utf-8",
									vary: "Accept",
									"x-markdown-tokens": "42",
								},
								status: 200,
							},
						);
					}

					return null;
				},
			}),
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(badFrontmatterResult.ok).toBe(false);
		expect(badFrontmatterResult.failures.some((msg) => msg.includes("frontmatter"))).toBe(true);
	});

	it("fails when an Accept: text/markdown request poisons subsequent browser HTML cache entries or degrades them to DYNAMIC", async () => {
		let markdownFetchedOnAbout = false;
		const poisonedFetch = createEdgeFetchFake({
			intercept({ accept, pathname }) {
				if (pathname === "/about/" && accept === "text/markdown") {
					markdownFetchedOnAbout = true;

					return null;
				}

				if (
					pathname === "/about/"
					&& markdownFetchedOnAbout
					&& accept.includes("text/html")
					&& !accept.includes("text/markdown")
				) {
					return new Response('---\ntitle: "Poisoned"\n---\n', {
						headers: {
							"cf-cache-status": "HIT",
							"content-type": "text/markdown; charset=utf-8",
						},
						status: 200,
					});
				}

				return null;
			},
		});

		const poisonedResult = await verifyDeployment({
			fetchImpl: poisonedFetch,
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(poisonedResult.ok).toBe(false);
		expect(poisonedResult.failures.some((msg) => msg.includes("text/html"))).toBe(true);
	});

	it("fails when Accept: text/html, text/markdown;q=0.5 does not fall back to HTML", async () => {
		const brokenQWeightFetch = createEdgeFetchFake({
			intercept({ accept, pathname }) {
				if (pathname === "/about/" && accept === "text/html, text/markdown;q=0.5") {
					return new Response('---\ntitle: "Wrong Variant"\n---\n', {
						headers: {
							"content-type": "text/markdown; charset=utf-8",
							vary: "Accept",
						},
						status: 200,
					});
				}

				return null;
			},
		});

		const result = await verifyDeployment({
			fetchImpl: brokenQWeightFetch,
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(result.ok).toBe(false);
		expect(result.failures.some((msg) => msg.includes("q=0.5"))).toBe(true);
	});

	it("fails when unslashed Accept: text/markdown requests leak /__md in 301 Location headers", async () => {
		const leakyRedirectFetch = createEdgeFetchFake({
			intercept({ accept, pathname, url }) {
				if (pathname === "/about" && accept === "text/markdown") {
					const origin = new URL(url).origin;

					return new Response(null, {
						headers: {
							location: `${origin}/__md/about/`,
						},
						status: 301,
					});
				}

				return null;
			},
		});

		const result = await verifyDeployment({
			fetchImpl: leakyRedirectFetch,
			logger: SILENT_LOGGER,
			target: "https://nms-optimizer.app",
		});

		expect(result.ok).toBe(false);
		expect(result.failures.some((msg) => msg.includes("/__md"))).toBe(true);
	});

	it("passes end-to-end when wired through the Zone URL Rewrite rule, public/_routes.json exclusions, functions/[[path]].js, and generateAgentMarkdown", async () => {
		const isMockedReadFile = typeof fsPromises.readFile.mockImplementation === "function";
		const previousImpl =
			isMockedReadFile ? fsPromises.readFile.getMockImplementation?.() : undefined;

		if (isMockedReadFile) {
			fsPromises.readFile.mockImplementation(async (filePath, encoding) =>
				fs.readFileSync(filePath, encoding),
			);
		}

		const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

		try {
			const i18nInstance = await initI18n();
			const routesJson = JSON.parse(
				fs.readFileSync(path.join(__dirname, "../public/_routes.json"), "utf-8"),
			);
			const excludedSet = new Set(routesJson.exclude);
			const staticAssets = new Map();

			const htmlShell =
				'<!doctype html><html lang="en"><head><script type="module" src="/build/index-abc123.js"></script></head><body></body></html>';

			const ssgTargets = [
				["en", "", "/"],
				["en", "about", "/about/"],
				["es", "about", "/es/about/"],
				["fr", "about", "/fr/about/"],
				["de", "about", "/de/about/"],
				["pt", "about", "/pt/about/"],
				["it", "about", "/it/about/"],
				["fr", "instructions", "/fr/instructions/"],
				["de", "changelog", "/de/changelog/"],
				["pt", "translation", "/pt/translation/"],
				["it", "privacy", "/it/privacy/"],
			];

			for (const [lang, pageName, routePath] of ssgTargets) {
				const t = i18nInstance.getFixedT(lang, "translation");
				const md = await generateAgentMarkdown(
					lang,
					pageName,
					"https://nms-optimizer.app",
					t,
				);
				staticAssets.set(routePath, htmlShell);
				staticAssets.set(`${routePath}index.html`, htmlShell);
				staticAssets.set(`${routePath}index.md`, md);
			}

			staticAssets.set("/es/index.html", htmlShell);

			const edgeCacheByPathname = new Map();
			let functionInvocations = 0;

			const integratedFetch = async (input, init = {}) => {
				const incomingUrl = new URL(String(input));
				const reqHeaders = new Headers(init.headers);
				const accept = reqHeaders.get("accept") ?? "";

				if (incomingUrl.pathname === "/assets/locales/en/translation.json") {
					return new Response("{}", {
						headers: {
							"cache-control": "public, max-age=60, stale-while-revalidate=300",
							"cf-cache-status": "HIT",
							"content-type": "application/json",
						},
						status: 200,
					});
				}

				if (incomingUrl.pathname === "/build/index-abc123.js") {
					const cachedBuild = edgeCacheByPathname.get(incomingUrl.pathname);

					if (cachedBuild) {
						return new Response(cachedBuild.body, {
							headers: { ...cachedBuild.headers, "cf-cache-status": "HIT" },
							status: cachedBuild.status,
						});
					}

					const buildHeaders = {
						"cache-control": "public, max-age=31536000, immutable",
						"content-type": "application/javascript",
					};
					edgeCacheByPathname.set(incomingUrl.pathname, {
						body: "export {};",
						headers: buildHeaders,
						status: 200,
					});

					return new Response("export {};", {
						headers: { ...buildHeaders, "cf-cache-status": "MISS" },
						status: 200,
					});
				}

				// Simulate Cloudflare Zone http_request_transform phase prior to cache key / _routes.json
				const rewrittenUrl = new URL(incomingUrl);

				if (shouldRewriteToMarkdownPrefix(rewrittenUrl, accept, "nms-optimizer.app")) {
					rewrittenUrl.pathname = `/__md${rewrittenUrl.pathname}`;
				}

				// Simulate Cloudflare Zone http_request_cache_settings Rule 1 (cache: false) vs Rule 2 (300s URI-only cache)
				const bypassEdgeCache =
					rewrittenUrl.pathname === "/"
					|| rewrittenUrl.pathname.startsWith("/performance/")
					|| rewrittenUrl.pathname.endsWith("/performance/")
					|| shouldBypassMarkdownEdgeCache(rewrittenUrl.pathname, accept);

				if (!bypassEdgeCache) {
					const cachedEntry = edgeCacheByPathname.get(rewrittenUrl.pathname);

					if (cachedEntry) {
						const hitHeaders = new Headers(cachedEntry.headers);
						hitHeaders.set("cf-cache-status", "HIT");

						return new Response(cachedEntry.body, {
							headers: hitHeaders,
							status: cachedEntry.status,
						});
					}
				}

				const isExcludedFromPagesFunction =
					excludedSet.has(rewrittenUrl.pathname)
					|| (excludedSet.has("/*.md") && rewrittenUrl.pathname.endsWith(".md"));

				if (isExcludedFromPagesFunction) {
					const body = staticAssets.get(rewrittenUrl.pathname) ?? "Not Found";
					const status = staticAssets.has(rewrittenUrl.pathname) ? 200 : 404;
					const staticHeaders = [
						["cache-control", "no-cache, must-revalidate, max-age=0"],
						[
							"content-type",
							rewrittenUrl.pathname.endsWith(".md") ?
								"text/markdown; charset=utf-8"
							:	"text/html; charset=utf-8",
						],
					];

					if (!bypassEdgeCache && status === 200) {
						edgeCacheByPathname.set(rewrittenUrl.pathname, {
							body,
							headers: staticHeaders,
							status,
						});
					}

					const responseHeaders = new Headers(staticHeaders);
					responseHeaders.set("cf-cache-status", bypassEdgeCache ? "BYPASS" : "MISS");

					return new Response(body, {
						headers: responseHeaders,
						status,
					});
				}

				functionInvocations++;
				const fnResponse = await onRequest({
					env: {
						ASSETS: {
							fetch: async (assetReq) => {
								const assetUrl = new URL(
									typeof assetReq === "string" ? assetReq : assetReq.url,
								);
								const assetBody = staticAssets.get(assetUrl.pathname);

								if (!assetBody) {
									return new Response("Not Found", { status: 404 });
								}

								return new Response(assetBody, {
									headers: {
										"cache-control": "no-cache, must-revalidate, max-age=0",
										"content-type":
											assetUrl.pathname.endsWith(".md") ?
												"text/markdown; charset=utf-8"
											:	"text/html; charset=utf-8",
									},
									status: 200,
								});
							},
						},
					},
					next: async () => new Response("Not Found", { status: 404 }),
					request: new Request(rewrittenUrl.toString(), { headers: reqHeaders }),
				});

				const rawBody = fnResponse.body ? await fnResponse.arrayBuffer() : null;
				const headerEntries = Array.from(fnResponse.headers.entries());

				if (!bypassEdgeCache) {
					edgeCacheByPathname.set(rewrittenUrl.pathname, {
						body: rawBody,
						headers: headerEntries,
						status: fnResponse.status,
					});
				}

				const finalHeaders = new Headers(headerEntries);
				finalHeaders.set("cf-cache-status", bypassEdgeCache ? "DYNAMIC" : "MISS");

				return new Response(rawBody, {
					headers: finalHeaders,
					status: fnResponse.status,
				});
			};

			const result = await verifyDeployment({
				fetchImpl: integratedFetch,
				logger: SILENT_LOGGER,
				target: "https://nms-optimizer.app",
			});

			expect(result.failures).toEqual([]);
			expect(result.ok).toBe(true);

			// Confirm repeated pure Accept: text/markdown hits serve directly from the URI-only /__md/about/ edge cache without invoking onRequest.
			const invocationsBeforeCachedHit = functionInvocations;
			const cachedMdHit = await integratedFetch("https://nms-optimizer.app/about/", {
				headers: { Accept: "text/markdown" },
			});
			expect(cachedMdHit.status).toBe(200);
			expect(cachedMdHit.headers.get("cf-cache-status")).toBe("HIT");
			expect(cachedMdHit.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
			expect(functionInvocations).toBe(invocationsBeforeCachedHit);
		} finally {
			infoSpy.mockRestore();

			if (isMockedReadFile && previousImpl) {
				fsPromises.readFile.mockImplementation(previousImpl);
			}
		}
	});
});
