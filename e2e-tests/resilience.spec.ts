import { expect, test } from "@playwright/test";

test.describe("Application Resilience & Recovery", () => {
	test.beforeEach(async ({ page }) => {
		// Suppress welcome dialog via localStorage for resilience tests to avoid race conditions with mocks
		await page.addInitScript(() => {
			localStorage.setItem("user-visited", "true");
		});
	});

	test.describe("Retry cycle", () => {
		test("should show recovery UI when a critical chunk fails to load after max retries", async ({
			page,
		}) => {
			await page.route("**/build/*.js", async (route) => {
				await route.fulfill({
					status: 404,
					contentType: "application/javascript",
					body: "/* Mock 404 */",
				});
			});

			// Navigate with init_retry=2 so the error UI appears immediately
			await page.goto("/?init_retry=2");

			// Wait for redirect to 500.html
			await page.waitForURL("**/500.html*");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 15000 });

			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible();
		});

		test("should exhaust retries and show error UI when chunks keep failing", async ({
			page,
		}) => {
			await page.route("**/build/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			// Wait for redirect to 500.html after exhausting retries
			await page.waitForURL("**/500.html*", { timeout: 30000 });

			// After exhausting retries (0 -> 1 -> 2 -> error UI)
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();
			expect(page.url()).toContain("500.html");
		});

		test("refresh button should clear retry state", async ({ page }) => {
			await page.route("**/build/*.js", async (route) => {
				await route.fulfill({
					status: 404,
					contentType: "application/javascript",
					body: "/* Mock 404 */",
				});
			});

			await page.goto("/?init_retry=2");

			// Wait for redirect to 500.html
			await page.waitForURL("**/500.html*");

			const refreshButton = page.locator("button", { hasText: "Hard Reset & Refresh" });
			await expect(refreshButton).toBeVisible({ timeout: 15000 });
			await page.unroute("**/assets/*.js");

			// In 500.html, the button clears EVERYTHING and reloads with ?reload=timestamp
			await refreshButton.click();
			
			await page.waitForURL(/\/\?reload=\d+/);
			expect(page.url()).not.toContain("init_retry");
		});
	});

	test.describe("False positive prevention", () => {
		test("should NOT trigger recovery when a third-party script fails", async ({ page }) => {
			// Block a third-party analytics script (common with ad-blockers)
			await page.route("**/www.googletagmanager.com/**", async (route) => {
				await route.abort("blockedbyclient");
			});

			await page.goto("/");

			// The app should load normally — no error UI
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });

			// Verify init_retry was NOT added to the URL
			expect(page.url()).not.toContain("init_retry");
		});

		test("should NOT trigger recovery when a non-asset same-origin resource fails", async ({
			page,
		}) => {
			// Inject a failing non-asset script (e.g., a random path not under /assets/)
			await page.addInitScript(() => {
				const script = document.createElement("script");
				script.src = "/some-random-path/widget.js";
				document.head.appendChild(script);
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("init_retry");
		});

		test("should NOT trigger recovery when a preload fetch link fails", async ({ page }) => {
			// Block the translation preload (rel=preload, as=fetch)
			await page.route("**/assets/locales/**", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("init_retry");
		});

		test("should NOT trigger recovery when favicon or manifest fails", async ({ page }) => {
			await page.route("**/favicon*", async (route) => {
				await route.fulfill({ status: 404 });
			});
			await page.route("**/manifest*", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).not.toBeVisible({ timeout: 10000 });
			expect(page.url()).not.toContain("init_retry");
		});
	});

	test.describe("Malformed input handling", () => {
		test("should treat malformed init_retry as 0 and retry normally", async ({ page }) => {
			await page.route("**/build/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			// Navigate with a garbage init_retry value
			await page.goto("/?init_retry=abc");

			// Should treat as 0 and retry (landing at init_retry=1, then 2, then redirect to 500.html)
			await page.waitForURL("**/500.html*", { timeout: 30000 });
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();
		});

		test("should treat negative init_retry as 0 and retry normally", async ({ page }) => {
			await page.route("**/build/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/?init_retry=-5");

			// Should treat as 0 and retry (landing at init_retry=1, then 2, then redirect to 500.html)
			await page.waitForURL("**/500.html*", { timeout: 30000 });
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();
		});
	});

	test.describe("Network Throttling", () => {
		test("should load successfully on a slow 3G connection", async ({ page }) => {
			const client = await page.context().newCDPSession(page);
			await client.send("Network.emulateNetworkConditions", {
				offline: false,
				downloadThroughput: (800 * 1024) / 8, // 800 kbps (slightly faster than 400 for CI stability)
				uploadThroughput: (400 * 1024) / 8, 
				latency: 200, 
			});

			// We need a higher timeout for slow network
			await page.goto("/", { timeout: 60000 });

			// Use a robust wait that checks for both a flag and the event
			await page.waitForFunction(() => {
				return (window as any).__APP_READY__ || false;
			}, { timeout: 30000 });

			const grid = page.locator(".gridTable");
			await expect(grid).toBeVisible();
		});
	});

	test.describe("API Failure Recovery", () => {
		test("should redirect to 500.html when critical API fails", async ({ page }) => {
			// Mock critical platforms API failure
			await page.route("**/platforms", async (route) => {
				await route.fulfill({ status: 500 });
			});

			// Mock critical tech-tree API failure
			await page.route("**/tech_tree/**", async (route) => {
				await route.fulfill({ status: 500 });
			});

			await page.goto("/");

			// Should redirect to 500.html
			await page.waitForURL("**/500.html*", { timeout: 30000 });
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible();
		});
	});

	test.describe("Successful boot cleanup", () => {
		test("should clear init_retry from URL after successful app boot", async ({ page }) => {
			// Navigate with a leftover init_retry=1 (simulating a recovered first retry)
			await page.goto("/?init_retry=1");

			// Wait for the app to fully boot (the app-ready event fires and clears the param)
			await page.waitForFunction(
				() => !new URL(window.location.href).searchParams.has("init_retry"),
				{ timeout: 30000 }
			);

			expect(page.url()).not.toContain("init_retry");
		});
	});
});
