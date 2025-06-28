// scripts/inline-critical.js
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "../dist");
const htmlPath = path.join(distDir, "index.html");
const criticalCSSPath = path.join(distDir, "index_critical.min.css");

const htmlContent = fs.readFileSync(htmlPath, "utf-8");
const criticalCSS = fs.readFileSync(criticalCSSPath, "utf-8");

function inlineCritical() {
	if (!criticalCSS) {
		console.error("❌ Critical CSS file not found or empty.");
		process.exit(1);
	}

	// Insert <style> block with critical CSS before the first <link rel="stylesheet"> tag
	const inlinedHtml = htmlContent.replace(
		/(<link[^>]+rel=["']stylesheet["'][^>]*>)/i,
		`<style>${criticalCSS}</style>\n$1`
	);

	fs.writeFileSync(htmlPath, inlinedHtml);
	console.log("✅ Critical CSS inlined before stylesheet links");
}

inlineCritical();
