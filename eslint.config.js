// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
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
		"jsx-a11y": jsxA11y,
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

export default tseslint.config(
	//
	// --- GLOBAL IGNORES ---
	//
	{ ignores: ["dist", "coverage/", "**/tmp", "/tmp", "storybook-static"] },

	//
	// --- MAIN SOURCE FILES ---
	//
	{
		...shared,
		files: ["src/**/*.{ts,tsx}"],
	},

	//
	// --- STORYBOOK ---
	//
	{
		...shared,
		files: ["**/.storybook/**/*.{ts,tsx}"],
	},

	//
	// --- TEST FILES ---
	//
	{
		...shared,
		files: ["src/**/*.test.{ts,tsx}"],
	},

	//
	// --- STORYBOOK'S OWN ESLINT RULESET ---
	//
	storybook.configs["flat/recommended"]
);
