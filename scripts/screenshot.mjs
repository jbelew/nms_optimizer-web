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
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-blink-features=AutomationControlled",
		],
	});
	const context = await browser.newContext({
		userAgent:
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
		viewport: { width: 1280, height: 880 },
	});

	await context.addInitScript(() => {
		localStorage.setItem("userVisited", "true");
	});

	const page = await context.newPage();

	page.on("console", (msg) => {
		console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
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
		console.log("Waiting for grid to be rendered...");
		await page.waitForSelector(".gridCell", { timeout: 15000 });
		console.log("Grid cells found. Checking for modules...");

		// Wait a bit more for state synchronization
		await page.waitForTimeout(3000);

		const moduleCount = await page.locator("[data-tech]").count();
		console.log(`✅ Current grid state: Found ${moduleCount} modules.`);

		if (moduleCount === 0) {
			console.log("Dumping page content for debugging...");
			const content = await page.content();
			console.log(content.slice(0, 1000)); // Log first 1000 chars
		}

		console.log("Taking standard screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot.png",
			fullPage: true,
		});
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_desktop.png",
			fullPage: true,
		});

		console.log("Taking mobile screenshot ...");
		await page.setViewportSize({ width: 375, height: 600 });
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
			path: "public/assets/img/screenshots/screenshot_mobile.png",
			fullPage: false,
		});

		console.log("Taking tablet screenshot ...");
		await page.setViewportSize({ width: 800, height: 1280 });
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
			path: "public/assets/img/screenshots/screenshot_tablet.png",
			fullPage: false,
		});
	} catch (error) {
		console.error("Screenshot script failed:", error);
	} finally {
		await browser.close();
	}
})();
