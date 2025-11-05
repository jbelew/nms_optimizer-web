import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { createServer } from "./app.js";

// Define a path for a temporary dist directory for testing
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_DIST_PATH = path.join(__dirname, "../dist");

describe("Express Server", () => {
	let server;
	let app;

	beforeAll(async () => {
		// Create mock dist directories for client and server
		const MOCK_CLIENT_DIST_PATH = path.join(MOCK_DIST_PATH, 'client');
		const MOCK_SERVER_DIST_PATH = path.join(MOCK_DIST_PATH, 'server');
		fs.mkdirSync(MOCK_CLIENT_DIST_PATH, { recursive: true });
		fs.mkdirSync(MOCK_SERVER_DIST_PATH, { recursive: true });

		// Create mock files for the server to use during tests
		fs.writeFileSync(
			path.join(MOCK_CLIENT_DIST_PATH, "index.html"),
			"<html><body><!--ssr-outlet--></body></html>"
		);
		// Mock server entry file
		fs.writeFileSync(
			path.join(MOCK_SERVER_DIST_PATH, "entry-server.js"),
			'export function render() { return "<h1>mocked render</h1>"; }'
		);
		fs.writeFileSync(
			path.join(MOCK_CLIENT_DIST_PATH, "sitemap.xml"),
			'<xml version="1.0" encoding="UTF-8"?><urlset></urlset>'
		);
		fs.writeFileSync(path.join(MOCK_CLIENT_DIST_PATH, "robots.txt"), "User-agent: *");

		app = await createServer(MOCK_DIST_PATH);
		await new Promise((resolve) => {
			server = app.listen(0, resolve);
		});
	});

	afterAll(async () => {
		// Clean up the mock dist directory after tests are complete
		fs.rmSync(MOCK_DIST_PATH, { recursive: true, force: true });
		await new Promise((resolve) => server.close(resolve));
	});

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

	it("should return 200 for a non-existent static asset", async () => {
		const response = await request(app).get("/assets/non-existent-file.js");
		expect(response.status).toBe(200);
	});

	it("should handle SPA fallback for non-asset paths", async () => {
		const response = await request(app)
			.get("/a/random/spa/path")
			.set("Accept", "text/html");
		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
	});

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
