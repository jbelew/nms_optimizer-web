// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

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
	"padding-line-between-statements": [
		"error",

		// Import spacing: one blank line after imports, never multiple
		{ blankLine: "always", prev: "import", next: "*" },
		{ blankLine: "any", prev: "import", next: "import" },

		// Blank line before exports
		{ blankLine: "always", prev: "*", next: "export" },

		// Blank line before and after blocks (if/else/loops/functions)
		{ blankLine: "always", prev: "block-like", next: "*" },
		{ blankLine: "always", prev: "*", next: "block-like" },

		// Blank line before return (helps structure logic)
		{ blankLine: "always", prev: "*", next: "return" },
	],

	"no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1, maxBOF: 1 }],
};

/**
 * Shared base for all file groups
 */
const shared = {
	extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
	languageOptions: {
		ecmaVersion: 2020,
		parserOptions: {
			tsconfigRootDir: import.meta.dirname,
		},
		globals: {
			...globals.browser,
			...globals.node,
		},
	},
	plugins: {
		"react-hooks": reactHooks,
		"react-refresh": reactRefresh,
		jsdoc,
	},
	settings: {
		jsdoc: {
			mode: "typescript",
		},
	},
	rules: {
		...reactHooks.configs.recommended.rules,
		"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		...blankLineRules,

		// TypeScript strict rules
		"@typescript-eslint/no-explicit-any": "error",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
	},
};

/**
 * Agentic JSDoc rules - applied selectively to non-test/non-story files
 */
const jsdocRules = {
	"jsdoc/require-jsdoc": [
		"warn",
		{
			enableFixer: false,
			publicOnly: true,
			require: {
				FunctionDeclaration: true,
				MethodDefinition: true,
				ClassDeclaration: true,
				ArrowFunctionExpression: true,
			},
			contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration"],
		},
	],
	"jsdoc/require-param-description": "warn",
	"jsdoc/require-returns-description": "warn",
	"jsdoc/require-example": "warn",
	"jsdoc/require-description": "warn",
	"jsdoc/require-hyphen-before-param-description": "warn",
	"jsdoc/require-throws": "warn",
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
	// Types are handled by TypeScript, so don't enforce them in JSDoc (user preference)
	"jsdoc/require-param-type": "off",
	"jsdoc/require-returns-type": "off",
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
};

export default tseslint.config(
	//
	// --- GLOBAL IGNORES ---
	//
	{ ignores: ["dist", "coverage/", "**/tmp", "/tmp", "storybook-static"] },

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
		},
	},

	//
	// --- TEST FILES & STORIES ---
	//
	{
		...shared,
		files: ["src/**/*.test.{ts,tsx}", "src/**/*.stories.tsx", "**/test-jsdoc.ts"],
		rules: {
			...shared.rules,
			// explicit overrides to keep them clean
			"jsdoc/require-jsdoc": "off",
			"jsdoc/require-description": "off",
			"jsdoc/require-example": "off",
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
