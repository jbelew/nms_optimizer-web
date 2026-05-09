#!/usr/bin/env node

/**
 * Generate optimized Radix UI color CSS files without P3 color definitions
 * This reduces file size by ~50% while maintaining full sRGB support
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// Colors we're using in main.tsx
const colors = [
	"cyan",
	"slate",
	"sage",
	"purple",
	"amber",
	"blue",
	"crimson",
	"green",
	"iris",
	"jade",
	"orange",
	"red",
	"sky",
	"teal",
	"yellow",
];

const outputDir = join(projectRoot, "src/assets/css/radix-colors");

/**
 * Strip P3 color definitions, light mode colors, and light color-schemes
 * Keep only dark mode colors since the app uses appearance="dark"
 * @param {string} css - Original CSS content
 * @returns {string} Optimized CSS
 */
function optimizeCss(css) {
	// First, remove P3 @supports blocks
	let result = css.replace(
		/@supports \(color: color\(display-p3[^}]+\)\) \{[\s\S]*?\n\}(?=\n|$)/gm,
		""
	);

	// Remove light mode colors (everything from ':root, .light' to the closing brace)
	result = result.replace(/:root,\s*\.light,\s*\.light-theme\s*\{[\s\S]*?\n\}(?:\n|$)/m, "");

	// Remove color-scheme: light blocks
	result = result.replace(/\.radix-themes:where\(\.light, \.light-theme\)[^{]*\{[\s\S]*?\n\}(?:\n|$)/g, "");

	return result;
}

const ALL_RADIX_COLORS = [
	"gray", "gold", "bronze", "brown", "yellow", "amber", "orange", "tomato", 
	"red", "ruby", "crimson", "pink", "plum", "purple", "violet", "iris", 
	"indigo", "blue", "cyan", "teal", "jade", "green", "grass", "lime", 
	"mint", "sky", "mauve", "slate", "sage", "olive", "sand"
];

console.log("Generating optimized Radix UI color files...\n");

let totalOriginalSize = 0;
let totalOptimizedSize = 0;
const optimizedColorContents = [];

// 1. Process base tokens (black-a, white-a, transparent, etc)
const baseInputPath = join(projectRoot, "node_modules/@radix-ui/themes/tokens/base.css");

try {
	const baseCss = readFileSync(baseInputPath, "utf-8");
	// Apply full optimization to base.css as well
	let optimizedBaseCss = optimizeCss(baseCss);

	// Strip unused accent colors and gray colors from base.css to save space
	for (const color of ALL_RADIX_COLORS) {
		if (!colors.includes(color)) {
			// We always want to preserve the 'gray' accent block because components 
			// might use color="gray" which maps to the configured grayColor (e.g. slate)
			if (color !== "gray") {
				// Remove [data-accent-color='color'] block
				const accentRegex = new RegExp(`\\[data-accent-color=['"]${color}['"]\\]\\s*\\{[\\s\\S]*?\\n\\}(?:\\n|$)`, "g");
				optimizedBaseCss = optimizedBaseCss.replace(accentRegex, "");
			}
			
			// Remove .radix-themes:where([data-gray-color='color']) block
			const grayRegex = new RegExp(`\\.radix-themes:where\\(\\[data-gray-color=['"]${color}['"]\\]\\)\\s*\\{[\\s\\S]*?\\n\\}(?:\\n|$)`, "g");
			optimizedBaseCss = optimizedBaseCss.replace(grayRegex, "");
		}
	}

	optimizedColorContents.push(optimizedBaseCss);
	console.log(`✓ base.css optimized`);
} catch (error) {
	console.error(`✗ base.css: ${error.message}`);
}

// 2. Process specific colors
for (const color of colors) {
	const inputPath = join(projectRoot, `node_modules/@radix-ui/themes/tokens/colors/${color}.css`);

	try {
		const originalCss = readFileSync(inputPath, "utf-8");
		const optimizedCss = optimizeCss(originalCss);

		optimizedColorContents.push(optimizedCss);

		const originalSize = Buffer.byteLength(originalCss, "utf-8");
		const optimizedSize = Buffer.byteLength(optimizedCss, "utf-8");
		const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

		totalOriginalSize += originalSize;
		totalOptimizedSize += optimizedSize;

		console.log(
			`✓ ${color.padEnd(10)} ${originalSize} → ${optimizedSize} bytes (${savings}% reduction)`
		);
	} catch (error) {
		console.error(`✗ ${color}: ${error.message}`);
	}
}

// Generate concatenated file for production use
const concatenatedPath = join(outputDir, "radix-colors.css");
const concatenatedContent = optimizedColorContents.join("\n");
writeFileSync(concatenatedPath, concatenatedContent);

const totalSavings = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
console.log(
	`\n✨ Total: ${totalOriginalSize} → ${totalOptimizedSize} bytes (${totalSavings}% reduction)`
);
console.log(`📦 Saved ${totalOriginalSize - totalOptimizedSize} bytes from color CSS`);
console.log(
	`\n✓ Generated concatenated file: radix-colors.css (${optimizedColorContents.length} colors)\n`
);
