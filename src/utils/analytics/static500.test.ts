/**
 * @file Integration tests for static `/500.html` Google Analytics 4 hostname gating (ADR-0003).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const STATIC_500_HTML_PATH = path.resolve(currentDir, "../../../public/500.html");
const STATIC_500_HTML = fs.readFileSync(STATIC_500_HTML_PATH, "utf-8");

/**
 * Global analytics properties populated on `window` by `public/500.html` when GA4 initializes.
 */
interface Static500WindowGlobals {
	/** Queued GA4 command arguments. */
	dataLayer?: IArguments[];
	/** GA4 command dispatcher attached to `window`. */
	gtag?: (...args: unknown[]) => void;
}

/**
 * Loads `public/500.html` into an isolated DOM window at the given URL with inline scripts enabled
 * and external script file downloads disabled.
 *
 * @param url - Full URL used as `window.location` when parsing `public/500.html`.
 *
 * @returns Isolated document, typed window globals, and cleanup callback.
 */
const renderStatic500AtUrl = (url: string) => {
	const win = new Window({
		settings: {
			disableJavaScriptFileLoading: true,
			enableJavaScriptEvaluation: true,
			suppressInsecureJavaScriptEnvironmentWarning: true,
		},
		url,
	});

	win.document.write(STATIC_500_HTML);
	win.document.close();

	return {
		cleanup: () => win.happyDOM.close(),
		document: win.document,
		globals: win as unknown as Static500WindowGlobals,
	};
};

describe("public/500.html GA4 hostname gating", () => {
	it.each([
		"http://localhost:4173/500.html?error_type=initialization_error",
		"http://127.0.0.1:4173/500.html?error_type=initialization_error",
		"https://preview-branch.nms-optimizer-web.pages.dev/500.html",
		"https://www.nms-optimizer.app/500.html",
	])("skips Google Tag Manager script injection and gtag calls on %s", async (url) => {
		const { cleanup, document, globals } = renderStatic500AtUrl(url);

		try {
			expect(
				document.querySelector('script[src*="googletagmanager.com/gtag/js"]'),
			).toBeNull();
			expect(globals.dataLayer).toBeUndefined();
			expect(globals.gtag).toBeUndefined();
		} finally {
			await cleanup();
		}
	});

	it("injects Google Tag Manager script and configures GA4 exclusively on nms-optimizer.app", async () => {
		const { cleanup, document, globals } = renderStatic500AtUrl(
			"https://nms-optimizer.app/500.html?error_type=initialization_error",
		);

		try {
			const gtmScript = document.head.querySelector(
				'script[src="https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9"]',
			);
			expect(gtmScript).not.toBeNull();
			expect(gtmScript?.hasAttribute("async")).toBe(true);

			expect(globals.dataLayer).toBeDefined();
			const entries = (globals.dataLayer ?? []).map((entry) => Array.from(entry));
			expect(entries).toHaveLength(2);
			expect(entries[0]?.[0]).toBe("js");
			expect(Object.prototype.toString.call(entries[0]?.[1])).toBe("[object Date]");
			expect(entries[1]).toEqual([
				"config",
				"G-P5VBZQ69Q9",
				{
					allow_ad_personalization_signals: false,
					allow_google_signals: false,
					anonymize_ip: true,
					error_type: "initialization_error",
					page_path: "/500.html",
					page_title: "500: Application Error | NMS Optimizer",
				},
			]);
		} finally {
			await cleanup();
		}
	});

	it("defaults error_type to 'unknown' on nms-optimizer.app when query parameter is absent", async () => {
		const { cleanup, globals } = renderStatic500AtUrl("https://nms-optimizer.app/500.html");

		try {
			const entries = (globals.dataLayer ?? []).map((entry) => Array.from(entry));
			expect(entries[1]).toEqual([
				"config",
				"G-P5VBZQ69Q9",
				expect.objectContaining({
					error_type: "unknown",
					page_path: "/500.html",
				}),
			]);
		} finally {
			await cleanup();
		}
	});
});
