/**
 * @file Vite plugin that bundles markdown files at build time.
 * Creates a virtual module that exports markdown content as a JS object.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

/**
 * Recursively reads markdown files from the locales directory
 * @returns {Object} Object mapping language to markdown file content
 */
function loadMarkdownContent() {
	const content = {};

	// Read all language directories
	const languages = fs.readdirSync(LOCALES_DIR).filter((file) => {
		const filePath = path.join(LOCALES_DIR, file);
		return fs.statSync(filePath).isDirectory();
	});

	languages.forEach((lang) => {
		content[lang] = {};
		const langDir = path.join(LOCALES_DIR, lang);

		// Read all markdown files in this language directory
		const mdFiles = fs
			.readdirSync(langDir)
			.filter((file) => file.endsWith(".md"));

		mdFiles.forEach((file) => {
			const fileName = file.replace(/\.md$/, "");
			const filePath = path.join(langDir, file);
			const fileContent = fs.readFileSync(filePath, "utf-8");
			content[lang][fileName] = fileContent;
		});
	});

	return content;
}

/**
 * Generates the virtual module code
 * @param {Object} markdownContent - The markdown content object
 * @returns {string} JavaScript code as a string
 */
function generateModuleCode(markdownContent) {
	return `
// Auto-generated markdown bundle
export const markdownBundle = ${JSON.stringify(markdownContent)};

export function getMarkdown(lang, fileName) {
	// Fallback to English if language not available
	const langContent = markdownBundle[lang] || markdownBundle['en'];
	
	// Fallback to English if file not available for language
	if (!langContent[fileName] && lang !== 'en') {
		return markdownBundle['en'][fileName] || '';
	}
	
	return langContent[fileName] || '';
}
`;
}

/**
 * Vite plugin that creates a virtual markdown bundle module
 * Usage: Import from 'virtual:markdown-bundle' in your code
 */
export function markdownBundlePlugin() {
	const virtualModuleId = "virtual:markdown-bundle";
	const resolvedId = "\0" + virtualModuleId;
	let markdownContent = null;

	return {
		name: "markdown-bundle",
		// Resolve the virtual module ID
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedId;
			}
		},
		// Load the virtual module content
		load(id) {
			if (id === resolvedId) {
				if (!markdownContent) {
					markdownContent = loadMarkdownContent();
				}
				return generateModuleCode(markdownContent);
			}
		},
		// Watch markdown files for changes in dev mode
		async handleHotUpdate({ file, server }) {
			if (file.startsWith(LOCALES_DIR) && file.endsWith(".md")) {
				markdownContent = null; // Invalidate cache
				const module = server.moduleGraph.getModuleById(resolvedId);
				if (module) {
					server.moduleGraph.invalidateModule(module);
				}
				return [];
			}
		},
	};
}
