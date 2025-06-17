import express from "express";
import expressStaticGzip from "express-static-gzip";
import { fileURLToPath } from "url";
import path from "path";

// Get the current directory from the module URL
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Redirect traffic from Heroku to your custom domain
app.use((req, res, next) => {
	const host = req.headers.host;
	const targetHost = "nms-optimizer.app";

	// Only redirect if on the Heroku domain
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
      const path = require("path"); // Ensure path module is available
      const fileName = path.basename(filePath);

      // Regex to check for typical Vite hash pattern (e.g., index-a1b2c3d4.js)
      const versionedAssetPattern = /-[0-9a-zA-Z]{8}\.(js|css|woff2|webp|svg|png|jpg|jpeg|gif)$/i;

      if (versionedAssetPattern.test(fileName)) {
        // For versioned assets (JS, CSS, fonts, images with hashes)
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (fileName === "index.html") {
        // For index.html, no-cache to ensure freshness for SPA routing fallbacks.
        res.setHeader("Cache-Control", "no-cache");
      } else {
        // For other static assets in "dist" that might not be versioned
        // (e.g., images copied directly from public, favicons, manifest.json)
        // A shorter cache time, e.g., 1 day. Adjust as needed.
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    },
	})
);

// Handle React/Vite history mode (SPA routing)
app.get("/*splat", async (req, res) => {
	res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Use the PORT environment variable provided by Heroku or fallback to 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
