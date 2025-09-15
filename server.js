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
const KNOWN_ROUTES = ["/", "/instructions", "/about", "/changelog", "/translation", "/userstats"];
app.get(/.*/, async (req, res, next) => {
	if (/\.[^/]+$/.test(req.path)) return next(); // static asset, skip

	try {
		const indexHtml = await loadIndexHtml();
		let modifiedHtml = indexHtml;

		// --- SEO Tags Injection ---
		const baseUrl = `${req.protocol}://${req.headers.host}`;
		const tagsToInject = [];
		const requestUrl = new URL(req.originalUrl, baseUrl);

		// 1. Canonical URL Logic
		let canonicalUrl;
		if (KNOWN_ROUTES.includes(req.path)) {
			const url = new URL(requestUrl.href);
			url.searchParams.delete("platform");
			url.searchParams.delete("ship");
			url.searchParams.delete("grid");

			// If no language is specified on a known route, set 'en' as default for the canonical URL.
			if (!url.searchParams.has("lng")) {
				url.searchParams.set("lng", "en");
			}
			canonicalUrl = url.href;
		} else {
			canonicalUrl = new URL("/", baseUrl).href;
		}
		tagsToInject.push(`<link rel="canonical" href="${canonicalUrl}" />`);
		tagsToInject.push(`<meta property="og:url" content="${canonicalUrl}" />`);

		// 2. Hreflang Tags Logic
		const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de"];
		if (KNOWN_ROUTES.includes(req.path)) {
			const pathForHreflang = req.path;

			// Create a clean search string for hreflang, preserving only non-SEO, non-language params.
			const hreflangSearchParams = new URLSearchParams(requestUrl.search);
			hreflangSearchParams.delete("platform");
			hreflangSearchParams.delete("ship");
			hreflangSearchParams.delete("grid");
			hreflangSearchParams.delete("lng");
			const searchForHreflang = hreflangSearchParams.toString() ? `?${hreflangSearchParams.toString()}` : "";

			SUPPORTED_LANGUAGES.forEach(lang => {
				const url = new URL(pathForHreflang + searchForHreflang, baseUrl);
				url.searchParams.set("lng", lang);
				tagsToInject.push(`<link rel="alternate" hreflang="${lang}" href="${url.href}" />`);
			});

			const defaultUrl = new URL(pathForHreflang + searchForHreflang, baseUrl);
			defaultUrl.searchParams.set("lng", "en"); // Assuming 'en' is the default
			tagsToInject.push(`<link rel="alternate" hreflang="x-default" href="${defaultUrl.href}" />`);
		}

		// Inject all tags before the closing </head> tag
		modifiedHtml = modifiedHtml.replace("</head>", `  ${tagsToInject.join("\n  ")}\n</head>`);

		const indexEtag = etag(modifiedHtml);

		res.setHeader("ETag", indexEtag);
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

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