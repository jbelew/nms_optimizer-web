/**
 * @file Unit tests for the mode-aware Vite environment resolver (`resolveModeEnv`).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "bun:test";

import { parseDotEnvFile, resolveModeEnv } from "./resolve-mode-env.mjs";

/**
 * Deletes `VITE_*` and `SENTRY_*` keys from `process.env` so ambient `.env.local`
 * or `.env.test` values loaded by `bun test` cannot pollute mode resolution assertions.
 *
 * @returns {void}
 */
function clearViteAndSentryEnv() {
	for (const key of Object.keys(process.env)) {
		if (key.startsWith("VITE_") || key.startsWith("SENTRY_")) {
			delete process.env[key];
		}
	}
}

/**
 * Resets `process.env` in-place to match a saved snapshot.
 *
 * @param {Record<string, string | undefined>} savedEnv - Snapshot captured prior to test mutation.
 * @returns {void}
 */
function restoreProcessEnv(savedEnv) {
	for (const key of Object.keys(process.env)) {
		if (!(key in savedEnv)) {
			delete process.env[key];
		}
	}

	for (const [key, value] of Object.entries(savedEnv)) {
		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}
}

describe("Vite Mode Environment Resolution (resolveModeEnv)", () => {
	it("prevents Bun .env.development auto-load and empty CI secrets from shadowing .env.<mode> in isolated fixtures", () => {
		const savedEnv = { ...process.env };
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resolve-mode-env-"));

		try {
			fs.writeFileSync(
				path.join(tempDir, ".env.development"),
				[
					"# Local dev overrides may change freely",
					"VITE_API_URL=http://127.0.0.1:8000/",
					"VITE_WS_URL=ws://127.0.0.1:8000",
					"VITE_SENTRY_DSN=https://example@o0.ingest.us.sentry.io/1",
					"VITE_SENTRY_ENV=development",
					"VITE_SENTRY_ENABLED=false",
					"VITE_ANALYTICS_ENABLED=false",
				].join("\n"),
			);
			fs.writeFileSync(
				path.join(tempDir, ".env.production"),
				[
					"VITE_API_URL=https://api.nms-optimizer.app/",
					"VITE_WS_URL=wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com",
					"VITE_SENTRY_DSN=https://prod@o0.ingest.us.sentry.io/2",
					"VITE_SENTRY_ENV=production",
					"VITE_SENTRY_ENABLED=false",
					"VITE_ANALYTICS_ENABLED=true",
				].join("\n"),
			);
			fs.writeFileSync(
				path.join(tempDir, ".env.docker"),
				["VITE_API_URL=/api/", "VITE_WS_URL=/"].join("\n"),
			);
			fs.writeFileSync(
				path.join(tempDir, ".env.e2e"),
				[
					"VITE_API_URL=https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/",
					"VITE_SENTRY_ENV=e2e",
				].join("\n"),
			);

			const devEnv = parseDotEnvFile(path.join(tempDir, ".env.development"));

			// Simulate Bun auto-loading .env.development and CI setting empty secret strings
			clearViteAndSentryEnv();
			Object.assign(process.env, devEnv);
			process.env.VITE_SENTRY_DSN = "";

			const prodEnv = resolveModeEnv("production", tempDir);
			expect(prodEnv.VITE_API_URL).toBe("https://api.nms-optimizer.app/");
			expect(prodEnv.VITE_SENTRY_ENABLED).toBe("false");
			expect(prodEnv.VITE_ANALYTICS_ENABLED).toBe("true");
			expect(prodEnv.VITE_SENTRY_ENV).toBe("production");
			expect(prodEnv.VITE_SENTRY_DSN).toBe("https://prod@o0.ingest.us.sentry.io/2");

			// Simulate Bun auto-loading .env.development before --mode docker
			clearViteAndSentryEnv();
			Object.assign(process.env, devEnv);
			const dockerEnv = resolveModeEnv("docker", tempDir);
			expect(dockerEnv.VITE_API_URL).toBe("/api/");
			expect(dockerEnv.VITE_WS_URL).toBe("/");

			// Simulate Bun auto-loading .env.development before --mode e2e
			clearViteAndSentryEnv();
			Object.assign(process.env, devEnv);
			const e2eEnv = resolveModeEnv("e2e", tempDir);
			expect(e2eEnv.VITE_API_URL).toBe(
				"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/",
			);
			expect(e2eEnv.VITE_SENTRY_ENV).toBe("e2e");

			// Explicit non-development CI override (e.g. VITE_SENTRY_ENV=staging) must still win
			clearViteAndSentryEnv();
			Object.assign(process.env, devEnv);
			process.env.VITE_SENTRY_ENV = "staging";
			const stagingEnv = resolveModeEnv("production", tempDir);
			expect(stagingEnv.VITE_SENTRY_ENV).toBe("staging");
		} finally {
			restoreProcessEnv(savedEnv);
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	it("prevents whatever values are currently in repository .env.development from shadowing .env.<mode>", () => {
		const savedEnv = { ...process.env };

		try {
			const devEnv = parseDotEnvFile(path.join(process.cwd(), ".env.development"));

			for (const mode of ["production", "docker", "e2e"]) {
				clearViteAndSentryEnv();
				Object.assign(process.env, devEnv);

				const expectedModeEnv = parseDotEnvFile(path.join(process.cwd(), `.env.${mode}`));
				const resolved = resolveModeEnv(mode, process.cwd());

				for (const [key, expectedValue] of Object.entries(expectedModeEnv)) {
					expect(resolved[key]).toBe(expectedValue);
				}
			}
		} finally {
			restoreProcessEnv(savedEnv);
		}
	});
});
