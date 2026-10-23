import { describe, expect, it, vi } from "bun:test";

import {
	generateSitemap,
	getFileLastMod,
	getLocalizedSourceFiles,
	getPageImages,
	PAGE_IMAGE_CONFIG,
} from "./generate-sitemap.mjs";

describe("generate-sitemap.mjs", () => {
	const mockTranslations = {
		appName: "NMS Optimizer",
		"seo.aboutPageTitle": "About the Optimization Algorithms",
		"seo.instructionsPageTitle": "How to Optimize Your Tech Layout",
		"seo.mainPageTitle": "No Man's Sky Tech Layout & Adjacency Bonus Calculator",
		"seo.userstatsPageTitle": "Community Meta & Tech Stats",
	};

	const mockT = vi.fn(
		(key, options = {}) => mockTranslations[key] || options.defaultValue || key,
	);

	describe("PAGE_IMAGE_CONFIG", () => {
		it("declares screenshot configs for root and key dialog pages", () => {
			expect(Object.keys(PAGE_IMAGE_CONFIG).sort()).toEqual([
				"about",
				"instructions",
				"root",
				"userstats",
			]);
		});
	});

	describe("getPageImages", () => {
		it("resolves image titles dynamically via getPageMetadata", () => {
			const images = getPageImages(mockT);

			expect(images.root.title).toBe(
				"No Man's Sky Tech Layout & Adjacency Bonus Calculator | NMS Optimizer",
			);
			expect(images.about.title).toBe("About the Optimization Algorithms | NMS Optimizer");
			expect(images.instructions.title).toBe(
				"How to Optimize Your Tech Layout | NMS Optimizer",
			);
			expect(images.userstats.title).toBe("Community Meta & Tech Stats | NMS Optimizer");
		});

		it("preserves image location and caption metadata", () => {
			const images = getPageImages(mockT);

			expect(images.root.loc).toContain("/assets/img/screenshots/screenshot.webp");
			expect(images.root.caption).toContain("optimized technology grid");
			expect(images.about.loc).toContain("/assets/img/screenshots/screenshot_desktop.webp");
			expect(images.about.caption).toContain("optimization algorithms");
			expect(images.instructions.loc).toContain(
				"/assets/img/screenshots/screenshot_desktop.webp",
			);
			expect(images.userstats.loc).toContain(
				"/assets/img/screenshots/screenshot_desktop.webp",
			);
		});
	});

	describe("getFileLastMod", () => {
		it("resolves the latest git modification date across an array of files", () => {
			const mdOnlyDate = getFileLastMod("public/assets/locales/en/translation-request.md");
			const combinedDate = getFileLastMod([
				"public/assets/locales/en/translation-request.md",
				"public/assets/locales/en/translation.json",
			]);

			expect(mdOnlyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(combinedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(combinedDate >= mdOnlyDate).toBe(true);
			expect(combinedDate > "2026-04-21").toBe(true);
		});

		it("uses localized markdown when present and falls back to English markdown only when missing", () => {
			const esInstructionsFiles = getLocalizedSourceFiles(
				"instructions",
				"es",
				"public/assets/locales/en/instructions.md",
			);
			expect(esInstructionsFiles).toEqual([
				"public/assets/locales/es/translation.json",
				"public/assets/locales/es/instructions.md",
			]);

			const esChangelogFiles = getLocalizedSourceFiles(
				"changelog",
				"es",
				"public/assets/locales/en/changelog.md",
			);
			expect(esChangelogFiles).toEqual([
				"public/assets/locales/es/translation.json",
				"public/assets/locales/en/changelog.md",
			]);
		});
	});

	describe("generateSitemap", () => {
		it("generates valid sitemap XML with canonical image titles", async () => {
			const xml = await generateSitemap({ write: false });

			expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
			expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
			expect(xml).toContain(
				"<image:title>No Man&apos;s Sky Tech Layout &amp; Adjacency Bonus Calculator | NMS Optimizer</image:title>",
			);
			expect(xml).toContain(
				"<image:title>About the Optimization Algorithms | NMS Optimizer</image:title>",
			);
			expect(xml).toContain(
				"<image:title>How to Optimize Your Tech Layout | NMS Optimizer</image:title>",
			);
			expect(xml).toContain(
				"<image:title>Community Meta &amp; Tech Stats | NMS Optimizer</image:title>",
			);
		});

		it("excludes performance route from the sitemap", async () => {
			const xml = await generateSitemap({ write: false });

			expect(xml).not.toContain("<loc>https://nms-optimizer.app/performance/</loc>");
		});
	});
});
