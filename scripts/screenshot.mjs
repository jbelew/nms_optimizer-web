import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseUrl = process.env.BASE_URL;

if (!baseUrl) {
	console.error("BASE_URL environment variable is required");
	process.exit(1);
}

console.log(`Screenshot script started. Using BASE_URL: ${baseUrl}`);

(async () => {
	console.log("Attempting to launch browser...");
	const browser = await chromium.launch({
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-blink-features=AutomationControlled",
		],
		headless: true,
	});
	const context = await browser.newContext({
		userAgent:
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
		viewport: { height: 880, width: 1280 },
	});

	await context.addInitScript(() => {
		localStorage.setItem("userVisited", "true");
	});

	const page = await context.newPage();

	page.on("console", (msg) => {
		console.log(`BROWSER LOG [${msg.type()}]: ${msg.text()}`);
	});
	page.on("pageerror", (err) => {
		console.error(`BROWSER ERROR: ${err.stack || err.message}`);
	});
	page.on("requestfailed", (request) => {
		console.warn(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText || "Unknown error"}`);
	});
	page.on("request", (request) => {
		console.log(`REQUEST: ${request.method()} ${request.url()}`);
	});
	page.on("response", (response) => {
		console.log(`RESPONSE: ${response.status()} ${response.url()}`);
	});

	try {
		await page.goto(baseUrl, {
			waitUntil: "networkidle",
		});

		// Load the build file through the UI
		const nmsFilePath = path.resolve(__dirname, "Corvette - Akamai Terror VI.nms");
		const fileInputSelector = 'input[type="file"][aria-label="Load Build"]';

		// Wait for file input to be available (it's hidden in the UI)
		await page.waitForSelector(fileInputSelector, { state: "attached", timeout: 10000 });

		// Upload the file
		await page.setInputFiles(fileInputSelector, nmsFilePath);

		// Trigger change event (Playwright's setInputFiles usually triggers it, but we'll keep the manual dispatch if needed)
		await page.evaluate(() => {
			const input = document.querySelector('input[type="file"]');

			if (input) {
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		// Wait for the build to load and modules to appear
		await page.waitForSelector(".gridCell img", { timeout: 15000 });
		const moduleCount = await page.locator(".gridCell img").count();
		console.log(`✅ Build loaded successfully. Found ${moduleCount} modules in the grid.`);

		console.log("Taking standard screenshot ...");
		await page.screenshot({
			fullPage: true,
			path: "public/assets/img/screenshots/screenshot.png",
		});
		await page.screenshot({
			fullPage: true,
			path: "public/assets/img/screenshots/screenshot_desktop.png",
		});

		console.log("Taking mobile screenshot ...");
		await page.setViewportSize({ height: 600, width: 375 });
		await page.goto(baseUrl, {
			waitUntil: "networkidle",
		});
		// Inject CSS to hide scrollbars for the mobile screenshot
		await page.addStyleTag({
			content: `
			body::-webkit-scrollbar {
				display: none;
			}
			html::-webkit-scrollbar {
				display: none;
			}
		`,
		});
		await page.screenshot({
			fullPage: false,
			path: "public/assets/img/screenshots/screenshot_mobile.png",
		});

		console.log("Taking tablet screenshot ...");
		await page.setViewportSize({ height: 1280, width: 800 });
		await page.goto(baseUrl, {
			waitUntil: "networkidle",
		});
		// Inject CSS to hide scrollbars for the tablet screenshot
		await page.addStyleTag({
			content: `
			body::-webkit-scrollbar {
				display: none;
			}
			html::-webkit-scrollbar {
				display: none;
			}
		`,
		});
		await page.screenshot({
			fullPage: false,
			path: "public/assets/img/screenshots/screenshot_tablet.png",
		});
	} catch (error) {
		console.error("Screenshot script failed:", error);
	} finally {
		await browser.close();
	}
})();
