/**
 * @file Unit tests for the Cloudflare Pages Function routing logic.
 *
 * Tests redirects, SSG passthrough, SPA fallback, `/__md/*` Agent Markdown Document
 * RFC 9110 content negotiation, and the build-to-edge contract by mocking
 * `context.next()` and `context.env.ASSETS.fetch()`.
 */

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "bun:test";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES } from "../shared/config.js";
import { generateAgentMarkdown, initI18n } from "./generate-ssg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FN_URL = `file://${path.join(__dirname, "../functions/[[path]].js")}`;
const { onRequest } = await import(FN_URL);

const PUBLIC_LOCALIZED_ROUTES = SUPPORTED_LANGUAGES.flatMap((lang) => {
	const langPrefix = lang === "en" ? "" : `/${lang}`;

	return [`${langPrefix}/`, ...KNOWN_DIALOGS.map((dialogId) => `${langPrefix}/${dialogId}/`)];
});

/**
 * Builds a minimal Cloudflare Pages Function `context` for a given URL.
 *
 * @param {string} url - Request URL string.
 * @param {Object} [options] - Test context configuration.
 * @param {Map<string, string | { body: string, headers?: Record<string, string>, status?: number }> | Record<string, string | { body: string, headers?: Record<string, string>, status?: number }>} [options.assets] - Declarative pathname-to-asset map for `env.ASSETS.fetch()`.
 * @param {HeadersInit} [options.headers] - Incoming HTTP request headers.
 * @param {Response} [options.nextResponse] - Response returned by `context.next()`.
 * @returns {{ env: { ASSETS: { fetch: ReturnType<typeof vi.fn> } }, next: ReturnType<typeof vi.fn>, request: Request }} Mocked Pages Function context.
 */
function makeContext(url, { assets, headers, nextResponse } = {}) {
	const assetEntries =
		assets instanceof Map ? assets
		: assets ? new Map(Object.entries(assets))
		: null;

	const next = vi.fn(
		async () =>
			nextResponse
			?? new Response("OK", { headers: { "content-type": "text/html" }, status: 200 }),
	);
	const fetchAssets = vi.fn(async (req) => {
		if (assetEntries) {
			const reqUrl = new URL(req.url);
			const entry = assetEntries.get(reqUrl.pathname);

			if (typeof entry === "string") {
				return new Response(entry, { status: 200 });
			}

			if (entry) {
				return new Response(entry.body, {
					headers: entry.headers,
					status: entry.status ?? 200,
				});
			}

			return new Response("Not Found", { status: 404 });
		}

		return new Response('<html lang="en"><head></head><body></body></html>', {
			headers: { "content-type": "text/html" },
			status: 200,
		});
	});

	return {
		env: { ASSETS: { fetch: fetchAssets } },
		next,
		request: new Request(url, { headers }),
	};
}

