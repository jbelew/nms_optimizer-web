import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";

import { KNOWN_DIALOGS, SUPPORTED_LANGUAGES } from "../shared/config.js";
import {
	extractSsgTemplate,
	generateAgentMarkdown,
	generatePage,
	initI18n,
} from "./generate-ssg.mjs";
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

	it("renders enriched localized subpage titles, localized SoftwareApplication schema, Corvette homepage copy, Spanish líneas ley, and fixed About FAQ copy across real locale bundles", async () => {
		const distDir = fs.mkdtempSync(path.join(os.tmpdir(), "nms-verify-ssg-real-"));
		tempDirs.push(distDir);

		const sourceIndexHtml = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
		const { ssgHeader } = await extractSsgTemplate(sourceIndexHtml);
		const mdProcessor = createMarkdownProcessor();
		const realI18n = await initI18n();

		for (const lang of SUPPORTED_LANGUAGES) {
			const t = realI18n.getFixedT(lang, "translation");

			const writeRealRoute = async (slug) => {
				const relDir =
					slug === "" ?
						lang === "en" ?
							""
						:	lang
					: lang === "en" ? slug
					: `${lang}/${slug}`;
				const routeDir = path.join(distDir, relDir);
				fs.mkdirSync(routeDir, { recursive: true });

				const html = await generatePage(
					sourceIndexHtml,
					lang,
					slug,
					BASE_URL,
					mdProcessor,
					t,
					ssgHeader,
				);
				const md = await generateAgentMarkdown(lang, slug, BASE_URL, t);
				fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");

				if (md) {
					fs.writeFileSync(path.join(routeDir, "index.md"), md, "utf-8");
				}
			};

			await writeRealRoute("");

			for (const dialog of KNOWN_DIALOGS) {
				await writeRealRoute(dialog);
			}
		}

		const silentLogger = { log: () => {} };
		const summary = verifySsg({ distDir, isDocker: false, logger: silentLogger });
		expect(summary.totalPages).toBe(42);
		expect(summary.passedPages).toBe(42);
		expect(summary.ok).toBe(true);

		// 1. English root <title> and <meta name="description"> remain byte-for-byte unchanged
		const sourceTitleMatch = sourceIndexHtml.match(/<title>([^<]+)<\/title>/);
		const sourceDescMatch = sourceIndexHtml.match(
			/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/,
		);
		const enHomeHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
		const enHomeTitleMatch = enHomeHtml.match(/<title>([^<]+)<\/title>/);
		const enHomeDescMatch = enHomeHtml.match(
			/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/,
		);

		expect(enHomeTitleMatch?.[1]).toBe(sourceTitleMatch?.[1]);
		expect(enHomeDescMatch?.[1]).toBe(sourceDescMatch?.[1]);

		const corvetteExpectations = {
			de: { cosmetic: /kosmetisch/i, platform: /korvetten/i, reactor: /reaktor/i },
			en: { cosmetic: /cosmetic/i, platform: /corvettes/i, reactor: /reactor/i },
			es: { cosmetic: /cosmétic/i, platform: /corbetas/i, reactor: /reactor/i },
			fr: { cosmetic: /cosmétique/i, platform: /corvettes/i, reactor: /réacteur/i },
			it: { cosmetic: /estetic/i, platform: /corvette/i, reactor: /reattore/i },
			pt: { cosmetic: /cosmétic/i, platform: /corvetas/i, reactor: /reator/i },
		};

		const enrichedSubpages = ["about", "instructions", "changelog", "userstats", "privacy"];

		for (const lang of SUPPORTED_LANGUAGES) {
			const langPrefix = lang === "en" ? "" : lang;
			const homeHtml = fs.readFileSync(path.join(distDir, langPrefix, "index.html"), "utf-8");
			const homeMd = fs.readFileSync(path.join(distDir, langPrefix, "index.md"), "utf-8");

			// 2. SoftwareApplication JSON-LD localized featureList & keywords, no FAQPage
			expect(homeHtml).not.toContain('"FAQPage"');
			const softwareSchemaMatch = homeHtml.match(
				/<script[^>]*id="softwareapplication-schema"[^>]*>([\s\S]*?)<\/script>/,
			);
			expect(softwareSchemaMatch).not.toBeNull();
			const softwareSchema = JSON.parse(softwareSchemaMatch?.[1] ?? "{}");
			expect(Array.isArray(softwareSchema.featureList)).toBe(true);
			expect(softwareSchema.featureList.length).toBeGreaterThanOrEqual(5);
			expect(typeof softwareSchema.keywords).toBe("string");
			expect(softwareSchema.keywords).toContain("No Man's Sky");

			// 3. Homepage Static SEO Fallback & Agent Markdown Document include Corvettes (Reactor & Cosmetic Modules)
			const mainMatch = homeHtml.match(/<main[\s\S]*?<\/main>/);
			expect(mainMatch).not.toBeNull();
			const mainHtml = mainMatch?.[0] ?? "";
			const rules = corvetteExpectations[lang];
			expect(mainHtml).toMatch(rules.platform);
			expect(mainHtml).toMatch(rules.reactor);
			expect(mainHtml).toMatch(rules.cosmetic);
			expect(homeMd).toMatch(rules.platform);
			expect(homeMd).toMatch(rules.reactor);
			expect(homeMd).toMatch(rules.cosmetic);

			// 4. Subpage <title> across all 6 locales includes "No Man's Sky"
			for (const slug of enrichedSubpages) {
				const subpageHtml = fs.readFileSync(
					path.join(distDir, langPrefix, slug, "index.html"),
					"utf-8",
				);
				const titleMatch = subpageHtml.match(/<title>([^<]+)<\/title>/);
				expect(titleMatch?.[1]).toMatch(/No Man(?:'|&#39;|&apos;)s Sky/);
				expect(subpageHtml).not.toContain('"FAQPage"');
			}
		}

		// 5. Spanish homepage pre-rendered HTML & Agent Markdown include "líneas ley" alongside "bonificaciones de adyacencia"
		const esHomeHtml = fs.readFileSync(path.join(distDir, "es", "index.html"), "utf-8");
		const esHomeMd = fs.readFileSync(path.join(distDir, "es", "index.md"), "utf-8");
		expect(esHomeHtml.toLowerCase()).toContain("líneas ley");
		expect(esHomeHtml.toLowerCase()).toContain("bonificaciones de adyacencia");
		expect(esHomeMd.toLowerCase()).toContain("líneas ley");
		expect(esHomeMd.toLowerCase()).toContain("bonificaciones de adyacencia");

		// 6. English About double-negative typo fixed in both HTML and Agent Markdown Document
		const enAboutHtml = fs.readFileSync(path.join(distDir, "about", "index.html"), "utf-8");
		const enAboutMd = fs.readFileSync(path.join(distDir, "about", "index.md"), "utf-8");
		expect(enAboutMd).toContain("Why doesn't the tool show in-game stats?");
		expect(enAboutMd).not.toContain("doesn't the tool not show");
		expect(enAboutHtml).toMatch(/Why doesn(?:'|&#39;|&apos;|’)t the tool show in-game stats\?/);
		expect(enAboutHtml).not.toMatch(/doesn(?:'|&#39;|&apos;|’)t the tool not show/);
	});
});
