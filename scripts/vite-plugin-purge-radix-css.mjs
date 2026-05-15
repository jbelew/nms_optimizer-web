/**
 * @file Vite plugin to purge unused Radix Themes component CSS at build time.
 *
 * @remarks
 * Radix Themes ships a monolithic `components.css` (~432 KB) containing styles
 * for every component in the library. This plugin strips CSS rule blocks for
 * components that are not imported anywhere in the application source code.
 *
 * The plugin operates on the final CSS bundle output (post-minification), so it
 * works regardless of how the CSS is imported or bundled. It identifies Radix
 * Themes CSS by the `.rt-` class prefix convention and removes entire rule blocks
 * that only reference unused component class prefixes.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { purgeRadixCss } from "./scripts/vite-plugin-purge-radix-css.mjs";
 * export default defineConfig({
 *   plugins: [purgeRadixCss()],
 * });
 * ```
 */

import fs from "fs";
import path from "path";

/**
 * Maps Radix Themes component names to their CSS class prefixes in `components.css`.
 *
 * Each key is a component name as exported from `@radix-ui/themes`.
 * Each value is an array of `.rt-*` class prefixes used by that component.
 *
 * Components that share base classes (e.g., Dialog uses BaseDialog*, DropdownMenu
 * uses BaseMenu*) have their shared prefixes listed under the component that uses them.
 *
 * @type {Record<string, string[]>}
 */
const COMPONENT_CSS_MAP = {
	// --- Components NOT typically used (candidates for removal) ---
	Badge: ["Badge"],
	Card: ["Card", "BaseCard"],
	Checkbox: ["CheckboxRoot", "BaseCheckboxRoot", "BaseCheckboxIndicator"],
	CheckboxCards: ["CheckboxCardCheckbox", "CheckboxCardsItem", "CheckboxCardsRoot"],
	CheckboxGroup: [
		"CheckboxGroupItem",
		"CheckboxGroupItemCheckbox",
		"CheckboxGroupItemInner",
		"CheckboxGroupRoot",
	],
	Container: ["Container", "ContainerInner"],
	ContextMenu: ["ContextMenuContent"],
	Em: ["Em"],
	// Note: "Grid" here is the Radix layout component, not the app's GridTable
	GridLayout: ["Grid"],
	HoverCard: ["HoverCardContent"],
	Inset: ["Inset"],
	Quote: ["Quote"],
	RadioCards: ["RadioCardsItem", "RadioCardsRoot"],
	RadioGroup: ["RadioGroupItem", "RadioGroupItemInner", "RadioGroupRoot", "BaseRadioRoot"],
	Section: ["Section"],
	SegmentedControl: [
		"SegmentedControlIndicator",
		"SegmentedControlItem",
		"SegmentedControlItemLabel",
		"SegmentedControlItemLabelActive",
		"SegmentedControlItemLabelInactive",
		"SegmentedControlItemSeparator",
		"SegmentedControlRoot",
	],
	Select: [
		"SelectContent",
		"SelectIcon",
		"SelectItem",
		"SelectItemIndicator",
		"SelectItemIndicatorIcon",
		"SelectLabel",
		"SelectSeparator",
		"SelectTrigger",
		"SelectTriggerInner",
		"SelectViewport",
	],
	Slider: ["SliderRange", "SliderRoot", "SliderThumb", "SliderTrack"],
	Strong: ["Strong"],
	Table: [
		"TableBody",
		"TableCell",
		"TableColumnHeaderCell",
		"TableHeader",
		"TableRoot",
		"TableRootTable",
		"TableRow",
		"TableRowHeaderCell",
	],
	TabNav: [
		"TabNavItem",
		"TabNavLink",
		"BaseTabList",
		"BaseTabListTrigger",
		"BaseTabListTriggerInner",
		"BaseTabListTriggerInnerHidden",
	],
	Tabs: ["TabsContent"],
	ThemePanel: [
		"ThemePanelRadioCard",
		"ThemePanelRadioCardInput",
		"ThemePanelShortcut",
		"ThemePanelSwatch",
		"ThemePanelSwatchInput",
	],
};

/**
 * Vite plugin that removes unused Radix Themes component CSS from the production build.
 *
 * @remarks
 * The plugin runs in the `generateBundle` hook (production builds only) and processes
 * all CSS assets in the output bundle. It scans `src/` for Radix Themes imports to
 * determine which components are used, then strips CSS rules for unused components.
 *
 * This is safe because:
 * 1. It only removes rules where ALL `.rt-*` selectors reference unused components.
 * 2. Shared base classes (like `.rt-reset`) are never removed.
 * 3. Responsive/utility classes (`.rt-r-*`) are never removed.
 *
 * @returns {import("vite").Plugin} The Vite plugin object.
 */
