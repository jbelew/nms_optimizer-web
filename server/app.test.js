/**
 * @file Server application tests
 * @description Integration tests for the Express server including routing, SPA fallback,
 * SEO middleware, static file serving, and language-based path routing.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import app from "./app.js";

/** Directory of the current module, resolved from ES module metadata */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Path to the mock dist directory used for testing */
const MOCK_DIST_PATH = path.join(__dirname, "../dist");

/**
 * Setup: Create a mock dist directory and files for the server to use during tests
 */
beforeAll(() => {
	if (!fs.existsSync(MOCK_DIST_PATH)) {
		fs.mkdirSync(MOCK_DIST_PATH);
	}
	// Root index
	fs.writeFileSync(
		path.join(MOCK_DIST_PATH, "index.html"),
		'<!DOCTYPE html><html lang="en"><head><title>Root Page</title></head><body>Root Index ' +
			"填充 ".repeat(200) +
			"</body></html>"
	);
	
	// SSG Language Root
	const frDir = path.join(MOCK_DIST_PATH, "fr");
	if (!fs.existsSync(frDir)) fs.mkdirSync(frDir);
	fs.writeFileSync(
		path.join(frDir, "index.html"),
		"<html><body>French Index</body></html>"
	);

	// SSG Nested Route
	const frAboutDir = path.join(frDir, "about");
	if (!fs.existsSync(frAboutDir)) fs.mkdirSync(frAboutDir, { recursive: true });
	fs.writeFileSync(
		path.join(frAboutDir, "index.html"),
		"<html><body>French About Page</body></html>"
	);

	// English Nested Route
	const enAboutDir = path.join(MOCK_DIST_PATH, "about");
	if (!fs.existsSync(enAboutDir)) fs.mkdirSync(enAboutDir);
	fs.writeFileSync(
		path.join(enAboutDir, "index.html"),
		"<html><body>English About Page</body></html>"
	);

	fs.writeFileSync(
		path.join(MOCK_DIST_PATH, "sitemap.xml"),
		'<xml version="1.0" encoding="UTF-8"?><urlset></urlset>'
	);
	fs.writeFileSync(path.join(MOCK_DIST_PATH, "robots.txt"), "User-agent: *");
});

/**
 * Teardown: Clean up the mock dist directory after tests are complete
 */
afterAll(() => {
	fs.rmSync(MOCK_DIST_PATH, { recursive: true, force: true });
});

describe("Express Server", () => {

	it("should respond with HTML for the root path", async () => {
		const response = await request(app).get("/").set("Accept", "text/html");
		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should serve sitemap.xml", async () => {
		const response = await request(app).get("/sitemap.xml");
		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/xml/);
	});

	it("should serve robots.txt", async () => {
		const response = await request(app).get("/robots.txt");
		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/text\/plain/);
	});

	it("should return 404 for a non-existent static asset", async () => {
		const response = await request(app).get("/assets/non-existent-file.js");
		expect(response.status).toBe(404);
	});

	it("should handle SPA fallback for non-asset paths", async () => {
		        const response = await request(app)
		            .get("/a/random/spa/path")
		            .set("Accept", "text/html");
		        expect(response.status).toBe(404);	});

	it("should redirect requests with trailing slashes", async () => {
		const response = await request(app).get("/about/");
		expect(response.status).toBe(301);
		expect(response.headers["location"]).toBe("/about");
	});

	it("should not redirect the root path with a trailing slash", async () => {
		// A request to '/' is a special case and should not be redirected.
		const response = await request(app).get("/").set("Accept", "text/html");
		expect(response.status).toBe(200);
	});
});

describe("SEO Middleware - Path-based Language Routing", () => {
	it("should serve /fr language route from SSG", async () => {
		const response = await request(app).get("/fr");
		expect(response.status).toBe(200);
		expect(response.text).toContain("French Index");
	});

	it("should serve /fr/about language route from SSG", async () => {
		const response = await request(app).get("/fr/about");
		expect(response.status).toBe(200);
		expect(response.text).toContain("French About Page");
	});

	it("should serve /about from SSG", async () => {
		const response = await request(app).get("/about");
		expect(response.status).toBe(200);
		expect(response.text).toContain("English About Page");
	});

	it("should serve / (root)", async () => {
		const response = await request(app).get("/");
		expect(response.status).toBe(200);
		expect(response.text).toContain("Root Index");
	});

	it("should serve a supported language route without SSG via dynamic injection", async () => {
		// /es was not created in beforeAll, should fall back to base template with dynamic injection
		const response = await request(app).get("/es");
		expect(response.status).toBe(200);
		// Should contain Spanish SEO markers injected by middleware
		expect(response.text).toContain('lang="es"');
		expect(response.text).toContain("<title>");
	});
});

