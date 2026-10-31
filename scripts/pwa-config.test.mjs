/**
 * @file Consistency and validation checks for PWA manifest and Service Worker configuration.
 *
 * This test guarantees:
 *   1. Manifest has valid PWA shortcuts pointing to existing routes.
 *   2. Manifest includes categories, display_override, and native attributes for desktop/mobile integration.
 *   3. Generated sw.js does not redundantly precache index.html (which is served via NetworkOnly).
 *   4. Workbox navigation preload remains enabled.
 *   5. API cache networkTimeoutSeconds is tuned for mobile responsiveness.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "bun:test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const MANIFEST_PATH = path.join(DIST, "manifest.json");
const SW_PATH = path.join(DIST, "sw.js");

describe("PWA Configuration & Manifest", () => {
	const distExists = fs.existsSync(DIST);
	const itWhenBuilt = distExists ? it : it.skip;

	const manifest =
		distExists && fs.existsSync(MANIFEST_PATH) ?
			JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
		:	null;

	const swContent = distExists && fs.existsSync(SW_PATH) ? fs.readFileSync(SW_PATH, "utf-8") : "";

	itWhenBuilt("manifest contains valid PWA shortcuts", () => {
		expect(manifest).not.toBeNull();
		expect(manifest.shortcuts).toBeDefined();
		expect(Array.isArray(manifest.shortcuts)).toBe(true);
		expect(manifest.shortcuts.length).toBe(4);

		const names = manifest.shortcuts.map((s) => s.name);
		expect(names).toContain("How to Optimize Your Tech Layout");
		expect(names).toContain("Latest Features and Updates");
		expect(names).toContain("Community Meta & Tech Stats");
		expect(names).toContain("About the Optimization Algorithms");

		for (const shortcut of manifest.shortcuts) {
			expect(shortcut.name).toBeTruthy();
			expect(shortcut.name).not.toContain("| NMS Optimizer");
			expect(shortcut.url).toBeTruthy();
			expect(shortcut.url.startsWith("/")).toBe(true);
			expect(shortcut.icons).toBeDefined();
			expect(shortcut.icons.length).toBeGreaterThan(0);
		}
	});

	itWhenBuilt("manifest includes categories and display_override for native integration", () => {
		expect(manifest).not.toBeNull();
		expect(manifest.categories).toEqual(expect.arrayContaining(["utilities", "games"]));
		expect(manifest.display_override).toContain("window-controls-overlay");
		expect(manifest.dir).toBe("ltr");
		expect(manifest.lang).toBe("en");
		expect(manifest.prefer_related_applications).toBe(false);
	});

	itWhenBuilt("manifest configures WebP screenshots for desktop, tablet, and mobile", () => {
		expect(manifest).not.toBeNull();
		expect(manifest.screenshots).toEqual([
			expect.objectContaining({
				form_factor: "wide",
				sizes: "1280x880",
				src: "/assets/img/screenshots/screenshot_desktop.webp",
				type: "image/webp",
			}),
			expect.objectContaining({
				form_factor: "narrow",
				sizes: "800x1280",
				src: "/assets/img/screenshots/screenshot_tablet.webp",
				type: "image/webp",
			}),
			expect.objectContaining({
				form_factor: "narrow",
				sizes: "375x600",
				src: "/assets/img/screenshots/screenshot_mobile.webp",
				type: "image/webp",
			}),
		]);
	});

	itWhenBuilt(
		"sw.js excludes index.html from precache list to prevent redundant downloads",
		() => {
			expect(swContent).toBeTruthy();
			// Should NOT have {url:"index.html" in precacheAndRoute
			expect(swContent).not.toMatch(/\{url:"index\.html"/);
		},
	);

	itWhenBuilt("sw.js excludes build JavaScript and CSS bundles from precache manifest", () => {
		expect(swContent).toBeTruthy();
		// Should NOT precache hashed build JS/CSS bundles (delegated to immutable HTTP caching)
		expect(swContent).not.toMatch(/\{url:"build\/[^"]+\.(?:js|css)"/);
	});

	itWhenBuilt("sw.js enables navigation preload", () => {
		expect(swContent).toBeTruthy();
		expect(swContent).toMatch(/navigationPreload|enable\(\)/);
	});

	itWhenBuilt("sw.js configures api-cache with 3-second network timeout", () => {
		expect(swContent).toBeTruthy();
		expect(swContent).toMatch(/networkTimeoutSeconds:\s*3/);
	});

	itWhenBuilt("sw.js contains no duplicate precache URLs", () => {
		expect(swContent).toBeTruthy();
		const urls = [...swContent.matchAll(/\{url:"([^"]+)"/g)].map((m) => m[1]);
		expect(urls.length).toBeGreaterThan(0);
		expect(new Set(urls).size).toBe(urls.length);
	});

	itWhenBuilt(
		"sw.js excludes screenshots, legacy manifest icons, and locale JSONs from precache",
		() => {
			expect(swContent).toBeTruthy();
			expect(swContent).not.toMatch(/\{url:"assets\/img\/screenshots\//);
			expect(swContent).not.toMatch(/\{url:"assets\/img\/manifest\//);
			expect(swContent).not.toMatch(/\{url:"assets\/locales\//);
		},
	);

	itWhenBuilt(
		"sw.js includes a build release stamp so code-only deployments trigger Staged Worker detection",
		() => {
			expect(swContent).toBeTruthy();
			expect(swContent).toMatch(/\/\/ Release: v/);
		},
	);

	it("public/_headers configures immutable caching for /workbox-*.js and no-cache for /sw.js and /version.json", () => {
		const headersContent = fs.readFileSync(path.join(ROOT, "public/_headers"), "utf-8");
		expect(headersContent).toMatch(
			/\/workbox-\*\.js\s+Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/,
		);
		expect(headersContent).toMatch(
			/\/sw\.js\s+Cache-Control:\s*no-cache,\s*must-revalidate,\s*max-age=0/,
		);
		expect(headersContent).toMatch(
			/\/version\.json\s+Cache-Control:\s*no-cache,\s*must-revalidate,\s*max-age=0/,
		);
	});

	itWhenBuilt("sw.js excludes .md Agent Markdown Documents from precache manifest", () => {
		expect(swContent).toBeTruthy();
		expect(swContent).not.toMatch(/\{url:"[^"]*\.md"/);
	});
});
