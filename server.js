import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import expressStaticGzip from "express-static-gzip";

// Get the current directory from the module URL
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
const app = express();

// Redirect traffic from Heroku to your custom domain
app.use((req, res, next) => {
	const host = req.headers.host;
	const targetHost = "nms-optimizer.app";
	if (host && host !== targetHost) {
		return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
	}
	next();
});

// Serve static files from the dist directory with compression support
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

// Handle React/Vite history mode (SPA routing)
app.get("/*splat", async (req, res) => {
	// If path has an extension, but wasn't served by static middleware, it's a 404.
	if (path.extname(req.path)) {
		res.status(404).sendFile(path.join(__dirname, "dist", "404.html"));
	} else {
		try {
			const indexPath = path.join(__dirname, "dist", "index.html");
			let indexHtml = await fs.promises.readFile(indexPath, "utf8");

			// Determine the protocol from the x-forwarded-proto header (for Heroku)
			const protocol = req.headers["x-forwarded-proto"] || req.protocol;
			const host = req.get("host");
			const fullUrl = new URL(req.originalUrl, `${protocol}://${host}`);
			const canonicalParams = fullUrl.searchParams;

			// Remove parameters that should not affect the canonical URL
			canonicalParams.delete("platform");
			canonicalParams.delete("ship");
			canonicalParams.delete("grid");

			fullUrl.search = canonicalParams.toString();
			const canonicalUrl = fullUrl.href;

			// Inject canonical link tag right before the closing </head> tag
			const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
			indexHtml = indexHtml.replace(/<\/head>/i, `	${canonicalTag}\n</head>`);

			// Also update the og:url meta tag
			const ogUrlRegex = /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i;
			const ogUrlTag = `<meta property="og:url" content="${canonicalUrl}" />`;
			if (ogUrlRegex.test(indexHtml)) {
				indexHtml = indexHtml.replace(ogUrlRegex, ogUrlTag);
			} else {
				// If it doesn't exist for some reason, add it.
				indexHtml = indexHtml.replace(/<\/head>/i, `	${ogUrlTag}\n</head>`);
			}

			res.setHeader("Cache-control", "no-cache, no-store, must-revalidate");
			res.send(indexHtml);
		} catch (error) {
			console.error("Error modifying and serving index.html:", error);
			res.status(500).send("Internal Server Error");
		}
	}
});

// Use the PORT environment variable provided by Heroku or fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT} (from server.js)`);
});
