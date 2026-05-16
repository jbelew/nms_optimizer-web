import fs from "node:fs";
import path from "node:path";
import babel from "@rolldown/plugin-babel";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { splashScreen } from "vite-plugin-splash-screen";

import type { PreRenderedAsset, PreRenderedChunk } from "rolldown";
import type { UserConfig } from "vite";

import packageJson from "./package.json";
import { markdownBundlePlugin } from "./scripts/vite-plugin-markdown-bundle.mjs";
import { purgeRadixCss } from "./scripts/vite-plugin-purge-radix-css.mjs";

/**
 * Vite 8 / Rolldown Configuration
 *
 * Major Architecture Decisions:
 * 1. Unified Bundler: Uses Rolldown (Rust-based) for both dev and prod, ensuring consistency.
 * 2. Native Transpilation: Oxc is used for JS/TS transforms and minification for peak performance.
 * 3. Declarative Chunking: Replaced imperative `manualChunks` with `codeSplitting.groups` for
 *    stable, efficient vendor splitting.
 * 4. Target Strategy: 'baseline-widely-available' ensures modern features with safe fallbacks
 *    for a public web application.
 * 5. CSS Optimization: LightningCSS handles transforms and minification, synced with .browserslistrc.
 */
export default defineConfig(async ({ command: _command, mode }): Promise<UserConfig> => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), "");

	// Load browserslist for LightningCSS targets to ensure CSS polyfilling matches JS support.
	const browserslistTargets = browserslist();

	// Use an environment variable for the app version, falling back to package.json
	let appVersion = process.env.VITE_APP_VERSION || env.VITE_APP_VERSION || packageJson.version;

	// Standardize: ensure the version always starts with 'v' to match tags and avoid analytics duplicates
	if (appVersion && !appVersion.startsWith("v")) {
		appVersion = `v${appVersion}`;
	}

	const buildDate = new Date().toISOString();

	const sentryEnabled = env.VITE_SENTRY_ENABLED === "true";
	const sentryDsn = process.env.VITE_SENTRY_DSN || env.VITE_SENTRY_DSN || "";
	const sentryEnv = process.env.VITE_SENTRY_ENV || env.VITE_SENTRY_ENV || "production";
	const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN || env.SENTRY_AUTH_TOKEN;

	// Fail build if Sentry token is missing in production to avoid "deploy and pray"
	if (mode === "production" && sentryEnabled && !sentryAuthToken && !process.env.CI) {
		console.warn("⚠️  SENTRY_AUTH_TOKEN is missing. Source maps will not be uploaded.");
	}

	const deferManifestPlugin = () => ({
		enforce: "post" as const,
		name: "defer-manifest",
		transformIndexHtml: {
			handler(html: string) {
				// Remove the automatically injected manifest link (handles various formats)
				const manifestRegex = /<link rel="manifest"[^>]*href="[^"]*manifest\.json"[^>]*>/;
				const hasManifest = manifestRegex.test(html);
				let newHtml = html.replace(manifestRegex, "");

				if (hasManifest) {
					// Inject it via script after load
					const script = `
		<script>
			window.addEventListener('load', function() {
				var link = document.createElement('link');
				link.rel = 'manifest';
				link.href = '/manifest.json';
				document.head.appendChild(link);
			});
		</script>`;
					newHtml = newHtml.replace("</head>", `${script}\n	</head>`);
				}

				return newHtml;
			},
			order: "post" as const,
		},
	});

	return {
		build: {
			chunkSizeWarningLimit: 600,
			cssCodeSplit: true,
			cssMinify: "lightningcss",
			manifest: "build-manifest.json",
			modulePreload: {
				resolveDependencies: (filename: string, deps: string[]) => {
					// Restore aggressive preloading for all critical-path dependencies.
					// We only exclude truly heavy, asynchronous chunks like charts and markdown.
					// We also exclude CSS files to prevent double-loading issues when Vite
					// injects them separately into the HTML.
					return deps.filter(
						(dep: string) =>
							!dep.endsWith(".css") &&
							!dep.includes("vendor-telemetry") &&
							!dep.includes("vendor-charts") &&
							!dep.includes("vendor-markdown") &&
							!dep.includes("vendor-markdown-lib") &&
							!dep.includes("vendor-html-to-image")
					);
				},
			},
			rolldownOptions: {
				output: {
					assetFileNames: (assetInfo: PreRenderedAsset) =>
						assetInfo.name?.endsWith(".css")
							? "build/[name]-[hash].css"
							: "build/[name]-[hash].[ext]",
					chunkFileNames: (chunkInfo: PreRenderedChunk) => {
						// Preserve manual chunk names starting with 'vendor-', or containing 'index'/'entry'
						// for better preloading/debugging. Use generic 'chunk-' for all others
						// to avoid triggering ad-blockers (e.g. 'analytics' in filename).
						if (
							chunkInfo.name &&
							(chunkInfo.name.startsWith("vendor-") ||
								chunkInfo.name.includes("index") ||
								chunkInfo.name.includes("entry"))
						) {
							return "build/[name]-[hash].js";
						}

						return "build/chunk-[hash].js";
					},
					// Declarative code splitting via groups is the native Rolldown/Vite 8 way
					// to manage manual chunks with high performance.
					codeSplitting: {
						groups: [
							{
								// Dedicated chunk for html-to-image to keep it out of the entry path.
								name: "vendor-html-to-image",
								priority: 105,
								test: /[\\/]node_modules[\\/]html-to-image[\\/]/,
							},
							{
								// Dedicated chunk for virtual markdown bundle to keep it out of the entry path.
								name: "vendor-markdown",
								priority: 120,
								test: /virtual:markdown-bundle/,
							},
							{
								// Markdown rendering libraries
								name: "vendor-markdown-lib",
								priority: 115,
								test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-raw|micromark|vfile|unified|unist|mdast|hast|decode-named-character-reference|character-entities|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|zwitch|html-void-elements)[\\/]/,
							},
							// Group all Sentry monitoring code into a chunk only if enabled.
							...(sentryEnabled
								? [
										{
											name: "vendor-monitoring",
											priority: 110,
											test: /[\\/]node_modules[\\/]@sentry[\\/]/,
										},
									]
								: []),
							{
								// Group GA4 and related tracking packages into a neutrally named chunk.
								// Anchored to node_modules so app-level analytics.ts / analyticsClient.ts
								// are NOT inadvertently captured here.
								// Name avoids 'analytics' or 'events' to reduce automatic blocking by privacy filters.
								name: "vendor-telemetry",
								priority: 100,
								test: /[\\/]node_modules[\\/](react-ga4|google-analytics|gtag\.js|web-vitals)[\\/]/,
							},
							{
								// Core framework runtime — MUST be highest priority.
								name: "vendor-core",
								priority: 130,
								test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-is|use-sync-external-store)[\\/]/,
							},
							{
								// Routing logic
								name: "vendor-router",
								priority: 92,
								test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run\/router)[\\/]/,
							},
							{
								// State management and core utilities
								name: "vendor-state",
								priority: 90,
								test: /[\\/]node_modules[\\/](zustand|immer|clsx|tailwind-merge|tiny-invariant)[\\/]/,
							},
							{
								name: "vendor-ui-themes",
								priority: 80,
								test: /[\\/]node_modules[\\/]@radix-ui\/themes[\\/]|[\\/]assets[\\/]css[\\/]radix-colors[\\/]/,
							},
							{
								name: "vendor-ui-utils",
								priority: 70,
								test: /[\\/]node_modules[\\/](@radix-ui\/|@floating-ui\/|aria-hidden|react-remove-scroll|focus-lock)/,
							},
							{
								name: "vendor-i18n",
								priority: 60,
								test: /[\\/]node_modules[\\/](i18next|react-i18next|@formatjs|intl-messageformat)/,
							},
							{
								// Stable name for charts to enable its exclusion from eager preloading via modulePreload.
								name: "vendor-charts",
								priority: 50,
								test: /[\\/]node_modules[\\/](recharts|d3-|d3$|victory-vendor|@reduxjs\/toolkit|react-redux)/,
							},
						],
						// Merge shared modules smaller than 12KB into their dependents to reduce
						// request overhead, while allowing larger shared pieces to remain split.
						minSize: 12000,
					},
					entryFileNames: "build/entry-[hash].js",
					minify: {
						compress: {
							dropConsole: true,
							dropDebugger: true,
						},
					},
				},
			},
			sourcemap: false,

			// 'baseline-widely-available' targeting (Chrome 111, Firefox 114, Safari 16.4)
			// ensures optimal performance for a public tool without excessive polyfilling.
			target: "baseline-widely-available",
		},

		css: {
			lightningcss: {
				targets: browserslistToTargets(browserslistTargets),
			},
			transformer: "lightningcss",
		},
		define: {
			__APP_VERSION__: JSON.stringify(appVersion),
			__BUILD_DATE__: JSON.stringify(buildDate),
			"import.meta.env.VITE_SENTRY_DSN": JSON.stringify(sentryDsn),
			"import.meta.env.VITE_SENTRY_ENABLED": JSON.stringify(env.VITE_SENTRY_ENABLED),
			"import.meta.env.VITE_SENTRY_ENV": JSON.stringify(sentryEnv),
		},
		optimizeDeps: {
			include: ["react", "react-dom", "react-ga4"],
		},
		oxc: {
			jsx: {
				importSource: "react",
				runtime: "automatic",
			},
		},
		plugins: [
			markdownBundlePlugin(),
			...(!process.env.STORYBOOK_BUILD
				? [
						{
							name: "generate-version-json",
							writeBundle() {
								const versionInfo = {
									buildDate: buildDate,
									version: appVersion,
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
				exclude: /node_modules/,
				include: /\.[jt]sx?$/,
				presets: [reactCompilerPreset()],
			}),
			tailwindcss(),
			// Sentry is positioned after transforms to ensure it captures all generated sourcemaps.
			...(!process.env.STORYBOOK_BUILD && sentryEnabled
				? [
						sentryVitePlugin({
							authToken: sentryAuthToken,
							org: process.env.SENTRY_ORG || env.SENTRY_ORG || "personal-4gm",
							project:
								process.env.SENTRY_PROJECT ||
								env.SENTRY_PROJECT ||
								"nms-optimizer-web",
							release: {
								name: appVersion,
							},
							telemetry: false,
						}),
					]
				: []),
			splashScreen({
				loaderBg: "#00A2C7",
				loaderType: "dots",
				logoSrc: "assets/svg/loader.svg",
				splashBg: "#000000",
			}),
			// Purge unused Radix Themes component CSS to reduce TBT from style recalculation.
			// Must run in production builds only (the plugin uses generateBundle hook).
			purgeRadixCss(),
			...(!process.env.STORYBOOK_BUILD
				? [
						visualizer({
							brotliSize: true,
							filename: "bundle/stats.html",
							gzipSize: true,
							open: false,
						}),
						visualizer({
							brotliSize: true,
							filename: "bundle/stats.json",
							gzipSize: true,
							open: false,
							template: "raw-data",
						}),
					]
				: []),
			...(!process.env.STORYBOOK_BUILD
				? [
						VitePWA({
							includeAssets: [
								"assets/svg/favicon.svg",
								"robots.txt",
								"assets/img/favicons/apple-touch-icon.png",
								"assets/fonts/*.woff2",
								"assets/locales/*/translation.json",
							],
							manifest: {
								background_color: "#274860",
								description:
									"Find the best No Man's Sky technology layouts for your Starship, Corvette, Multitool, Exosuit, and Exocraft. Optimize adjacency bonuses and supercharged slots for peak performance.",
								display: "standalone",
								file_handlers: [
									{
										accept: {
											"application/x-nms": [".nms"],
										},
										action: "/",
									},
								],
								icons: [
									{
										sizes: "192x192",
										src: "/assets/img/favicons/pwa-192x192.png",
										type: "image/png",
									},
									{
										sizes: "512x512",
										src: "/assets/img/favicons/pwa-512x512.png",
										type: "image/png",
									},
									{
										purpose: "maskable",
										sizes: "512x512",
										src: "/assets/img/favicons/pwa-maskable-512x512.png",
										type: "image/png",
									},
								],
								id: "/",
								name: "No Man's Sky Technology Layout Optimizer",
								orientation: "any",
								scope: "/",
								screenshots: [
									{
										form_factor: "wide",
										label: "Main application view showing the technology grid on desktop.",
										sizes: "1280x880",
										src: "/assets/img/screenshots/screenshot_desktop.png",
										type: "image/png",
									},
									{
										form_factor: "narrow",
										label: "Main application view on tablet.",
										sizes: "800x1280",
										src: "/assets/img/screenshots/screenshot_tablet.png",
										type: "image/png",
									},
									{
										form_factor: "narrow",
										label: "Main application view on mobile.",
										sizes: "375x600",
										src: "/assets/img/screenshots/screenshot_mobile.png",
										type: "image/png",
									},
								],
								short_name: "NMS Optimizer",
								start_url: "/",
								theme_color: "#003848",
							},
							manifestFilename: "manifest.json",
							registerType: "prompt",
							workbox: {
								cleanupOutdatedCaches: true,
								clientsClaim: false,
								dontCacheBustURLsMatching: /\/build\/.*\.(js|css|woff2?)$/,
								globIgnores: ["maintenance.html", "404.html", "500.html"],
								maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
								navigateFallback: undefined,
								navigationPreload: false,
								runtimeCaching: [
									{
										handler: "NetworkOnly",
										options: {
											fetchOptions: { cache: "reload" },
										},
										// TTFB optimization: match navigation requests immediately
										// with NetworkOnly so Workbox skips evaluating all other
										// rules. Combined with navigationPreload, the browser starts
										// the network fetch in parallel with SW boot, eliminating
										// the SW startup penalty from TTFB entirely.
										//
										// `cache: "reload"` forces the underlying fetch to bypass the
										// browser HTTP cache. Without this, a stale `/performance/` (or
										// any SPA-fallback shell) cached during a prior `no-cache`-only
										// header era can be served via 304 revalidation and ship users
										// HTML that references chunks that no longer exist.
										urlPattern: ({ request }) => request.mode === "navigate",
									},
									{
										handler: "NetworkOnly",
										urlPattern: /\/version\.json$/,
									},
									{
										handler: "CacheFirst",
										options: {
											cacheableResponse: {
												statuses: [0, 200],
											},
											cacheName: "images-cache",
											expiration: {
												maxAgeSeconds: 31536000,
												maxEntries: 1000,
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
										urlPattern: ({ request }) => request.destination === "image",
									},
									{
										handler: "CacheFirst",
										options: {
											cacheName: "fonts-cache",
											expiration: {
												maxAgeSeconds: 31536000,
												maxEntries: 30,
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
										urlPattern: ({ request }) => request.destination === "font",
									},
									{
										handler: "StaleWhileRevalidate",
										options: {
											cacheName: "translations-cache",
											expiration: {
												maxAgeSeconds: 86400,
												maxEntries: 20,
											},
										},
										urlPattern: /\/assets\/locales\/.*\/translation\.json$/,
									},
									{
										handler: "NetworkFirst",
										method: "GET",
										options: {
											cacheableResponse: {
												statuses: [0, 200],
											},
											cacheName: "api-cache",
											expiration: {
												maxAgeSeconds: 60 * 60 * 24, // 1 day
												maxEntries: 50,
											},
											networkTimeoutSeconds: 5,
										},
										urlPattern: /^https:\/\/api\.nms-optimizer\.app\/.*$/,
									},
									{
										handler: "NetworkOnly",
										method: "POST",
										options: {
											plugins: [
												{
													handlerDidError: async () =>
														new Response(null, {
															status: 204,
															statusText: "No Content",
														}),
												},
											],
										},
										urlPattern:
											/^https:\/\/api\.nms-optimizer\.app\/api\/events$/,
									},
									{
										handler: "NetworkFirst",
										options: {
											cacheName: "google-analytics-cache",
											expiration: {
												maxAgeSeconds: 86400,
												maxEntries: 50,
											},
											networkTimeoutSeconds: 3,
											plugins: [
												{
													handlerDidError: async () =>
														new Response(null, {
															status: 204,
															statusText: "No Content",
														}),
												},
											],
										},
										urlPattern: /^https:\/\/www\.googletagmanager\.com\//,
									},
									{
										handler: "NetworkOnly",
										options: {
											plugins: [
												{
													handlerDidError: async () =>
														new Response(null, {
															status: 204,
															statusText: "No Content",
														}),
												},
											],
										},
										urlPattern: /^https:\/\/www\.google-analytics\.com\//,
									},
								],
								skipWaiting: false,
							},
						}),
					]
				: []),
			deferManifestPlugin(),
		],
		preview: { host: "0.0.0.0", port: 4173 },
		resolve: {
			alias: {
				react: path.resolve(__dirname, "node_modules/react"),
				"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
				...(!sentryEnabled
					? {
							"@sentry/react": path.resolve(
								__dirname,
								"src/utils/system/sentryMock.ts"
							),
						}
					: {}),
			},
			dedupe: ["react", "react-dom"],
			tsconfigPaths: true,
		},
		server: {
			forwardConsole: true,
			headers: {
				"Document-Policy": "js-profiling",
			},

			host: true,
		},
	};
});
