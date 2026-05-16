// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import perfectionist from "eslint-plugin-perfectionist";

import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Industry-standard blank line rules
 * (used widely in TS/React teams for clean readability)
 *
 * Note: padding-line-between-statements can only check statement types, not multiline detection.
 * For variable declarations, we rely on developer judgment—group single-line consts/lets/vars
 * together, and add blank lines before blocks/returns/exports as shown below.
 */
const blankLineRules = {
	"no-multiple-empty-lines": ["error", { max: 1, maxBOF: 1, maxEOF: 1 }],

	"padding-line-between-statements": [
		"error",

		// Import spacing: one blank line after imports, never multiple
		{ blankLine: "always", next: "*", prev: "import" },
		{ blankLine: "any", next: "import", prev: "import" },

		// Blank line before exports
		{ blankLine: "always", next: "export", prev: "*" },

		// Blank line before and after blocks (if/else/loops/functions)
		{ blankLine: "always", next: "*", prev: "block-like" },
		{ blankLine: "always", next: "block-like", prev: "*" },

		// Blank line before return (helps structure logic)
		{ blankLine: "always", next: "return", prev: "*" },
	],
};

/**
 * Shared base for all file groups
 */
const shared = {
	extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
	languageOptions: {
		ecmaVersion: "latest",
		globals: {
			...globals.browser,
			...globals.node,
			...globals.serviceworker,
			HTMLRewriter: "readonly", // Cloudflare Workers/Pages global
		},
		parserOptions: {
			tsconfigRootDir: import.meta.dirname,
		},
	},
	plugins: {
		jsdoc,
		perfectionist,
		"react-hooks": reactHooks,
		"react-refresh": reactRefresh,
	},
	rules: {
		...reactHooks.configs.recommended.rules,
		"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		...blankLineRules,

		// TypeScript strict rules
		// Enforce `import type` for type-only imports — benefits React Compiler & tree-shakers
		"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
		"@typescript-eslint/no-explicit-any": "error",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
			},
		],
		// Perfectionist sorting rules
		...perfectionist.configs["recommended-natural"].rules,
		// These two are handled by @ianvs/prettier-plugin-sort-imports — disable to avoid conflict
		"perfectionist/sort-imports": "off",
		"perfectionist/sort-named-imports": "off",
	},
	settings: {
		jsdoc: {
			mode: "typescript",
		},
	},
};

/**
 * Agentic JSDoc rules - applied selectively to non-test/non-story files
 */
const jsdocRules = {
	"jsdoc/check-tag-names": [
		"warn",
		{
			definedTags: [
				"hook",
				"component",
				"remarks",
				"performance",
				"accessibility",
				"security",
				"category",
				"template",
				"default",
			],
		},
	],
	// Enforce {@link} instead of Markdown links for cross-references
	"jsdoc/no-undefined-types": [
		"warn",
		{
			definedTypes: [
				"JSX",
				"React",
				"TouchEvent",
				"MouseEvent",
				"KeyboardEvent",
				"ChangeEvent",
				"RequestInit",
				"ReactNode",
				"Ref",
				"MutableRefObject",
				"ComponentType",
				"SVGProps",
				"SVGSVGElement",
				"HTMLElement",
				"NodeJS",
			],
		},
	],
	"jsdoc/require-description": "warn",
	// Examples are added selectively by the agentic-jsdoc skill — blanket enforcement is too noisy
	"jsdoc/require-example": "off",
	"jsdoc/require-hyphen-before-param-description": "warn",
	"jsdoc/require-jsdoc": [
		"warn",
		{
			contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration"],
			enableFixer: false,
			publicOnly: true,
			require: {
				ArrowFunctionExpression: true,
				ClassDeclaration: true,
				FunctionDeclaration: true,
				MethodDefinition: true,
			},
		},
	],
	"jsdoc/require-param-description": "warn",
	// Types are handled by TypeScript, so don't enforce them in JSDoc (user preference)
	"jsdoc/require-param-type": "off",
	"jsdoc/require-returns-description": "warn",
	"jsdoc/require-returns-type": "off",
	"jsdoc/require-throws": "warn",
	"jsdoc/sort-tags": [
		"warn",
		{
			tagSequence: [
				{ tags: ["remarks"] },
				{ tags: ["typedef"] },
				{ tags: ["template"] },
				{ tags: ["param"] },
				{ tags: ["returns"] },
				{ tags: ["throws"] },
				{ tags: ["deprecated"] },
				{ tags: ["default"] },
				{ tags: ["see"] },
				{ tags: ["hook", "component"] },
				{ tags: ["category"] },
				{ tags: ["example"] },
			],
		},
	],
};

export default tseslint.config(
	//
	// --- GLOBAL IGNORES ---
	// Must be first in Flat Config
	//
	{
		ignores: [
			"**/dist/**",
			"**/node_modules/**",
			"**/coverage/**",
			"**/venv/**",
			"**/docs/**",
			"**/public/**",
			"**/storybook-static/**",
			"**/test-results/**",
			"**/playwright-report/**",
			"**/seo_report/**",
			"**/audio/**",
			"**/source_images/**",
			"**/tmp/**",
			"**/.wrangler/**",
			"**/.beads/**",
			"**/.lighthouseci/**",
			"**/.elsikora/**",
			"**/.git/**",
			"**/.gemini/**",
			"**/.vitest/**",
			"**/.playwright-mcp/**",
			"**/.agents/**",
			"**/scratch/**",
			// Declaration files are ambient — inline import() is intentional and correct here
			"**/*.d.ts",
		],
	},

	//
	// --- BUILD, UTILITY & SHARED SCRIPTS ---
	//
	{
		...shared,
		files: ["scripts/**/*.{js,mjs,cjs,ts}", "functions/**/*.{js,ts}", "shared/**/*.{js,ts}", "*.{js,mjs,cjs,ts}"],
		rules: {
			...shared.rules,
			"jsdoc/require-jsdoc": "off", // Optional for internal scripts
		},
	},

	//
	// --- MAIN SOURCE FILES (Business Logic & UI) ---
	//
	{
		...shared,
		files: ["src/**/*.{ts,tsx}"],
		ignores: ["**/*.test.tsx", "**/*.test.ts", "**/*.stories.tsx", "**/test-jsdoc.ts"],
		rules: {
			...shared.rules,
			...jsdocRules,
			// Disallow stray console.log in production source
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},

	//
	// --- TEST FILES & STORIES ---
	//
	{
		...shared,
		files: [
			"src/**/*.test.{ts,tsx}",
			"src/**/*.stories.tsx",
			"**/test-jsdoc.ts",
			"e2e-tests/**/*.{ts,js}",
			"__mocks__/**/*.{ts,tsx,js}",
			"vitest-mocks/**/*.{ts,js}",
		],
		rules: {
			...shared.rules,
			"jsdoc/require-description": "off",
			"jsdoc/require-example": "off",
			"jsdoc/require-jsdoc": "off",
			"react-refresh/only-export-components": "off",
		},
	},

	//
	// --- STORYBOOK CONFIG ---
	//
	{
		...shared,
		files: ["**/.storybook/**/*.{ts,tsx}"],
		rules: {
			...shared.rules,
			"jsdoc/require-jsdoc": "off",
		},
	},

	//
	// --- STORYBOOK'S OWN ESLINT RULESET ---
	//
	storybook.configs["flat/recommended"]
);
