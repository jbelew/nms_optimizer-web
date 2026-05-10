import fs from "fs";
import path from "path";
import babel from "@rolldown/plugin-babel";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";
import { splashScreen } from "vite-plugin-splash-screen";

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
export default defineConfig(async ({ mode, command }): Promise<import("vite").UserConfig> => {
	// Load env file based on `mode` in the current working directory.
	const env = loadEnv(mode, process.cwd(), "");

	// Load browserslist for LightningCSS targets to ensure CSS polyfilling matches JS support.
	const browserslistTargets = browserslist();

	// Cloudflare Pages sets CF_PAGES=1 during builds. Skip pre-compression since
	// Cloudflare handles brotli/gzip natively, and pre-compressed .br/.gz files
	// alongside assets can cause MIME type errors.
	const isCloudflarePages = process.env.CF_PAGES === "1";

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
		name: "defer-manifest",
		enforce: "post" as const,
		transformIndexHtml: {
			order: "post" as const,
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
		},
	});

	return {
		define: {
			__APP_VERSION__: JSON.stringify(appVersion),
			__BUILD_DATE__: JSON.stringify(buildDate),
			"import.meta.env.VITE_SENTRY_DSN": JSON.stringify(sentryDsn),
			"import.meta.env.VITE_SENTRY_ENV": JSON.stringify(sentryEnv),
			"import.meta.env.VITE_SENTRY_ENABLED": JSON.stringify(env.VITE_SENTRY_ENABLED),
			__VUE_OPTIONS_API__: false,
			__VUE_PROD_DEVTOOLS__: false,
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
		},

		oxc: {
			jsx: {
				runtime: "automatic",
				importSource: "react",
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
			// Sentry is positioned after transforms to ensure it captures all generated sourcemaps.
			...(!process.env.STORYBOOK_BUILD && sentryEnabled
				? [
						sentryVitePlugin({
							org: process.env.SENTRY_ORG || env.SENTRY_ORG || "personal-4gm",
							project:
								process.env.SENTRY_PROJECT ||
								env.SENTRY_PROJECT ||
								"nms-optimizer-web",
							authToken: sentryAuthToken,
							telemetry: false,
							release: {
								name: appVersion,
							},
						}),
					]
				: []),
			splashScreen({
				logoSrc: "assets/svg/loader.svg",
				splashBg: "#000000",
				loaderBg: "#00A2C7",
				loaderType: "dots",
			}),
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
			// Purge unused Radix Themes component CSS to reduce TBT from style recalculation.
			// Must run in production builds only (the plugin uses generateBundle hook).
			purgeRadixCss(),
			...(!process.env.STORYBOOK_BUILD
				? [
						visualizer({
							open: false,
							gzipSize: true,
							brotliSize: true,
							filename: "bundle/stats.html",
						}),
						visualizer({
							open: false,
							gzipSize: true,
							brotliSize: true,
							filename: "bundle/stats.json",
							template: "raw-data",
						}),
					]
				: []),
			...(!process.env.STORYBOOK_BUILD
				? [
						VitePWA({
							manifestFilename: "manifest.json",
							registerType: "prompt",
							includeAssets: [
								"assets/svg/favicon.svg",
								"robots.txt",
								"assets/img/favicons/apple-touch-icon.png",
								"assets/fonts/*.woff2",
								"assets/locales/*/translation.json",
							],
							workbox: {
								globIgnores: ["maintenance.html", "404.html", "500.html"],
								clientsClaim: false,
								skipWaiting: false,
								navigationPreload: false,
								cleanupOutdatedCaches: true,
								maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
								navigateFallback: undefined,
								dontCacheBustURLsMatching: /\/build\/.*\.(js|css|woff2?)$/,
								runtimeCaching: [
									{
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
										handler: "NetworkOnly",
										options: {
											fetchOptions: { cache: "reload" },
										},
									},
									{
										urlPattern: /\/version\.json$/,
										handler: "NetworkOnly",
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
										urlPattern:
											/^https:\/\/api\.nms-optimizer\.app\/api\/events$/,
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
									},
									{
										urlPattern: /^https:\/\/www\.google-analytics\.com\//,
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
								file_handlers: [
									{
										action: "/",
										accept: {
											"application/x-nms": [".nms"],
										},
									},
								],
							},
						}),
					]
				: []),
			deferManifestPlugin(),
		],
		resolve: {
			tsconfigPaths: true,
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
		css: {
			transformer: "lightningcss",
			lightningcss: {
				targets: browserslistToTargets(browserslistTargets),
			},
		},
		build: {
			// 'baseline-widely-available' targeting (Chrome 111, Firefox 114, Safari 16.4)
			// ensures optimal performance for a public tool without excessive polyfilling.
			target: "baseline-widely-available",
			manifest: "build-manifest.json",
			chunkSizeWarningLimit: 600,
			cssCodeSplit: true,
			sourcemap: false,
			cssMinify: "lightningcss",
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
					minify: {
						compress: {
							dropConsole: true,
							dropDebugger: true,
						},
					},
					chunkFileNames: (chunkInfo: import("rolldown").PreRenderedChunk) => {
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
					entryFileNames: "build/entry-[hash].js",
					// Declarative code splitting via groups is the native Rolldown/Vite 8 way
					// to manage manual chunks with high performance.
					codeSplitting: {
						// Merge shared modules smaller than 12KB into their dependents to reduce
						// request overhead, while allowing larger shared pieces to remain split.
						minSize: 12000,
						groups: [
							{
								// Dedicated chunk for html-to-image to keep it out of the entry path.
								name: "vendor-html-to-image",
								test: /[\\/]node_modules[\\/]html-to-image[\\/]/,
								priority: 105,
							},
							{
								// Dedicated chunk for virtual markdown bundle to keep it out of the entry path.
								name: "vendor-markdown",
								test: /virtual:markdown-bundle/,
								priority: 120,
							},
							{
								// Markdown rendering libraries
								name: "vendor-markdown-lib",
								test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-raw|micromark|vfile|unified|unist|mdast|hast|decode-named-character-reference|character-entities|property-information|space-separated-tokens|comma-separated-tokens|web-namespaces|zwitch|html-void-elements)[\\/]/,
								priority: 115,
							},
							// Group all Sentry monitoring code into a chunk only if enabled.
							...(sentryEnabled
								? [
										{
											name: "vendor-monitoring",
											test: /[\\/]node_modules[\\/]@sentry[\\/]/,
											priority: 110,
										},
									]
								: []),
							{
								// Group GA4 and related tracking packages into a neutrally named chunk.
								// Anchored to node_modules so app-level analytics.ts / analyticsClient.ts
								// are NOT inadvertently captured here.
								// Name avoids 'analytics' or 'events' to reduce automatic blocking by privacy filters.
								name: "vendor-telemetry",
								test: /[\\/]node_modules[\\/](react-ga4|google-analytics|gtag\.js|web-vitals)[\\/]/,
								priority: 100,
							},
							{
								// Core framework runtime — MUST be highest priority.
								name: "vendor-core",
								test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-is|use-sync-external-store)[\\/]/,
								priority: 130,
							},
							{
								// Routing logic
								name: "vendor-router",
								test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run\/router)[\\/]/,
								priority: 92,
							},
							{
								// State management and core utilities
								name: "vendor-state",
								test: /[\\/]node_modules[\\/](zustand|immer|clsx|tailwind-merge|tiny-invariant)[\\/]/,
								priority: 90,
							},
							{
								name: "vendor-ui-themes",
								test: /[\\/]node_modules[\\/]@radix-ui\/themes[\\/]|[\\/]assets[\\/]css[\\/]radix-colors[\\/]/,
								priority: 80,
							},
							{
								name: "vendor-ui-utils",
								test: /[\\/]node_modules[\\/](@radix-ui\/|@floating-ui\/|aria-hidden|react-remove-scroll|focus-lock)/,
								priority: 70,
							},
							{
								name: "vendor-i18n",
								test: /[\\/]node_modules[\\/](i18next|react-i18next|@formatjs|intl-messageformat)/,
								priority: 60,
							},
							{
								// Stable name for charts to enable its exclusion from eager preloading via modulePreload.
								name: "vendor-charts",
								test: /[\\/]node_modules[\\/](recharts|d3-|d3$|victory-vendor|@reduxjs\/toolkit|react-redux)/,
								priority: 50,
							},
						],
					},
					assetFileNames: (assetInfo: import("rolldown").PreRenderedAsset) =>
						assetInfo.name?.endsWith(".css")
							? "build/[name]-[hash].css"
							: "build/[name]-[hash].[ext]",
				},
			},
		},
	};
});
