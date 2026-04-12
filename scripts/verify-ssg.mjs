/**
 * @file Verification script for SSG output
 * Run: node scripts/verify-ssg.mjs
 * Checks that all generated pages have proper SEO tags and content
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "../dist");

const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt"];
const KNOWN_DIALOGS = ["about", "instructions", "changelog", "translation", "userstats"];

/**
 * Checks a generated HTML file for required SEO tags and content.
 *
 * @param {string} filePath - Path to the HTML file to check.
 * @param {string} pageName - Name of the page for reporting.
 * @param {string} lang - Language code of the page.
 * @param {boolean} [expectContent=true] - Whether the page is expected to have pre-rendered markdown content.
 * @param {boolean} [isRoot=false] - Whether the page is a root page (should have FAQ schema).
 * @returns {boolean} True if all checks pass, false otherwise.
 */
function checkFile(filePath, pageName, lang, expectContent = true, isRoot = false) {
	if (!fs.existsSync(filePath)) {
		console.log(`✗ ${filePath} - NOT FOUND`);
		return false;
	}

	const content = fs.readFileSync(filePath, "utf-8");
	const checks = {
		hasCanonical: content.includes('rel="canonical"'),
		hasHreflang: content.includes('hreflang='),
		hasPrerendered: !expectContent || content.includes('data-prerendered-markdown'),
		hasContent: !expectContent || content.includes("<h2") || content.includes("<p"), // Has HTML content
		hasFAQ: isRoot ? content.includes('"@type":"FAQPage"') : !content.includes('"@type":"FAQPage"'),
	};

	const allPass = Object.values(checks).every((v) => v);

	if (!allPass) {
		console.log(
			`✗ /${pageName} (${lang}): ${Object.entries(checks)
				.filter(([_, v]) => !v)
				.map(([k]) => k)
				.join(", ")}`
		);
		return false;
	}

	return true;
}

console.log("Verifying SSG output...\n");

let totalPages = 0;
let passedPages = 0;

// Pages that have markdown content
const PAGES_WITH_CONTENT = ["about", "instructions", "changelog"];

// Check root pages for each language (no markdown content expected)
SUPPORTED_LANGUAGES.forEach((lang) => {
	const rootPath = lang === "en" ? "" : lang;
	const filePath = path.join(DIST_DIR, rootPath, "index.html");
	totalPages++;

	if (checkFile(filePath, lang === "en" ? "/" : `/${lang}`, lang, false, true)) {
		passedPages++;
		console.log(`✓ ${lang === "en" ? "/" : "/" + lang}`);
	}
});

// Check dialog pages for each language
SUPPORTED_LANGUAGES.forEach((lang) => {
	KNOWN_DIALOGS.forEach((dialog) => {
		const pagePath = lang === "en" ? dialog : `${lang}/${dialog}`;
		const filePath = path.join(DIST_DIR, pagePath, "index.html");
		totalPages++;

		// translation and userstats may not have content
		const hasContent = PAGES_WITH_CONTENT.includes(dialog);
		if (checkFile(filePath, dialog, lang, hasContent)) {
			passedPages++;
			console.log(`✓ /${pagePath}`);
		}
	});
});

console.log(
	`\n${passedPages === totalPages ? "✅" : "⚠️"} ${passedPages}/${totalPages} pages verified`
);

if (passedPages !== totalPages) {
	process.exit(1);
}
