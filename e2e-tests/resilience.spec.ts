import { expect, test } from "@playwright/test";

test.describe("Application Resilience & Recovery", () => {
	test.describe("Retry cycle", () => {
		test("should show recovery UI when a critical chunk fails to load after max retries", async ({
			page,
		}) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({
					status: 404,
					contentType: "application/javascript",
					body: "/* Mock 404 */",
				});
			});

			// Navigate with init_retry=2 so the error UI appears immediately
			await page.goto("/?init_retry=2");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 15000 });

			const refreshButton = page.locator("button", { hasText: "Refresh Now" });
			await expect(refreshButton).toBeVisible();
		});

		test("should exhaust retries and show error UI when chunks keep failing", async ({
			page,
		}) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/");

			// After exhausting retries (0 -> 1 -> 2 -> error UI)
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 30000 });
			expect(page.url()).toContain("init_retry=2");
		});

		test("refresh button should clear retry state", async ({ page }) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({
					status: 404,
					contentType: "application/javascript",
					body: "/* Mock 404 */",
				});
			});

			await page.goto("/?init_retry=2");

			const refreshButton = page.locator("button", { hasText: "Refresh Now" });
			await expect(refreshButton).toBeVisible({ timeout: 15000 });
			await page.unroute("**/assets/*.js");

			// Verify the button's onclick will clear init_retry from the URL
			const cleanUrl = await page.evaluate(() => {
				const u = new URL(location.href);
				u.searchParams.delete("init_retry");
				return u.toString();
			});
			expect(cleanUrl).not.toContain("init_retry");

			const onclickAttr = await refreshButton.getAttribute("onclick");
			expect(onclickAttr).toContain("searchParams.delete");
			expect(onclickAttr).toContain("init_retry");
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

			// Also block API preloads
			await page.route("**/platforms", async (route) => {
				await route.fulfill({ status: 500 });
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
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			// Navigate with a garbage init_retry value
			await page.goto("/?init_retry=abc");

			// Should treat as 0 and retry (landing at init_retry=1, then 2, then error UI)
			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 30000 });
			expect(page.url()).toContain("init_retry=2");
		});

		test("should treat negative init_retry as 0 and retry normally", async ({ page }) => {
			await page.route("**/assets/*.js", async (route) => {
				await route.fulfill({ status: 404 });
			});

			await page.goto("/?init_retry=-5");

			const errorHeading = page.locator("h1", { hasText: "Application Load Error" });
			await expect(errorHeading).toBeVisible({ timeout: 30000 });
			expect(page.url()).toContain("init_retry=2");
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
