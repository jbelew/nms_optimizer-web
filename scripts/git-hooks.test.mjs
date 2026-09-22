/**
 * @file Consistency and validation checks for Git lifecycle hooks (Lefthook).
 *
 * This test guarantees:
 *   1. Lefthook config is valid according to the Lefthook CLI.
 *   2. pre-commit hook runs fast scoped tests (vitest related) without coverage.
 *   3. pre-commit excludes slow whole-repo audits (knip, circular).
 *   4. pre-push hook safeguards the remote by running full whole-project checks.
 *   5. package.json exposes test:related and test:unit helper scripts.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LEFTHOOK_PATH = path.join(ROOT, "lefthook.yml");
const PACKAGE_PATH = path.join(ROOT, "package.json");

/**
 * Extract a top-level hook section from lefthook.yml without external YAML dependencies.
 *
 * @param {string} raw - The raw YAML string.
 * @param {string} hookName - The name of the top-level hook (e.g., 'pre-commit', 'pre-push').
 * @returns {string} The text content of that hook section.
 */
function getHookSection(raw, hookName) {
	const lines = raw.split("\n");
	const sectionLines = [];
	let capturing = false;

	for (const line of lines) {
		if (/^[a-z0-9_-]+:/.test(line)) {
			if (line.startsWith(`${hookName}:`)) {
				capturing = true;
				sectionLines.push(line);
				continue;
			}

			if (capturing) {
				break;
			}
		} else if (capturing) {
			sectionLines.push(line);
		}
	}

	return sectionLines.join("\n");
}

describe("Git Hooks Architecture (Lefthook)", () => {
	const lefthookRaw = fs.readFileSync(LEFTHOOK_PATH, "utf-8");
	const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf-8"));

	it("passes lefthook CLI configuration validation", () => {
		const output = execSync("bunx lefthook validate", { cwd: ROOT, encoding: "utf-8" });
		expect(output.toLowerCase()).toContain("all good");
	});

	it("declares test:related and test:unit in package.json", () => {
		expect(pkg.scripts["test:related"]).toBeDefined();
		expect(pkg.scripts["test:related"]).toContain("vitest related");
		expect(pkg.scripts["test:related"]).toContain("--passWithNoTests");

		expect(pkg.scripts["test:unit"]).toBeDefined();
		expect(pkg.scripts["test:unit"]).toContain("vitest run --project unit");
		expect(pkg.scripts["test:unit"]).not.toContain("--coverage");
	});

	it("configures pre-commit for fast developer loop without coverage or slow whole-repo audits", () => {
		const preCommit = getHookSection(lefthookRaw, "pre-commit");
		expect(preCommit, "pre-commit section must exist").toBeTruthy();

		// Fast test execution via related tests
		expect(preCommit).toContain("bun run test:related");
		expect(preCommit).not.toContain("--coverage");
		expect(preCommit).not.toContain("test:ci");

		// Slow whole-repo audits deferred away from pre-commit
		expect(preCommit).not.toMatch(/^\s+knip:/m);
		expect(preCommit).not.toMatch(/^\s+circular:/m);
	});

	it("configures pre-push with full safety barrier before pushing to remote", () => {
		const prePush = getHookSection(lefthookRaw, "pre-push");
		expect(prePush, "pre-push hook must be configured in lefthook.yml").toBeTruthy();

		expect(prePush).toMatch(/^\s+typecheck:/m);
		expect(prePush).toMatch(/^\s+circular:/m);
		expect(prePush).toMatch(/^\s+knip:/m);
		expect(prePush).toMatch(/^\s+test:/m);
		expect(prePush).toMatch(/^\s+test-scripts:/m);
	});
});
