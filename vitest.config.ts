import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname =
	typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const sharedAlias = {
	"@": path.resolve(dirname, "./src"),
	"virtual:pwa-register": path.resolve(dirname, "./vitest-mocks/virtual-pwa-register.ts"),
	"virtual:markdown-bundle": path.resolve(dirname, "./vitest-mocks/virtual-markdown-bundle.ts"),
};

export default defineConfig({
	resolve: { alias: sharedAlias },
	test: {
		projects: [
			{
				plugins: [react()],
				resolve: { alias: sharedAlias },
				test: {
					name: "unit",
					globals: true,
					environment: "jsdom",
					setupFiles: ["./vitest.setup.ts"],
					include: ["src/**/*.test.{ts,tsx}"],
					exclude: ["node_modules", "dist", ".storybook"],
					silent: true,
				},
			},
			{
				plugins: [
					react(),
					storybookTest({ configDir: path.resolve(dirname, ".storybook") }),
				],
				resolve: { alias: sharedAlias },
				test: {
					name: "storybook",
					globals: true,
					environment: "jsdom",
					setupFiles: [path.resolve(dirname, ".storybook/vitest.setup.ts")],
					browser: {
						enabled: true,
						name: "chromium",
						provider: playwright(),
						headless: true,
						instances: [{ browser: "chromium" }],
					},
				},
			},
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["node_modules", "src/**/*.stories.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
		},
	},
});
