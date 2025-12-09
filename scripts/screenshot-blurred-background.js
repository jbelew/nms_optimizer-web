import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
	try {
		console.log("🎨 Generating blurred and tinted mobile background with Chromium...");

		// Use the high-res desktop background as source to ensure quality
		const bgImagePath = path.resolve(__dirname, "../public/assets/img/background@2x.webp");
		const outputPath = path.resolve(
			__dirname,
			"../public/assets/img/background@mobile-blurred_v4.webp"
		);

		// Mobile dimensions (Reverting to 640w to maintain blur scale/softness)
		const mobileWidth = 640;
		const mobileHeight = 1136;

		// Get source image dimensions
		const sharp = (await import("sharp")).default;
		const metadata = await sharp(bgImagePath).metadata();
		const sourceWidth = metadata.width;
		const sourceHeight = metadata.height;

		// Scale image to mobile height, preserving aspect ratio
		const scaleFactor = mobileHeight / sourceHeight;
		const scaledWidth = Math.round(sourceWidth * scaleFactor);

		// Resize image to mobile height, then crop horizontally to mobile width
		const croppedImageBuffer = await sharp(bgImagePath)
			.resize(scaledWidth, mobileHeight, {
				fit: "fill",
			})
			.extract({
				left: Math.round((scaledWidth - mobileWidth) / 2),
				top: 0,
				width: mobileWidth,
				height: mobileHeight,
			})
			.webp()
			.toBuffer();
		const base64Image = croppedImageBuffer.toString("base64");
		const dataUrl = `data:image/webp;base64,${base64Image}`;

		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		// Set viewport to mobile dimensions
		await page.setViewport({ width: mobileWidth, height: mobileHeight });

		const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				* { margin: 0; padding: 0; }
				html, body {
					width: 100%;
					height: 100%;
					overflow: hidden;
					background: black;
				}
				.container {
					position: relative;
					width: 100%;
					height: 100%;
				}
				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					filter: blur(64px);
					display: block;
				}
				.tint {
					position: absolute;
					inset: 0;
					background-color: #DDEAF814;
					width: 100%;
					height: 100%;
					pointer-events: none;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<img src="${dataUrl}" alt="">
				<div class="tint"></div>
			</div>
		</body>
		</html>
	`;

		const tempScreenshotPath = path.resolve(
			__dirname,
			"../public/assets/img/.temp-screenshot.png"
		);
		await page.setContent(html);
		await page.screenshot({ path: tempScreenshotPath });
		await browser.close();

		// Convert screenshot to webp
		await sharp(tempScreenshotPath).webp({ quality: 85 }).toFile(outputPath);

		// Clean up temp file
		fs.unlinkSync(tempScreenshotPath);

		// Get file size
		const stats = fs.statSync(outputPath);
		const fileSizeKb = (stats.size / 1024).toFixed(2);

		console.log("✅ Successfully generated blurred and tinted mobile background!");
		console.log(`   Output: ${outputPath}`);
		console.log(`   Size: ${fileSizeKb} KB`);
		console.log("");
		console.log("🎨 Applied effects:");
		console.log("   - Background: cyan-a3 (#00befd28)");
		console.log("   - Blur: backdrop-filter blur(64px)");
	} catch (error) {
		console.error("❌ Error generating blurred background:", error);
		process.exit(1);
	}
})();
