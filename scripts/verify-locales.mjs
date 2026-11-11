#!/usr/bin/env bun
/**
 * @file Deterministic structural, tag, interpolation, and SEO safeguard validator for Locale Bundles and Localized Route Documents.
 *
 * Verifies across `en` (source) and all target languages in `SUPPORTED_LANGUAGES`:
 * - Valid JSON syntax, non-empty string leaves, and exact key-set parity (`0` missing, `0` extra keys) vs. `en/translation.json`.
 * - Array shape and length parity on `messageSpinner.randomMessages` and `seo.featureList`.
 * - Balanced inline JSX/HTML tags and exact tag multiset parity (`<0>`, `<1>`, `<5>`, `<strong>`, `<i>`, `<p>`, `<icon/>`, etc.) per key.
 * - Exact `{{variable}}` interpolation placeholder multiset parity per key.
 * - SEO title safeguards (`seo.*PageTitle` must not contain em-dashes `—`).
 * - Presence, non-emptiness, `<radix-icon>` parity, `[youtube:...]` shortcode parity, and em-dash-free headings across all Markdown documents declared in `PAGE_REGISTRY`.
 *
 * Usage:
 *   bun scripts/verify-locales.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SUPPORTED_LANGUAGES } from "../shared/constants.js";
import { getAllPages, getPageContentLanguages } from "../shared/page-registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOCALES_DIR = path.join(__dirname, "../public/assets/locales");

const INLINE_TAG_REGEX = /<(\/?)([a-zA-Z0-9]+)(?:\s+[^<>]*?)?(\/?)>/g;
const INTERPOLATION_REGEX = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
const RADIX_ICON_REGEX = /<radix-icon\b[^>]*><\/radix-icon>/g;
const YOUTUBE_SHORTCODE_REGEX = /\[youtube:[^\]]+\]/g;

/**
 * Extracts normalized inline JSX/HTML tag tokens and checks whether opening/closing tags are balanced.
 *
 * @remarks
 * Normalizes attributes (such as `<p style="...">` -> `<p>`) while preserving self-closing markers
 * (`<icon/>`) so React-i18next `<Trans>` component slots and inline formatting tags can be compared
 * deterministically across locales.
 *
 * @param {string} text - Localized JSON string value.
 * @returns {{ balanced: boolean, tokens: string[], unbalancedDetail: null | string }} Normalized tag tokens and balance result.
 * @see {@link ./verify-locales.test.mjs Unit Tests}
 */
export function extractInlineTags(text) {
	/** @type {string[]} */
	const stack = [];
	/** @type {string[]} */
	const tokens = [];
	/** @type {null | string} */
	let unbalancedDetail = null;

	for (const match of text.matchAll(INLINE_TAG_REGEX)) {
		const isClosing = match[1] === "/";
		const tagName = match[2];
		const isSelfClosing = match[3] === "/";

		if (isSelfClosing) {
			tokens.push(`<${tagName}/>`);
			continue;
		}

		if (isClosing) {
			tokens.push(`</${tagName}>`);
			const top = stack.pop();

			if (top !== tagName && unbalancedDetail === null) {
				unbalancedDetail =
					top ?
						`expected </${top}> before </${tagName}>`
					:	`unexpected closing </${tagName}>`;
			}
		} else {
			tokens.push(`<${tagName}>`);
			stack.push(tagName);
		}
	}

	if (stack.length > 0 && unbalancedDetail === null) {
		unbalancedDetail = `unclosed <${stack[stack.length - 1]}>`;
	}

	return {
		balanced: unbalancedDetail === null,
		tokens,
		unbalancedDetail,
	};
}

/**
 * Extracts sorted `{{variable}}` interpolation placeholder names from a localized string.
 *
 * @param {string} text - Localized JSON string value.
 * @returns {string[]} Sorted placeholder token list (preserving duplicate occurrences).
 * @see {@link ./verify-locales.test.mjs Unit Tests}
 */
export function extractInterpolations(text) {
	/** @type {string[]} */
	const vars = [];

	for (const match of text.matchAll(INTERPOLATION_REGEX)) {
		vars.push(match[1]);
	}

	return vars.sort();
}

