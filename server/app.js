/**
 * @file Defines the Express application for the NMS Optimizer web application.
 * This file configures all middleware, routes, and handlers, then exports the app for use by the server entrypoint or tests.
 * @author jbelew
 * @license GPL-3.0
 */

// Node.js built-in modules
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Third-party libraries
import express from "express";
import expressStaticGzip from "express-static-gzip";

// Local modules
import { seoTagInjectionMiddleware } from "./seoMiddleware.js";
import {
	BASE_KNOWN_PATHS,
	KNOWN_DIALOGS,
	OTHER_LANGUAGES,
	SUPPORTED_LANGUAGES,
	TARGET_HOST,
} from "./config.js";

// ============================================================================
// CONSTANTS
// ============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

const csp = [
	"default-src 'self'",
	"script-src 'self' www.googletagmanager.com static.cloudflareinsights.com 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: www.google-analytics.com",
	"font-src 'self'",
	"connect-src 'self' https://nms-optimizer-service-afebcfd47e2a.herokuapp.com wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com https://*.google-analytics.com https://*.googletagmanager.com https://api.nms-optimizer.app cloudflareinsights.com",
	"frame-src https://www.youtube.com",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
].join("; ");

const app = express();

// ============================================================================
// IN-MEMORY CACHE FOR INDEX.HTML
// ============================================================================

let cachedIndex = null;
let cachedIndexMTime = 0;
let cachedIndexETag = null;

/**
 * Loads index.html from the filesystem and caches it in memory.
 * If the file has been modified, re-reads and updates the cache.
 * @async
 * @returns {Promise<string>} The content of index.html.
 */
async function loadIndexHtml() {
	const stat = await fs.promises.stat(INDEX_PATH);
	if (!cachedIndex || stat.mtimeMs > cachedIndexMTime) {
		cachedIndex = await fs.promises.readFile(INDEX_PATH, "utf8");
		cachedIndexMTime = stat.mtimeMs;
		cachedIndexETag = `"${crypto.createHash("md5").update(cachedIndex).digest("hex")}"`;
	}
	return cachedIndex;
}

/**
 * Gets the ETag for index.html.
 * @async
 * @returns {Promise<string>} The ETag value.
 */
