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

// Serve static assets with gzip and brotli support
app.use(
	"/",
	expressStaticGzip(path.join(__dirname, "dist"), {
		enableBrotli: true,
		orderPreference: ["br", "gz"],
		setHeaders: (res, filePath) => {
			const fileName = path.basename(filePath);
			const versionedAssetPattern = /-[0-9a-zA-Z]{8}\.(js|css|woff2|webp|svg|png|jpg|jpeg|gif)$/i;
			if (versionedAssetPattern.test(fileName)) {
				res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
			} else if (
				fileName === "index.html" ||
				fileName.endsWith(".md") ||
				fileName === "robots.txt"
			) {
				res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			} else {
				res.setHeader("Cache-Control", "no-cache, must-revalidate");
			}
		},
	})
);

// Cache index.html in memory and reload if changed on disk
let cachedIndexHtml = null;
let cachedIndexHtmlMTimeMs = 0;
const indexPath = path.join(__dirname, "dist", "index.html");

function escapeHtmlAttr(str) {
	return str.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

app.get("/*splat", async (req, res) => {
	// Return 404 for requests with file extensions not served statically
	if (path.extname(req.path)) {
		res.status(404).sendFile(path.join(__dirname, "dist", "404.html"));
		return;
	}

	try {
		// Reload index.html if file changed
		const stat = await fs.promises.stat(indexPath);
		if (!cachedIndexHtml || stat.mtimeMs > cachedIndexHtmlMTimeMs) {
			cachedIndexHtml = await fs.promises.readFile(indexPath, "utf8");
			cachedIndexHtmlMTimeMs = stat.mtimeMs;
		}

		let indexHtml = cachedIndexHtml;

		// Use trusted req.protocol with fallback and normalization
		let protocol = req.protocol || "http";
		protocol = protocol.toLowerCase();
		if (protocol !== "http" && protocol !== "https") protocol = "http";

		const host = req.get("host");
		const fullUrl = new URL(req.originalUrl, `${protocol}://${host}`);

		// Remove non-canonical query params
		fullUrl.searchParams.delete("platform");
		fullUrl.searchParams.delete("ship");
		fullUrl.searchParams.delete("grid");

		const canonicalUrl = fullUrl.href;
		const escapedCanonicalUrl = escapeHtmlAttr(canonicalUrl);

		// Replace or insert canonical link tag (flexible regex)
		const canonicalLinkRegex = /<link[^>]*rel=["']canonical["'][^>]*>/i;
		const canonicalTag = `<link rel="canonical" href="${escapedCanonicalUrl}" />`;

		if (canonicalLinkRegex.test(indexHtml)) {
			indexHtml = indexHtml.replace(canonicalLinkRegex, canonicalTag);
		} else {
			indexHtml = indexHtml.replace(/<\/head>/i, `    ${canonicalTag}\n</head>`);
		}

		// Replace or insert og:url meta tag (flexible regex)
		const ogUrlRegex = /<meta[^>]*property=["']og:url["'][^>]*>/i;
		const ogUrlTag = `<meta property="og:url" content="${escapedCanonicalUrl}" />`;

		if (ogUrlRegex.test(indexHtml)) {
			indexHtml = indexHtml.replace(ogUrlRegex, ogUrlTag);
		} else {
			indexHtml = indexHtml.replace(/<\/head>/i, `    ${ogUrlTag}\n</head>`);
		}

		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.send(indexHtml);
	} catch (error) {
		console.error("Error modifying and serving index.html:", error);
		res.status(500).send("Internal Server Error");
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} (from server.js)`);
});
