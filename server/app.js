/**
 * @file Express application definition for the NMS Optimizer.
 * @remarks This file configures the middleware pipeline, static asset serving, 
 * SSG (Static Site Generation) caching, and SPA fallback routing.
 * @author jbelew
 * @license GPL-3.0
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import expressStaticGzip from "express-static-gzip";

import {
	BASE_KNOWN_PATHS,
	KNOWN_DIALOGS,
	MAINTENANCE_MODE,
	SUPPORTED_LANGUAGES,
	TARGET_HOST,
} from "./config.js";

// ============================================================================
// CONSTANTS
// ============================================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Path to the directory containing production build assets.
 * @type {string}
 */
const DIST_DIR = path.join(__dirname, "../dist");

/**
 * Absolute path to the main `index.html` template.
 * @type {string}
 */
const INDEX_PATH = path.join(DIST_DIR, "index.html");

/**
 * Content Security Policy (CSP) string.
 * @remarks Defines trusted sources for scripts, styles, images, and connections.
 * @type {string}
 * @category Security
 */
const csp = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://static.cloudflareinsights.com https://browser.sentry-cdn.com https://*.sentry-cdn.com",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com",
	"font-src 'self' data:",
	"connect-src 'self' https://api.nms-optimizer.app https://*.google-analytics.com https://*.googletagmanager.com https://cloudflareinsights.com/cdn-cgi/rum https://*.ingest.us.sentry.io https://*.sentry.io https://*.google.com https://nms-optimizer-service-afebcfd47e2a.herokuapp.com wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com",
	"frame-src https://www.youtube.com https://*.googletagmanager.com",
	"worker-src 'self' blob:",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
].join("; ");

/**
 * The Express application instance.
 * @type {import('express').Application}
 */
const app = express();

// ============================================================================
// IN-MEMORY CACHE FOR SSG FILES & INDEX.HTML
// ============================================================================

/**
 * A set of paths to pre-rendered `index.html` files (Static Site Generation).
 * @remarks Cached at startup to avoid expensive filesystem `stat` calls on every request.
 * Contains relative paths from `DIST_DIR` (e.g., `"fr/about/index.html"`).
 * @type {Set<string>}
 * @category Cache
 */
const ssgFiles = new Set();

/**
 * Scans the `DIST_DIR` for pre-rendered `index.html` files and populates the `ssgFiles` cache.
 * @remarks 
 * - Only runs in production or if the cache is empty.
 * - Recursively walks the directory tree.
 * @returns {void} Side-effects only (populates `ssgFiles`).
 * @see {@link ssgFiles}
 * @category Cache
 */
export function scanSsgFiles() {
	if (!fs.existsSync(DIST_DIR)) return;

	const walk = (dir) => {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const fullPath = path.join(dir, file);
			if (fs.statSync(fullPath).isDirectory()) {
				walk(fullPath);
			} else if (file === "index.html") {
				const relativePath = path.relative(DIST_DIR, fullPath);
				ssgFiles.add(relativePath);
			}
		}
	};

	try {
		ssgFiles.clear();
		walk(DIST_DIR);
		console.log(`SSG cache populated with ${ssgFiles.size} files.`);
	} catch (error) {
		console.error("Failed to scan SSG files:", error);
	}
}

scanSsgFiles();

if (MAINTENANCE_MODE && process.env.NODE_ENV !== "test") {
	app.use((req, res, next) => {
		res.status(503).sendFile(path.join(__dirname, "../public", "maintenance.html"));
	});
}

// NOTE: Global compression is intentionally omitted here to offload Brotli/Gzip 
// compression to Cloudflare, reducing origin CPU usage and TTFB.

// ============================================================================
// IN-MEMORY CACHE FOR INDEX.HTML
// ============================================================================

/** @type {string|null} */
let cachedIndex = null;
/** @type {number} */
let cachedIndexMTime = 0;
/** @type {string|null} */
let cachedIndexETag = null;

/**
 * Loads `index.html` from the filesystem and caches it in memory.
 * @remarks 
 * - In production, assumes the file doesn't change after server start.
 * - In other environments, re-reads the file if the modified time (mtime) has changed.
 * - Generates an MD5-based ETag for the content.
 * @async
 * @returns {Promise<{content: string, etag: string}>} Object containing the HTML content and its ETag.
 * @throws {Error} If the file cannot be read and no cache exists.
 * @category Cache
 */
