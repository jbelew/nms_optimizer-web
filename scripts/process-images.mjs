import { mkdir, readdir, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";

const imageDirs = [
	{
		sourceDir: "source_images/grid",
		outputDir: "public/assets/img/grid",
		resolutions: [
			{ width: 60, height: 60, suffix: "" },
			{ width: 120, height: 120, suffix: "@2x" },
		],
	},
	{
		sourceDir: "source_images/tech",
		outputDir: "public/assets/img/tech",
		resolutions: [
			{ width: 60, height: 60, suffix: "" },
			{ width: 120, height: 120, suffix: "@2x" },
		],
	},
	{
		sourceDir: "source_images/sidebar",
		outputDir: "public/assets/img/sidebar",
		resolutions: [
			{ width: 36, height: 24, suffix: "" },
			{ width: 72, height: 48, suffix: "@2x" },
		],
	},
];

const singleImages = [
	{
		sourceFile: "source_images/background.png",
		outputDir: "public/assets/img",
		resolutions: [
			{ width: 1920, suffix: "" },
			{ width: 2880, suffix: "@2x" }, // Reduced from 3840
			{ width: 640, height: 1136, suffix: "@mobile" },
		],
		webpOptions: { quality: 55, effort: 6 },
	},
];

async function processImages() {
	// Process directories
	for (const { sourceDir, outputDir, resolutions } of imageDirs) {
		try {
			await mkdir(outputDir, { recursive: true });

			const processFile = async (filePath) => {
				const ext = path.extname(filePath);
				if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext.toLowerCase())) {
					return;
				}

				const filename = path.basename(filePath, ext);
				const relativeDir = path.dirname(path.relative(sourceDir, filePath));
				const targetDir = path.join(outputDir, relativeDir);

				await mkdir(targetDir, { recursive: true });

				for (const res of resolutions) {
					const newFilename = `${filename}${res.suffix}.webp`;
					const outputPath = path.join(targetDir, newFilename);

					await sharp(filePath)
						.resize(res.width, res.height)
						.webp({ quality: res.suffix === "@2x" ? 55 : 65, effort: 6 })
						.toFile(outputPath);
				}
			};

			const processDirectory = async (dir) => {
				const entries = await readdir(dir);
				for (const entry of entries) {
					const fullPath = path.join(dir, entry);
					const stats = await stat(fullPath);
					if (stats.isDirectory()) {
						await processDirectory(fullPath);
					} else {
						await processFile(fullPath);
					}
				}
			};

			await processDirectory(sourceDir);
			console.log(`Images in ${sourceDir} processed successfully!`);
		} catch (error) {
			console.error(`Error processing images in ${sourceDir}:`, error);
		}
	}

	// Process single images
	for (const { sourceFile, outputDir, resolutions, webpOptions } of singleImages) {
		try {
			await mkdir(outputDir, { recursive: true });
			const ext = path.extname(sourceFile);
			const filename = path.basename(sourceFile, ext);

			for (const res of resolutions) {
				const newFilename = `${filename}${res.suffix}.webp`;
				const outputPath = path.join(outputDir, newFilename);

				if (res.suffix === "@mobile") {
					await sharp(sourceFile)
						.resize(res.width, res.height, { fit: 'cover', position: 'center' })
						.webp(webpOptions)
						.toFile(outputPath);
				} else {
					await sharp(sourceFile)
						.resize({ width: res.width })
						.webp(webpOptions)
						.toFile(outputPath);
				}
			}
			console.log(`Image ${sourceFile} processed successfully!`);
		} catch (error) {
			console.error(`Error processing image ${sourceFile}:`, error);
		}
	}
}

processImages();