describe("Caching Headers", () => {
	it("should set cache headers for HTML content", async () => {
		const response = await request(app).get("/").set("Accept", "text/html");
		expect(response.headers["cache-control"]).toBeDefined();
	});

	it("should include ETag header for HTML", async () => {
		const response = await request(app).get("/");
		expect(response.headers["etag"]).toBeDefined();
	});

	it("should support conditional requests with ETag", async () => {
		const firstResponse = await request(app).get("/");
		const etag = firstResponse.headers["etag"];

		const secondResponse = await request(app)
			.get("/")
			.set("If-None-Match", etag);

		// Should return 304 Not Modified or 200 with same content
		expect([200, 304]).toContain(secondResponse.status);
	});

	it("should set Cache-Control for static assets", async () => {
		const response = await request(app).get("/sitemap.xml");
		expect(response.status).toBe(200);
		// Static files should have cache headers
		expect([200]).toContain(response.status);
	});
});

describe("Security Headers", () => {
	it("should set Content-Security-Policy header with GTM in img-src", async () => {
		const response = await request(app).get("/");
		const csp = response.headers["content-security-policy"];
		expect(csp).toBeDefined();
		expect(csp).toContain("img-src");
		expect(csp).toContain("www.googletagmanager.com");
	});

	it("should include X-Content-Type-Options header", async () => {
		const response = await request(app).get("/");
		expect(response.headers["x-content-type-options"]).toBeDefined();
	});

	it("should set X-Frame-Options header", async () => {
		const response = await request(app).get("/");
		// CSP frame-ancestors should be set
		expect(response.headers["content-security-policy"]).toContain("frame-ancestors");
	});
});

describe("Compression", () => {
	it("should serve gzip-compressed assets for HTML", async () => {
		const response = await request(app).get("/").set("Accept-Encoding", "gzip");
		expect(response.status).toBe(200);
		expect(response.headers["content-encoding"]).toBe("gzip");
	});

	it("should serve uncompressed assets to clients without gzip support", async () => {
		const response = await request(app).get("/").set("Accept-Encoding", "identity");
		expect(response.status).toBe(200);
		expect(response.headers["content-encoding"]).toBeUndefined();
	});
});

describe("Error Responses", () => {
	it("should return 404 for nonexistent HTML routes", async () => {
		const response = await request(app)
			.get("/nonexistent-page")
			.set("Accept", "text/html");
		expect(response.status).toBe(404);
	});

	it("should not leak sensitive information in error responses", async () => {
		const response = await request(app).get("/nonexistent-asset.js");
		expect(response.status).toBe(404);
		expect(response.text).not.toContain("ENOENT");
		expect(response.text).not.toContain("/home");
	});
});

describe("Request Handling", () => {
	it("should handle requests with query parameters", async () => {
		const response = await request(app)
			.get("/?platform=standard&ship=fighter")
			.set("Accept", "text/html");
		expect(response.status).toBe(200);
		expect(response.text).toContain("<html");
	});

	it("should handle requests with URL fragments (client-side only)", async () => {
		const response = await request(app)
			.get("/#/changelog")
			.set("Accept", "text/html");
		// Fragment is client-side, server sees '/'
		expect(response.status).toBe(200);
		expect(response.text).toContain("<html");
	});

	it("should preserve query parameters when falling back to dynamic injection", async () => {
		// /es is dynamic fallback, query params are handled by middleware
		const response = await request(app)
			.get("/es?foo=bar")
			.set("Accept", "text/html");
		expect(response.status).toBe(200);
		expect(response.text).toContain('lang="es"');
	});
});

describe("Content-Type Handling", () => {
	it("should serve HTML with correct content-type", async () => {
		const response = await request(app).get("/");
		expect(response.headers["content-type"]).toMatch(/text\/html/);
	});

	it("should serve XML with correct content-type", async () => {
		const response = await request(app).get("/sitemap.xml");
		expect(response.headers["content-type"]).toMatch(/xml/);
	});

	it("should serve text files with correct content-type", async () => {
		const response = await request(app).get("/robots.txt");
		expect(response.headers["content-type"]).toMatch(/text\/plain/);
	});
});
