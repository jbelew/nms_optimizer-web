/**
 * @file Unit tests for the mode-aware Vite environment resolver (`resolveModeEnv`).
 */

import { describe, expect, it } from "bun:test";

import { resolveModeEnv } from "./resolve-mode-env.mjs";

describe("Vite Mode Environment Resolution (resolveModeEnv)", () => {
	it("prevents Bun .env.development auto-load and empty CI secrets from shadowing .env.production, .env.docker, and .env.e2e", () => {
		const savedEnv = { ...process.env };

		try {
			// Simulate Bun auto-loading .env.development and CI setting empty secret strings
			process.env.VITE_API_URL = "https://api.nms-optimizer.app/";
			process.env.VITE_WS_URL = "wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com";
			process.env.VITE_SENTRY_ENV = "development";
			process.env.VITE_SENTRY_ENABLED = "false";
			process.env.VITE_ANALYTICS_ENABLED = "false";
			process.env.VITE_SENTRY_DSN = "";

			const prodEnv = resolveModeEnv("production");
			expect(prodEnv.VITE_SENTRY_ENABLED).toBe("false");
			expect(prodEnv.VITE_ANALYTICS_ENABLED).toBe("true");
			expect(prodEnv.VITE_SENTRY_ENV).toBe("production");
			expect(prodEnv.VITE_SENTRY_DSN).toContain("ingest.us.sentry.io");

			// Simulate Bun auto-loading .env.development before --mode docker
			process.env.VITE_API_URL = "https://api.nms-optimizer.app/";
			process.env.VITE_WS_URL = "wss://nms-optimizer-service-afebcfd47e2a.herokuapp.com";
			const dockerEnv = resolveModeEnv("docker");
			expect(dockerEnv.VITE_API_URL).toBe("/api/");
			expect(dockerEnv.VITE_WS_URL).toBe("/");

			// Simulate Bun auto-loading .env.development before --mode e2e
			process.env.VITE_API_URL = "https://api.nms-optimizer.app/";
			process.env.VITE_SENTRY_ENV = "development";
			const e2eEnv = resolveModeEnv("e2e");
			expect(e2eEnv.VITE_API_URL).toBe(
				"https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/",
			);
			expect(e2eEnv.VITE_SENTRY_ENV).toBe("e2e");

			// Explicit non-development CI override (e.g. VITE_SENTRY_ENV=staging) must still win
			process.env.VITE_SENTRY_ENV = "staging";
			const stagingEnv = resolveModeEnv("production");
			expect(stagingEnv.VITE_SENTRY_ENV).toBe("staging");
		} finally {
			for (const key of Object.keys(process.env)) {
				if (!(key in savedEnv)) {
					delete process.env[key];
				}
			}

			Object.assign(process.env, savedEnv);
		}
	});
});
