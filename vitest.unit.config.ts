import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(dirname, "./src"),
			"virtual:pwa-register": path.resolve(dirname, "./vitest-mocks/virtual-pwa-register.ts"),
			"virtual:markdown-bundle": path.resolve(dirname, "./vitest-mocks/virtual-markdown-bundle.ts"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		include: ["src/**/*.test.{ts,tsx}"],
		exclude: ["node_modules", "dist", ".storybook"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"node_modules",
				"src/**/*.stories.{ts,tsx}",
				"src/**/*.test.{ts,tsx}",
			],
		},
	},
});
