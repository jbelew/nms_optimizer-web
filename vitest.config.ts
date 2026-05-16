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
	"virtual:markdown-bundle": path.resolve(dirname, "./vitest-mocks/virtual-markdown-bundle.ts"),
	"virtual:pwa-register": path.resolve(dirname, "./vitest-mocks/virtual-pwa-register.ts"),
};

export default defineConfig({
	resolve: { alias: sharedAlias },
	test: {
		coverage: {
			exclude: ["node_modules", "src/**/*.stories.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
			include: ["src/**/*.{ts,tsx}"],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		projects: [
			{
				plugins: [react()],
				resolve: { alias: sharedAlias },
				test: {
					environment: "jsdom",
					exclude: ["node_modules", "dist", ".storybook"],
					globals: true,
					include: ["src/**/*.test.{ts,tsx}"],
					name: "unit",
					setupFiles: ["./vitest.setup.ts"],
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
					browser: {
						enabled: true,
						headless: true,
						instances: [{ browser: "chromium" }],
						name: "chromium",
						provider: playwright(),
					},
					globals: true,
					name: "storybook",
					setupFiles: [path.resolve(dirname, ".storybook/vitest.setup.ts")],
				},
			},
		],
	},
});
