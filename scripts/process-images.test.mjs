import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

import { imageDirs, processFile } from "./process-images.mjs";

describe("process-images.mjs", () => {
	describe("imageDirs configuration", () => {
		it("includes class_icons directory configuration", () => {
			const classIconsConfig = imageDirs.find(
				(dir) => dir.sourceDir === "source_images/class_icons"
			);

			expect(classIconsConfig).toBeDefined();
			expect(classIconsConfig.outputDir).toBe("public/assets/img/class_icons");
			expect(classIconsConfig.trim).toBe(true);
			expect(classIconsConfig.resolutions).toEqual([
				{ height: 36, suffix: "" },
				{ height: 72, suffix: "@2x" },
			]);
		});

		it("preserves existing image directory configurations for grid, tech, and sidebar", () => {
			const gridConfig = imageDirs.find((dir) => dir.sourceDir === "source_images/grid");
			const techConfig = imageDirs.find((dir) => dir.sourceDir === "source_images/tech");
			const sidebarConfig = imageDirs.find(
				(dir) => dir.sourceDir === "source_images/sidebar"
			);

			expect(gridConfig).toBeDefined();
			expect(techConfig).toBeDefined();
			expect(sidebarConfig).toBeDefined();
		});
	});

	describe("processFile", () => {
		let tempOutputDir;

		beforeAll(async () => {
			tempOutputDir = await mkdtemp(path.join(os.tmpdir(), "process-images-test-"));
		});

		afterAll(async () => {
			if (tempOutputDir) {
				await rm(tempOutputDir, { force: true, recursive: true });
			}
		});

		it("processes class icon with trim and height resize preserving aspect ratio", async () => {
			const sampleFile = "source_images/class_icons/class-a.webp";
			const fileStat = await stat(sampleFile);
			expect(fileStat.isFile()).toBe(true);

			const config = {
				outputDir: tempOutputDir,
				resolutions: [
					{ height: 36, suffix: "" },
					{ height: 72, suffix: "@2x" },
				],
				sourceDir: "source_images/class_icons",
				trim: true,
			};

			await processFile(sampleFile, config);

			const output1x = path.join(tempOutputDir, "class-a.webp");
			const output2x = path.join(tempOutputDir, "class-a@2x.webp");

			const meta1x = await sharp(output1x).metadata();
			const meta2x = await sharp(output2x).metadata();

			expect(meta1x.format).toBe("webp");
			expect(meta1x.height).toBe(36);
			// Close cropped class-a has aspect ratio ~1.11, so width should be 40
			expect(meta1x.width).toBe(40);

			expect(meta2x.format).toBe("webp");
			expect(meta2x.height).toBe(72);
			expect(meta2x.width).toBe(80);
		});

		it("processes png class icon converting to webp with close crop and proportional scaling", async () => {
			const sampleFile = "source_images/class_icons/class-c.png";
			const fileStat = await stat(sampleFile);
			expect(fileStat.isFile()).toBe(true);

			const config = {
				outputDir: tempOutputDir,
				resolutions: [
					{ height: 36, suffix: "" },
					{ height: 72, suffix: "@2x" },
				],
				sourceDir: "source_images/class_icons",
				trim: true,
			};

			await processFile(sampleFile, config);

			const output1x = path.join(tempOutputDir, "class-c.webp");
			const output2x = path.join(tempOutputDir, "class-c@2x.webp");

			const meta1x = await sharp(output1x).metadata();
			const meta2x = await sharp(output2x).metadata();

			expect(meta1x.format).toBe("webp");
			expect(meta1x.height).toBe(36);
			// Close cropped class-c (shield only) has aspect ratio ~0.65, so width should be 23
			expect(meta1x.width).toBe(23);

			expect(meta2x.format).toBe("webp");
			expect(meta2x.height).toBe(72);
			expect(meta2x.width).toBe(47);
		});
	});
});