/**
 * Scans Markdown headings outside fenced code blocks for disallowed em-dashes (`—`).
 *
 * @param {string} markdownText - Raw Markdown document contents.
 * @returns {Array<{ line: number, text: string }>} Heading lines containing `—`.
 * @see {@link ./verify-locales.test.mjs Unit Tests}
 */
export function findMarkdownHeadingEmDashes(markdownText) {
	const lines = markdownText.split(/\r?\n/);
	/** @type {Array<{ line: number, text: string }>} */
	const violations = [];
	/** @type {null | string} */
	let activeFence = null;

	for (let idx = 0; idx < lines.length; idx += 1) {
		const line = lines[idx];
		const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);

		if (fenceMatch) {
			const marker = fenceMatch[1];

			if (activeFence === null) {
				activeFence = marker;
			} else if (marker[0] === activeFence[0] && marker.length >= activeFence.length) {
				activeFence = null;
			}

			continue;
		}

		if (activeFence === null && /^#{1,6}\s/.test(line) && line.includes("—")) {
			violations.push({ line: idx + 1, text: line.trim() });
		}
	}

	return violations;
}

/**
 * Flattens a nested locale JSON object into dot/bracket leaf paths while recording structural errors.
 *
 * @param {unknown} node - Parsed JSON value.
 * @param {string} [prefix] - Current dot/bracket key path.
 * @returns {{ errors: string[], flat: Record<string, string> }} Flattened string map and any non-string leaf errors.
 * @see {@link ./verify-locales.test.mjs Unit Tests}
 */
export function flattenLocaleBundle(node, prefix = "") {
	/** @type {string[]} */
	const errors = [];
	/** @type {Record<string, string>} */
	const flat = {};

	if (Array.isArray(node)) {
		for (let idx = 0; idx < node.length; idx += 1) {
			const child = flattenLocaleBundle(node[idx], `${prefix}[${idx}]`);
			errors.push(...child.errors);
			Object.assign(flat, child.flat);
		}

		return { errors, flat };
	}

	if (node !== null && typeof node === "object") {
		for (const [key, value] of Object.entries(node)) {
			const nextKey = prefix ? `${prefix}.${key}` : key;
			const child = flattenLocaleBundle(value, nextKey);
			errors.push(...child.errors);
			Object.assign(flat, child.flat);
		}

		return { errors, flat };
	}

	if (typeof node !== "string") {
		errors.push(`Key "${prefix}" must be a string leaf (received ${typeof node}).`);

		return { errors, flat };
	}

	flat[prefix] = node;

	return { errors, flat };
}

/**
 * Validates all Locale Bundles (`translation.json`) and Localized Route Documents (`*.md`) on disk.
 *
 * @param {object} [options] - Optional overrides for testing.
 * @param {string} [options.localesDir] - Root `public/assets/locales` directory path.
 * @param {Array<{ contentLanguages?: readonly string[], id: string, markdownFileName?: string }>} [options.pages] - Page definitions to validate.
 * @param {string[]} [options.supportedLanguages] - Ordered list of supported language codes (`en` must be present).
 * @returns {{ checkedKeysPerLocale: number, checkedLocales: number, checkedMarkdownFiles: number, errors: string[] }} Aggregated verification report.
 * @see {@link ./verify-locales.test.mjs Unit Tests}
 */
