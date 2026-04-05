import fs from "fs";
import path from "path";
import babel from "@rolldown/plugin-babel";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { splashScreen } from "vite-plugin-splash-screen";

import packageJson from "./package.json";
import deferStylesheetsPlugin from "./scripts/deferStylesheetsPlugin";
import { markdownBundlePlugin } from "./scripts/vite-plugin-markdown-bundle.mjs";

export default defineConfig(async ({ mode, command }): Promise<import("vite").UserConfig> => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), "");

	// Cloudflare Pages sets CF_PAGES=1 during builds. Skip pre-compression since
	// Cloudflare handles brotli/gzip natively, and pre-compressed .br/.gz files
	// alongside assets can cause MIME type errors.
	const isCloudflarePages = process.env.CF_PAGES === "1";

	// Use an environment variable for the app version, falling back to package.json
	const appVersion = process.env.VITE_APP_VERSION || env.VITE_APP_VERSION || packageJson.version;
	const buildDate = new Date().toISOString();

	const sentryDsn = process.env.VITE_SENTRY_DSN || env.VITE_SENTRY_DSN || "";
	const sentryEnv = process.env.VITE_SENTRY_ENV || env.VITE_SENTRY_ENV || "production";
	const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN || env.SENTRY_AUTH_TOKEN;

	// Fail build if Sentry token is missing in production to avoid "deploy and pray"
	if (mode === "production" && !sentryAuthToken && !process.env.CI) {
		console.warn("⚠️  SENTRY_AUTH_TOKEN is missing. Source maps will not be uploaded.");
	}

	return {
		define: {
			__APP_VERSION__: JSON.stringify(appVersion),
			__BUILD_DATE__: JSON.stringify(buildDate),
			"import.meta.env.VITE_SENTRY_DSN": JSON.stringify(sentryDsn),
			"import.meta.env.VITE_SENTRY_ENV": JSON.stringify(sentryEnv),
			__VUE_OPTIONS_API__: false,
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
		},
		devtools: {
			enabled: command === "serve",
		},

		oxc: {
			jsx: {
				runtime: "automatic",
				importSource: "react",
			},
		},
		plugins: [
			// DevTools only loaded during `vite dev` (command === 'serve'), never during builds
			...(command === "serve" ? await (async () => { try { const { DevTools } = await import("@vitejs/devtools"); return await DevTools(); } catch { return []; } })() : []),
			sentryVitePlugin({
				org: process.env.SENTRY_ORG || env.SENTRY_ORG || "personal-4gm",
				project: process.env.SENTRY_PROJECT || env.SENTRY_PROJECT || "nms-optimizer-web",
				authToken: sentryAuthToken,
				telemetry: false,
				release: {
					name: appVersion,
				},
			}),
			markdownBundlePlugin(),
			...(!process.env.STORYBOOK_BUILD
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
			react(),
			// React Compiler support via Babel (Rolldown native plugin)
			babel({
				presets: [reactCompilerPreset()],
				include: /\.[jt]sx?$/,
				exclude: /node_modules/,
			}),
			tailwindcss(),
			splashScreen({
				logoSrc: "assets/svg/loader.svg",
				splashBg: "#000000",
				loaderBg: "#00A2C7",
				loaderType: "dots",
			}),
			deferStylesheetsPlugin(),
			...(!isCloudflarePages
				? [
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
				  ]
				: []),
			visualizer({ open: false, gzipSize: true, brotliSize: true, filename: "stats.html" }),
			visualizer({
				open: false,
				gzipSize: true,
				brotliSize: true,
				filename: "stats.json",
				template: "raw-data",
			}),
			VitePWA({
				manifestFilename: "manifest.json",
				registerType: "prompt",
				includeAssets: [
					"favicon.svg",
					"robots.txt",
					"/assets/img/favicons/apple-touch-icon.png",
					"assets/fonts/*.woff2",
					"assets/locales/*/translation.json",
				],
				workbox: {
					clientsClaim: false,
					skipWaiting: false,
					navigationPreload: false,
					cleanupOutdatedCaches: true,
					maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
					navigateFallback: undefined,
					dontCacheBustURLsMatching: /\.(js|css|woff2?)$/,
					runtimeCaching: [
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
									maxAgeSeconds: 300,
								},
								cacheableResponse: {
									statuses: [0, 200],
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
									maxAgeSeconds: 31536000,
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
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
							urlPattern: ({ request }) => request.destination === "font",
							handler: "CacheFirst",
							options: {
								cacheName: "fonts-cache",
								expiration: {
									maxEntries: 30,
									maxAgeSeconds: 31536000,
								},
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
							handler: "StaleWhileRevalidate",
							options: {
								cacheName: "translations-cache",
								expiration: {
									maxEntries: 20,
									maxAgeSeconds: 86400,
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
									maxAgeSeconds: 86400,
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
			tsconfigPaths: true,
			alias: {
				react: path.resolve(__dirname, "node_modules/react"),
				"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
			},
			dedupe: ["react", "react-dom"],
		},
		optimizeDeps: {
			include: ["react", "react-dom", "react-ga4"],
		},
		server: {
			host: true,
			forwardConsole: true,

			headers: {
				"Document-Policy": "js-profiling",
			},
		},
		preview: { host: "0.0.0.0", port: 4173 },
		css: { transformer: "lightningcss" },
		build: {
			target: "esnext",
			chunkSizeWarningLimit: 600,
			cssCodeSplit: true,
			sourcemap: true,
			cssMinify: "lightningcss",
			modulePreload: {
				resolveDependencies: (filename: string, deps: string[]) => {
					// Filter out non-critical vendor chunks to prevent eager preloading.
					// We leave naturally split chunks alone so Vite can parallelize dynamic route waterfalls.
					return deps.filter(
						(dep: string) =>
							!dep.includes("vendor-charts") &&
							!dep.includes("vendor-ui-utils")
					);
				},
			},

			rolldownOptions: {
				output: {
					minify: {
						compress: {
							dropConsole: true,
							dropDebugger: true,
						},
					},
					chunkFileNames: (chunkInfo: import("rolldown").PreRenderedChunk) => {
						// Preserve manual chunk names starting with 'vendor-' for better preloading/filtering,
						// use generic 'chunk-' prefix for all other naturally split modules.
						if (chunkInfo.name && chunkInfo.name.startsWith("vendor-")) {
							return "assets/[name]-[hash].js";
						}
						return "assets/chunk-[hash].js";
					},
					entryFileNames: "assets/entry-[hash].js",
					manualChunks(id: string) {
						// Avoid ad-blocker triggers by grouping potentially blocked terms into neutrally-named chunks.
						const blockedTerms = [
							"analytics",
							"sentry",
							"telemetry",
							"beacon",
							"google-analytics",
							"gtag",
							"ad-block",
						];

						if (blockedTerms.some((term) => id.toLowerCase().includes(term))) {
							return "vendor-events";
						}

						if (id.includes("node_modules")) {
							// CORE VENDOR: React, Router, and essential state management
							if (
								/[\/]node_modules[\/](react|react-dom|scheduler|react-router|zustand|immer)[\/]/.test(
									id
								) ||
								id.includes("react-is") ||
								id.includes("use-sync-external-store") ||
								id.includes("clsx") ||
								id.includes("tailwind-merge") ||
								id.includes("tiny-invariant")
							) {
								return "vendor-core";
							}

							// NOTE: Recharts and its dependencies (d3, victory-vendor,
							// @reduxjs/toolkit, react-redux) are NOT assigned to a manual
							// chunk. They are code-split automatically via the React.lazy()
							// boundary in UserStatsRoute.tsx, which keeps the ~290 KB
							// recharts bundle out of the initial page load.

							// UI VENDOR: Radix Themes
							if (
								id.includes("@radix-ui/themes") ||
								id.includes("/assets/css/radix-colors/")
							) {
								return "vendor-ui-themes";
							}

							// UI UTILS: Floating UI and Radix primitives
							if (
								id.includes("@radix-ui/") ||
								id.includes("@floating-ui/") ||
								id.includes("aria-hidden") ||
								id.includes("react-remove-scroll") ||
								id.includes("focus-lock")
							) {
								return "vendor-ui-utils";
							}

							// i18n VENDOR
							if (
								id.includes("i18next") ||
								id.includes("react-i18next") ||
								id.includes("@formatjs") ||
								id.includes("intl-messageformat")
							) {
								return "vendor-i18n";
							}
						}
					},
					assetFileNames: (assetInfo: import("rolldown").PreRenderedAsset) =>
						assetInfo.name?.endsWith(".css")
							? "assets/[name]-[hash].css"
							: "assets/[name]-[hash].[ext]",
				},
			},
		},
	};
});
