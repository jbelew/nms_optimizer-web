import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		react(),
		storybookTest({
			configDir: path.resolve(dirname, ".storybook"),
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(dirname, "./src"),
			"virtual:pwa-register": path.resolve(dirname, "./vitest-mocks/virtual-pwa-register.ts"),
			"virtual:markdown-bundle": path.resolve(dirname, "./vitest-mocks/virtual-markdown-bundle.ts"),
		},
	},
	test: {
		globals: true,
		browser: {
			enabled: true,
			name: "chromium",
			provider: playwright(),
			headless: true,
			instances: [
				{
					browser: "chromium",
				},
			],
		},
		setupFiles: [path.resolve(dirname, ".storybook/vitest.setup.ts")],
		environment: "jsdom",
	},
});
