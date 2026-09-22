#!/usr/bin/env bun
/**
 * @file Early remote synchronization validation hook for Lefthook.
 *
 * Runs at the very start of `pre-push` to verify that the local branch is not
 * behind its remote counterpart before running expensive validation checks
 * (typechecking, full test suite, linting).
 *
 * Catches remote updates (e.g. automated GitHub Actions release commits,
 * screenshot updates, merged PRs) within ~1-2 seconds, failing fast with a clear
 * hint to rebase or pull before wasting developer time.
 */

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Checks whether the remote tracking branch has commits that are not present in local HEAD.
 *
 * @param {object} [options] - Options for the sync check.
 * @param {string} [options.cwd] - Working directory.
 * @param {string} [options.baseRef] - Base commit ref to check from (defaults to "HEAD").
 * @param {string} [options.targetRef] - Target ref to check against (defaults to upstreamRef).
 * @param {boolean} [options.skipFetch] - Whether to skip the network fetch (useful for tests).
 * @returns {{ behindCount: number; missingCommits: string[]; error?: string; skipped?: boolean; reason?: string }}
 */
export function checkRemoteSync({
	baseRef = "HEAD",
	cwd = process.cwd(),
	skipFetch = false,
	targetRef = null,
} = {}) {
	if (process.env.SKIP_REMOTE_SYNC_CHECK === "1" || process.env.SKIP_SYNC_CHECK === "1") {
		return { behindCount: 0, missingCommits: [], reason: "Bypassed via environment variable", skipped: true };
	}

	if (isForceOrDeletePush()) {
		return { behindCount: 0, missingCommits: [], reason: "Bypassed due to force/delete push flag", skipped: true };
	}

	const branch = getCurrentBranch(cwd);

	if (!branch && !targetRef) {
		return { behindCount: 0, missingCommits: [], reason: "Detached HEAD", skipped: true };
	}

	let effectiveTargetRef = targetRef;

	if (!effectiveTargetRef) {
		const upstream = getUpstreamInfo(branch, cwd);

		if (!upstream) {
			return { behindCount: 0, missingCommits: [], reason: "No remote upstream found", skipped: true };
		}

		const { remote, remoteBranch, upstreamRef } = upstream;
		effectiveTargetRef = upstreamRef;

		// Fetch remote ref to ensure we have the freshest commits
		if (!skipFetch) {
			try {
				execFileSync("git", ["fetch", remote, remoteBranch, "--quiet"], {
					cwd,
					encoding: "utf-8",
					stdio: ["pipe", "pipe", "pipe"],
					timeout: 7000,
				});
			} catch {
				// If fetch fails (e.g. offline, remote branch not created yet, auth issue),
				// check if remote tracking ref exists locally. If not, bypass softly.
				try {
					execFileSync("git", ["rev-parse", "--verify", "--quiet", upstreamRef], {
						cwd,
						encoding: "utf-8",
						stdio: ["pipe", "pipe", "ignore"],
					});
				} catch {
					return {
						behindCount: 0,
						missingCommits: [],
						reason: `Remote ref '${upstreamRef}' does not exist yet`,
						skipped: true,
					};
				}
			}
		}
	}

	// Count commits reachable from targetRef that are not reachable from baseRef
	try {
		const countOutput = execFileSync(
			"git",
			["rev-list", `${baseRef}..${effectiveTargetRef}`, "--count"],
			{
				cwd,
				encoding: "utf-8",
				stdio: ["pipe", "pipe", "ignore"],
			}
		).trim();

		const behindCount = parseInt(countOutput, 10) || 0;

		if (behindCount > 0) {
			const missingOutput = execFileSync(
				"git",
				["log", "--oneline", "-n", "10", `${baseRef}..${effectiveTargetRef}`],
				{
					cwd,
					encoding: "utf-8",
					stdio: ["pipe", "pipe", "ignore"],
				}
			).trim();

			const missingCommits = missingOutput ? missingOutput.split("\n") : [];

			return { behindCount, missingCommits };
		}

		return { behindCount: 0, missingCommits: [] };
	} catch (err) {
		return {
			behindCount: 0,
			missingCommits: [],
			reason: `Could not evaluate rev-list: ${err.message}`,
			skipped: true,
		};
	}
}

/**
 * Returns the currently checked-out branch name.
 *
 * @param {string} [cwd] - Optional working directory.
 * @returns {string | null} The branch name, or null if in detached HEAD.
 */
export function getCurrentBranch(cwd = process.cwd()) {
	try {
		const branch = execFileSync("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "ignore"],
		}).trim();

		return branch || null;
	} catch {
		return null;
	}
}

