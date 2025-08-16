import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import expressStaticGzip from "express-static-gzip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const app = express();

// Trust proxies like Cloudflare and Heroku for x-forwarded-* headers
app.set("trust proxy", true);

const targetHost = "nms-optimizer.app";

// Redirect non-target hosts to your domain (case-insensitive)
app.use((req, res, next) => {
	const host = req.headers.host?.toLowerCase();
	if (host && host !== targetHost.toLowerCase()) {
		return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
	}
	next();
});

// Cache index.html in memory and reload if changed on disk
let cachedIndexHtml = null;
let cachedIndexHtmlMTimeMs = 0;
const indexPath = path.join(__dirname, "dist", "index.html");

function escapeHtmlAttr(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

// Middleware to handle page requests and inject dynamic tags
app.use(async (req, res, next) => {
	// Pass asset requests (with file extensions) or non-GET requests to the next middleware
	if (path.extname(req.path) || req.method !== "GET") {
		return next();
	}

	// Handle page requests
	try {
		const stat = await fs.promises.stat(indexPath);
		if (!cachedIndexHtml || stat.mtimeMs > cachedIndexHtmlMTimeMs) {
			cachedIndexHtml = await fs.promises.readFile(indexPath, "utf8");
			cachedIndexHtmlMTimeMs = stat.mtimeMs;
		}

		let indexHtml = cachedIndexHtml;

		let protocol = req.protocol || "http";
		protocol = protocol.toLowerCase();
		if (protocol !== "http" && protocol !== "https") protocol = "http";

		const host = req.get("host");
		const fullUrl = new URL(req.originalUrl, `${protocol}://${host}`);

		fullUrl.searchParams.delete("platform");
		fullUrl.searchParams.delete("ship");
		fullUrl.searchParams.delete("grid");

		const canonicalUrl = fullUrl.href;
		const escapedCanonicalUrl = escapeHtmlAttr(canonicalUrl);

		const canonicalLinkRegex = /<link[^>]*rel=["']canonical["'][^>]*>/i;
		const canonicalTag = `<link rel="canonical" href="${escapedCanonicalUrl}" />`;

		if (canonicalLinkRegex.test(indexHtml)) {
			indexHtml = indexHtml.replace(canonicalLinkRegex, canonicalTag);
		} else {
			indexHtml = indexHtml.replace(/<\/head>/i, `    ${canonicalTag}\n</head>`);
		}

		const ogUrlRegex = /<meta[^>]*property=["']og:url["'][^>]*>/i;
		const ogUrlTag = `<meta property="og:url" content="${escapedCanonicalUrl}" />`;

		if (ogUrlRegex.test(indexHtml)) {
			indexHtml = indexHtml.replace(ogUrlRegex, ogUrlTag);
		} else {
			indexHtml = indexHtml.replace(/<\/head>/i, `    ${ogUrlTag}\n</head>`);
		}

		res.setHeader("Cache-Control", "no-cache, must-revalidate");
		res.send(indexHtml);
	} catch (error) {
		console.error("Error modifying and serving index.html:", error);
		res.status(500).send("Internal Server Error");
	}
});

// Serve static assets. This runs for requests passed on by the middleware above.
app.use(
	"/",
	expressStaticGzip(path.join(__dirname, "dist"), {
		enableBrotli: true,
		orderPreference: ["br", "gz"],
		setHeaders: (res, filePath) => {
			const fileName = path.basename(filePath);
			const versionedAssetPattern =
				/-[0-9a-zA-Z]{8}\.(js|css|woff2|webp|svg|png|jpg|jpeg|gif)$/i;
			if (versionedAssetPattern.test(fileName)) {
				res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
			} else if (
				fileName === "index.html" ||
				fileName.endsWith(".md") ||
				fileName === "robots.txt"
			) {
				res.setHeader("Cache-Control", "no-cache, must-revalidate");
			} else {
				res.setHeader("Cache-Control", "no-cache, must-revalidate");
			}
		},
	})
);

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} (from server.js)`);
});