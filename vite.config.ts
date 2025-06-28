import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import critical from "rollup-plugin-critical";
import inlineCriticalCssPlugin from "./scripts/vite-plugin-inline-critical-css";
import deferStylesheetsPlugin from "./scripts/deferStylesheetsPlugin";

export default defineConfig(({ mode }) => {
	const isDocker = mode === "docker";

	return {
		plugins: [
			react(),
			tailwindcss(),

			// Conditionally apply defer and critical plugins
			...(!isDocker
				? [
					deferStylesheetsPlugin(),
					critical({
						criticalBase: "dist/",
						criticalUrl: "https://nms-optimizer.app",
						criticalPages: [{ uri: "/", template: "index" }],
						criticalConfig: {
							inline: false,
							base: "dist/",
							extract: false,
							width: 375,
							height: 667,
						},
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
			...(!isDocker
				? [
					inlineCriticalCssPlugin()
				]
				: []),

			visualizer({ open: false, gzipSize: true, brotliSize: true }),
		],

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
			sourcemap: true,
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
							id.includes("parse-entities")
						) {
							return "markdown";
						}

						if (
							id.includes("i18next") ||
							id.includes("react-i18next") ||
							id.includes("@formatjs") ||
							id.includes("intl-messageformat")
						) {
							return "i18n";
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
			environment: "jsdom",
			setupFiles: "./src/test/setup.ts",
		},
	};
});