async function getIndexHtmlETag() {
	await loadIndexHtml();
	return cachedIndexETag;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sets appropriate Cache-Control headers for static assets based on file type and name.
 * Hashed assets get long-lived caching, others vary by type.
 * @param {import('express').Response} res - Express response object.
 * @param {string} filePath - Path to the file being served.
 */
function setCacheHeaders(res, filePath) {
	let fileName = path.basename(filePath).replace(/\.(br|gz)$/, '');
	const hashedAsset = /-[0-9a-zA-Z_-]+\.(js|css|woff2?|png|jpe?g|webp|svg)$/;

	if (fileName === 'sw.js') {
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	} else if (hashedAsset.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
	} else if (/\.(woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
		// Non-hashed static assets get a 7-day browser cache.
		// Cloudflare's edge cache can be longer, as it's purged on deploy.
		res.setHeader("Cache-Control", "public, max-age=604800");
	} else if (/\.md$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=3600");
	} else {
		res.setHeader("Cache-Control", "public, max-age=86400");
	}
}

/**
 * Checks if a pathname corresponds to a known client-side SPA route.
 * Handles base paths and language-prefixed paths.
 * @param {string} pathname - URL pathname to check.
 * @returns {boolean} True if pathname is a known SPA route.
 */
function isSpaRoute(pathname) {
	const parts = pathname.split("/").filter((p) => p);

	if (parts.length === 0) {
		return BASE_KNOWN_PATHS.includes("/");
	}

	if (SUPPORTED_LANGUAGES.includes(parts[0])) {
		const page = parts[1];
		return !page || KNOWN_DIALOGS.includes(page);
	}

	return KNOWN_DIALOGS.includes(parts[0]);
}

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

app.set("trust proxy", true);

// Security headers
app.use((req, res, next) => {
	res.setHeader("Content-Security-Policy", csp);
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	next();
});

// Canonical host redirect (production only)
if (process.env.NODE_ENV === "production") {
	app.use((req, res, next) => {
		const host = req.headers.host?.toLowerCase();
		if (host && host !== TARGET_HOST.toLowerCase()) {
			return res.redirect(301, `https://${TARGET_HOST}${req.originalUrl}`);
		}
		next();
	});
}

// Trailing slash redirect
app.use((req, res, next) => {
	if (req.path.length > 1 && req.path.endsWith("/")) {
		const query = req.url.slice(req.path.length);
		return res.redirect(301, req.path.slice(0, -1) + query);
	}
	next();
});

// ETag generation for static files
app.use((req, res, next) => {
	const originalSendFile = res.sendFile;
	res.sendFile = function(filePath, ...args) {
		fs.stat(filePath, (err, stats) => {
			if (!err) {
				const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
				res.setHeader("ETag", etag);
				
				if (req.headers["if-none-match"] === etag) {
					res.status(304).end();
					return;
				}
			}
			originalSendFile.call(res, filePath, ...args);
		});
	};
	next();
});

// ============================================================================
// SPECIFIC ROUTES (before wildcard and static middleware)
// ============================================================================

app.get("/sitemap.xml", (req, res) => {
	res.type("application/xml");
	res.setHeader("Cache-Control", "public, max-age=86400");
	res.sendFile(path.join(DIST_DIR, "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.setHeader("Cache-Control", "public, max-age=86400");
	res.sendFile(path.join(DIST_DIR, "robots.txt"));
});

/**
 * Service worker route with explicit ETag handling and strong cache-busting.
 * Service workers must never be cached to ensure updates reach users immediately.
 */
app.get("/sw.js", async (req, res) => {
	const swPath = path.join(DIST_DIR, "sw.js");
	try {
		const stat = await fs.promises.stat(swPath);
		const etag = `"${stat.mtime.getTime()}-${stat.size}"`;
		res.setHeader("ETag", etag);
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
		res.setHeader("Content-Type", "application/javascript");
		
		if (req.headers["if-none-match"] === etag) {
			res.status(304).end();
			return;
		}
		
		res.sendFile(swPath);
	} catch (error) {
		res.status(404).send("Service worker not found");
	}
});

app.get("/status/404", (req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

// ============================================================================
// SPA FALLBACK HANDLER
// ============================================================================

/**
 * Handles SPA routes with SSG files, SEO tag injection, and proper caching.
 * Runs before the static file middleware to intercept known SPA routes.
 */
app.get(/^[^.]*$/, async (req, res, next) => {
	if (!isSpaRoute(req.path)) {
		return next();
	}

	// HTML revalidation strategy
	res.setHeader("Cache-Control", "no-cache, public");
	res.setHeader("Pragma", "no-cache");
	
	const etag = await getIndexHtmlETag();
	res.setHeader("ETag", etag);
	
	if (req.headers["if-none-match"] === etag) {
		res.status(304).end();
		return;
	}

	// Try to serve pregenerated SSG file first
	const parts = req.path.split("/").filter((p) => p);
	let ssgPath = null;

	if (parts.length === 0) {
		ssgPath = path.join(DIST_DIR, "index.html");
	} else if (SUPPORTED_LANGUAGES.includes(parts[0])) {
		const langPage = parts.slice(1).join("/");
		ssgPath = path.join(DIST_DIR, parts[0], langPage || "index.html");
		if (langPage) ssgPath = path.join(ssgPath, "index.html");
	} else {
		ssgPath = path.join(DIST_DIR, parts.join("/"), "index.html");
	}

	try {
		const stats = await fs.promises.stat(ssgPath);
		if (stats.isFile()) {
			res.setHeader("Cache-Control", "public, max-age=300");
			return res.sendFile(ssgPath);
		}
	} catch (err) {
		// SSG file doesn't exist, fall back to dynamic rendering
	}

	try {
		await seoTagInjectionMiddleware(req, res, loadIndexHtml, csp);
	} catch (error) {
		next(error);
	}
});

// ============================================================================
// STATIC FILE MIDDLEWARE
// ============================================================================

// Strip query parameters from static asset requests before express-static-gzip processes them
// This prevents issues where browsers/service workers add query params to asset requests
app.use((req, res, next) => {
	const assetPattern = /^\/assets\//;
	if (assetPattern.test(req.path) && req.query && Object.keys(req.query).length > 0) {
		// Reconstruct URL without query parameters for assets
		return res.redirect(301, req.path);
	}
	next();
});

app.use("/", expressStaticGzip(DIST_DIR, {
	enableBrotli: true,
	orderPreference: ["br", "gz"],
	index: false,
	setHeaders: (res, filePath) => {
		setCacheHeaders(res, filePath);
	},
}));

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

export default app;
