/**
 * @file Simple HTTP server for testing SSG output
 * Run: node scripts/serve-ssg.mjs
 * Serves the dist folder and properly routes to generated index.html files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const PORT = 8888;

const server = http.createServer((req, res) => {
	// Log request
	console.log(`${req.method} ${req.url}`);

	// Normalize and resolve path to prevent path traversal
	const pathname = req.url.split("?")[0];
	const resolvedPath = path.resolve(path.join(DIST_DIR, pathname));

	// Ensure the resolved path is within DIST_DIR
	if (!resolvedPath.startsWith(DIST_DIR)) {
		res.writeHead(403, { "Content-Type": "text/plain" });
		res.end("Forbidden");

		return;
	}

	let filePath = resolvedPath;

	// If it's a directory, try index.html
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		filePath = path.join(filePath, "index.html");
	}

	// If file doesn't exist, try with .html
	if (!fs.existsSync(filePath) && !pathname.endsWith(".html")) {
		const htmlPath = filePath + ".html";

		if (fs.existsSync(htmlPath)) {
			filePath = htmlPath;
		}
	}

	// If still doesn't exist, try directory/index.html
	if (!fs.existsSync(filePath)) {
		const dirPath = path.join(DIST_DIR, pathname, "index.html");

		if (fs.existsSync(dirPath)) {
			filePath = dirPath;
		}
	}

	// Serve the file
	if (fs.existsSync(filePath)) {
		const content = fs.readFileSync(filePath, "utf-8");
		const ext = path.extname(filePath);

		let contentType = "text/html";
		if (ext === ".js") contentType = "application/javascript";
		if (ext === ".css") contentType = "text/css";
		if (ext === ".json") contentType = "application/json";
		if (ext === ".svg") contentType = "image/svg+xml";
		if (ext === ".png") contentType = "image/png";
		if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
		if (ext === ".woff2") contentType = "font/woff2";
		if (ext === ".woff") contentType = "font/woff";

		res.writeHead(200, { "Content-Type": contentType });
		res.end(content);
	} else {
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.end("Not Found");
	}
});

server.listen(PORT, () => {
	console.log(`\n🚀 SSG Test Server running at http://localhost:${PORT}`);
	console.log(`\nTest these URLs:`);
	console.log(`  http://localhost:${PORT}/`);
	console.log(`  http://localhost:${PORT}/about`);
	console.log(`  http://localhost:${PORT}/es/about`);
	console.log(`  http://localhost:${PORT}/fr/instructions`);
	console.log(`\nPress Ctrl+C to stop`);
});
