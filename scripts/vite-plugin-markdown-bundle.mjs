/**
 * @file Vite plugin that bundles markdown files at build time.
 * Creates a virtual module that exports markdown content as a JS object.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { PAGE_REGISTRY } from "../shared/page-registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

/**
 * Set of markdown filenames (with `.md` extension) rendered by client-side Routed Dialogs.
 * Excludes SSG-only markdown files (`home.md`, `userstats.md`) whose routes use custom UI components.
 */
const CLIENT_DIALOG_MARKDOWN_FILES = new Set(
	Object.values(PAGE_REGISTRY)
		.filter((page) => page.componentType === "markdown" && page.markdownFileName)
		.map((page) => `${page.markdownFileName}.md`),
);

/**
 * Creates a Vite plugin that bundles Routed Dialog markdown files into a virtual module.
 *
 * @remarks
 * Exposes `virtual:markdown-bundle` with `markdownBundle` and `getMarkdown(lang, fileName)`
 * while excluding SSG-only markdown files (`home.md` and `userstats.md`)
 * and stripping redundant raw `.md` files copied from `public/assets/locales` into `dist`.
 *
 * @returns {import("vite").Plugin} The configured Vite plugin object.
 *
 * @see {@link CLIENT_DIALOG_MARKDOWN_FILES}
 * @see {@link PAGE_REGISTRY}
 * @see {@link generateModuleCode}
 * @see {@link loadMarkdownContent}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const plugin = markdownBundlePlugin();
 * // returns { name: "markdown-bundle", resolveId, load, handleHotUpdate, writeBundle }
 * ```
 */
export function markdownBundlePlugin() {
	const virtualModuleId = "virtual:markdown-bundle";
	const resolvedId = "\0" + virtualModuleId;
	let markdownContent = null;

	return {
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
		// Load the virtual module content
		load(id) {
			if (id === resolvedId) {
				if (!markdownContent) {
					markdownContent = loadMarkdownContent();
				}

				return generateModuleCode(markdownContent);
			}
		},
		name: "markdown-bundle",
		// Resolve the virtual module ID
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedId;
			}
		},
		// Strip raw .md files copied from public/assets/locales into dist/assets/locales
		writeBundle(options) {
			const outDir = options.dir || path.join(__dirname, "../dist");
			const distLocalesDir = path.join(outDir, "assets/locales");

			if (!fs.existsSync(distLocalesDir)) {
				return;
			}

			for (const lang of fs.readdirSync(distLocalesDir)) {
				const langDir = path.join(distLocalesDir, lang);

				if (!fs.statSync(langDir).isDirectory()) {
					continue;
				}

				for (const file of fs.readdirSync(langDir)) {
					if (file.endsWith(".md")) {
						fs.rmSync(path.join(langDir, file), { force: true });
					}
				}
			}
		},
	};
}

/**
 * Generates the source code for the virtual module "virtual:markdown-bundle".
 * This function does not execute the logic itself but returns a string containing
 * the JavaScript code that will be served by Vite.
 *
 * The generated module exports:
 * - `markdownBundle`: The raw JSON object containing all markdown content.
 * - `getMarkdown(lang, fileName)`: A helper function to retrieve content with fallbacks.
 *
 * @param {Object} markdownContent - The dictionary of markdown content keyed by language and filename.
 * @returns {string} The complete JavaScript source code for the virtual module.
 */
function generateModuleCode(markdownContent) {
	return `
/**
 * Auto-generated markdown bundle containing all content from locales directory.
 * @type {Record<string, Record<string, string>>}
 */
export const markdownBundle = ${JSON.stringify(markdownContent)};

/**
 * Retrieves markdown content for a specific language and file.
 * Falls back to English if the language or file is missing.
 *
 * @param {string} lang - The language code (e.g., 'en', 'es').
 * @param {string} fileName - The name of the markdown file (without extension).
 * @returns {string} The markdown content or an empty string if not found.
 */
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
 * Recursively reads Routed Dialog markdown files from the locales directory.
 *
 * @returns {Record<string, Record<string, string>>} Dictionary mapping language code to markdown filename and content.
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

		// Read client-rendered Routed Dialog markdown files (excluding SSG-only files like home.md and userstats.md).
		const mdFiles = fs
			.readdirSync(langDir)
			.filter((file) => CLIENT_DIALOG_MARKDOWN_FILES.has(file));

		mdFiles.forEach((file) => {
			const fileName = file.replace(/\.md$/, "");
			const filePath = path.join(langDir, file);
			const fileContent = fs.readFileSync(filePath, "utf-8");
			content[lang][fileName] = fileContent;
		});
	});

	return content;
}
