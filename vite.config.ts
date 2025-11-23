import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import PluginCritical from "rollup-plugin-critical";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, Plugin } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { splashScreen } from "vite-plugin-splash-screen";

import deferStylesheetsPlugin from "./scripts/deferStylesheetsPlugin";
import inlineCriticalCssPlugin from "./scripts/vite-plugin-inline-critical-css";
import { markdownBundlePlugin } from "./scripts/vite-plugin-markdown-bundle.mjs";

export default defineConfig(({ mode }) => {
	const doCritical = mode === "critical" || mode === "production";
	// Use an environment variable for the app version, defaulting to 'unknown'
	const appVersion = process.env.VITE_APP_VERSION || "unknown";
	const buildDate = new Date().toISOString();

	return {
		define: {
			__APP_VERSION__: JSON.stringify(appVersion),
			__BUILD_DATE__: JSON.stringify(buildDate),
		},
		plugins: [
			markdownBundlePlugin(),
			{
				name: "generate-version-json",
				writeBundle() {
					const versionInfo = {
						version: appVersion,
						buildDate: buildDate,
					};
					fs.writeFileSync(
						path.resolve(__dirname, "dist/version.json"),
						JSON.stringify(versionInfo, null, 2)
					);
				},
			},
			react({
				babel: {
					plugins: [["babel-plugin-react-compiler"]],
				},
			}),
			tailwindcss(),
			splashScreen({
				logoSrc: "assets/svg/loader.svg",
				splashBg: "#000000",
				loaderBg: "#00A2C7",
				loaderType: "dots",
			}),
			...(doCritical
				? [
						deferStylesheetsPlugin(),
						// PluginCritical({
						// 	criticalBase: "dist/",
						// 	criticalUrl: "https://nms-optimizer.app",
						// 	criticalPages: [{ uri: "/", template: "index" }],
						// 	criticalConfig: {},
						// }),
					]
				: []),
			compression({
				algorithm: "brotliCompress",
				ext: ".br",
				threshold: 10240,
				deleteOriginFile: false,
			}),
			compression({
				algorithm: "gzip",
				ext: ".gz",
				threshold: 10240,
				deleteOriginFile: false,
			}),
			// ...(doCritical
			// 	? [inlineCriticalCssPlugin({ criticalCssFileName: "index_critical.min.css" })]
			// 	: []),
			visualizer({ open: false, gzipSize: true, brotliSize: true, filename: "stats.html" }),
			visualizer({
				open: false,
				gzipSize: true,
				brotliSize: true,
				filename: "stats.json",
				template: "raw-data",
			}),
			VitePWA({
				manifestFilename: "manifest.json", // ensure browsers don’t 404 on /manifest.json
				registerType: "prompt", // Use 'prompt' for user control over updates
				includeAssets: [
					"favicon.svg",
					"robots.txt",
					"/assets/img/favicons/apple-touch-icon.png",
					"assets/fonts/*.woff2",
					"assets/locales/*/translation.json",
				],
				workbox: {
					// User-controlled updates
					clientsClaim: false, // Set to false to allow onNeedRefresh to prompt
					skipWaiting: false, // Set to false to allow onNeedRefresh to prompt

					// Workbox quality-of-life features
					navigationPreload: false,
					cleanupOutdatedCaches: true, // Essential for cache hygiene

					// Don't serve app shell for unknown routes - let 404s return proper status for SEO
					navigateFallback: undefined,

					// Don't precache HTML - let the server handle it with proper cache headers
					dontCacheBustURLsMatching: /\.(js|css|woff2?)$/,

					// define caching strategies
					runtimeCaching: [
						// CRITICAL: version.json must NEVER be cached - always fetch from network
						{
							urlPattern: /\/version\.json$/,
							handler: "NetworkOnly",
						},
						{
							urlPattern: /^https:\/\/nms-optimizer\.app\/.*\.html$/,
							handler: "NetworkFirst",
							options: {
								cacheName: "html-cache",
								networkTimeoutSeconds: 3,
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 300, // 5 minutes
								},
								cacheableResponse: {
									statuses: [0, 200], // Only cache successful responses, not 404s
								},
							},
						},
						{
							urlPattern: ({ request }) => request.destination === "image",
							handler: "CacheFirst",
							options: {
								cacheName: "images-cache",
								expiration: {
									maxEntries: 1000,
									maxAgeSeconds: 31536000, // 1 year (matches server/app.js)
								},
								cacheableResponse: {
									statuses: [0, 200], // Only cache successful responses, not 503s
								},
								// Ignore query parameters in cache key to prevent duplicate caches
								plugins: [
									{
										// Ignore query parameters when matching cache entries
										cacheKeyWillBeUsed: async ({ request }) => {
											const url = new URL(request.url);
											url.search = ""; // Remove query string
											return new Request(url.toString(), {
												method: request.method,
											});
										},
									},
								],
							},
						},
						{
							urlPattern: ({ request }) => request.destination === "font",
							handler: "CacheFirst",
							options: {
								cacheName: "fonts-cache",
								expiration: {
									maxEntries: 30,
									maxAgeSeconds: 31536000, // 1 year
								},
								// Ignore query parameters in cache key
								plugins: [
									{
										cacheKeyWillBeUsed: async ({ request }) => {
											const url = new URL(request.url);
											url.search = "";
											return new Request(url.toString(), {
												method: request.method,
											});
										},
									},
								],
							},
						},
						{
							urlPattern: /\/assets\/locales\/.*\/translation\.json$/,
							handler: "NetworkFirst",
							options: {
								cacheName: "translations-cache",
								networkTimeoutSeconds: 3,
								expiration: {
									maxEntries: 20,
									maxAgeSeconds: 86400, // 1 day
								},
							},
						},
						{
							urlPattern: /^https:\/\/api\.nms-optimizer\.app\/.*$/,
							handler: "NetworkFirst",
							method: "GET",
							options: {
								cacheName: "api-cache",
								networkTimeoutSeconds: 5,
								expiration: {
									maxEntries: 50,
									maxAgeSeconds: 60 * 60 * 24, // 1 day
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
					],
				},
				manifest: {
					id: "/",
					name: "No Man's Sky Technology Layout Optimizer",
					short_name: "NMS Optimizer",
					description:
						"The NMS Optimizer helps you design the perfect Starship, Corvette, Multitool, Exocraft, or Exosuit layout in No Man's Sky. Use smart optimization tools to maximize adjacency bonuses, supercharged slots, and overall performance.",
					start_url: "/",
					scope: "/",
					display: "standalone",
					background_color: "#274860",
					theme_color: "#003848",
					orientation: "any",
					icons: [
						{
							src: "/assets/img/favicons/pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "/assets/img/favicons/pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
						},
						{
							src: "/assets/img/favicons/pwa-maskable-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
					screenshots: [
						{
							src: "/assets/img/screenshots/screenshot_desktop.png",
							sizes: "1280x880",
							type: "image/png",
							form_factor: "wide",
							label: "Main application view showing the technology grid on desktop.",
						},
						{
							src: "/assets/img/screenshots/screenshot_tablet.png",
							sizes: "800x1280",
							type: "image/png",
							form_factor: "narrow",
							label: "Main application view on tablet.",
						},
						{
							src: "/assets/img/screenshots/screenshot_mobile.png",
							sizes: "375x600",
							type: "image/png",
							form_factor: "narrow",
							label: "Main application view on mobile.",
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
				react: path.resolve(__dirname, "node_modules/react"),
				"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
			},
			dedupe: ["react", "react-dom"], // <- critical for singleton React
		},
		optimizeDeps: {
			include: ["react", "react-dom"],
			dedupe: ["react", "react-dom"], // <- dedupe pre-bundling
		},
		preview: { host: "0.0.0.0", port: 4173 },
		css: { transformer: "lightningcss" },
		build: {
			target: "esnext",
			minify: "terser",
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
				},
			},
			cssCodeSplit: true,
			sourcemap: false,
			cssMinify: "lightningcss",
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							// Chunk React and its dependencies
							if (/[\/]node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) {
								return "react";
							}

							// Radix Themes - Optimized colors from src/assets/css/radix-colors/
							// Colors are now split into their own chunk to enable lazy-loading
							if (id.includes("/assets/css/radix-colors/")) return "radix-colors";
							if (id.includes("@radix-ui/themes/utilities.css"))
								return "radix-utilities";
							if (id.includes("@radix-ui/themes")) return "radix-themes";

							// i18n
							if (
								id.includes("i18next") ||
								id.includes("react-i18next") ||
								id.includes("@formatjs") ||
								id.includes("intl-messageformat")
							)
								return "i18n";

							// Additional large libs - force separate chunks to avoid unused code
							if (id.includes("lodash")) return "lodash";
							if (id.includes("d3-")) return "d3";
							if (id.includes("recharts") || id.includes("decimal.js"))
								return "recharts";
							if (
								id.includes("react-markdown") ||
								id.includes("unified") ||
								id.includes("micromark") ||
								id.includes("remark")
							)
								return "markdown";

							// Radix UI components - split from other vendor code
							if (id.includes("@radix-ui")) return "radix";

							// Router
							if (id.includes("react-router")) return "router";

							// Web Vitals monitoring
							if (id.includes("web-vitals")) return "web-vitals";

							return "vendor";
						}
					},
					assetFileNames: (assetInfo) =>
						assetInfo.name?.endsWith(".css")
							? "assets/[name]-[hash].css"
							: "assets/[name]-[hash].[ext]",
				},
			},
		},
		test: {
			globals: true,
			environment: "happy-dom",
			setupFiles: ".vitest/setup.ts",
			root: ".",
			include: ["src/**/*.{test,spec}.{ts,tsx}", "server/**/*.{test,spec}.{js,ts}"],
		},
	};
});