/**
 * Determines the remote tracking branch or candidate remote ref for the given branch.
 *
 * @param {string} branch - The local branch name.
 * @param {string} [cwd] - Optional working directory.
 * @returns {{ remote: string; remoteBranch: string; upstreamRef: string } | null}
 */
export function getUpstreamInfo(branch, cwd = process.cwd()) {
	// 1. Try to get configured upstream tracking branch (e.g. origin/main)
	try {
		const upstream = execFileSync(
			"git",
			["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
			{
				cwd,
				encoding: "utf-8",
				stdio: ["pipe", "pipe", "ignore"],
			}
		).trim();

		if (upstream) {
			const slashIdx = upstream.indexOf("/");

			if (slashIdx !== -1) {
				return {
					remote: upstream.slice(0, slashIdx),
					remoteBranch: upstream.slice(slashIdx + 1),
					upstreamRef: upstream,
				};
			}
		}
	} catch {
		// No upstream configured, fall back to checking default remote 'origin'
	}

	// 2. Fall back to origin if configured
	try {
		const remotes = execFileSync("git", ["remote"], {
			cwd,
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "ignore"],
		})
			.trim()
			.split("\n")
			.map((r) => r.trim());

		if (remotes.includes("origin")) {
			return {
				remote: "origin",
				remoteBranch: branch,
				upstreamRef: `origin/${branch}`,
			};
		}
	} catch {
		// Git command failed
	}

	return null;
}

/**
 * Traverses parent processes to inspect the originating `git push` invocation.
 * Detects if the push is a force push (`-f`, `--force`, `--force-with-lease`)
 * or a branch deletion (`-d`, `--delete`), in which case synchronization checks
 * should be bypassed.
 *
 * @returns {boolean} True if the push command specifies force or delete flags.
 */
export function isForceOrDeletePush() {
	let pid = process.ppid;

	while (pid > 1) {
		try {
			if (fs.existsSync(`/proc/${pid}/cmdline`)) {
				const raw = fs.readFileSync(`/proc/${pid}/cmdline`);
				const cmdline = raw
					.toString("utf-8")
					.split("\0")
					.filter((part) => part.length > 0);

				const isGit = cmdline.some((arg) => arg === "git" || arg.endsWith("/git"));
				const isPush = cmdline.includes("push");

				if (isGit && isPush) {
					const bypassFlags = ["-f", "--force", "--force-with-lease", "--delete", "-d"];

					return cmdline.some((arg) =>
						bypassFlags.some((flag) => arg === flag || arg.startsWith(`${flag}=`))
					);
				}

				const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf-8");
				const match = stat.match(/\)\s+[A-Za-z]\s+(\d+)/);

				if (!match) {
					break;
				}

				pid = parseInt(match[1], 10);
			} else {
				const psResult = spawnSync("ps", ["-o", "ppid=,args=", "-p", String(pid)], {
					encoding: "utf-8",
				});

				if (psResult.status !== 0 || !psResult.stdout) {
					break;
				}

				const trimmed = psResult.stdout.trim();
				const spaceIdx = trimmed.indexOf(" ");

				if (spaceIdx === -1) {
					break;
				}

				const nextPpid = parseInt(trimmed.slice(0, spaceIdx).trim(), 10);
				const cmd = trimmed.slice(spaceIdx + 1).trim();

				if (cmd.includes("git") && cmd.includes("push")) {
					return /(?:-f|--force|--force-with-lease|--delete|-d)(?:\s+|$|=)/.test(cmd);
				}

				pid = nextPpid;
			}
		} catch {
			break;
		}
	}

	return false;
}

/**
 * Main execution function for CLI/hook usage.
 *
 * @returns {void}
 */
export function main() {
	const result = checkRemoteSync();

	if (result.skipped) {
		if (process.env.DEBUG_REMOTE_SYNC) {
			console.log(`ℹ️  Remote sync check skipped: ${result.reason}`);
		}

		process.exit(0);
	}

	if (result.behindCount > 0) {
		console.error("\n❌ Cannot push: your local branch is behind the remote tracking branch!");
		console.error(`   Remote has ${result.behindCount} new commit(s) not present locally:\n`);

		for (const commit of result.missingCommits) {
			console.error(`   • ${commit}`);
		}

		console.error("\n⚡ Fail-fast guard: Aborted push before running expensive tests, typechecking, or linting.");
		console.error("👉 Please pull or rebase the remote changes first:");
		console.error("   git pull --rebase\n");

		process.exit(1);
	}
}

// Execute when invoked directly
const isDirectCall =
	process.argv[1] &&
	(process.argv[1] === fileURLToPath(import.meta.url) ||
		process.argv[1].endsWith("/check-remote-sync.mjs"));

if (isDirectCall) {
	main();
}
