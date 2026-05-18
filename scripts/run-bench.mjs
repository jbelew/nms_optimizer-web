#!/usr/bin/env bun
/**
 * @file Wrapper around `tachometer` that boots the local SSG preview server
 * for the duration of the run.
 *
 * Usage:
 *   bun scripts/run-bench.mjs              # uses scripts/tachometer/fcp.json
 *   bun scripts/run-bench.mjs custom.json  # custom config path
 *
 * The script:
 *   1. Spawns `bun scripts/serve-ssg.mjs` (port 8888).
 *   2. Waits for the port to start accepting connections.
 *   3. Runs tachometer with the chosen config.
 *   4. Tears the server back down — even on failure.
 *
 * Assumes `bun run build` has already been executed; tachometer compares the
 * dist/ output against the deployed production URL.
 */

import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const configArg = process.argv[2] ?? "scripts/tachometer/fcp.json";
const configPath = path.resolve(repoRoot, configArg);

const SERVE_PORT = 8888;
const SERVE_HOST = "127.0.0.1";
const READY_TIMEOUT_MS = 15_000;
const READY_POLL_MS = 250;

/**
 * Resolves once a TCP connect succeeds on host:port, or rejects after timeout.
 */
function waitForPort(host, port, timeoutMs) {
	const deadline = Date.now() + timeoutMs;

	return new Promise((resolve, reject) => {
		const tryOnce = () => {
			const socket = createConnection({ host, port });
			socket.once("connect", () => {
				socket.end();
				resolve();
			});
			socket.once("error", () => {
				socket.destroy();

				if (Date.now() > deadline) {
					reject(new Error(`Server at ${host}:${port} never came up`));
				} else {
					setTimeout(tryOnce, READY_POLL_MS);
				}
			});
		};

		tryOnce();
	});
}

let server;

function shutdown(code) {
	if (server && !server.killed) {
		server.kill("SIGTERM");
	}

	process.exit(code);
}

process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));

try {
	console.log(`▶︎ Starting SSG preview server on ${SERVE_HOST}:${SERVE_PORT}…`);
	server = spawn("bun", ["run", "preview", "--", "--host", SERVE_HOST, "--port", SERVE_PORT.toString()], {
		cwd: repoRoot,
		stdio: ["ignore", "ignore", "inherit"],
	});

	server.on("exit", (code, signal) => {
		if (code !== null && code !== 0) {
			console.error(`SSG server exited unexpectedly (code=${code}, signal=${signal})`);
		}
	});

	await waitForPort(SERVE_HOST, SERVE_PORT, READY_TIMEOUT_MS);
	console.log(`✓ Server ready.\n▶︎ Running tachometer with ${configArg}…\n`);

	await new Promise((resolve, reject) => {
		const tach = spawn("bunx", ["tachometer", "--config", configPath], {
			cwd: repoRoot,
			stdio: "inherit",
		});
		tach.on("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`tachometer exited with code ${code}`));
			}
		});
	});

	shutdown(0);
} catch (err) {
	console.error(`\n✗ ${err.message}`);
	shutdown(1);
}
