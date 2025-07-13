
import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import path from 'path';

const imageDirs = [
    { sourceDir: 'source_images/grid', outputDir: 'public/assets/img/grid' },
    { sourceDir: 'source_images/tech', outputDir: 'public/assets/img/tech' },
];

const resolutions = [
    { width: 60, height: 60, suffix: '' },
    { width: 120, height: 120, suffix: '@2x' },
];

async function processImages() {
    for (const { sourceDir, outputDir } of imageDirs) {
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

                    await sharp(filePath)
                        .resize(res.width, res.height)
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
