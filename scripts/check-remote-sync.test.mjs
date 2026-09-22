/**
 * @file Unit and integration tests for early remote synchronization pre-push hook.
 */

import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
	checkRemoteSync,
	getCurrentBranch,
	getUpstreamInfo,
	isForceOrDeletePush,
} from "./check-remote-sync.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

describe("Remote Synchronization Check (check-remote-sync.mjs)", () => {
	it("detects the current branch correctly", () => {
		const branch = getCurrentBranch(ROOT);
		expect(branch).toBeTypeOf("string");
		expect(branch?.length).toBeGreaterThan(0);
	});

	it("resolves upstream info for the current branch", () => {
		const branch = getCurrentBranch(ROOT);
		expect(branch).not.toBeNull();

		const upstream = getUpstreamInfo(branch, ROOT);
		expect(upstream).toBeDefined();
		expect(upstream?.remote).toBe("origin");
		expect(upstream?.remoteBranch).toBe(branch);
		expect(upstream?.upstreamRef).toBe(`origin/${branch}`);
	});

	it("returns false for isForceOrDeletePush during standard test execution", () => {
		const isBypassed = isForceOrDeletePush();
		expect(isBypassed).toBe(false);
	});

	it("bypasses sync check when SKIP_REMOTE_SYNC_CHECK environment variable is set", () => {
		const previousEnv = process.env.SKIP_REMOTE_SYNC_CHECK;

		try {
			process.env.SKIP_REMOTE_SYNC_CHECK = "1";
			const result = checkRemoteSync({ cwd: ROOT, skipFetch: true });
			expect(result.skipped).toBe(true);
			expect(result.reason).toContain("Bypassed via environment variable");
			expect(result.behindCount).toBe(0);
		} finally {
			if (previousEnv === undefined) {
				delete process.env.SKIP_REMOTE_SYNC_CHECK;
			} else {
				process.env.SKIP_REMOTE_SYNC_CHECK = previousEnv;
			}
		}
	});

	it("reports behindCount = 0 when repository is synchronized with remote", () => {
		const result = checkRemoteSync({
			baseRef: "HEAD",
			cwd: ROOT,
			skipFetch: true,
			targetRef: "HEAD",
		});
		expect(result.behindCount).toBe(0);
		expect(result.missingCommits).toEqual([]);
	});

	it("detects when baseRef is behind targetRef", () => {
		const result = checkRemoteSync({
			baseRef: "HEAD~1",
			cwd: ROOT,
			skipFetch: true,
			targetRef: "HEAD",
		});
		expect(result.behindCount).toBe(1);
		expect(result.missingCommits.length).toBe(1);
	});

	it("runs cleanly via CLI when bypassed or synchronized", () => {
		const scriptPath = path.join(ROOT, "scripts/check-remote-sync.mjs");
		const output = execSync(`bun ${scriptPath}`, {
			cwd: ROOT,
			encoding: "utf-8",
			env: { ...process.env, SKIP_REMOTE_SYNC_CHECK: "1" },
		});
		expect(output).toBe("");
	});
});