export function verifyLocales({
	localesDir = DEFAULT_LOCALES_DIR,
	pages = getAllPages(),
	supportedLanguages = SUPPORTED_LANGUAGES,
} = {}) {
	/** @type {string[]} */
	const errors = [];
	const enJsonPath = path.join(localesDir, "en", "translation.json");

	if (!fs.existsSync(enJsonPath)) {
		return {
			checkedKeysPerLocale: 0,
			checkedLocales: 0,
			checkedMarkdownFiles: 0,
			errors: [`Missing source English bundle: ${enJsonPath}`],
		};
	}

	/** @type {Record<string, unknown>} */
	let enBundle;

	try {
		enBundle = JSON.parse(fs.readFileSync(enJsonPath, "utf8"));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);

		return {
			checkedKeysPerLocale: 0,
			checkedLocales: 0,
			checkedMarkdownFiles: 0,
			errors: [`Invalid JSON in ${enJsonPath}: ${message}`],
		};
	}

	const { errors: enFlattenErrors, flat: enFlat } = flattenLocaleBundle(enBundle);

	for (const err of enFlattenErrors) {
		errors.push(`[en/translation.json] ${err}`);
	}

	validateSourceBundleSafeguards(enBundle, enFlat, errors);

	const enKeys = Object.keys(enFlat);
	const enKeySet = new Set(enKeys);
	let checkedLocales = 1;

	for (const lang of supportedLanguages) {
		if (lang === "en") continue;

		checkedLocales += 1;
		const targetPath = path.join(localesDir, lang, "translation.json");

		if (!fs.existsSync(targetPath)) {
			errors.push(`[${lang}/translation.json] Missing locale bundle file.`);
			continue;
		}

		/** @type {Record<string, unknown>} */
		let targetBundle;

		try {
			targetBundle = JSON.parse(fs.readFileSync(targetPath, "utf8"));
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			errors.push(`[${lang}/translation.json] Invalid JSON: ${message}`);
			continue;
		}

		validateTargetArrayShapes(enBundle, targetBundle, lang, errors);

		const { errors: flattenErrors, flat: targetFlat } = flattenLocaleBundle(targetBundle);

		for (const err of flattenErrors) {
			errors.push(`[${lang}/translation.json] ${err}`);
		}

		for (const key of enKeys) {
			if (!Object.prototype.hasOwnProperty.call(targetFlat, key)) {
				errors.push(`[${lang}/translation.json] Missing key "${key}".`);
				continue;
			}

			validateKeyParity(lang, key, enFlat[key], targetFlat[key], errors);
		}

		for (const key of Object.keys(targetFlat)) {
			if (!enKeySet.has(key)) {
				errors.push(`[${lang}/translation.json] Unexpected extra key "${key}".`);
			}
		}
	}

	const checkedMarkdownFiles = validateMarkdownDocuments({
		errors,
		localesDir,
		pages,
		supportedLanguages,
	});

	return {
		checkedKeysPerLocale: enKeys.length,
		checkedLocales,
		checkedMarkdownFiles,
		errors,
	};
}

/**
 * Validates `<Trans>`/HTML tags, `{{interpolation}}` tokens, emptiness, and SEO title rules for a single key.
 *
 * @param {string} lang - Target language code.
 * @param {string} key - Flattened dot/bracket key path.
 * @param {string} enValue - Source English string value.
 * @param {string} targetValue - Target localized string value.
 * @param {string[]} errors - Mutable error accumulator.
 * @returns {void}
 */
function validateKeyParity(lang, key, enValue, targetValue, errors) {
	if (enValue.trim().length > 0 && targetValue.trim().length === 0) {
		errors.push(`[${lang}/translation.json] Empty translation for "${key}".`);
	}

	const enTagInfo = extractInlineTags(enValue);
	const targetTagInfo = extractInlineTags(targetValue);

	if (!targetTagInfo.balanced) {
		errors.push(
			`[${lang}/translation.json] Unbalanced inline tag in "${key}": ${targetTagInfo.unbalancedDetail}.`,
		);
	}

	const sortedEnTags = [...enTagInfo.tokens].sort().join(" ");
	const sortedTargetTags = [...targetTagInfo.tokens].sort().join(" ");

	if (sortedEnTags !== sortedTargetTags) {
		errors.push(
			`[${lang}/translation.json] Inline tag mismatch in "${key}": expected [${enTagInfo.tokens.join(", ")}], received [${targetTagInfo.tokens.join(", ")}].`,
		);
	}

	const enVars = extractInterpolations(enValue).join(", ");
	const targetVars = extractInterpolations(targetValue).join(", ");

	if (enVars !== targetVars) {
		errors.push(
			`[${lang}/translation.json] Interpolation mismatch in "${key}": expected [${enVars}], received [${targetVars}].`,
		);
	}

	if (/^seo\.[a-zA-Z]+PageTitle$/.test(key) && targetValue.includes("—")) {
		errors.push(
			`[${lang}/translation.json] Disallowed em-dash (—) in SEO title "${key}": "${targetValue}".`,
		);
	}
}

