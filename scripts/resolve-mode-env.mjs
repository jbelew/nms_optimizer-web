/**
 * Mode-aware environment variable resolver for Vite builds under Bun.
 *
 * @remarks
 * Prevents Bun's automatic `.env.development` preload or empty CI secret strings
 * from shadowing `.env.<mode>` (`production`, `docker`, `e2e`).
 */

import fs from "node:fs";
import path from "node:path";

/**
 * Environment variable keys that GitHub Actions may pass as empty strings (`""`)
 * when repository secrets or workflow inputs are unset.
 */
const CI_EMPTY_ENV_KEYS = [
	"SENTRY_AUTH_TOKEN",
	"SENTRY_ORG",
	"SENTRY_PROJECT",
	"VITE_APP_VERSION",
	"VITE_BUILD_VERSION",
	"VITE_SENTRY_DSN",
	"VITE_SENTRY_ENV",
];

/**
 * Parses a simple `KEY=VALUE` dotenv file from disk if it exists.
 *
 * @remarks
 * Ignores blank lines and `#` comment lines, trims surrounding whitespace, and
 * strips matching single or double quotes around values. Returns an empty object
 * when the target file does not exist.
 *
 * @param {string} filePath - Absolute path to the dotenv file.
 * @returns {Record<string, string>} Parsed key-value pairs.
 *
 * @see {@link resolveModeEnv}
 * @see {@link ./resolve-mode-env.test.mjs Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const env = parseDotEnvFile("/path/to/.env.production");
 * // returns { VITE_SENTRY_ENABLED: "true", ... }
 * ```
 */
export function parseDotEnvFile(filePath) {
	if (!fs.existsSync(filePath)) {
		return {};
	}

	/** @type {Record<string, string>} */
	const result = {};
	const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

	for (const rawLine of lines) {
		const line = rawLine.trim();

		if (!line || line.startsWith("#")) {
			continue;
		}

		const eqIndex = line.indexOf("=");

		if (eqIndex <= 0) {
			continue;
		}

		const key = line.slice(0, eqIndex).trim();
		const value = line
			.slice(eqIndex + 1)
			.trim()
			.replace(/^(['"])(.*)\1$/, "$2");
		result[key] = value;
	}

	return result;
}

/**
 * Sanitizes `process.env` for the given Vite mode and returns the resolved environment map.
 *
 * @remarks
 * When Bun executes a script without `NODE_ENV=production` (including custom Vite modes
 * such as `--mode docker` or `--mode e2e`), Bun automatically loads `.env.development`
 * into `process.env` at startup. Because Vite's `loadEnv` prioritizes `process.env` over
 * `.env.<mode>`, any key pre-populated from `.env.development` (or set to `""` by a CI
 * workflow expression) would otherwise override `.env.<mode>`.
 *
 * @param {string} mode - The active Vite mode (`"production"`, `"docker"`, `"e2e"`, `"development"`).
 * @param {string} [cwd] - Working directory containing `.env.*` files.
 * @returns {Record<string, string>} Resolved environment map for the given mode.
 *
 * @default cwd process.cwd()
 *
 * @see {@link parseDotEnvFile}
 * @see {@link ./resolve-mode-env.test.mjs Tests}
 *
 * @category Utilities
 *
 * @example
 * ```js
 * const env = resolveModeEnv("production");
 * // returns { VITE_SENTRY_ENABLED: "true", VITE_SENTRY_ENV: "production", ... }
 * ```
 */
export function resolveModeEnv(mode, cwd = process.cwd()) {
	for (const key of CI_EMPTY_ENV_KEYS) {
		if (process.env[key] === "") {
			delete process.env[key];
		}
	}

	const baseEnv = parseDotEnvFile(path.join(cwd, ".env"));
	const modeEnv = parseDotEnvFile(path.join(cwd, `.env.${mode}`));

	if (mode !== "development") {
		const devEnv = parseDotEnvFile(path.join(cwd, ".env.development"));

		for (const [key, modeValue] of Object.entries(modeEnv)) {
			if (process.env[key] === "" || (key in devEnv && process.env[key] === devEnv[key])) {
				process.env[key] = modeValue;
			}
		}
	}

	/** @type {Record<string, string>} */
	const resolved = { ...baseEnv, ...modeEnv };

	for (const [key, value] of Object.entries(process.env)) {
		if (typeof value === "string") {
			resolved[key] = value;
		}
	}

	return resolved;
}
