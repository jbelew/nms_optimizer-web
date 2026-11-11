import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "bun:test";

import {
	extractInlineTags,
	extractInterpolations,
	findMarkdownHeadingEmDashes,
	verifyLocales,
} from "./verify-locales.mjs";

/**
 * Builds a minimal valid locale fixture tree (`en` + `es`) inside a temporary directory.
 *
 * @param {string[]} tempDirs - Cleanup tracker array.
 * @returns {string} Absolute path to the temporary `locales` directory.
 */
function createValidFixture(tempDirs) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-locales-test-"));
	tempDirs.push(dir);

	const enDir = path.join(dir, "en");
	const esDir = path.join(dir, "es");
	fs.mkdirSync(enDir, { recursive: true });
	fs.mkdirSync(esDir, { recursive: true });

	const baseEnJson = {
		dialogs: {
			welcome: {
				item1: "Select a <strong>Platform Type</strong> with <icon/>.",
			},
		},
		gridTable: {
			cellAriaLabel: "Row {{row}}, Column {{col}}: {{content}}",
		},
		messageSpinner: {
			randomMessages: ["-(( Asking the Atlas! ))-", "-(( Polishing chrome! ))-"],
		},
		seo: {
			aboutPageTitle: "About the Optimization Algorithms",
			featureList: ["Simulated annealing", "Offline PWA"],
			mainPageTitle: "No Man's Sky Tech Layout Calculator",
		},
	};

	const baseEsJson = {
		dialogs: {
			welcome: {
				item1: "Selecciona un <strong>Tipo de plataforma</strong> con <icon/>.",
			},
		},
		gridTable: {
			cellAriaLabel: "Fila {{row}}, columna {{col}}: {{content}}",
		},
		messageSpinner: {
			randomMessages: ["-(( ¡Consultando al Atlas! ))-", "-(( ¡Puliendo el cromo! ))-"],
		},
		seo: {
			aboutPageTitle: "Acerca de los algoritmos de optimización",
			featureList: ["Recocido simulado", "PWA sin conexión"],
			mainPageTitle: "Calculadora de diseños tecnológicos de No Man's Sky",
		},
	};

	fs.writeFileSync(
		path.join(enDir, "translation.json"),
		JSON.stringify(baseEnJson, null, "\t"),
		"utf8",
	);
	fs.writeFileSync(
		path.join(esDir, "translation.json"),
		JSON.stringify(baseEsJson, null, "\t"),
		"utf8",
	);

	const enInstructions = `# Instructions\n\nClick <radix-icon name="GearIcon" size="20"></radix-icon> and watch:\n\n[youtube:abc123 | Demo]\n`;
	const esInstructions = `# Instrucciones\n\nPulsa <radix-icon name="GearIcon" size="20"></radix-icon> y mira:\n\n[youtube:abc123 | Demo]\n`;

	fs.writeFileSync(path.join(enDir, "instructions.md"), enInstructions, "utf8");
	fs.writeFileSync(path.join(esDir, "instructions.md"), esInstructions, "utf8");
	fs.writeFileSync(
		path.join(enDir, "changelog.md"),
		"# Changelog\n\n- Initial release\n",
		"utf8",
	);

	return dir;
}

const TEST_PAGES = [
	{ id: "instructions", markdownFileName: "instructions" },
	{ contentLanguages: ["en"], id: "changelog", markdownFileName: "changelog" },
];

