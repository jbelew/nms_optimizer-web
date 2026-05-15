import { mkdir, readdir, stat } from "fs/promises";
import path from "path";
import sharp from "sharp";

const imageDirs = [
	{
		outputDir: "public/assets/img/grid",
		resolutions: [
			{ height: 60, suffix: "", width: 60 },
			{ height: 120, suffix: "@2x", width: 120 },
		],
		sourceDir: "source_images/grid",
	},
	{
		outputDir: "public/assets/img/tech",
		resolutions: [
			{ height: 60, suffix: "", width: 60 },
			{ height: 120, suffix: "@2x", width: 120 },
		],
		sourceDir: "source_images/tech",
	},
	{
		outputDir: "public/assets/img/sidebar",
		resolutions: [
			{ height: 24, suffix: "", width: 36 },
			{ height: 48, suffix: "@2x", width: 72 },
		],
		sourceDir: "source_images/sidebar",
	},
];

const singleImages = [
	{
		outputDir: "public/assets/img",
		resolutions: [
			{ suffix: "", width: 1920 },
			{ suffix: "@2x", width: 2880 }, // Reduced from 3840
			{ height: 1136, suffix: "@mobile", width: 640 },
		],
		sourceFile: "source_images/background.png",
		webpOptions: { effort: 6, quality: 55 },
	},
];

async function processImages() {
	// Process directories
	for (const { outputDir, resolutions, sourceDir } of imageDirs) {
		try {
			await mkdir(outputDir, { recursive: true });

			const processFile = async (filePath) => {
				const ext = path.extname(filePath);

				if (![".jpeg", ".jpg", ".png", ".webp"].includes(ext.toLowerCase())) {
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
						.webp({ effort: 6, quality: res.suffix === "@2x" ? 55 : 65 })
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
	for (const { outputDir, resolutions, sourceFile, webpOptions } of singleImages) {
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
