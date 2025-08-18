import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import PluginCritical from "rollup-plugin-critical";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { splashScreen } from "vite-plugin-splash-screen";

import deferStylesheetsPlugin from "./scripts/deferStylesheetsPlugin";
import inlineCriticalCssPlugin from "./scripts/vite-plugin-inline-critical-css";

// Function to read version from package.json
function getAppVersion() {
	const packageJsonPath = path.resolve(__dirname, "package.json");
	try {
		const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(packageJsonContent);
		if (packageJson && packageJson.version) {
			return packageJson.version;
		} else {
			console.error("Version not found in package.json");
		}
	} catch (error) {
		console.error("Failed to read or parse package.json", error);
	}
	return "unknown"; // Fallback version
}

export default defineConfig(({ mode }) => {
	const doCritical = mode === "critical" || mode === "production";
	const appVersion = getAppVersion();

	return {
		define: {
			// Make app version available to JS code (e.g., AppHeader.tsx)
			__APP_VERSION__: JSON.stringify(appVersion),
		},
		plugins: [
			react(),
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
						PluginCritical({
							criticalBase: "dist/",
							criticalUrl: "https://nms-optimizer.app",
							criticalPages: [{ uri: "/", template: "index" }],
							criticalConfig: {},
						}),
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

			// Conditionally apply defer and critical plugins
			...(doCritical ? [inlineCriticalCssPlugin()] : []),

			visualizer({ open: false, gzipSize: true, brotliSize: true, filename: "stats.html" }),
			visualizer({
				open: false,
				gzipSize: true,
				brotliSize: true,
				filename: "stats.json",
				template: "raw-data",
			}),
		],

		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},

		server: {
			host: "0.0.0.0",
			port: 5173,
		},

		css: {
			transformer: "lightningcss",
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			cssCodeSplit: true,
			sourcemap: false,
			cssMinify: "lightningcss",
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (!id.includes("node_modules")) return;

						if (
							id.includes("react-markdown") ||
							id.includes("remark-") ||
							id.includes("rehype-") ||
							id.includes("micromark") ||
							id.includes("mdast-") ||
							id.includes("unist-") ||
							id.includes("vfile") ||
							id.includes("zwitch") ||
							id.includes("bail") ||
							id.includes("trough") ||
							                            id.includes("decode-named-character-reference") ||
							id.includes("parse-entities") ||
							id.includes("recharts") ||
							id.includes("decimal") ||
							id.includes("d3-")
						) {
							return; // Let Vite handle lazy-loading for these
						}

						if (id.includes("@radix-ui/themes/tokens/colors/")) {
							return "radix-colors";
						}
						// if (id.includes("@radix-ui/themes/components.css")) {
						// 	return "radix-components";
						// }
						if (id.includes("@radix-ui/themes/utilities.css")) {
							return "radix-utilities";
						}
						if (id.includes("@radix-ui/themes")) {
							return "radix-themes";
						}
						if (
							id.includes("i18next") ||
							id.includes("react-i18next") ||
							id.includes("@formatjs") ||
							id.includes("intl-messageformat")
						) {
							return "i18n";
						}
						if (id.includes("zustand") || id.includes("immer")) {
							return "zustand";
						}
						if (id.includes("ga4")) {
							return "ga4";
						}
						if (id.includes("radix")) {
							return "radix";
						}

						return "vendor";
					},
					assetFileNames: (assetInfo) => {
						if (assetInfo.name?.endsWith(".css")) {
							return "assets/[name]-[hash].css";
						}
						return "assets/[name]-[hash].[ext]";
					},
				},
			},
		},

		test: {
			globals: true,
			environment: "happy-dom",
			setupFiles: ".vitest/setup",
			root: ".",
			include: ["src/**/*.{test,spec}.{ts,tsx}"],
		},
	};
});