describe("functions/[[path]].js", () => {
	beforeEach(() => vi.clearAllMocks());

	describe("redirects", () => {
		it("redirects www. to apex (301)", async () => {
			const ctx = makeContext("https://www.nms-optimizer.app/about/");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/about/");
		});

		it("appends trailing slash for extensionless paths (301)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/about");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/about/");
		});

		it("does NOT add trailing slash for asset paths", async () => {
			const ctx = makeContext("https://nms-optimizer.app/logo.svg");
			const res = await onRequest(ctx);
			expect(res.status).not.toBe(301);
		});

		it("does NOT add trailing slash for /404 or /500", async () => {
			const ctx = makeContext("https://nms-optimizer.app/404");
			const res = await onRequest(ctx);
			expect(res.status).not.toBe(301);
		});

		it("rewrites ?lng=fr to /fr/ (301)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/about/?lng=fr");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/fr/about/");
		});

		it("rewrites ?lng=en to bare path (301)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/about/?lng=en");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/about/");
		});

		it("falls back to en for unsupported ?lng= values", async () => {
			const ctx = makeContext("https://nms-optimizer.app/about/?lng=zz");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/about/");
		});

		it("strips /en/ prefix (301)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/en/about/");
			const res = await onRequest(ctx);
			expect(res.status).toBe(301);
			expect(res.headers.get("location")).toBe("https://nms-optimizer.app/about/");
		});
	});

	describe("SSG passthrough", () => {
		it("returns the asset response unchanged when next() succeeds", async () => {
			const ctx = makeContext("https://nms-optimizer.app/es/about/", {
				nextResponse: new Response("ssg-body", { status: 200 }),
			});
			const res = await onRequest(ctx);
			expect(res.status).toBe(200);
			expect(await res.text()).toBe("ssg-body");
			expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled();
		});

		it("returns 404 unchanged when path is NOT a known SPA route", async () => {
			const ctx = makeContext("https://nms-optimizer.app/totally-bogus/", {
				nextResponse: new Response("404", { status: 404 }),
			});
			const res = await onRequest(ctx);
			expect(res.status).toBe(404);
			expect(res.headers.get("X-SPA-Fallback")).toBeNull();
			expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled();
		});

		it("returns 404 unchanged for missing assets (path with extension)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/missing.png", {
				nextResponse: new Response("404", { status: 404 }),
			});
			const res = await onRequest(ctx);
			expect(res.status).toBe(404);
			expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled();
		});
	});

	describe("SPA fallback (probe → shell)", () => {
		it("returns 404 for unknown extensionless paths (Probe fail)", async () => {
			const ctx = makeContext("https://nms-optimizer.app/not-a-real-page/", {
				nextResponse: new Response("Not Found", { status: 404 }),
			});
			const res = await onRequest(ctx);
			expect(res.status).toBe(404);
		});
	});

	describe("Agent Markdown Document negotiation (/__md/*)", () => {
		it("serves pre-rendered index.md with negotiation headers, merged Vary, and UTF-8 x-markdown-tokens", async () => {
			// 26 UTF-16 code units, 30 UTF-8 bytes ("é" = 2B, "—" = 3B, "Ñ" = 2B) -> ceil(30 / 4) = 8
			const utf8Markdown = '---\ntitle: "Café — Ñ"\n---\n';
			const ctx = makeContext("https://nms-optimizer.app/__md/about/", {
				assets: {
					"/about/index.md": {
						body: utf8Markdown,
						headers: { Vary: "Accept-Encoding" },
					},
				},
				headers: { Accept: "text/markdown" },
				nextResponse: new Response("Not Found", { status: 404 }),
			});

			const res = await onRequest(ctx);

			expect(res.status).toBe(200);
			expect(await res.text()).toBe(utf8Markdown);
			expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
			expect(res.headers.get("vary")).toBe("Accept-Encoding, Accept");
			expect(res.headers.get("x-markdown-tokens")).toBe("8");
			expect(res.headers.get("content-signal")).toBe(
				"ai-train=yes, search=yes, ai-input=yes",
			);
			expect(res.headers.get("cache-control")).toBe("no-cache, must-revalidate, max-age=0");
		});

		it("unwraps /__md before canonical 301 redirects so Location headers never leak /__md", async () => {
			const cases = [
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					url: "https://www.nms-optimizer.app/__md/about/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					url: "https://www.nms-optimizer.app/__md/__md/about/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					url: "https://nms-optimizer.app/__md/about",
				},
				{
					expectedLocation: "https://nms-optimizer.app/fr/about/",
					url: "https://nms-optimizer.app/__md/about/?lng=fr",
				},
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					url: "https://nms-optimizer.app/__md/en/about/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/",
					url: "https://nms-optimizer.app/__md/en/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/fr/about/",
					url: "https://www.nms-optimizer.app/__md/en/about?lng=fr",
				},
			];

			for (const { expectedLocation, url } of cases) {
				const ctx = makeContext(url, {
					headers: { Accept: "text/markdown" },
				});
				const res = await onRequest(ctx);

				expect(res.status).toBe(301);
				expect(res.headers.get("location")).toBe(expectedLocation);
			}
		});

		it("redirects direct /__md/* requests without text/markdown in Accept to the unwrapped canonical public URL (301)", async () => {
			const cases = [
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					headers: {
						Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					},
					url: "https://nms-optimizer.app/__md/about/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/about/",
					headers: { Accept: "text/html" },
					url: "https://nms-optimizer.app/__md/__md/about/",
				},
				{
					expectedLocation: "https://nms-optimizer.app/",
					headers: undefined,
					url: "https://nms-optimizer.app/__md",
				},
				{
					expectedLocation: "https://nms-optimizer.app/?platform=starship&grid=abc",
					headers: { Accept: "*/*" },
					url: "https://nms-optimizer.app/__md/?platform=starship&grid=abc",
				},
				{
					expectedLocation: "https://nms-optimizer.app/instructions/",
					headers: { Accept: "text/html" },
					url: "https://nms-optimizer.app/__md/en/instructions",
				},
				{
					expectedLocation: "https://nms-optimizer.app/fr/about/",
					headers: { Accept: "text/html" },
					url: "https://www.nms-optimizer.app/__md/about/?lng=fr",
				},
			];

			for (const { expectedLocation, headers, url } of cases) {
				const ctx = makeContext(url, {
					assets: { "/about/index.md": "# Should redirect instead of serving\n" },
					headers,
				});
				const res = await onRequest(ctx);

				expect(res.status).toBe(301);
				expect(res.headers.get("location")).toBe(expectedLocation);
			}
		});

		it("serves Agent Markdown Documents when RFC 9110 q= weights prefer or tie text/markdown", async () => {
			const assets = {
				"/about/": {
					body: "<!doctype html><html><head></head><body>About HTML</body></html>",
					headers: { "content-type": "text/html; charset=utf-8" },
				},
				"/about/index.md": {
					body: "# About Markdown\n",
					headers: { "content-type": "text/markdown; charset=utf-8" },
				},
			};

			const markdownAcceptHeaders = [
				"text/markdown",
				"text/markdown, text/html;q=0.9",
				"text/markdown, text/html",
				"text/html;q=0.8, application/xhtml+xml;q=0.8, text/markdown;q=0.8",
				"text/markdown;q=0.9, */*;q=0.8",
				"text/markdown; charset=utf-8; q=0.9, text/html; q=0.8",
				'text/markdown;charset="utf-8";q=0.8, text/html;profile="a,b;\\"c\\"";q=0.9, text/html;q=0.7',
				"TEXT/MARKDOWN;Q=0.9, TEXT/HTML;Q=0.5",
			];

			for (const accept of markdownAcceptHeaders) {
				const ctx = makeContext("https://nms-optimizer.app/__md/about/", {
					assets,
					headers: { Accept: accept },
				});
				const res = await onRequest(ctx);

				expect(res.status).toBe(200);
				expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
				expect(res.headers.get("vary")).toBe("Accept");
				expect(await res.text()).toBe("# About Markdown\n");
			}
		});

		it("serves HTML with Vary: Accept when RFC 9110 q= weights or media parameters reject text/markdown", async () => {
			const assets = {
				"/about/": {
					body: "<!doctype html><html><head></head><body>About HTML</body></html>",
					headers: { "content-type": "text/html; charset=utf-8" },
				},
				"/about/index.md": {
					body: "# About Markdown\n",
					headers: { "content-type": "text/markdown; charset=utf-8" },
				},
			};

			const htmlAcceptHeaders = [
				"text/html, text/markdown;q=0.5",
				"application/xhtml+xml;q=0.9, text/markdown;q=0.8",
				"text/markdown;q=0",
				"text/markdown;q=0, */*;q=0.8",
				"text/markdown;q=0.5, */*",
				"text/markdown;q=0.5, text/*;q=0.9",
				"text/html;q=0.8, text/html;level=2;q=0.4, text/markdown;q=0.6",
				"text/markdown;charset=iso-8859-1, text/html;q=0.5",
				"text/markdown;q=0.1234, text/html;q=0.5",
			];

			for (const accept of htmlAcceptHeaders) {
				const ctx = makeContext("https://nms-optimizer.app/__md/about/", {
					assets,
					headers: { Accept: accept },
				});
				const res = await onRequest(ctx);

				expect(res.status).toBe(200);
				expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
				expect(res.headers.get("vary")).toBe("Accept");
				expect(await res.text()).toContain("About HTML");
			}
		});

		it("falls through to the noindex,follow HTML SPA shell on client-only performance Routed Dialogs", async () => {
			const shellAssets = {
				"/es/index.html": {
					body: '<!doctype html><html lang="es"><head><title>Shell</title></head><body>/es/index.html</body></html>',
					headers: { "content-type": "text/html; charset=utf-8" },
				},
				"/index.html": {
					body: '<!doctype html><html lang="en"><head><title>Shell</title></head><body>/index.html</body></html>',
					headers: { "content-type": "text/html; charset=utf-8" },
				},
			};
			const spaCases = [
				{
					expectedShellMarker: "<body>/index.html</body>",
					url: "https://nms-optimizer.app/__md/performance/",
				},
				{
					expectedShellMarker: "<body>/index.html</body>",
					url: "https://nms-optimizer.app/__md/performance/inp/",
				},
				{
					expectedShellMarker: "<body>/es/index.html</body>",
					url: "https://nms-optimizer.app/__md/es/performance/",
				},
			];

			for (const { expectedShellMarker, url } of spaCases) {
				const ctx = makeContext(url, {
					assets: shellAssets,
					headers: { Accept: "text/markdown" },
				});

				const res = await onRequest(ctx);
				const body = await res.text();

				expect(res.status).toBe(200);
				expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
				expect(res.headers.get("x-spa-fallback")).toBe("true");
				expect(res.headers.get("vary")).toBe("Accept");
				expect(res.headers.get("cache-control")).toBe(
					"no-cache, must-revalidate, max-age=0",
				);
				expect(body).toContain(
					'<meta name="robots" content="noindex,follow" data-spa-fallback="true">',
				);
				expect(body).toContain(expectedShellMarker);
			}
		});

		it("preserves 404 status codes on unknown /__md/* routes and missing assets", async () => {
			const unknownUrls = [
				"https://nms-optimizer.app/__md/unknown-route/",
				"https://nms-optimizer.app/__md/es/unknown-route/",
				"https://nms-optimizer.app/__md/missing.png",
			];

			for (const url of unknownUrls) {
				const ctx = makeContext(url, {
					assets: { "/missing.pngindex.md": "# Should never match extension path\n" },
					headers: { Accept: "text/markdown" },
				});

				const res = await onRequest(ctx);

				expect(res.status).toBe(404);
				expect(res.headers.get("x-spa-fallback")).toBeNull();
			}
		});

		it("serves negotiated Agent Markdown Documents across all 42 public localized routes", async () => {
			expect(PUBLIC_LOCALIZED_ROUTES).toHaveLength(42);

			const assets = new Map(
				PUBLIC_LOCALIZED_ROUTES.map((route) => [`${route}index.md`, `# Route ${route}\n`]),
			);

			for (const route of PUBLIC_LOCALIZED_ROUTES) {
				const ctx = makeContext(`https://nms-optimizer.app/__md${route}`, {
					assets,
					headers: { Accept: "text/markdown" },
				});

				const res = await onRequest(ctx);

				expect(res.status).toBe(200);
				expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
				expect(res.headers.get("vary")).toBe("Accept");
				expect(await res.text()).toBe(`# Route ${route}\n`);
			}
		});

		it("serves the homepage Agent Markdown Document when Shared Grid query parameters are present", async () => {
			const sharedGridCtx = makeContext(
				"https://nms-optimizer.app/__md/?platform=corvette&grid=eJxLZmBgYAAABQAB",
				{
					assets: { "/index.md": "# Home Markdown\n" },
					headers: { Accept: "text/markdown" },
				},
			);
			const sharedGridRes = await onRequest(sharedGridCtx);

			expect(sharedGridRes.status).toBe(200);
			expect(sharedGridRes.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
			expect(await sharedGridRes.text()).toBe("# Home Markdown\n");
		});

		it("keeps all 42 SSG HTML routes and /*.md excluded in public/_routes.json while leaving /__md/* active", () => {
			const routesJson = JSON.parse(
				fs.readFileSync(path.join(__dirname, "../public/_routes.json"), "utf-8"),
			);
			const excluded = new Set(routesJson.exclude);

			expect(excluded.has("/*.md")).toBe(true);
			expect(excluded.has("/__md/*")).toBe(false);

			for (const route of PUBLIC_LOCALIZED_ROUTES) {
				expect(excluded.has(route)).toBe(true);
			}
		});

		it("serves synthesized Agent Markdown Documents produced at build time with accurate UTF-8 token counts", async () => {
			const isMockedReadFile = typeof fsPromises.readFile.mockImplementation === "function";
			const previousImpl =
				isMockedReadFile ? fsPromises.readFile.getMockImplementation?.() : undefined;

			if (isMockedReadFile) {
				fsPromises.readFile.mockImplementation(async (filePath, encoding) =>
					fs.readFileSync(filePath, encoding),
				);
			}

			try {
				const i18nInstance = await initI18n();
				const esT = i18nInstance.getFixedT("es", "translation");
				const esAboutMd = await generateAgentMarkdown(
					"es",
					"about",
					"https://nms-optimizer.app",
					esT,
				);

				expect(esAboutMd).not.toBeNull();

				const esRes = await onRequest(
					makeContext("https://nms-optimizer.app/__md/es/about/", {
						assets: { "/es/about/index.md": esAboutMd },
						headers: { Accept: "text/markdown, text/html;q=0.9" },
					}),
				);
				const esBody = await esRes.text();

				expect(esRes.status).toBe(200);
				expect(esRes.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
				expect(esRes.headers.get("vary")).toBe("Accept");
				expect(esRes.headers.get("content-signal")).toBe(
					"ai-train=yes, search=yes, ai-input=yes",
				);
				expect(esRes.headers.get("cache-control")).toBe(
					"no-cache, must-revalidate, max-age=0",
				);
				expect(esRes.headers.get("x-markdown-tokens")).toBe("2114");
				expect(esBody).toBe(esAboutMd);
				expect(esBody.startsWith("---\n")).toBe(true);
				expect(esBody).toContain('url: "https://nms-optimizer.app/es/about/"');
				expect(esBody).toContain('lang: "es"');
				expect(esBody).not.toContain("<radix-icon");
			} finally {
				if (isMockedReadFile && previousImpl) {
					fsPromises.readFile.mockImplementation(previousImpl);
				}
			}
		});
	});
});