async function loadIndexHtml() {
	if (process.env.NODE_ENV === "production" && cachedIndex) {
		return { content: cachedIndex, etag: cachedIndexETag };
	}

	try {
		const stat = await fs.promises.stat(INDEX_PATH);
		if (!cachedIndex || stat.mtimeMs > cachedIndexMTime) {
			cachedIndex = await fs.promises.readFile(INDEX_PATH, "utf8");
			cachedIndexMTime = stat.mtimeMs;
			cachedIndexETag = `"${crypto.createHash("md5").update(cachedIndex).digest("hex")}"`;
		}
	} catch (error) {
		console.error("Critical: Failed to read index.html", error);
		if (!cachedIndex) throw error;
	}
	return { content: cachedIndex, etag: cachedIndexETag };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sets appropriate `Cache-Control` headers for static assets based on file type and naming conventions.
 * @remarks
 * - **Hashed Assets:** Get immutable caching for 1 year.
 * - **sw.js:** Explicitly disabled caching to ensure fast PWA updates.
 * - **index.html:** Short browser cache with long `s-maxage` for Cloudflare edge caching.
 * - **Static Assets:** 7-day browser cache for fonts, images, etc.
 * @param {import('express').Response} res - Express response object.
 * @param {string} filePath - Path to the file being served.
 * @category Middleware
 */
function setCacheHeaders(res, filePath) {
	let fileName = path.basename(filePath).replace(/\.(br|gz)$/, "");
	const hashedAsset = /-[0-9a-zA-Z_-]{8,}\.(js|css|woff2?|png|jpe?g|webp|svg)$/;

	if (fileName === "sw.js" || fileName === "version.json") {
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	} else if (fileName === "index.html") {
		// Never serve stale HTML — chunk hashes change on every deploy
		res.setHeader("Cache-Control", "public, no-cache, must-revalidate");
	} else if (fileName === "manifest.json" || fileName === "robots.txt" || fileName === "sitemap.xml") {
		res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
	} else if (hashedAsset.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
	} else if (/\.(woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|ico|mp3|mp4|webm)$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
	} else if (/\.md$/.test(fileName)) {
		res.setHeader("Cache-Control", "public, max-age=3600");
	} else if (filePath.includes("/assets/locales/")) {
		res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
	} else {
		res.setHeader("Cache-Control", "public, max-age=86400");
	}
}

/**
 * Checks if a pathname corresponds to a known client-side SPA route.
 * @remarks
 * Validates routes against `BASE_KNOWN_PATHS` and `KNOWN_DIALOGS`, 
 * accounting for language prefixes (e.g., `/fr/about`).
 * @param {string} pathname - URL pathname to validate.
 * @returns {boolean} `true` if the path is a known SPA route.
 * @see {@link BASE_KNOWN_PATHS}
 * @see {@link KNOWN_DIALOGS}
 * @category Routing
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

app.use((req, res, next) => {
	res.setHeader("Content-Security-Policy", csp);
	res.setHeader("Document-Policy", "js-profiling");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	next();
});

app.use((req, res, next) => {
	const lng = req.query.lng;
	if (lng) {
		const lang = Array.isArray(lng) ? String(lng[0]) : String(lng);
		const supportedLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : "en";

		const newURL = new URL(req.originalUrl, `https://${req.headers.host}`);
		newURL.searchParams.delete("lng");

		if (supportedLang !== "en") {
			newURL.pathname = `/${supportedLang}${newURL.pathname === "/" ? "" : newURL.pathname}`;
		}

		return res.redirect(301, newURL.href);
	}

	const pathParts = req.path.split("/").filter(Boolean);
	if (pathParts[0] === "en") {
		const cleanPath = `/${pathParts.slice(1).join("/")}`;
		const newURL = new URL(cleanPath, `https://${req.headers.host}`);
		const search = req.originalUrl.split("?")[1];
		if (search) {
			newURL.search = search;
		}
		return res.redirect(301, newURL.href);
	}
	next();
});

if (process.env.NODE_ENV === "production") {
	app.use((req, res, next) => {
		const host = req.headers.host?.toLowerCase();
		// Canonical Apex Host Enforcement
		if (host === `www.${TARGET_HOST.toLowerCase()}`) {
			return res.redirect(301, `https://${TARGET_HOST}${req.originalUrl}`);
		}
		next();
	});
}

app.use((req, res, next) => {
	const pathname = req.path;
	const isReservedErrorPath = pathname === "/404" || pathname === "/500";
	
	// Trailing Slash Enforcement (match Cloudflare Function)
	if (
		pathname !== "/" &&
		!pathname.endsWith("/") &&
		!pathname.includes(".") &&
		!isReservedErrorPath
	) {
		const query = req.url.slice(req.path.length);
		return res.redirect(301, pathname + "/" + query);
	}
	next();
});

// ============================================================================
// STATIC FILE MIDDLEWARE
// ============================================================================

app.use(
	"/",
	expressStaticGzip(DIST_DIR, {
		enableBrotli: true,
		orderPreference: ["br", "gz"],
		index: false,
		redirect: false,
		setHeaders: (res, filePath) => {
			setCacheHeaders(res, filePath);
		},
	})
);

// ============================================================================
// SPECIFIC ROUTES
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

app.get("/status/404", (req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

// ============================================================================
// SPA FALLBACK HANDLER
// ============================================================================

/**
 * SPA Fallback Handler.
 * @remarks
 * Handles all non-asset requests. If the path is a known SPA route:
 * 1. Checks for a corresponding pre-rendered SSG file.
 * 2. If no SSG file exists, uses `seoTagInjectionMiddleware` for dynamic tag injection.
 * @see {@link isSpaRoute}
 * @see {@link seoTagInjectionMiddleware}
 * @category Routing
 */
app.get(/^[^.]*$/, async (req, res, next) => {
	if (!isSpaRoute(req.path)) {
		return next();
	}

	const parts = req.path.split("/").filter((p) => p);
	let relativeSsgPath = null;

	if (parts.length === 0) {
		relativeSsgPath = "index.html";
	} else if (SUPPORTED_LANGUAGES.includes(parts[0])) {
		const langPage = parts.slice(1).join("/");
		relativeSsgPath = path.join(parts[0], langPage || "index.html");
		if (langPage) relativeSsgPath = path.join(relativeSsgPath, "index.html");
	} else {
		relativeSsgPath = path.join(parts.join("/"), "index.html");
	}

	if (ssgFiles.has(relativeSsgPath)) {
		const fullPath = path.join(DIST_DIR, relativeSsgPath);
		res.setHeader("Cache-Control", "public, max-age=0, s-maxage=31536000, stale-while-revalidate=60");
		res.setHeader("Document-Policy", "js-profiling");
		return res.sendFile(fullPath);
	}

	next();
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, "../public", "404.html"));
});

export default app;
