import type { PluginOption } from "vite";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { promisify } from "node:util";

const gzip = promisify(zlib.gzip);
const brotliCompress = promisify(zlib.brotliCompress);

interface Options {
	/**
	 * Path to the critical CSS file, relative to outDir.
	 * @default 'index_critical.min.css'
	 */
	criticalCssFileName?: string;
	/**
	 * Path to the HTML file, relative to outDir.
	 * @default 'index.html'
	 */
	htmlFileName?: string;
}

export default function inlineCriticalCssPlugin(options?: Options): PluginOption {
	const {
		criticalCssFileName = "index_critical.min.css",
		htmlFileName = "index.html",
	} = options || {};

	let viteConfig: any; // To store resolved Vite config

	return {
		name: "vite-plugin-inline-critical-css",
		apply: "build", // Apply only during build

		configResolved(resolvedConfig) {
			// Store the resolved config
			viteConfig = resolvedConfig;
		},

		async closeBundle() {
			if (viteConfig.command !== "build") {
				return;
			}

			const outDir = viteConfig.build.outDir || "dist";
			const indexPath = path.resolve(outDir, htmlFileName);
			const criticalCssPath = path.resolve(outDir, criticalCssFileName);

			const pluginName = "vite-plugin-inline-critical-css";
			try {
				console.log(`[${pluginName}] Starting critical CSS inlining...`);
				console.log(`[${pluginName}] Output directory: ${outDir}`);
				console.log(`[${pluginName}] HTML file path: ${indexPath}`);
				console.log(`[${pluginName}] Critical CSS file path: ${criticalCssPath}`);

				let htmlContent = await fs.readFile(indexPath, "utf-8");
				const criticalCSS = await fs.readFile(criticalCssPath, "utf-8");

				if (!criticalCSS) {
					console.warn(`[${pluginName}] Critical CSS file not found or empty at ${criticalCssPath}. Skipping inlining.`);
					return;
				}

				// Inline critical CSS -
				// Basic replacement: insert before the first <link rel="stylesheet">
				// or at the end of <head> if no stylesheet links are found.
				const linkTagMatch = /<link[^>]+rel=["']stylesheet["'][^>]*>/i;
				const headEndMatch = /<\/head>/i;
				const styleBlock = `<style>${criticalCSS}</style>`;

				if (linkTagMatch.test(htmlContent)) {
					htmlContent = htmlContent.replace(linkTagMatch, `${styleBlock}\n$&`);
					console.log(`[${pluginName}] Inlined critical CSS before the first stylesheet link.`);
				} else if (headEndMatch.test(htmlContent)) {
					htmlContent = htmlContent.replace(headEndMatch, `${styleBlock}\n$&`);
					console.log(`[${pluginName}] Inlined critical CSS at the end of the <head> tag.`);
				} else {
					console.warn(`[${pluginName}] Could not find a suitable place to inline critical CSS (no <link rel="stylesheet"> or </head>).`);
					return;
				}

				await fs.writeFile(indexPath, htmlContent, "utf-8");
				console.log(`[${pluginName}] Successfully inlined critical CSS into ${indexPath}`);

				// Re-compress the modified HTML file
				const htmlBuffer = Buffer.from(htmlContent, "utf-8");

				// Gzip
				try {
					const gzipOutput = await gzip(htmlBuffer);
					await fs.writeFile(`${indexPath}.gz`, gzipOutput);
					console.log(`[${pluginName}] Successfully re-compressed ${indexPath}.gz`);
				} catch (err) {
					console.error(`[${pluginName}] Error re-compressing ${indexPath}.gz:`, err);
				}

				// Brotli
				// Check if zlib.brotliCompress is available (Node.js v11.7.0+)
				if (typeof zlib.brotliCompress === "function") {
					try {
						const brotliOutput = await brotliCompress(htmlBuffer);
						await fs.writeFile(`${indexPath}.br`, brotliOutput);
						console.log(`[${pluginName}] Successfully re-compressed ${indexPath}.br`);
					} catch (err) {
						console.error(`[${pluginName}] Error re-compressing ${indexPath}.br:`, err);
					}
				} else {
					console.warn(`[${pluginName}] zlib.brotliCompress not available. Skipping .br re-compression. Node.js v11.7.0+ is required.`);
				}

			} catch (error) {
				console.error(`[${pluginName}] Error during critical CSS inlining:`, error);
			}
		},
	};
}
