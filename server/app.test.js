import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import app from "./app.js";

// Define a path for a temporary dist directory for testing
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DIST_PATH = path.join(__dirname, "../dist");

// Create a mock dist directory and files for the server to use during tests
beforeAll(() => {
	if (!fs.existsSync(MOCK_DIST_PATH)) {
		fs.mkdirSync(MOCK_DIST_PATH);
	}
	fs.writeFileSync(
		path.join(MOCK_DIST_PATH, "index.html"),
		"<html><body>Mock Index</body></html>"
	);
	fs.writeFileSync(
		path.join(MOCK_DIST_PATH, "sitemap.xml"),
		'<xml version="1.0" encoding="UTF-8"?><urlset></urlset>'
	);
	fs.writeFileSync(path.join(MOCK_DIST_PATH, "robots.txt"), "User-agent: *");
});

// Clean up the mock dist directory after tests are complete
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

describe("SEO Middleware", () => {
	it("should redirect /?lng=fr to /fr", async () => {
		const response = await request(app).get("/?lng=fr");
		expect(response.status).toBe(301);
		expect(new URL(response.headers["location"]).pathname).toBe("/fr");
	});

	it("should redirect /instructions?lng=de to /de/instructions", async () => {
		const response = await request(app).get("/instructions?lng=de");
		expect(response.status).toBe(301);
		expect(new URL(response.headers["location"]).pathname).toBe("/de/instructions");
	});

	it("should redirect /?lng=en to /", async () => {
		const response = await request(app).get("/?lng=en");
		expect(response.status).toBe(301);
		expect(new URL(response.headers["location"]).pathname).toBe("/");
	});

	it("should redirect /about?lng=en to /about", async () => {
		const response = await request(app).get("/about?lng=en");
		expect(response.status).toBe(301);
		expect(new URL(response.headers["location"]).pathname).toBe("/about");
	});

	it("should not redirect /", async () => {
		const response = await request(app).get("/");
		expect(response.status).toBe(200);
	});

	it("should not redirect /about", async () => {
		const response = await request(app).get("/about");
		expect(response.status).toBe(200);
	});
});
