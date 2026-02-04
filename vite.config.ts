import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, Plugin } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { splashScreen } from "vite-plugin-splash-screen";

import deferStylesheetsPlugin from "./scripts/deferStylesheetsPlugin";
import { markdownBundlePlugin } from "./scripts/vite-plugin-markdown-bundle.mjs";

export default defineConfig(({ mode }) => {
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
			...(!process.env.STORYBOOK_BUILD // Conditionally include the plugin
				? [
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
					]
				: []),
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
			deferStylesheetsPlugin(),
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
			visualizer({ open: false, gzipSize: true, brotliSize: true, filename: "stats.html" }),
			visualizer({
				open: false,
				gzipSize: true,
				brotliSize: true,
				filename: "stats.json",
				template: "raw-data",
			}),
			VitePWA({
				manifestFilename: "manifest.json", // ensure browsers don't 404 on /manifest.json
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
					maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
						{
							urlPattern: /^https:\/\/api\.nms-optimizer\.app\/api\/events$/,
							handler: "NetworkOnly",
							method: "POST",
						},
						{
							urlPattern: /^https:\/\/www\.googletagmanager\.com\//,
							handler: "NetworkFirst",
							options: {
								cacheName: "google-analytics-cache",
								networkTimeoutSeconds: 3,
								expiration: {
									maxEntries: 50,
									maxAgeSeconds: 86400, // 1 day
								},
							},
						},
						{
							urlPattern: /^https:\/\/www\.google-analytics\.com\//,
							handler: "NetworkOnly",
						},
						],
				},
				manifest: {
					id: "/",
					name: "No Man's Sky Technology Layout Optimizer",
					short_name: "NMS Optimizer",
					description:
						"Find the best No Man's Sky technology layouts for your Starship, Corvette, Multitool, Exosuit, and Exocraft. Optimize adjacency bonuses and supercharged slots for peak performance.",
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
			modulePreload: {
				// Filter function to control which chunks get modulepreload links
				// Exclude charts chunk to prevent eager loading of recharts
				resolveDependencies: (filename, deps, { hostId, hostType }) => {
					return deps.filter((dep) => !dep.includes("charts"));
				},
			},
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							// Chunk React and its dependencies
							if (/[\/]node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) {
								return "react";
							}

							// Common Utilities to avoid circularity with manual chunks
							// Handle these BEFORE specific rules like charts
							if (
								id.includes("clsx") ||
								id.includes("tailwind-merge") ||
								id.includes("react-is") ||
								id.includes("immer") ||
								id.includes("tiny-invariant") ||
								id.includes("use-sync-external-store")
							) {
								return "react";
							}

							// Radix UI Components & Themes
							if (
								id.includes("@radix-ui/") ||
								id.includes("/assets/css/radix-colors/") ||
								id.includes("@floating-ui/") ||
								id.includes("aria-hidden") ||
								id.includes("react-remove-scroll") ||
								id.includes("focus-lock")
							) {
								return "radix";
							}

							// i18n
							if (
								id.includes("i18next") ||
								id.includes("react-i18next") ||
								id.includes("@formatjs") ||
								id.includes("intl-messageformat")
							)
								return "i18n";

							// Split Zustand and other state management
							if (id.includes("zustand") || id.includes("immer")) {
								return "state";
							}

							// Charts & Data Visualization
							if (id.includes("recharts") || id.includes("decimal.js") || id.includes("d3-"))
								return "charts";

							// Markdown Processing (grouped to prevent circular dependencies)
							if (
								id.includes("react-markdown") ||
								id.includes("unified") ||
								id.includes("micromark") ||
								id.includes("remark") ||
								id.includes("rehype") ||
								id.includes("vfile") ||
								id.includes("unist-") ||
								id.includes("property-information") ||
								id.includes("hast-") ||
								id.includes("mdast-") ||
								id.includes("ccount") ||
								id.includes("decode-named-character-reference") ||
								id.includes("space-separated-tokens") ||
								id.includes("comma-separated-tokens") ||
								id.includes("markdown-table") ||
								id.includes("is-") ||
								id.includes("character-entities")
							)
								return "markdown";

							// Router
							if (id.includes("react-router")) return "router";

							// Web Vitals & Analytics
							if (id.includes("web-vitals") || id.includes("react-ga4")) return "events";
						}
					},
					assetFileNames: (assetInfo) =>
						assetInfo.name?.endsWith(".css")
							? "assets/[name]-[hash].css"
							: "assets/[name]-[hash].[ext]",
				},
			},
		},
	};
});
