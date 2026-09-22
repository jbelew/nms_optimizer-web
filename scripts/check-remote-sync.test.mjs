/**
 * @file Unit and integration tests for early remote synchronization pre-push hook.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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
	it("detects the current branch correctly in an initialized repository", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-branch-fixture-"));

		try {
			execFileSync("git", ["init", "-b", "feature-sync"], { cwd: tempDir, stdio: "ignore" });
			const branch = getCurrentBranch(tempDir);
			expect(branch).toBe("feature-sync");
		} finally {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	it("returns null for branch when in detached HEAD", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-detached-fixture-"));

		try {
			execFileSync("git", ["init", "-b", "main"], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["config", "user.name", "CI Tester"], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["config", "user.email", "tester@ci.local"], { cwd: tempDir, stdio: "ignore" });
			fs.writeFileSync(path.join(tempDir, "file.txt"), "content");
			execFileSync("git", ["add", "."], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["commit", "-m", "Init"], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["checkout", "--detach", "HEAD"], { cwd: tempDir, stdio: "ignore" });

			const branch = getCurrentBranch(tempDir);
			expect(branch).toBeNull();
		} finally {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	it("resolves upstream info for a branch with configured remote", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-upstream-fixture-"));

		try {
			execFileSync("git", ["init", "-b", "main"], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["remote", "add", "origin", "https://github.com/example/repo.git"], {
				cwd: tempDir,
				stdio: "ignore",
			});

			const upstream = getUpstreamInfo("main", tempDir);
			expect(upstream).toEqual({
				remote: "origin",
				remoteBranch: "main",
				upstreamRef: "origin/main",
			});
		} finally {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	it("returns null when no upstream or origin remote is configured", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-no-remote-fixture-"));

		try {
			execFileSync("git", ["init", "-b", "main"], { cwd: tempDir, stdio: "ignore" });
			const upstream = getUpstreamInfo("main", tempDir);
			expect(upstream).toBeNull();
		} finally {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
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

	it("detects when baseRef is behind targetRef in an isolated repository", () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-sync-fixture-"));

		try {
			execFileSync("git", ["init"], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["config", "user.name", "CI Tester"], {
				cwd: tempDir,
				stdio: "ignore",
			});
			execFileSync("git", ["config", "user.email", "tester@ci.local"], {
				cwd: tempDir,
				stdio: "ignore",
			});
			fs.writeFileSync(path.join(tempDir, "file1.txt"), "first");
			execFileSync("git", ["add", "."], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["commit", "-m", "Initial commit"], { cwd: tempDir, stdio: "ignore" });
			const c1 = execFileSync("git", ["rev-parse", "HEAD"], { cwd: tempDir, encoding: "utf-8" }).trim();

			fs.writeFileSync(path.join(tempDir, "file2.txt"), "second");
			execFileSync("git", ["add", "."], { cwd: tempDir, stdio: "ignore" });
			execFileSync("git", ["commit", "-m", "Second commit"], { cwd: tempDir, stdio: "ignore" });
			const c2 = execFileSync("git", ["rev-parse", "HEAD"], { cwd: tempDir, encoding: "utf-8" }).trim();

			const result = checkRemoteSync({
				baseRef: c1,
				cwd: tempDir,
				skipFetch: true,
				targetRef: c2,
			});

			expect(result.behindCount).toBe(1);
			expect(result.missingCommits.length).toBe(1);
			expect(result.missingCommits[0]).toContain("Second commit");
		} finally {
			fs.rmSync(tempDir, { force: true, recursive: true });
		}
	});

	it("runs cleanly via CLI when bypassed or synchronized", () => {
		const scriptPath = path.join(ROOT, "scripts/check-remote-sync.mjs");
		const output = execFileSync("bun", [scriptPath], {
			cwd: ROOT,
			encoding: "utf-8",
			env: { ...process.env, SKIP_REMOTE_SYNC_CHECK: "1" },
		});
		expect(output).toBe("");
	});
});
