/**
 * @file Defines the Express application for the NMS Optimizer web application.
 * This file configures all middleware, routes, and handlers, then exports the app for use by the server entrypoint or tests.
 * @author jbelew
 * @license GPL-3.0
 */

// Node.js built-in modules
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

// --- CONSTANTS ---

/**
 * The directory name of the current module.
 * @type {string}
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The absolute path to the 'dist' directory, where built assets are stored.
 * @type {string}
 */
const DIST_DIR = path.join(__dirname, "../dist"); // Adjusted for new file location

/**
 * The main Express application instance.
 * @type {import('express').Express}
 */
const app = express();

/**
 * The absolute path to the main index.html file.
 * @type {string}
 */
const INDEX_PATH = path.join(DIST_DIR, "index.html");

/**
 * The Content Security Policy (CSP) string.
 * @type {string}
 */
const csp = [
	"default-src 'self'",
	"script-src 'self' www.googletagmanager.com static.cloudflareinsights.com 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: www.google-analytics.com",
	"font-src 'self'",
	"connect-src 'self' https://nms-optimizer-service-afebcfd47e2a.herokuapp.com wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com https://*.google-analytics.com https://*.googletagmanager.com https://api.nms-optimizer.app",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
].join("; ");

// --- IN-MEMORY CACHE FOR INDEX.HTML ---

/**
 * In-memory cache for the index.html content.
 * @type {string | null}
 */
let cachedIndex = null;

/**
 * The modification time of the cached index.html file.
 * @type {number}
 */
let cachedIndexMTime = 0;

/**
 * Loads index.html from the filesystem and caches it in memory.
 * If the file has been modified since the last read, it re-reads and updates the cache.
 * @async
 * @returns {Promise<string>} The content of index.html.
 */
async function loadIndexHtml() {
	const stat = await fs.promises.stat(INDEX_PATH);
	if (!cachedIndex || stat.mtimeMs > cachedIndexMTime) {
		cachedIndex = await fs.promises.readFile(INDEX_PATH, "utf8");
		cachedIndexMTime = stat.mtimeMs;
	}
	return cachedIndex;
}

// --- HELPER FUNCTIONS ---

/**
 * Sets appropriate Cache-Control headers for static assets based on their file type and name.
 * Hashed assets are given an immutable cache header, while others have shorter durations.
 * @param {import('express').Response} res - The Express response object.
 * @param {string} filePath - The path to the file being served.
 */
function setCacheHeaders(res, filePath) {
	let fileName = path.basename(filePath);
	// Strip compression extensions (.br, .gz) before checking hash
	fileName = fileName.replace(/\.(br|gz)$/, '');
	const hashedAsset = /-[0-9a-zA-Z_-]+\.(js|css|woff2?|png|jpe?g|webp|svg)$/; // Vite hashed files

	if (fileName === 'sw.js') { // Explicitly set no-cache for the service worker file
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
	} else if (hashedAsset.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
	} else if (/\.(woff2?|ttf|otf|eot)$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
	} else if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=604800"); // 1 week
	} else if (/\.md$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
	} else {
		res.setHeader("Cache-control", "public, max-age=86400"); // 1 day
	}
}

/**
 * Checks if a given pathname corresponds to a known client-side SPA route.
 * This function considers base paths and language-prefixed paths.
 * @param {string} pathname - The URL pathname to check.
 * @returns {boolean} True if the pathname is a known SPA route, false otherwise.
 */
function isSpaRoute(pathname) {
	const parts = pathname.split("/").filter((p) => p);

	// Root path (e.g., '/')
	if (parts.length === 0) {
		return BASE_KNOWN_PATHS.includes("/");
	}

	// Language-prefixed paths (e.g., '/es/about', '/de')
	if (SUPPORTED_LANGUAGES.includes(parts[0])) {
		const page = parts[1];
		if (!page) {
			return true; // Language root (e.g., /es)
		}
		return KNOWN_DIALOGS.includes(page);
	}

	// Non-language-prefixed paths (e.g., '/about')
	const page = parts[0];
	return KNOWN_DIALOGS.includes(page);
}

// --- MIDDLEWARE & ROUTING ---

// Trust proxies like Heroku or Cloudflare to get the correct client IP.
app.set("trust proxy", true);

/**
 * Global security headers middleware
 */
app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	next();
});

/**
 * Middleware to redirect requests from non-canonical hosts to the target host in production.
 * Ensures all traffic goes to a single domain for SEO purposes.
 */
if (process.env.NODE_ENV === "production") {
	app.use((req, res, next) => {
		const host = req.headers.host?.toLowerCase();
		if (host && host !== TARGET_HOST.toLowerCase()) {
			return res.redirect(301, `https://${TARGET_HOST}${req.originalUrl}`);
		}
		next();
	});
}

/**
 * Middleware to redirect requests with trailing slashes to the non-slashed version.
 * e.g., /about/ -> /about. This is important for SEO.
 */
app.use((req, res, next) => {
	if (req.path.length > 1 && req.path.endsWith("/")) {
		const query = req.url.slice(req.path.length);
		return res.redirect(301, req.path.slice(0, -1) + query);
	}
	next();
});

/**
 * Route handler for serving the sitemap.xml file.
 */
app.get("/sitemap.xml", (req, res) => {
	res.type("application/xml");
	res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
	res.sendFile(path.join(DIST_DIR, "sitemap.xml"));
});

/**
 * Route handler for serving the robots.txt file.
 */
app.get("/robots.txt", (req, res) => {
	res.setHeader("Content-Type", "text/plain");
	res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
	res.sendFile(path.join(DIST_DIR, "robots.txt"));
});

/**
 * Middleware for serving pre-compressed static assets (Brotli/Gzip) from the 'dist' directory.
 */
app.use(
	"/",
	expressStaticGzip(DIST_DIR, {
		enableBrotli: true,
		orderPreference: ["br", "gz"],
		index: false, // SPA fallback is handled manually
		setHeaders: (res, filePath) => {
			setCacheHeaders(res, filePath);
		},
	})
);

app.get("/status/404", (req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

/**
 * The main SPA fallback handler.
 * It determines if a request is for a page navigation or a static asset.
 * If it's a navigation request, it serves the main index.html file with SEO tags injected.
 * Otherwise, it passes the request to the next middleware (the 404 handler).
 */
// This regex matches all paths that do not contain a dot, which is a common
// way to distinguish between SPA routes and static file requests.
app.get(/^[^.]*$/, async (req, res, next) => {
	if (isSpaRoute(req.path)) {
		// Ensure index.html is never cached by the browser or intermediaries
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		try {
			await seoTagInjectionMiddleware(req, res, loadIndexHtml, csp);
		} catch (error) {
			next(error);
		}
	} else {
		// If it's not a known SPA route, let it fall through to the 404 handler
		next();
	}
});

/**
 * Final fallback middleware to handle 404 errors for any requests that haven't been handled yet.
 * Serves a custom 404 page.
 */
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html")); // Adjusted for new file location
});

// --- EXPORT APP ---
/**
 * The configured Express app, exported for testing and for the server entry point.
 */
export default app;
