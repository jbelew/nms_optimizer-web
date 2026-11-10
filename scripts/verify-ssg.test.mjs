import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES } from "../shared/config.js";
import { generateAgentMarkdown, generatePage } from "./generate-ssg.mjs";
import { createMarkdownProcessor } from "./markdown-processor.mjs";
import { checkFile, verifySsg } from "./verify-ssg.mjs";

const BASE_URL = "https://nms-optimizer.app";
const BASE_HTML = `<!doctype html>
<html lang="en">
<head>
	<title>Original Title</title>
	<meta name="description" content="Original Description" />
	<meta name="keywords" content="original, keywords" />
	<meta property="og:title" content="Original Title" />
	<meta property="og:site_name" content="NMS Optimizer" />
	<meta property="og:description" content="Original Description" />
	<meta property="og:image" content="https://nms-optimizer.app/assets/img/screenshots/screenshot.webp" />
	<meta property="og:image:alt" content="Original Alt" />
	<meta name="twitter:title" content="Original Title" />
	<meta name="twitter:description" content="Original Description" />
	<meta name="twitter:image" content="https://nms-optimizer.app/assets/img/screenshots/screenshot.webp" />
	<meta name="twitter:image:alt" content="Original Alt" />
</head>
<body>
	<div id="root"></div>
</body>
</html>`;

const createFixtureT = (lang) => (key, options) => {
	const table = {
		appName: "NMS Optimizer",
		"seo.aboutDescription": `About description (${lang})`,
		"seo.aboutPageTitle": `About Title (${lang})`,
		"seo.appDescription": `App description (${lang})`,
		"seo.changelogDescription": `Changelog description (${lang})`,
		"seo.changelogPageTitle": `Changelog Title (${lang})`,
		"seo.instructionsDescription": `Instructions description (${lang})`,
		"seo.instructionsPageTitle": `Instructions Title (${lang})`,
		"seo.keywords": `nms, optimizer, ${lang}`,
		"seo.mainPageTitle": `Main Title (${lang})`,
		"seo.nav.about": "About",
		"seo.nav.changelog": "Changelog",
		"seo.nav.home": "Home",
		"seo.nav.instructions": "Instructions",
		"seo.nav.privacy": "Privacy",
		"seo.nav.title": "Navigation",
		"seo.nav.translation": "Translate",
		"seo.nav.userstats": "User Statistics",
		"seo.navDescriptions.about": "About page",
		"seo.navDescriptions.changelog": "Changelog page",
		"seo.navDescriptions.home": "Home page",
		"seo.navDescriptions.instructions": "Instructions page",
		"seo.navDescriptions.privacy": "Privacy page",
		"seo.navDescriptions.translation": "Translation page",
		"seo.navDescriptions.userstats": "User stats page",
		"seo.ogImageAlt": `Screenshot (${lang})`,
		"seo.privacyDescription": `Privacy description (${lang})`,
		"seo.privacyPageTitle": `Privacy Title (${lang})`,
		"seo.translationDescription": `Translation description (${lang})`,
		"seo.translationPageTitle": `Translation Title (${lang})`,
		"seo.userstatsDescription": `User stats description (${lang})`,
		"seo.userstatsPageTitle": "User Statistics",
	};

	return table[key] ?? options?.defaultValue ?? key;
};

