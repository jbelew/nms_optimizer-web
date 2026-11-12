/**
 * @file Integration tests for static `/500.html` and `/404.html` Google Analytics 4 hostname and bot gating (ADR-0003).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const STATIC_500_HTML_PATH = path.resolve(currentDir, "../../../public/500.html");
const STATIC_404_HTML_PATH = path.resolve(currentDir, "../../../public/404.html");
const STATIC_500_HTML = fs.readFileSync(STATIC_500_HTML_PATH, "utf-8");
const STATIC_404_HTML = fs.readFileSync(STATIC_404_HTML_PATH, "utf-8");

/**
 * Options for rendering a static HTML page inside an isolated `happy-dom` window.
 */
interface RenderStaticHtmlOptions {
	/** Custom User-Agent string (`navigator.userAgent`). */
	userAgent?: string;
	/** Whether `navigator.webdriver` should be `true`. */
	webdriver?: boolean;
}

/**
 * Global analytics properties populated on `window` by static error pages when GA4 initializes.
 */
interface StaticErrorWindowGlobals {
	/** Queued GA4 command arguments. */
	dataLayer?: IArguments[];
	/** GA4 command dispatcher attached to `window`. */
	gtag?: (...args: unknown[]) => void;
}

/**
 * Loads static HTML into an isolated DOM window at the given URL with inline scripts enabled
 * and external script file downloads disabled.
 *
 * @param html - Raw HTML source string.
 * @param url - Full URL used as `window.location` when parsing the document.
 * @param options - Optional `navigator.userAgent` and `navigator.webdriver` overrides.
 *
 * @returns Isolated document, typed window globals, and cleanup callback.
 */
const renderStaticHtmlAtUrl = (
	html: string,
	url: string,
	options: RenderStaticHtmlOptions = {},
) => {
	const win = new Window({
		settings: {
			disableJavaScriptFileLoading: true,
			enableJavaScriptEvaluation: true,
			navigator: {
				userAgent: options.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
			},
			suppressInsecureJavaScriptEnvironmentWarning: true,
		},
		url,
	});

	Object.defineProperty(win.navigator, "webdriver", {
		configurable: true,
		value: Boolean(options.webdriver),
	});

	win.document.write(html);
	win.document.close();

	return {
		cleanup: () => win.happyDOM.close(),
		document: win.document,
		globals: win as unknown as StaticErrorWindowGlobals,
	};
};

describe("public/500.html GA4 hostname and bot gating", () => {
	it.each([
		"http://localhost:4173/500.html?error_type=initialization_error",
		"http://127.0.0.1:4173/500.html?error_type=initialization_error",
		"https://preview-branch.nms-optimizer-web.pages.dev/500.html",
		"https://www.nms-optimizer.app/500.html",
	])("skips Google Tag Manager script injection and gtag calls on %s", async (url) => {
		const { cleanup, document, globals } = renderStaticHtmlAtUrl(STATIC_500_HTML, url);

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

	it("skips GA4 initialization on nms-optimizer.app for bots and automated webdriver sessions", async () => {
		const botRender = renderStaticHtmlAtUrl(
			STATIC_500_HTML,
			"https://nms-optimizer.app/500.html",
			{ userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)" },
		);
		const webdriverRender = renderStaticHtmlAtUrl(
			STATIC_500_HTML,
			"https://nms-optimizer.app/500.html",
			{ webdriver: true },
		);

		try {
			expect(botRender.globals.dataLayer).toBeUndefined();
			expect(webdriverRender.globals.dataLayer).toBeUndefined();
		} finally {
			await botRender.cleanup();
			await webdriverRender.cleanup();
		}
	});

	it("injects GTM script, configures GA4, emits exception, and tracks #reset-btn recovery on nms-optimizer.app", async () => {
		const { cleanup, document, globals } = renderStaticHtmlAtUrl(
			STATIC_500_HTML,
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
			expect(entries).toHaveLength(3);
			expect(entries[0]?.[0]).toBe("js");
			expect(Object.prototype.toString.call(entries[0]?.[1])).toBe("[object Date]");
			expect(entries[1]).toEqual([
				"config",
				"G-P5VBZQ69Q9",
				{
					allow_ad_personalization_signals: false,
					allow_google_signals: false,
					page_path: "/500.html",
					page_title: "500: Application Error | NMS Optimizer",
					tracking_source: "client",
				},
			]);
			expect(entries[2]).toEqual([
				"event",
				"exception",
				{
					category: "error",
					description: "static_500:initialization_error",
					fatal: "true",
					non_interaction: true,
					tracking_source: "client",
				},
			]);

			const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement | null;
			resetBtn?.click();

			const postClickEntries = (globals.dataLayer ?? []).map((entry) => Array.from(entry));
			expect(postClickEntries[3]).toEqual([
				"event",
				"select_content",
				{
					category: "engagement",
					content_type: "error_recovery",
					item_id: "hard_reset_500",
					tracking_source: "client",
					transport_type: "beacon",
				},
			]);
		} finally {
			await cleanup();
		}
	});

	it("defaults exception description suffix to 'unknown' when error_type query parameter is absent", async () => {
		const { cleanup, globals } = renderStaticHtmlAtUrl(
			STATIC_500_HTML,
			"https://nms-optimizer.app/500.html",
		);

		try {
			const entries = (globals.dataLayer ?? []).map((entry) => Array.from(entry));
			expect(entries[1]?.[2]).not.toHaveProperty("error_type");
			expect(entries[1]).toEqual([
				"config",
				"G-P5VBZQ69Q9",
				expect.objectContaining({
					page_path: "/500.html",
					tracking_source: "client",
				}),
			]);
			expect(entries[2]).toEqual([
				"event",
				"exception",
				expect.objectContaining({
					description: "static_500:unknown",
					fatal: "true",
				}),
			]);
		} finally {
			await cleanup();
		}
	});
});

describe("public/404.html GA4 hostname and bot gating", () => {
	it.each([
		"http://localhost:4173/missing",
		"https://preview-branch.nms-optimizer-web.pages.dev/missing",
		"https://www.nms-optimizer.app/missing",
	])("skips Google Tag Manager script injection on %s", async (url) => {
		const { cleanup, document, globals } = renderStaticHtmlAtUrl(STATIC_404_HTML, url);

		try {
			expect(
				document.querySelector('script[src*="googletagmanager.com/gtag/js"]'),
			).toBeNull();
			expect(globals.dataLayer).toBeUndefined();
		} finally {
			await cleanup();
		}
	});

	it("injects GTM script, configures GA4, and emits not_found exclusively on nms-optimizer.app", async () => {
		const { cleanup, document, globals } = renderStaticHtmlAtUrl(
			STATIC_404_HTML,
			"https://nms-optimizer.app/missing-route",
		);

		try {
			const gtmScript = document.head.querySelector(
				'script[src="https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9"]',
			);
			expect(gtmScript).not.toBeNull();

			const entries = (globals.dataLayer ?? []).map((entry) => Array.from(entry));
			expect(entries).toHaveLength(3);
			expect(entries[1]).toEqual([
				"config",
				"G-P5VBZQ69Q9",
				{
					allow_ad_personalization_signals: false,
					allow_google_signals: false,
					page_path: "/missing-route",
					page_title: "404: Not Found | NMS Optimizer",
					tracking_source: "client",
				},
			]);
			expect(entries[2]).toEqual([
				"event",
				"not_found",
				{
					category: "navigation",
					non_interaction: true,
					page_path: "/missing-route",
					tracking_source: "client",
				},
			]);
		} finally {
			await cleanup();
		}
	});
});
