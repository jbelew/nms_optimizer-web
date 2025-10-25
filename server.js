import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import etag from "etag";
import express from "express";
import expressStaticGzip from "express-static-gzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", true); // Trust Heroku/Cloudflare proxies

// Redirect non-canonical hosts
const TARGET_HOST = "nms-optimizer.app";
app.use((req, res, next) => {
	const host = req.headers.host?.toLowerCase();
	if (host && host !== TARGET_HOST.toLowerCase()) {
		return res.redirect(301, `https://${TARGET_HOST}${req.originalUrl}`);
	}
	next();
});

const DIST_DIR = path.join(__dirname, "dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

// Cache index.html in memory
let cachedIndex = null;
let cachedIndexMTime = 0;

async function loadIndexHtml() {
	const stat = await fs.promises.stat(INDEX_PATH);
	if (!cachedIndex || stat.mtimeMs > cachedIndexMTime) {
		cachedIndex = await fs.promises.readFile(INDEX_PATH, "utf8");
		cachedIndexMTime = stat.mtimeMs;
	}
	return cachedIndex;
}

// SPA fallback for non-asset GET requests
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt"];
const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];
const KNOWN_DIALOGS = ["instructions", "about", "changelog", "translation", "userstats"];

const csp = [
  "default-src 'self'",
  "script-src 'self' www.googletagmanager.com static.cloudflareinsights.com 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: www.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://nms-optimizer-service-afebcfd47e2a.herokuapp.com wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com https://*.google-analytics.com https://*.googletagmanager.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'"
].join('; ');

app.get(/.*/, async (req, res, next) => {
	if (/\.[^/]+$/.test(req.path)) return next(); // static asset, skip

	try {
		const indexHtml = await loadIndexHtml();
		let modifiedHtml = indexHtml;

		// --- SEO Tags Injection ---
		const baseUrl = `https://${req.headers.host}`;
		const tagsToInject = [];

		const pathParts = req.path.split("/").filter(Boolean);
		const langFromPath = pathParts[0];

		const lang = OTHER_LANGUAGES.includes(langFromPath) ? langFromPath : "en";
		const pagePathParts = OTHER_LANGUAGES.includes(langFromPath) ? pathParts.slice(1) : pathParts;
		const pagePath = pagePathParts.join("/");
		let basePath = `/${pagePath}`;
		if (basePath === "/") basePath = ""; // Avoid double slashes for root

		const isKnownDialog = KNOWN_DIALOGS.includes(pagePath);
		const isRoot = pagePath === "";

		// 1. Canonical URL Logic
		const cleanPathname = lang === "en" ? basePath || "/" : `/${lang}${basePath}`;
		const canonicalUrlBuilder = new URL(cleanPathname, baseUrl);
		const canonicalUrl = canonicalUrlBuilder.href;
		tagsToInject.push(`<link rel="canonical" href="${canonicalUrl}" />`);
		tagsToInject.push(`<meta property="og:url" content="${canonicalUrl}" />`);

		// 2. Hreflang Tags Logic
		if (isKnownDialog || isRoot) {
			const hreflangUrlBuilder = new URL(canonicalUrl);

			// English (and x-default)
			hreflangUrlBuilder.pathname = basePath || "/";
			tagsToInject.push(`<link rel="alternate" hreflang="en" href="${hreflangUrlBuilder.href}" />`);
			tagsToInject.push(
				`<link rel="alternate" hreflang="x-default" href="${hreflangUrlBuilder.href}" />`
			);

			// Other languages
			OTHER_LANGUAGES.forEach((langCode) => {
				hreflangUrlBuilder.pathname = `/${langCode}${basePath}`;
				tagsToInject.push(
					`<link rel="alternate" hreflang="${langCode}" href="${hreflangUrlBuilder.href}" />`
				);
			});
		}

		// Inject all tags before the closing </head> tag
		modifiedHtml = modifiedHtml.replace("</head>", `  ${tagsToInject.join("\n  ")}\n</head>`);

		const indexEtag = etag(modifiedHtml);

		res.setHeader("Content-Security-Policy-Report-Only", csp);
		res.setHeader("ETag", indexEtag);
		res.setHeader("Cache-Control", "no-cache");

		if (req.headers["if-none-match"] === indexEtag) {
			return res.status(304).end();
		}

		res.type("html").send(modifiedHtml);
	} catch (err) {
		console.error("Error serving index.html:", err);
		res.status(500).send("Internal Server Error");
	}
});

// Serve static assets
app.use(
	"/",
	expressStaticGzip(DIST_DIR, {
		enableBrotli: true,
		orderPreference: ["br", "gz"],
		index: false, // handled by SPA middleware
		setHeaders: (res, filePath) => {
			const fileName = path.basename(filePath);
			const hashedAsset = /-[0-9a-zA-Z_]{8}\./; // Vite hashed files

			if (hashedAsset.test(fileName)) {
				res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
			} else if (/\.(woff2?|ttf|otf|eot)$/.test(fileName)) {
				res.setHeader("Cache-Control", "public, max-age=604800"); // 1 week
			} else if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
				res.setHeader("Cache-Control", "public, max-age=604800"); // 1 week
			} else {
				res.setHeader("Cache-control", "public, max-age=86400");
			}
		},
	})
);

// Optional 404 fallback for missing assets
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
