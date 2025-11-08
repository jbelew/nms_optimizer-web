const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const LIGHTHOUSE_URL = process.env.LIGHTHOUSE_URL || "http://localhost:4173";
const IS_LOCAL_AUDIT = !process.env.LIGHTHOUSE_URL;

const SERVER_CHECK_URL = "http://127.0.0.1:4173/index.html"; // Explicitly check for index.html
const REPORT_FILENAME = "lighthouse-report.html";
const SERVER_START_TIMEOUT_MS = 60000; // 60 seconds
const SERVER_POLL_INTERVAL_MS = 2000; // 2 seconds

function startDevServer() {
	// Use 'npm.cmd' on Windows, 'npm' on Linux/macOS
	const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
	const serverProcess = spawn(npmCmd, ["run", "preview"], {
		stdio: "inherit", // Pipe server output to this process's stdio
		detached: true, // Important for killing the process tree
	});

	serverProcess.on("error", (err) => {
		console.error("Failed to start preview server:", err);
		process.exit(1);
	});

	serverProcess.on("exit", (code, signal) => {
		if (code !== 0 && signal !== "SIGTERM" && signal !== "SIGINT") {
			console.warn(`Preview server exited unexpectedly with code: ${code}, signal: ${signal}`);
		}
	});
	return serverProcess;
}

async function waitForServerReady() {
	const startTime = Date.now();
	console.log(`Waiting for server at ${SERVER_CHECK_URL}...`);
	while (true) {
		try {
			const response = await fetch(SERVER_CHECK_URL);
			if (response.ok) {
				console.log(`Server responded OK from ${SERVER_CHECK_URL}`);
				return true;
			} else {
				console.log(`Server at ${SERVER_CHECK_URL} responded with status: ${response.status}`);
			}
		} catch (error) {
			console.log(`Fetch error for ${SERVER_CHECK_URL}: ${error.message}. Retrying...`);
		}

		if (Date.now() - startTime > SERVER_START_TIMEOUT_MS) {
			console.error(
				`Timeout: Server at ${SERVER_CHECK_URL} did not start within ${SERVER_START_TIMEOUT_MS / 1000} seconds.`
			);
			return false;
		}
		await new Promise((resolve) => setTimeout(resolve, SERVER_POLL_INTERVAL_MS));
	}
}

async function runLighthouseAudit() {
	console.log(`Starting Lighthouse audit for ${LIGHTHOUSE_URL}...`);
	const browser = await puppeteer.launch({
		headless: "new",
		args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
	});

	let lhrForSummary; // Renamed from 'results' for clarity
	try {
		// Debug logs removed.
		// Destructure 'lhr' and 'report' (aliased to htmlReportString)
		const { lhr, report: htmlReportString } = await lighthouse.default(LIGHTHOUSE_URL, {
			port: new URL(browser.wsEndpoint()).port,
			output: "html",
			logLevel: "info", // Using "info" for better feedback during run
		});
		lhrForSummary = lhr; // Assign destructured lhr for summary

		const jsonReportPath = path.join(process.cwd(), "lighthouse-report.json");
		fs.writeFileSync(jsonReportPath, JSON.stringify(lhrForSummary, null, 2));
		console.log(`Lighthouse JSON report saved to ${jsonReportPath}`);

		if (!htmlReportString) {
			// This check is important to ensure Lighthouse returned the report string
			throw new Error("Lighthouse did not return an HTML report string.");
		}

		// const reportHtml = results.report; // This line is removed as htmlReportString is used directly
		const reportPath = path.join(process.cwd(), REPORT_FILENAME);
		fs.writeFileSync(reportPath, htmlReportString); // Use the directly destructured htmlReportString
		console.log(`Lighthouse report saved to ${reportPath}`);
	} catch (error) {
		console.error("Lighthouse audit failed:", error);
		throw error; // Re-throw to be caught by the main execution block
	} finally {
		await browser.close();
		console.log("Browser closed.");
	}

	if (lhrForSummary) {
		// Use lhrForSummary for the conditional check and logging
		console.log("\nLighthouse Audit Summary:");
		console.log(`  Performance: ${Math.round(lhrForSummary.categories.performance.score * 100)}`);
		console.log(
			`  Accessibility: ${Math.round(lhrForSummary.categories.accessibility.score * 100)}`
		);
		console.log(
			`  Best Practices: ${Math.round(lhrForSummary.categories["best-practices"].score * 100)}`
		);
		console.log(`  SEO: ${Math.round(lhrForSummary.categories.seo.score * 100)}`);
		if (lhrForSummary.categories.pwa) {
			console.log(`  PWA: ${Math.round(lhrForSummary.categories.pwa.score * 100)}`);
		}
	} else {
		// This path should ideally not be hit if the above checks/errors are caught
		throw new Error("Lighthouse audit did not produce LHR object for summary.");
	}
}

async function main() {
	let serverProcess;
	let exitCode = 0;
	try {
		if (IS_LOCAL_AUDIT) {
			serverProcess = startDevServer();
			const serverReady = await waitForServerReady();
			if (!serverReady) {
				throw new Error("Server did not become ready in time.");
			}
		}
		await runLighthouseAudit();
	} catch (error) {
		console.error("An error occurred:", error.message);
		exitCode = 1;
	} finally {
		if (serverProcess) {
			console.log("Shutting down preview server...");
			// Kill the entire process group to ensure Vite and its children are terminated
			// Use `-` prefix for PID to target process group
			try {
				process.kill(-serverProcess.pid, "SIGINT"); // Send SIGINT first for graceful shutdown
				await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait a bit
				process.kill(-serverProcess.pid, "SIGKILL"); // Force kill if still running
			} catch (e) {
				// Ignore errors if process already exited
			}
			console.log("Preview server shutdown signal sent.");
		}
		process.exit(exitCode);
	}
}

main();