describe("verify-locales.mjs", () => {
	/** @type {string[]} */
	const tempDirs = [];

	afterEach(() => {
		while (tempDirs.length > 0) {
			const dir = tempDirs.pop();

			if (dir && fs.existsSync(dir)) {
				fs.rmSync(dir, { force: true, recursive: true });
			}
		}
	});

	it("passes on the live repository locale bundles and Markdown route documents", () => {
		const report = verifyLocales();
		expect(report.errors).toEqual([]);
		expect(report.checkedLocales).toBeGreaterThanOrEqual(6);
		expect(report.checkedKeysPerLocale).toBeGreaterThan(600);
	});

	it("extracts balanced inline tags and normalizes tag attributes", () => {
		const parsed = extractInlineTags(
			'<p style="margin-top: .5rem">Use <1>Forced Solve</1> and <icon/>.</p>',
		);
		expect(parsed.balanced).toBe(true);
		expect(parsed.tokens).toEqual(["<p>", "<1>", "</1>", "<icon/>", "</p>"]);
	});

	it("flags unbalanced inline tags", () => {
		const parsed = extractInlineTags("Press <strong>Forced Solve</1> now.");
		expect(parsed.balanced).toBe(false);
		expect(parsed.unbalancedDetail).toContain("expected </strong> before </1>");
	});

	it("extracts sorted interpolation placeholder names", () => {
		expect(extractInterpolations("Window {{width}}×{{height}} for {{tech}}")).toEqual([
			"height",
			"tech",
			"width",
		]);
	});

	it("detects em-dashes in Markdown headings while ignoring fenced code blocks", () => {
		const md = [
			"# Clean Heading: Subheading",
			"Body paragraph — em-dash in prose is allowed.",
			"```md",
			"# Ignored — Inside Code Block",
			"```",
			"## Bad Heading — Em-Dash",
		].join("\n");

		expect(findMarkdownHeadingEmDashes(md)).toEqual([
			{ line: 6, text: "## Bad Heading — Em-Dash" },
		]);
	});

	it("passes on a valid multi-locale fixture with English-only changelog fallback", () => {
		const localesDir = createValidFixture(tempDirs);
		const report = verifyLocales({
			localesDir,
			pages: TEST_PAGES,
			supportedLanguages: ["en", "es"],
		});

		expect(report.errors).toEqual([]);
		expect(report.checkedLocales).toBe(2);
		expect(report.checkedMarkdownFiles).toBe(3);
	});

	it("reports missing keys, extra keys, broken randomMessages arrays, tag mismatches, interpolation mismatches, and SEO title em-dashes", () => {
		const localesDir = createValidFixture(tempDirs);
		const brokenEs = {
			dialogs: {
				welcome: {
					item1: "Selecciona un <span>Tipo de plataforma</span>.",
				},
			},
			extraOrphan: "No debería existir",
			gridTable: {
				cellAriaLabel: "Fila {{row}}, columna {{col}}",
			},
			messageSpinner: {
				randomMessages: { 0: "Objeto roto en vez de array" },
			},
			seo: {
				featureList: ["Solo uno"],
				mainPageTitle: "NMS Optimizer — Título con raya",
			},
		};

		fs.writeFileSync(
			path.join(localesDir, "es", "translation.json"),
			JSON.stringify(brokenEs, null, "\t"),
			"utf8",
		);

		const report = verifyLocales({
			localesDir,
			pages: TEST_PAGES,
			supportedLanguages: ["en", "es"],
		});

		expect(report.errors.some((e) => e.includes('Missing key "seo.aboutPageTitle"'))).toBe(
			true,
		);
		expect(report.errors.some((e) => e.includes('Unexpected extra key "extraOrphan"'))).toBe(
			true,
		);
		expect(
			report.errors.some((e) => e.includes("messageSpinner.randomMessages must be an Array")),
		).toBe(true);
		expect(report.errors.some((e) => e.includes("seo.featureList length mismatch"))).toBe(true);
		expect(
			report.errors.some((e) => e.includes('Inline tag mismatch in "dialogs.welcome.item1"')),
		).toBe(true);
		expect(
			report.errors.some((e) =>
				e.includes('Interpolation mismatch in "gridTable.cellAriaLabel"'),
			),
		).toBe(true);
		expect(
			report.errors.some((e) =>
				e.includes('Disallowed em-dash (—) in SEO title "seo.mainPageTitle"'),
			),
		).toBe(true);
	});

	it("reports Markdown <radix-icon>, [youtube:...], and heading em-dash violations", () => {
		const localesDir = createValidFixture(tempDirs);
		fs.writeFileSync(
			path.join(localesDir, "es", "instructions.md"),
			"# Instrucciones — Guía\n\nSin icono ni vídeo.\n",
			"utf8",
		);

		const report = verifyLocales({
			localesDir,
			pages: TEST_PAGES,
			supportedLanguages: ["en", "es"],
		});

		expect(
			report.errors.some((e) => e.includes("[es/instructions.md:1] Disallowed em-dash")),
		).toBe(true);
		expect(
			report.errors.some((e) => e.includes("[es/instructions.md] <radix-icon> mismatch")),
		).toBe(true);
		expect(
			report.errors.some((e) =>
				e.includes("[es/instructions.md] [youtube:...] shortcode mismatch"),
			),
		).toBe(true);
	});
});
