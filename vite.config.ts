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

export default defineConfig(({ mode }) => {
	const doCritical = mode === "critical" || mode === "production";
	// Use an environment variable for the app version, defaulting to 'unknown'
	const appVersion = process.env.VITE_APP_VERSION || "unknown";

	return {
		define: {
			__APP_VERSION__: JSON.stringify(appVersion),
		},
		plugins: [
			react({
				// Enable React Compiler
				babel: {
					plugins: [
						[
							"babel-plugin-react-compiler",
						],
					],
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
			...(doCritical
				? [inlineCriticalCssPlugin({ criticalCssFileName: "index_critical.min.css" })]
				: []),
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
				react: path.resolve(__dirname, "node_modules/react"),
				"react-dom": path.resolve(__dirname, "node_modules/react-dom"),
			},
			dedupe: ["react", "react-dom"], // <- critical for singleton React
		},
		optimizeDeps: {
			include: ["react", "react-dom"],
			dedupe: ["react", "react-dom"], // <- dedupe pre-bundling
		},
		server: { host: "0.0.0.0", port: 5173 },
		css: { transformer: "lightningcss" },
		build: {
			target: "esnext",
			minify: "terser",
			cssCodeSplit: true,
			sourcemap: false,
			cssMinify: "lightningcss",
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							// Chunk React and its dependencies
							if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
								return "react";
							}

							// Markdown ecosystem
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
								id.includes("parse-entities")
							)
								return "markdown";

							// Radix Themes (tokens/utilities)
							if (id.includes("@radix-ui/themes/tokens/colors/"))
								return "radix-colors";
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

							// Additional large libs
							if (id.includes("lodash")) return "lodash";
							if (id.includes("d3-")) return "d3";
							if (id.includes("recharts")) return "recharts";
							if (id.includes("radix")) return "radix";

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
			setupFiles: ".vitest/setup",
			root: ".",
			include: ["src/**/*.{test,spec}.{ts,tsx}"],
		},
	};
});
