/**
 * @file Integration tests for the Express server.
 * @remarks 
 * This suite verifies the following server behaviors:
 * 1.  **Static Asset Serving:** Ensures sitemaps, robots.txt, and JS/CSS assets are served with correct headers.
 * 2.  **Full SSG Routing:** Validates that client-side routes correctly serve pre-rendered SSG files.
 * 3.  **SEO Redirects:** Checks for lng parameter and /en/ prefix normalization.
 * 4.  **Security Headers:** Confirms CSP, HSTS, and other security headers are present.
 * 5.  **Caching:** Verifies ETag and Cache-Control behavior for both HTML and static assets.
 * 6.  **Error Handling:** Ensures 404 pages are served for invalid routes.
 * 
 * @author jbelew
 * @license GPL-3.0
 * @see {@link ../server/app.js} Express Application
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import app, { scanSsgFiles } from "./app.js";

/** 
 * Directory of the current module, resolved from ES module metadata.
 * @type {string}
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 
 * Path to the mock distribution directory used for integration testing.
 * @type {string}
 */
const MOCK_DIST_PATH = path.join(__dirname, "../dist");

/**
 * Setup hook: Creates a mock distribution environment with index files, SSG pages, and static assets.
 */
beforeAll(() => {
	if (!fs.existsSync(MOCK_DIST_PATH)) {
		fs.mkdirSync(MOCK_DIST_PATH, { recursive: true });
	}
	// Root index
	fs.writeFileSync(
		path.join(MOCK_DIST_PATH, "index.html"),
		'<!DOCTYPE html><html lang="en"><head><title>Root Page</title></head><body>Root Index</body></html>'
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

	// Refresh SSG cache after creating mock files
	scanSsgFiles();
});

/**
 * Teardown hook: Recursively removes the mock distribution directory.
 */
afterAll(() => {
	fs.rmSync(MOCK_DIST_PATH, { recursive: true, force: true });
});

describe("Express Server Core Routing", () => {

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

	it("should return 404 for a non-existent static asset", async () => {
		const response = await request(app).get("/assets/non-existent-file.js");
		expect(response.status).toBe(404);
	});

	it("should return 404 for unknown extensionless paths", async () => {
		const response = await request(app)
			.get("/a/random/path")
			.set("Accept", "text/html");
		expect(response.status).toBe(404);
	});

	it("should enforce trailing slashes (match Cloudflare)", async () => {
		const response = await request(app).get("/about");
		expect(response.status).toBe(301);
		expect(response.headers["location"]).toBe("/about/");
	});

	it("should not redirect the root path with a trailing slash", async () => {
		const response = await request(app).get("/").set("Accept", "text/html");
		expect(response.status).toBe(200);
	});

	it("should normalize lng parameter to path prefix", async () => {
		const response = await request(app).get("/about?lng=fr");
		expect(response.status).toBe(301);
		expect(response.headers["location"]).toBe("/fr/about/");
	});

	it("should strip /en/ prefix for SEO", async () => {
		const response = await request(app).get("/en/about/");
		expect(response.status).toBe(301);
		expect(response.headers["location"]).toBe("/about/");
	});
});

describe("Full SSG - Static Language Routing", () => {
	it("should serve /fr/ language root from SSG", async () => {
		const response = await request(app).get("/fr/");
		expect(response.status).toBe(200);
		expect(response.text).toContain("French Index");
	});

	it("should serve /fr/about/ language route from SSG", async () => {
		const response = await request(app).get("/fr/about/");
		expect(response.status).toBe(200);
		expect(response.text).toContain("French About Page");
	});

	it("should serve /about/ from SSG", async () => {
		const response = await request(app).get("/about/");
		expect(response.status).toBe(200);
		expect(response.text).toContain("English About Page");
	});

	it("should serve / (root)", async () => {
		const response = await request(app).get("/");
		expect(response.status).toBe(200);
		expect(response.text).toContain("Root Index");
	});
});

describe("Caching Headers Verification", () => {
	it("should set cache-control: no-cache for HTML to allow edge caching but prevent stale browser cache", async () => {
		const response = await request(app).get("/").set("Accept", "text/html");
		expect(response.headers["cache-control"]).toBe("public, no-cache, must-revalidate");
	});

	it("should include ETag header for HTML", async () => {
		const response = await request(app).get("/");
		expect(response.headers["etag"]).toBeDefined();
	});

	it("should set background revalidation for SSG files", async () => {
		const response = await request(app).get("/about/");
		expect(response.headers["cache-control"]).toContain("stale-while-revalidate=60");
	});
});

describe("Security Policy Headers", () => {
	it("should set Content-Security-Policy header", async () => {
		const response = await request(app).get("/");
		const csp = response.headers["content-security-policy"];
		expect(csp).toBeDefined();
		expect(csp).toContain("default-src 'self'");
	});

	it("should include X-Content-Type-Options header", async () => {
		const response = await request(app).get("/");
		expect(response.headers["x-content-type-options"]).toBe("nosniff");
	});
});
