#!/usr/bin/env bun
/**
 * @file Early commit message validation hook for Lefthook.
 *
 * Runs at the very start of `pre-commit` to inspect command-line arguments of
 * the parent `git commit` invocation. If `-m` or `-F` is present, it validates
 * the commit message with `commitlint` immediately (<1s) before expensive
 * checks (tests, typecheck, linting) execute.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";

/**
 * Traverses parent processes to find the originating `git commit` invocation
 * and extract the commit message from its command-line arguments.
 *
 * @returns {string | null} The commit message if passed via `-m` or `-F`, or `null`.
 */
function extractCommitMessageFromArgs() {
	let pid = process.ppid;

	while (pid > 1) {
		try {
			// Fast path for Linux via /proc filesystem
			if (fs.existsSync(`/proc/${pid}/cmdline`)) {
				const raw = fs.readFileSync(`/proc/${pid}/cmdline`);
				const cmdline = raw
					.toString("utf-8")
					.split("\0")
					.filter((part) => part.length > 0);

				const isGit = cmdline.some((arg) => arg === "git" || arg.endsWith("/git"));
				const isCommit = cmdline.includes("commit");

				if (isGit && isCommit) {
					const messages = [];

					for (let i = 0; i < cmdline.length; i++) {
						const arg = cmdline[i];

						if ((arg === "-m" || arg === "--message") && i + 1 < cmdline.length) {
							messages.push(cmdline[i + 1]);
							i++;
						} else if (arg.startsWith("-m=") || arg.startsWith("--message=")) {
							messages.push(arg.slice(arg.indexOf("=") + 1));
						} else if ((arg === "-F" || arg === "--file") && i + 1 < cmdline.length) {
							const filePath = cmdline[i + 1];
							i++;

							if (filePath !== "-" && fs.existsSync(filePath)) {
								messages.push(fs.readFileSync(filePath, "utf-8"));
							}
						} else if (arg.startsWith("-F=") || arg.startsWith("--file=")) {
							const filePath = arg.slice(arg.indexOf("=") + 1);

							if (filePath !== "-" && fs.existsSync(filePath)) {
								messages.push(fs.readFileSync(filePath, "utf-8"));
							}
						}
					}

					if (messages.length > 0) {
						// Git joins multiple -m arguments with double newlines
						return messages.join("\n\n");
					}

					// Found git commit, but no inline message flags (likely interactive editor)
					return null;
				}

				// Move to parent process
				const stat = fs.readFileSync(`/proc/${pid}/stat`, "utf-8");
				const ppidMatch = stat.match(/\)\s+[A-Za-z]\s+(\d+)/);

				if (!ppidMatch) {
					break;
				}

				pid = parseInt(ppidMatch[1], 10);
			} else {
				// Fallback using `ps` for non-Linux platforms
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

				if (cmd.includes("git") && cmd.includes("commit")) {
					const mMatch = cmd.match(/(?:-m|--message)(?:\s+|=)(["'])(.*?)\1/);

					if (mMatch) {
						return mMatch[2];
					}

					return null;
				}

				pid = nextPpid;
			}
		} catch {
			break;
		}
	}

	return null;
}

/**
 * Validates the extracted commit message using commitlint.
 *
 * @returns {void}
 */
function main() {
	const message = extractCommitMessageFromArgs();

	// If no commit message was supplied on the command line (e.g. interactive editor),
	// pass through and let the subsequent `commit-msg` hook perform validation.
	if (!message) {
		process.exit(0);
	}

	const result = spawnSync("bunx", ["commitlint"], {
		input: message,
		stdio: ["pipe", "inherit", "inherit"],
	});

	if (result.status !== 0) {
		console.error("\n❌ Commit message failed validation before running pre-commit checks.\n");
		process.exit(result.status ?? 1);
	}
}

main();
