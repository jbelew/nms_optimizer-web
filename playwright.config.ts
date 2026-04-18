import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./e2e-tests",
	/* Run tests in files in parallel */
	fullyParallel: false,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	/* Global timeout for each test */
	timeout: 60000,
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://127.0.0.1:4173",

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: "on-first-retry",
		
		/* Set flag to expose stores for E2E testing and suppress welcome dialog */
		launchOptions: {
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		},

		/* Inject E2E flags before every navigation */
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		initScript: () => {
			(window as any).__E2E_EXPOSE__ = true;
			localStorage.setItem("user-visited", "true");
		},
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				hasTouch: true,
			},
		},

		{
			name: "mobile-chrome",
			use: {
				...devices["Pixel 7"],
			},
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: "npm run preview -- --host 127.0.0.1",
		url: "http://127.0.0.1:4173",
		reuseExistingServer: !process.env.CI,
	},
});
