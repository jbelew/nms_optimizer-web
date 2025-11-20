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
 * Strip P3 color definitions and light mode colors from CSS content
 * Keep only dark mode colors since the app uses appearance="dark"
 * @param {string} css - Original CSS content
 * @returns {string} CSS with only dark mode colors
 */
function stripP3Colors(css) {
	// First, remove P3 @supports blocks
	let result = css.replace(
		/@supports \(color: color\(display-p3[^}]+\)\) \{[\s\S]*?\n\}(?=\n|$)/gm,
		""
	);

	// Remove light mode colors (everything from ':root, .light' to the closing brace before '.dark')
	result = result.replace(/:root,\s*\.light,\s*\.light-theme\s*\{[\s\S]*?\n\}\n\n/m, "");

	return result;
}

console.log("Generating optimized Radix UI color files...\n");

let totalOriginalSize = 0;
let totalOptimizedSize = 0;

for (const color of colors) {
	const inputPath = join(projectRoot, `node_modules/@radix-ui/themes/tokens/colors/${color}.css`);
	const outputPath = join(outputDir, `${color}.css`);

	try {
		const originalCss = readFileSync(inputPath, "utf-8");
		const optimizedCss = stripP3Colors(originalCss);

		writeFileSync(outputPath, optimizedCss);

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

const totalSavings = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);
console.log(
	`\n✨ Total: ${totalOriginalSize} → ${totalOptimizedSize} bytes (${totalSavings}% reduction)`
);
console.log(`📦 Saved ${totalOriginalSize - totalOptimizedSize} bytes from color CSS\n`);
