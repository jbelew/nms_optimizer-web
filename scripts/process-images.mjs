
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import path from 'path';

const imageDirs = [
    { sourceDir: 'source_images/grid', outputDir: 'public/assets/img/grid', resolutions: [{ width: 60, height: 60, suffix: '' }, { width: 120, height: 120, suffix: '@2x' }] },
    { sourceDir: 'source_images/tech', outputDir: 'public/assets/img/tech', resolutions: [{ width: 60, height: 60, suffix: '' }, { width: 120, height: 120, suffix: '@2x' }] },
    { sourceDir: 'source_images/sidebar', outputDir: 'public/assets/img/sidebar', resolutions: [{ width: 64, height: 48, suffix: '' }, { width: 128, height: 96, suffix: '@2x' }] },
];

async function processImages() {
    for (const { sourceDir, outputDir, resolutions } of imageDirs) {
        try {
            await mkdir(outputDir, { recursive: true });

            const processFile = async (filePath) => {
                const ext = path.extname(filePath);
                if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext.toLowerCase())) {
                    return;
                }

                const filename = path.basename(filePath, ext);
                const relativeDir = path.dirname(path.relative(sourceDir, filePath));
                const targetDir = path.join(outputDir, relativeDir);

                await mkdir(targetDir, { recursive: true });

                for (const res of resolutions) {
                    const newFilename = `${filename}${res.suffix}.webp`;
                    const outputPath = path.join(targetDir, newFilename);

                    let image = sharp(filePath).trim(); // Trim first

                    // Get metadata after trimming to calculate aspect ratio
                    const metadata = await image.metadata();
                    const originalWidth = metadata.width;
                    const originalHeight = metadata.height;

                    // Calculate width after resizing to target height while maintaining aspect ratio
                    const resizedWidth = Math.round((originalWidth / originalHeight) * res.height);

                    // Calculate padding needed on the right
                    const paddingRight = Math.max(0, res.width - resizedWidth);

                    await image
                        .resize({ height: res.height, fit: 'contain', position: 'left' }) // Resize to target height, maintain aspect ratio, left-aligned
                        .extend({
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: paddingRight,
                            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent padding
                        })
                        .webp({ quality: 80 })
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
}

processImages();