/**
 * Validates Localized Route Documents (`*.md`) declared in `PAGE_REGISTRY` across content languages.
 *
 * @param {object} params - Validation inputs.
 * @param {string[]} params.errors - Mutable error accumulator.
 * @param {string} params.localesDir - Root locales directory.
 * @param {Array<{ contentLanguages?: readonly string[], id: string, markdownFileName?: string }>} params.pages - Registered pages.
 * @param {string[]} params.supportedLanguages - Supported ISO language codes.
 * @returns {number} Count of Markdown files checked.
 */
function validateMarkdownDocuments({ errors, localesDir, pages, supportedLanguages }) {
	let checkedFiles = 0;

	for (const page of pages) {
		if (!page.markdownFileName) continue;

		const fileName = `${page.markdownFileName}.md`;
		const enMdPath = path.join(localesDir, "en", fileName);

		if (!fs.existsSync(enMdPath)) {
			errors.push(`[en/${fileName}] Missing source Markdown document.`);
			continue;
		}

		const enMd = fs.readFileSync(enMdPath, "utf8");
		checkedFiles += 1;

		if (enMd.trim().length === 0) {
			errors.push(`[en/${fileName}] Source Markdown document is empty.`);
		}

		for (const violation of findMarkdownHeadingEmDashes(enMd)) {
			errors.push(
				`[en/${fileName}:${violation.line}] Disallowed em-dash (—) in heading: "${violation.text}".`,
			);
		}

		const enRadix = [...(enMd.match(RADIX_ICON_REGEX) ?? [])].sort();
		const enYoutube = [...(enMd.match(YOUTUBE_SHORTCODE_REGEX) ?? [])].sort();
		const contentLanguages = getPageContentLanguages(
			/** @type {import("../shared/page-registry.js").PageDefinition} */ (page),
			supportedLanguages,
		);

		for (const lang of contentLanguages) {
			if (lang === "en") continue;

			const targetMdPath = path.join(localesDir, lang, fileName);

			if (!fs.existsSync(targetMdPath)) {
				errors.push(`[${lang}/${fileName}] Missing localized Markdown document.`);
				continue;
			}

			const targetMd = fs.readFileSync(targetMdPath, "utf8");
			checkedFiles += 1;

			if (targetMd.trim().length === 0) {
				errors.push(`[${lang}/${fileName}] Localized Markdown document is empty.`);
			}

			for (const violation of findMarkdownHeadingEmDashes(targetMd)) {
				errors.push(
					`[${lang}/${fileName}:${violation.line}] Disallowed em-dash (—) in heading: "${violation.text}".`,
				);
			}

			const targetRadix = [...(targetMd.match(RADIX_ICON_REGEX) ?? [])].sort();

			if (enRadix.join("|") !== targetRadix.join("|")) {
				errors.push(
					`[${lang}/${fileName}] <radix-icon> mismatch vs en/${fileName}: expected ${enRadix.length} tag(s), received ${targetRadix.length}.`,
				);
			}

			const targetYoutube = [...(targetMd.match(YOUTUBE_SHORTCODE_REGEX) ?? [])].sort();

			if (enYoutube.join("|") !== targetYoutube.join("|")) {
				errors.push(
					`[${lang}/${fileName}] [youtube:...] shortcode mismatch vs en/${fileName}: expected [${enYoutube.join(", ")}], received [${targetYoutube.join(", ")}].`,
				);
			}
		}
	}

	return checkedFiles;
}

/**
 * Validates source English bundle invariants (non-empty strings, balanced tags, array shapes, and SEO titles).
 *
 * @param {Record<string, unknown>} enBundle - Parsed `en/translation.json` object.
 * @param {Record<string, string>} enFlat - Flattened `en/translation.json` map.
 * @param {string[]} errors - Mutable error accumulator.
 * @returns {void}
 */
