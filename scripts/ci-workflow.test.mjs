/**
 * @file Architectural and performance verification tests for the GitHub Actions CI pipeline.
 *
 * Ensures `.github/workflows/ci.yml` and `playwright.config.ts` maintain optimal DAG
 * parallelism and avoid redundant setup/checkout/test steps.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CI_YML_PATH = path.join(ROOT, ".github/workflows/ci.yml");
const PLAYWRIGHT_CONFIG_PATH = path.join(ROOT, "playwright.config.ts");

/**
 * Extracts a top-level job block from `.github/workflows/ci.yml` by job key.
 *
 * @param {string} yml - Raw YAML content.
 * @param {string} jobId - Job identifier under `jobs:`.
 * @returns {string} The YAML substring for that job block.
 */
function extractJobBlock(yml, jobId) {
	const lines = yml.split("\n");
	const startIdx = lines.findIndex((line) => line.match(new RegExp(`^  ${jobId}:\\s*$`)));
	if (startIdx === -1) return "";

	let endIdx = lines.length;

	for (let i = startIdx + 1; i < lines.length; i++) {
		if (/^ {2}[a-zA-Z0-9_-]+:\s*$/.test(lines[i])) {
			endIdx = i;
			break;
		}
	}

	return lines.slice(startIdx, endIdx).join("\n");
}

describe("CI Pipeline Architecture (.github/workflows/ci.yml)", () => {
	const ciYml = fs.readFileSync(CI_YML_PATH, "utf-8");
	const playwrightConfig = fs.readFileSync(PLAYWRIGHT_CONFIG_PATH, "utf-8");

	it("preserves workflow name 'CI Pipeline' for dependabot-automerge trigger compatibility", () => {
		expect(ciYml).toMatch(/^name:\s*CI Pipeline\b/m);
	});

	it("starts storybook-test at t=0 without waiting on build and runs vitest storybook suite only once", () => {
		const storybookJob = extractJobBlock(ciYml, "storybook-test");
		expect(storybookJob).toBeTruthy();
		expect(storybookJob).not.toMatch(/^\s+needs:\s*build\b/m);
		expect(storybookJob).toContain("bun run test:storybook");
		expect(storybookJob).not.toContain("bun run test:storybook:a11y");
	});

	it("parallelizes e2e-test via browser matrix and multi-worker Playwright config", () => {
		const e2eJob = extractJobBlock(ciYml, "e2e-test");
		expect(e2eJob).toBeTruthy();
		expect(e2eJob).toMatch(/matrix:\s*\n\s*browser:\s*\[chromium,\s*firefox,\s*webkit\]/);
		expect(e2eJob).toContain("bunx playwright install --with-deps ${{ matrix.browser }}");
		expect(e2eJob).toContain("bunx playwright test --project=${{ matrix.browser }}");
		expect(playwrightConfig).toMatch(/workers:\s*process\.env\.CI\s*\?\s*2\s*:\s*1/);
	});

	it("builds dist-production inside release job to avoid a separate build-production runner spin-up", () => {
		const releaseJob = extractJobBlock(ciYml, "release");
		const buildProdJob = extractJobBlock(ciYml, "build-production");

		expect(releaseJob).toBeTruthy();
		expect(buildProdJob).toBe("");
		expect(releaseJob).toContain("name: dist-production");
		expect(releaseJob).toContain("VITE_SENTRY_ENV: production");
	});

	it("preserves actions/checkout for Cloudflare Pages Functions while skipping setup-node-env in deploy-production-cloudflare", () => {
		const deployProdJob = extractJobBlock(ciYml, "deploy-production-cloudflare");
		expect(deployProdJob).toBeTruthy();
		expect(deployProdJob).toContain("actions/checkout");
		expect(deployProdJob).not.toContain("setup-node-env");
		expect(deployProdJob).toContain("name: dist-production");
	});

	it("uses filter: blob:none on all fetch-depth: 0 checkouts to avoid downloading historical binary blobs", () => {
		const checkoutBlocks = [...ciYml.matchAll(/uses:\s*actions\/checkout@v\d+([\s\S]*?)(?=\n\s*-\s|\n\n)/g)];
		const fullDepthBlocks = checkoutBlocks.filter((m) => m[1].includes("fetch-depth: 0"));

		expect(fullDepthBlocks.length).toBeGreaterThan(0);

		for (const block of fullDepthBlocks) {
			expect(block[1]).toContain("filter: blob:none");
		}
	});

	it("sets setup-node: 'false' on pure-Bun CI jobs (lint-test, build, e2e-test)", () => {
		for (const jobId of ["lint-test", "build", "e2e-test"]) {
			const jobBlock = extractJobBlock(ciYml, jobId);
			expect(jobBlock, `${jobId} should configure setup-node: 'false'`).toMatch(
				/uses:\s*\.\/\.github\/actions\/setup-node-env\s*\n\s*with:\s*\n\s*setup-node:\s*['"]false['"]/
			);
		}
	});
});
