/**
 * @file Consistency check between client-only routes, declared pages, and SSG output.
 *
 * The Cloudflare Pages Function (`functions/[[path]].js`) maintains a
 * hand-curated `SPA_ROUTES` set: pages that have NO pre-rendered HTML and
 * therefore need the PWA shell as a fallback. This test guarantees:
 *
 *   1. Every entry in `SPA_ROUTES` exists in `pages` (no typos / dead routes).
 *   2. Every `pages` entry that lacks `dist/{page}/index.html` is in `SPA_ROUTES`
 *      (otherwise it would 404 in production).
 *   3. Every entry in `SPA_ROUTES` actually lacks SSG output (otherwise the
 *      fallback is dead code and SSG content is being shadowed).
 *
 * Run after `bun run build` (the test gracefully skips if `dist/` is absent so
 * CI dev loops without a build still pass).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const FN_PATH = path.join(ROOT, "functions/[[path]].js");
const ROUTE_CONFIG_PATH = path.join(ROOT, "src/routeConfig.ts");

/**
 * Extract the `pages` array from `src/routeConfig.ts` via a regex (TS import in
 * a node-vitest config is more friction than it's worth here).
 */
function readPages() {
	const src = fs.readFileSync(ROUTE_CONFIG_PATH, "utf-8");
	const match = src.match(/export const pages\s*=\s*\[([^\]]*)\]/);
	if (!match) throw new Error("Could not find `pages` in src/routeConfig.ts");

	return match[1]
		.split(",")
		.map((s) => s.trim().replace(/^["']|["']$/g, ""))
		.filter(Boolean);
}

/**
 * Extract the SPA_ROUTES literal set from the Function source without importing it
 * (it depends on the Cloudflare Workers runtime).
 */
function readSpaRoutes() {
	const src = fs.readFileSync(FN_PATH, "utf-8");
	const match = src.match(/SPA_ROUTES\s*=\s*new Set\(\s*\[([^\]]*)\]/);
	if (!match) throw new Error("Could not find SPA_ROUTES in functions/[[path]].js");

	return match[1]
		.split(",")
		.map((s) => s.trim().replace(/^["']|["']$/g, ""))
		.filter(Boolean);
}

/**
 * Routes that are "Hybrid" (have SSG output for the base path but client-only sub-routes).
 * These are allowed to be in both SPA_ROUTES and have SSG output.
 */
const HYBRID_ROUTES = ["performance"];

const hasSsgOutput = (page) => fs.existsSync(path.join(DIST, page, "index.html"));

describe("SPA_ROUTES ↔ pages ↔ SSG output consistency", () => {
	const spaRoutes = readSpaRoutes();
	const pages = readPages();

	it("every SPA_ROUTES entry is a declared page", () => {
		for (const route of spaRoutes) {
			expect(pages, `SPA_ROUTES contains "${route}" but it is not in pages`).toContain(route);
		}
	});

	const distExists = fs.existsSync(DIST);
	const hasAnySsgOutput = pages.some((p) => hasSsgOutput(p));
	const isSsgBuild = distExists && hasAnySsgOutput;

	if (distExists && !hasAnySsgOutput) {
		console.warn("⚠️  dist/ exists but no SSG output found. Skipping consistency checks.");
	}

	const maybeIt = isSsgBuild ? it : it.skip;

	maybeIt("pages without SSG output are listed in SPA_ROUTES", () => {
		const missing = pages.filter((p) => !hasSsgOutput(p)).filter((p) => !spaRoutes.includes(p));
		expect(
			missing,
			`These pages have no dist/{page}/index.html and would 404 in production. ` +
				`Add them to SPA_ROUTES in functions/[[path]].js: ${missing.join(", ")}`
		).toEqual([]);
	});

	maybeIt("SPA_ROUTES entries do not have SSG output (unless they are Hybrid)", () => {
		const shadowed = spaRoutes
			.filter((r) => hasSsgOutput(r))
			.filter((r) => !HYBRID_ROUTES.includes(r));
		expect(
			shadowed,
			`These routes are in SPA_ROUTES but ALSO have dist/{route}/index.html. ` +
				`If they are not Hybrid routes with sub-paths, remove from SPA_ROUTES: ${shadowed.join(", ")}`
		).toEqual([]);
	});
});
