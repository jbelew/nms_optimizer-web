/**
 * @file Unit tests for the Cloudflare Pages Function routing logic.
 *
 * Tests redirects, SSG passthrough, SPA fallback, and the recursion guard by
 * mocking `context.next()` and `context.env.ASSETS.fetch()`.
 *
 * The Function is plain ESM with no runtime-specific imports, so we can load
 * it directly under Node + Vitest.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FN_URL = `file://${path.join(__dirname, "../functions/[[path]].js")}`;
const { onRequest } = await import(FN_URL);

/**
 * Build a minimal Cloudflare Function `context` for a given URL.
 * `nextResponse` controls what `next()` returns; `assetsFetch` controls
 * what `env.ASSETS.fetch()` returns.
 */
function makeContext(url, { assetsFetch, nextResponse } = {}) {
	const next = vi.fn(
		async () =>
			nextResponse ??
			new Response("OK", { headers: { "content-type": "text/html" }, status: 200 })
	);
	const fetchAssets = vi.fn(
		async (req) =>
			(assetsFetch && assetsFetch(req)) ??
			new Response("<html lang=\"en\"></html>", {
				headers: { "content-type": "text/html" },
				status: 200,
			})
	);

	return {
		env: { ASSETS: { fetch: fetchAssets } },
		next,
		request: new Request(url),
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
			expect(res.status).toBe(404); // Probe fails, next() was called, function returns 404 next response
		});
	});
});
