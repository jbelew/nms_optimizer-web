import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";

import app from "./server/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "dist");

async function run() {
	console.log("Checking if dist/about/index.html exists...");
	const aboutPath = path.join(DIST_DIR, "about", "index.html");
	try {
		const stats = await fs.promises.stat(aboutPath);
		console.log(`File exists: ${stats.isFile()}`);
		const content = await fs.promises.readFile(aboutPath, "utf8");
		console.log(
			`Has prerendered content: ${content.includes('data-prerendered-markdown="true"')}`
		);
	} catch (e) {
		console.error("File check failed:", e.message);
	}

	console.log("\nMaking request to /about...");
	const response = await request(app).get("/about");

	console.log(`Status: ${response.status}`);
	console.log(`Content-Type: ${response.headers["content-type"]}`);

	const body = response.text;
	if (body.includes('data-prerendered-markdown="true"')) {
		console.log("SUCCESS: Response contains prerendered markdown.");
	} else {
		console.log("FAILURE: Response DOES NOT contain prerendered markdown.");
		if (body.includes('<div id="root">')) {
			console.log("Response appears to be the generic index.html (SPA shell).");
		}
	}
}

run().catch(console.error);