function validateSourceBundleSafeguards(enBundle, enFlat, errors) {
	const randomMessages = /** @type {{ randomMessages?: unknown } | undefined} */ (
		enBundle.messageSpinner
	)?.randomMessages;

	if (!Array.isArray(randomMessages) || randomMessages.length === 0) {
		errors.push(
			"[en/translation.json] messageSpinner.randomMessages must be a non-empty Array.",
		);
	}

	const featureList = /** @type {{ featureList?: unknown } | undefined} */ (enBundle.seo)
		?.featureList;

	if (!Array.isArray(featureList) || featureList.length === 0) {
		errors.push("[en/translation.json] seo.featureList must be a non-empty Array.");
	}

	for (const [key, value] of Object.entries(enFlat)) {
		if (value.trim().length === 0) {
			errors.push(`[en/translation.json] Empty source string for "${key}".`);
		}

		const tagInfo = extractInlineTags(value);

		if (!tagInfo.balanced) {
			errors.push(
				`[en/translation.json] Unbalanced inline tag in "${key}": ${tagInfo.unbalancedDetail}.`,
			);
		}

		if (/^seo\.[a-zA-Z]+PageTitle$/.test(key) && value.includes("—")) {
			errors.push(
				`[en/translation.json] Disallowed em-dash (—) in SEO title "${key}": "${value}".`,
			);
		}
	}
}

/**
 * Verifies that required array structures (`messageSpinner.randomMessages`, `seo.featureList`) remain arrays in target locales.
 *
 * @param {Record<string, unknown>} enBundle - Source English bundle.
 * @param {Record<string, unknown>} targetBundle - Target locale bundle.
 * @param {string} lang - Target language code.
 * @param {string[]} errors - Mutable error accumulator.
 * @returns {void}
 */
function validateTargetArrayShapes(enBundle, targetBundle, lang, errors) {
	const enRandom = /** @type {{ randomMessages?: unknown } | undefined} */ (
		enBundle.messageSpinner
	)?.randomMessages;
	const targetRandom = /** @type {{ randomMessages?: unknown } | undefined} */ (
		targetBundle.messageSpinner
	)?.randomMessages;

	if (Array.isArray(enRandom)) {
		if (!Array.isArray(targetRandom)) {
			errors.push(
				`[${lang}/translation.json] messageSpinner.randomMessages must be an Array (received ${typeof targetRandom}).`,
			);
		} else if (targetRandom.length !== enRandom.length) {
			errors.push(
				`[${lang}/translation.json] messageSpinner.randomMessages length mismatch: expected ${enRandom.length}, received ${targetRandom.length}.`,
			);
		}
	}

	const enFeatures = /** @type {{ featureList?: unknown } | undefined} */ (enBundle.seo)
		?.featureList;
	const targetFeatures = /** @type {{ featureList?: unknown } | undefined} */ (targetBundle.seo)
		?.featureList;

	if (Array.isArray(enFeatures)) {
		if (!Array.isArray(targetFeatures)) {
			errors.push(
				`[${lang}/translation.json] seo.featureList must be an Array (received ${typeof targetFeatures}).`,
			);
		} else if (targetFeatures.length !== enFeatures.length) {
			errors.push(
				`[${lang}/translation.json] seo.featureList length mismatch: expected ${enFeatures.length}, received ${targetFeatures.length}.`,
			);
		}
	}
}

if (import.meta.main) {
	const { checkedKeysPerLocale, checkedLocales, checkedMarkdownFiles, errors } = verifyLocales();

	if (errors.length > 0) {
		console.error(`\n❌ Locale verification failed with ${errors.length} error(s):\n`);

		for (const err of errors) {
			console.error(`  • ${err}`);
		}

		process.exit(1);
	}

	console.log(
		`✓ Verified ${checkedLocales} locale(s) (${checkedKeysPerLocale} keys/locale) and ${checkedMarkdownFiles} Markdown document(s).`,
	);
}
