const puppeteer = require("puppeteer");
const path = require("path");

const baseUrl = process.env.BASE_URL;
if (!baseUrl) {
	console.error("BASE_URL environment variable is required");
	process.exit(1);
}

console.log(`Screenshot script started. Using BASE_URL: ${baseUrl}`);

(async () => {
	console.log("Attempting to launch browser...");
	const browser = await puppeteer.launch({
		headless: "new",
		dumpio: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-blink-features=AutomationControlled",
		],
	});
	const page = await browser.newPage();
	await page.setUserAgent(
		"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
	);

	try {
		// GitHub Actions may run on localhost:4173 by default for vite preview
		await page.setViewport({ width: 1280, height: 880 });

		await page.goto(baseUrl, {
			waitUntil: "networkidle0",
		});

		// Load the build file through the UI
		const nmsFilePath = path.resolve(__dirname, "Corvette - Akamai Terror VI.nms");
		const fileInputSelector = 'input[type="file"]';

		// Wait for file input to be available
		await page.waitForSelector(fileInputSelector, { timeout: 5000 });

		// Upload the file
		const fileInput = await page.$(fileInputSelector);
		await fileInput.uploadFile(nmsFilePath);

		// Trigger change event
		await page.evaluate(() => {
			const input = document.querySelector('input[type="file"]');
			if (input) {
				input.dispatchEvent(new Event("change", { bubbles: true }));
			}
		});

		// Wait for the build to load
		await new Promise((resolve) => setTimeout(resolve, 2000));
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot.png",
			fullPage: true,
		});
		console.log("Taking standard screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_desktop.png",
			fullPage: true,
		});

		await page.setViewport({ width: 375, height: 600 });
		await page.goto(baseUrl, {
			waitUntil: "networkidle0",
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
		console.log("Taking mobile screenshot ...");
		await page.screenshot({
			path: "public/assets/img/screenshots/screenshot_mobile.png",
			fullPage: false,
		});

		await page.setViewport({ width: 800, height: 1280 });
		await page.goto(baseUrl, {
			waitUntil: "networkidle0",
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
		console.log("Taking tablet screenshot ...");
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