describe("verify-ssg.mjs", () => {
	/** @type {string[]} */
	const tempDirs = [];
	/** @type {ReturnType<typeof spyOn> | undefined} */
	let infoSpy;

	beforeEach(() => {
		infoSpy = spyOn(console, "info").mockImplementation(() => {});
	});

	afterEach(() => {
		infoSpy?.mockRestore();

		while (tempDirs.length > 0) {
			const dir = tempDirs.pop();

			if (dir) {
				fs.rmSync(dir, { force: true, recursive: true });
			}
		}
	});

	const writeRouteArtifacts = async (distDir, lang, slug) => {
		const mdProcessor = createMarkdownProcessor();
		const t = createFixtureT(lang);
		const relDir =
			slug === "" ?
				lang === "en" ?
					""
				:	lang
			: lang === "en" ? slug
			: `${lang}/${slug}`;
		const routeDir = path.join(distDir, relDir);
		fs.mkdirSync(routeDir, { recursive: true });

		const html = await generatePage(BASE_HTML, lang, slug, BASE_URL, mdProcessor, t, "");
		const md = await generateAgentMarkdown(lang, slug, BASE_URL, t);
		const htmlPath = path.join(routeDir, "index.html");
		const mdPath = path.join(routeDir, "index.md");

		fs.writeFileSync(htmlPath, html, "utf-8");

		if (md) {
			fs.writeFileSync(mdPath, md, "utf-8");
		}

		return { htmlPath, mdPath };
	};

	it("verifies all 42 pre-rendered HTML and Agent Markdown Document routes against the shared page metadata contract", async () => {
		const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "nms-verify-ssg-"));
		tempDirs.push(distDir);

		for (const lang of SUPPORTED_LANGUAGES) {
			await writeRouteArtifacts(distDir, lang, "");

			for (const dialog of KNOWN_DIALOGS) {
				await writeRouteArtifacts(distDir, lang, dialog);
			}
		}

		const silentLogger = { log: () => {} };
		const summary = verifySsg({ distDir, isDocker: false, logger: silentLogger });

		expect(summary.totalPages).toBe(42);
		expect(summary.passedPages).toBe(42);
		expect(summary.ok).toBe(true);
	});

	it("fails verification when /translation/ omits noindex, follow or when an indexable route emits noindex", async () => {
		const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "nms-verify-ssg-robots-"));
		tempDirs.push(distDir);
		const silentLogger = { log: () => {} };

		const { htmlPath: translationHtmlPath } = await writeRouteArtifacts(
			distDir,
			"es",
			"translation",
		);
		expect(checkFile(translationHtmlPath, "translation", "es", true, silentLogger)).toBe(true);

		const strippedRobotsHtml = fs
			.readFileSync(translationHtmlPath, "utf-8")
			.replace(/<meta\s+name="robots"[^>]*>/gi, "");
		fs.writeFileSync(translationHtmlPath, strippedRobotsHtml, "utf-8");
		expect(checkFile(translationHtmlPath, "translation", "es", true, silentLogger)).toBe(false);

		const { htmlPath: aboutHtmlPath } = await writeRouteArtifacts(distDir, "en", "about");
		expect(checkFile(aboutHtmlPath, "about", "en", true, silentLogger)).toBe(true);

		const pollutedAboutHtml = fs
			.readFileSync(aboutHtmlPath, "utf-8")
			.replace("</head>", '<meta name="robots" content="noindex, follow" /></head>');
		fs.writeFileSync(aboutHtmlPath, pollutedAboutHtml, "utf-8");
		expect(checkFile(aboutHtmlPath, "about", "en", true, silentLogger)).toBe(false);
	});

	it("fails verification when /<lang>/changelog/ self-canonicalizes or leaks untranslated hreflang links", async () => {
		const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "nms-verify-ssg-changelog-"));
		tempDirs.push(distDir);
		const silentLogger = { log: () => {} };

		const { htmlPath, mdPath } = await writeRouteArtifacts(distDir, "es", "changelog");
		const originalHtml = fs.readFileSync(htmlPath, "utf-8");
		const originalMd = fs.readFileSync(mdPath, "utf-8");

		expect(checkFile(htmlPath, "changelog", "es", true, silentLogger)).toBe(true);

		// 1. Wrong self-referential canonical URL in HTML
		fs.writeFileSync(
			htmlPath,
			originalHtml.replace(
				'<link rel="canonical" href="https://nms-optimizer.app/changelog/" />',
				'<link rel="canonical" href="https://nms-optimizer.app/es/changelog/" />',
			),
			"utf-8",
		);
		expect(checkFile(htmlPath, "changelog", "es", true, silentLogger)).toBe(false);

		// 2. Leaked untranslated hreflang="es" link in HTML
		fs.writeFileSync(
			htmlPath,
			originalHtml.replace(
				"</head>",
				'<link rel="alternate" hreflang="es" href="https://nms-optimizer.app/es/changelog/" /></head>',
			),
			"utf-8",
		);
		expect(checkFile(htmlPath, "changelog", "es", true, silentLogger)).toBe(false);

		// 3. Wrong self-referential url frontmatter in Agent Markdown Document
		fs.writeFileSync(htmlPath, originalHtml, "utf-8");
		fs.writeFileSync(
			mdPath,
			originalMd.replace(
				'url: "https://nms-optimizer.app/changelog/"',
				'url: "https://nms-optimizer.app/es/changelog/"',
			),
			"utf-8",
		);
		expect(checkFile(htmlPath, "changelog", "es", true, silentLogger)).toBe(false);
	});
});
