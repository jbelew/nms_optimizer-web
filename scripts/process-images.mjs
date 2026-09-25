import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * @typedef {Object} Resolution
 * @property {number} [height] - Target height in pixels.
 * @property {string} suffix - Filename suffix for the generated asset (e.g. "" or "@2x").
 * @property {number} [width] - Target width in pixels.
 */

/**
 * @typedef {Object} ImageDirConfig
 * @property {string} outputDir - Destination directory for processed assets.
 * @property {Resolution[]} resolutions - List of output resolutions and suffixes.
 * @property {string} sourceDir - Source directory containing raw assets.
 * @property {boolean} [trim] - Whether to close-crop (trim transparent borders) before resizing.
 */

/**
 * @typedef {Object} SingleImageConfig
 * @property {string} outputDir - Destination directory for processed assets.
 * @property {Resolution[]} resolutions - List of output resolutions and suffixes.
 * @property {string} sourceFile - Path to the source image file.
 * @property {import("sharp").WebpOptions} webpOptions - WebP encoding options.
 */

/**
 * Directory configurations for batch image optimization.
 *
 * @category Utilities
 * @type {ImageDirConfig[]}
 */
export const imageDirs = [
	{
		outputDir: "public/assets/img/class_icons",
		resolutions: [
			{ height: 36, suffix: "" },
			{ height: 72, suffix: "@2x" },
		],
		sourceDir: "source_images/class_icons",
		trim: true,
	},
	{
		outputDir: "public/assets/img/grid",
		resolutions: [
			{ height: 60, suffix: "", width: 60 },
			{ height: 120, suffix: "@2x", width: 120 },
		],
		sourceDir: "source_images/grid",
	},
	{
		outputDir: "public/assets/img/sidebar",
		resolutions: [
			{ height: 24, suffix: "", width: 36 },
			{ height: 48, suffix: "@2x", width: 72 },
		],
		sourceDir: "source_images/sidebar",
	},
	{
		outputDir: "public/assets/img/tech",
		resolutions: [
			{ height: 60, suffix: "", width: 60 },
			{ height: 120, suffix: "@2x", width: 120 },
		],
		sourceDir: "source_images/tech",
	},
];

/**
 * Configurations for individual standalone images requiring custom processing.
 *
 * @category Utilities
 * @type {SingleImageConfig[]}
 */
export const singleImages = [
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

/**
 * Process a single image file across all specified resolutions.
 *
 * @remarks
 * Converts compatible images (`.jpeg`, `.jpg`, `.png`, `.webp`) to WebP format.
 * If `trim` is enabled, extraneous transparent pixels are close-cropped before resizing.
 * When `width` is omitted from a resolution, the aspect ratio is preserved based on `height`.
 *
 * @param {string} filePath - Path to the source file to process.
 * @param {ImageDirConfig} config - Processing options and resolution definitions.
 * @returns {Promise<void>} Resolves when all resolutions have been generated.
 * @see {@link ./process-images.test.mjs Unit Tests}
 * @category Utilities
 * @example
 * ```javascript
 * await processFile("source_images/class_icons/class-a.webp", {
 *   outputDir: "public/assets/img/class_icons",
 *   resolutions: [{ height: 36, suffix: "" }],
 *   sourceDir: "source_images/class_icons",
 *   trim: true,
 * });
 * // resolves void
 * ```
 */
export async function processFile(filePath, config) {
	const { outputDir, resolutions, sourceDir, trim = false } = config;
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

		let pipeline = sharp(filePath);

		if (trim) {
			pipeline = pipeline.trim();
		}

		await pipeline
			.resize({
				height: res.height,
				width: res.width,
			})
			.webp({ effort: 6, quality: res.suffix === "@2x" ? 55 : 65 })
			.toFile(outputPath);
	}
}

/**
 * Optimize and convert all project asset directories and single images to WebP.
 *
 * @remarks
 * Sequentially executes directory traversals defined in `imageDirs` followed by
 * individual image conversions defined in `singleImages`.
 *
 * @returns {Promise<void>} Resolves when batch processing completes.
 * @see {@link ./process-images.test.mjs Unit Tests}
 * @category Utilities
 * @example
 * ```javascript
 * await processImages();
 * // resolves void
 * ```
 */
export async function processImages() {
	// Process directories
	for (const dirConfig of imageDirs) {
		try {
			await mkdir(dirConfig.outputDir, { recursive: true });
			await processDirectory(dirConfig.sourceDir, dirConfig);
			console.log(`Images in ${dirConfig.sourceDir} processed successfully!`);
		} catch (error) {
			console.error(`Error processing images in ${dirConfig.sourceDir}:`, error);
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
						.resize(res.width, res.height, { fit: "cover", position: "center" })
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

/**
 * Recursively traverse a directory and process all discovered image files.
 *
 * @param {string} dir - Directory path to traverse.
 * @param {ImageDirConfig} config - Processing configuration for discovered files.
 * @returns {Promise<void>} Resolves when all files in the directory tree have been processed.
 */
async function processDirectory(dir, config) {
	const entries = await readdir(dir);

	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		const stats = await stat(fullPath);

		if (stats.isDirectory()) {
			await processDirectory(fullPath, config);
		} else {
			await processFile(fullPath, config);
		}
	}
}

// Execute when invoked directly from CLI
const isDirectCall =
	process.argv[1] &&
	(process.argv[1] === fileURLToPath(import.meta.url) ||
		process.argv[1].endsWith("/process-images.mjs"));

if (isDirectCall) {
	processImages();
}