export function purgeRadixCss() {
	let srcDir;

	return {
		configResolved(config) {
			srcDir = path.resolve(config.root, "src");
		},
		enforce: "post",

		generateBundle(_options, bundle) {
			// Scan source for used Radix components
			const usedComponents = scanUsedRadixComponents(srcDir);
			const unusedPrefixes = buildUnusedPrefixes(usedComponents);

			if (unusedPrefixes.size === 0) {
				console.log("[purge-radix-css] All Radix components are in use, nothing to purge.");

				return;
			}

			let totalRemoved = 0;
			let totalOriginal = 0;

			// Process all CSS assets in the bundle
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (chunk.type === "asset" && fileName.endsWith(".css")) {
					const originalSize = chunk.source.length;
					const { css, removedBytes } = purgeUnusedRadixRules(
						chunk.source.toString(),
						unusedPrefixes,
					);

					if (removedBytes > 0) {
						chunk.source = css;
						totalRemoved += removedBytes;
						totalOriginal += originalSize;
					}
				}
			}

			if (totalRemoved > 0) {
				const pct = ((totalRemoved / totalOriginal) * 100).toFixed(1);

				console.log(
					`[purge-radix-css] Removed ${(totalRemoved / 1024).toFixed(1)} KB of unused Radix CSS (${pct}% reduction)`,
				);
				console.log(
					`[purge-radix-css] Used components: ${[...usedComponents].sort().join(", ")}`,
				);
			}
		},

		name: "purge-radix-css",
	};
}

/**
 * Builds the set of CSS class prefixes that should be removed.
 *
 * @param {Set<string>} usedComponents - Set of component names actually imported.
 *
 * @returns {Set<string>} Set of `.rt-*` class prefixes to strip from CSS.
 */
function buildUnusedPrefixes(usedComponents) {
	const unused = new Set();

	for (const [component, prefixes] of Object.entries(COMPONENT_CSS_MAP)) {
		if (!usedComponents.has(component)) {
			for (const prefix of prefixes) {
				unused.add(prefix);
			}
		}
	}

	return unused;
}

/**
 * Removes CSS rule blocks that only reference unused Radix component classes.
 *
 * @remarks
 * This function parses minified CSS and removes complete rule blocks (selector + body)
 * where ALL `.rt-*` class references in the selector belong to unused components.
 * Rules that mix used and unused component classes are preserved to avoid breakage.
 *
 * @param {string} css - The CSS string to process.
 * @param {Set<string>} unusedPrefixes - Set of `.rt-` prefixes to strip.
 *
 * @returns {{ css: string, removedBytes: number }} The purged CSS and bytes removed.
 */
function purgeUnusedRadixRules(css, unusedPrefixes) {
	if (unusedPrefixes.size === 0) {
		return { css, removedBytes: 0 };
	}

	const originalLength = css.length;

	// Split CSS into rule blocks by finding balanced braces.
	// For minified CSS, we need to handle nested @media blocks.
	const result = [];
	let i = 0;

	while (i < css.length) {
		// Check if this is an @-rule (like @media, @supports)
		if (css[i] === "@") {
			const openBrace = css.indexOf("{", i);

			if (openBrace === -1) {
				result.push(css.slice(i));
				break;
			}

			// For @media rules, we need to process inner rules
			const atRule = css.slice(i, openBrace + 1);

			// Find the matching closing brace
			let depth = 1;
			let j = openBrace + 1;

			while (j < css.length && depth > 0) {
				if (css[j] === "{") depth++;
				else if (css[j] === "}") depth--;
				j++;
			}

			// Process the inner content recursively
			const innerContent = css.slice(openBrace + 1, j - 1);
			const purgedInner = purgeUnusedRadixRules(innerContent, unusedPrefixes);

			if (purgedInner.css.trim()) {
				result.push(atRule + purgedInner.css + "}");
			}

			i = j;
			continue;
		}

		// Regular rule: find selector { ... }
		const openBrace = css.indexOf("{", i);

		if (openBrace === -1) {
			result.push(css.slice(i));
			break;
		}

		const selector = css.slice(i, openBrace);

		// Find matching close brace (no nesting for regular rules)
		const closeBrace = css.indexOf("}", openBrace);

		if (closeBrace === -1) {
			result.push(css.slice(i));
			break;
		}

		const fullRule = css.slice(i, closeBrace + 1);

		// Check if this rule's selector references Radix component classes
		const rtRefs = [...selector.matchAll(/\.rt-([A-Z][a-zA-Z]+)/g)].map((m) => m[1]);

		if (rtRefs.length > 0 && rtRefs.every((ref) => unusedPrefixes.has(ref))) {
			// All .rt- references in this selector are for unused components — skip it
		} else {
			result.push(fullRule);
		}

		i = closeBrace + 1;
	}

	const purgedCss = result.join("");

	return {
		css: purgedCss,
		removedBytes: originalLength - purgedCss.length,
	};
}

/**
 * Scans the source directory for Radix Themes component imports and returns
 * the set of component names that are actually used.
 *
 * @param {string} srcDir - Absolute path to the source directory to scan.
 *
 * @returns {Set<string>} Set of Radix Themes component names found in imports.
 */
function scanUsedRadixComponents(srcDir) {
	const used = new Set();

	/**
	 * Recursively walks a directory and processes .ts/.tsx files.
	 *
	 * @param {string} dir - Directory to walk.
	 */
	function walk(dir) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory() && entry.name !== "node_modules") {
				walk(fullPath);
			} else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
				const content = fs.readFileSync(fullPath, "utf-8");
				// Use a global regex to match single and multi-line imports
				const importPattern = /import\s*\{([^}]+)\}\s*from\s+["']@radix-ui\/themes["']/g;
				let match;

				while ((match = importPattern.exec(content)) !== null) {
					match[1].split(",").forEach((name) => {
						const trimmed = name.replace(/\s+as\s+\w+/, "").trim();

						if (trimmed && !trimmed.startsWith("type ")) {
							used.add(trimmed);
						}
					});
				}
			}
		}
	}

	walk(srcDir);

	return used;
}
