import type { Mock } from "vitest";
import ReactGA from "react-ga4";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals/attribution";

import type { GA4Event } from "@/types/analytics";

import * as tracking from "./tracking";

vi.mock("@/utils/system/monitoring", () => ({
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

vi.mock("react-ga4", () => ({
	default: {
		event: vi.fn(),
		initialize: vi.fn(),
	},
}));

vi.mock("web-vitals/attribution", () => ({
	onCLS: vi.fn(),
	onFCP: vi.fn(),
	onINP: vi.fn(),
	onLCP: vi.fn(),
	onTTFB: vi.fn(),
}));

describe("Analytics Tracking", () => {
	const testEvent: GA4Event = {
		action: "reset_grid",
		category: "ui",
		platform: "standard",
		value: 1,
	};

	let documentListeners: Record<string, Array<() => void>>;
	let windowListeners: Record<string, Array<() => void>>;

	beforeEach(() => {
		vi.clearAllMocks();
		tracking.resetAnalyticsForTesting();
		documentListeners = {};
		windowListeners = {};

		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
		vi.stubGlobal("navigator", {
			sendBeacon: vi.fn().mockReturnValue(true),
			userAgent: "Mozilla/5.0",
		});

		vi.stubGlobal("window", {
			addEventListener: vi.fn((event: string, handler: () => void) => {
				windowListeners[event] ??= [];
				windowListeners[event].push(handler);
			}),
			google_tag_manager: {},
			localStorage: {
				clear: vi.fn(() => localStorage.clear()),
				getItem: vi.fn((key: string) => localStorage.getItem(key)),
				removeItem: vi.fn((key: string) => localStorage.removeItem(key)),
				setItem: vi.fn((key: string, value: string) => localStorage.setItem(key, value)),
			},
			location: {
				pathname: "/",
				search: "",
			},
			matchMedia: vi.fn().mockReturnValue({ matches: false }),
			removeEventListener: vi.fn(),
		});

		const head = {
			appendChild: vi.fn(
				(script: { onerror?: () => void; onload?: () => void; src: string }) => {
					const probe = (globalThis as unknown as { fetch: Mock }).fetch;

					try {
						const result = probe?.(script.src);
						Promise.resolve(result)
							.then(() => script.onload?.())
							.catch(() => script.onerror?.());
					} catch {
						script.onerror?.();
					}

					return script;
				},
			),
		};

		vi.stubGlobal("document", {
			addEventListener: vi.fn((event: string, handler: () => void) => {
				documentListeners[event] ??= [];
				documentListeners[event].push(handler);
			}),
			body: {
				appendChild: vi.fn(),
			},
			cookie: "",
			createElement: vi.fn().mockImplementation((tag: string) => {
				if (tag === "script") {
					return {
						onerror: undefined,
						onload: undefined,
						remove: vi.fn(),
						setAttribute: vi.fn(),
					};
				}

				return {};
			}),
			head,
			querySelector: vi.fn().mockReturnValue(null),
			removeEventListener: vi.fn(),
			title: "Test Title",
			visibilityState: "visible",
		});

		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	describe("Initialization & Disabled/Bot Guards", () => {
		it("should not initialize GA4 or flush queued events on pagehide when analytics are disabled via env", async () => {
			const originalEnv = import.meta.env.VITE_ANALYTICS_ENABLED;
			vi.stubEnv("VITE_ANALYTICS_ENABLED", "false");

			try {
				tracking.sendEvent(testEvent);
				await tracking.initializeAnalytics();
				tracking.sendEvent(testEvent);

				Object.defineProperty(document, "visibilityState", {
					configurable: true,
					value: "hidden",
				});
				documentListeners.visibilitychange?.forEach((fn) => fn());
				windowListeners.pagehide?.forEach((fn) => fn());

				expect(ReactGA.initialize).not.toHaveBeenCalled();
				expect(navigator.sendBeacon).not.toHaveBeenCalled();
			} finally {
				if (originalEnv === undefined) {
					vi.unstubAllEnvs();
				} else {
					vi.stubEnv("VITE_ANALYTICS_ENABLED", originalEnv);
				}
			}
		});

		it("should not initialize GA4 or flush queued events on pagehide if the user is a bot", async () => {
			vi.stubGlobal("navigator", {
				sendBeacon: vi.fn().mockReturnValue(true),
				userAgent: "Googlebot/2.1",
			});

			tracking.sendEvent(testEvent);
			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "hidden",
			});
			documentListeners.visibilitychange?.forEach((fn) => fn());
			windowListeners.pagehide?.forEach((fn) => fn());

			expect(ReactGA.initialize).not.toHaveBeenCalled();
			expect(navigator.sendBeacon).not.toHaveBeenCalled();
		});

		it("should initialize GA4 if not blocked", async () => {
			vi.mocked(fetch).mockResolvedValue({ status: 200 } as Response);
			await tracking.initializeAnalytics();
			expect(ReactGA.initialize).toHaveBeenCalled();
		});

		it("should register Web Vitals observers before the 3s ad-blocker probe timeout finishes", async () => {
			vi.useFakeTimers();

			try {
				vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

				const initPromise = tracking.initializeAnalytics();

				await vi.waitFor(() => {
					expect(onCLS).toHaveBeenCalledWith(expect.any(Function));
					expect(onINP).toHaveBeenCalledWith(expect.any(Function));
					expect(onFCP).toHaveBeenCalledWith(expect.any(Function));
					expect(onLCP).toHaveBeenCalledWith(expect.any(Function));
					expect(onTTFB).toHaveBeenCalledWith(expect.any(Function));
				});

				await vi.advanceTimersByTimeAsync(3000);
				await initPromise;

				expect(ReactGA.initialize).not.toHaveBeenCalled();
			} finally {
				vi.useRealTimers();
			}
		});

		it.each([
			{ probe: "google-analytics.com", reason: "e.g. Pi-hole DNS sinkhole" },
			{ probe: "googletagmanager.com", reason: "e.g. script blocker" },
		])("should fall back to blocked when $probe fails ($reason)", async ({ probe }) => {
			vi.mocked(fetch).mockImplementation(((url: string) => {
				if (typeof url === "string" && url.includes(probe)) {
					return Promise.reject(new Error("net::ERR_NAME_NOT_RESOLVED"));
				}

				return Promise.resolve({ status: 200 } as Response);
			}) as typeof fetch);

			await tracking.initializeAnalytics();
			expect(ReactGA.initialize).not.toHaveBeenCalled();
		});
	});

	describe("Event Dispatching & Server Relay Fallback", () => {
		it("should call client-side analytics when tracking is not blocked", async () => {
			vi.mocked(fetch).mockResolvedValue({ status: 200 } as Response);
			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			await vi.waitFor(() => {
				expect(ReactGA.event).toHaveBeenCalledWith(
					testEvent.action,
					expect.objectContaining({
						tracking_source: "client",
					}),
				);
			});
		});

		it("should normalize boolean parameters to strings while preserving nonInteraction", async () => {
			vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
			await tracking.initializeAnalytics();
			tracking.sendEvent({
				action: "optimize_tech",
				category: "ui",
				forced: false,
				is_custom_grid: true,
				nonInteraction: true,
				supercharged: true,
			});

			await vi.waitFor(() => {
				expect(ReactGA.event).toHaveBeenCalledWith(
					"optimize_tech",
					expect.objectContaining({
						forced: "false",
						is_custom_grid: "true",
						nonInteraction: true,
						supercharged: "true",
						tracking_source: "client",
					}),
				);
			});
		});

		it.each([
			{ description: "all probes fail", filter: () => true },
			{
				description: "google-analytics collect endpoint is blocked (e.g. Pi-hole)",
				filter: (url: string) => url.includes("google-analytics.com/g/collect"),
			},
		])("should route events to server-side when $description", async ({ filter }) => {
			vi.mocked(fetch).mockImplementation(((url: string) => {
				if (typeof url === "string" && filter(url)) {
					return Promise.reject(new Error("net::ERR_NAME_NOT_RESOLVED"));
				}

				return Promise.resolve({ status: 200 } as Response);
			}) as typeof fetch);

			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			await vi.waitFor(() => {
				expect(navigator.sendBeacon).toHaveBeenCalled();
				expect(ReactGA.event).not.toHaveBeenCalled();
			});
			expect(localStorage.getItem("analytics_client_id")).toMatch(/^web_\d+_[a-z0-9]+$/);
		});

		it("should prioritize _ga cookie ID over localStorage and fall back to keepalive fetch when sendBeacon returns false", async () => {
			const gaId = "123456.789012";
			Object.defineProperty(document, "cookie", {
				value: `_ga=GA1.1.${gaId}`,
				writable: true,
			});
			vi.mocked(navigator.sendBeacon).mockReturnValue(false);

			const fetchMock = vi.fn().mockImplementation((url: string) => {
				if (url.includes("google")) {
					return Promise.reject(new Error("blocked"));
				}

				return Promise.resolve({ ok: true });
			});
			vi.stubGlobal("fetch", fetchMock);

			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			expect(localStorage.getItem("analytics_client_id")).toBe(gaId);
			expect(fetchMock).toHaveBeenCalledWith(
				expect.stringContaining("api/events"),
				expect.objectContaining({
					body: expect.stringContaining(`"clientId":"${gaId}"`),
					keepalive: true,
					method: "POST",
				}),
			);
		});
	});

	describe("Core Web Vitals Telemetry (ADR-0003)", () => {
		it("should format CLS (* 1000), INP (value over negative delta), and LCP attribution via initializeAnalytics", async () => {
			await tracking.initializeAnalytics();

			const clsCallback = vi.mocked(onCLS).mock.calls[0][0];
			clsCallback({
				attribution: {
					largestShiftTarget: "div.grid-container",
					loadState: "dom-interactive",
				},
				delta: 0.0549,
				entries: [],
				id: "v3-cls-attr",
				name: "CLS",
				navigationId: 1,
				navigationType: "navigate",
				rating: "good",
				value: 0.0549,
			});

			expect(ReactGA.event).toHaveBeenCalledWith(
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					interaction_target: "div.grid-container",
					label: "v3-cls-attr",
					load_state: "dom-interactive",
					metric_name: "CLS",
					nonInteraction: true,
					value: 55,
				}),
			);

			const inpCallback = vi.mocked(onINP).mock.calls[0][0];
			inpCallback({
				attribution: {
					inputDelay: 2.1,
					interactionTarget: "",
					interactionType: "keyboard",
					loadState: "complete",
					longAnimationFrameEntries: [],
					presentationDelay: 36.2,
					processedEventEntries: [],
					processingDuration: 42.8,
				},
				delta: -24,
				entries: [],
				id: "v3-subsequent-inp",
				name: "INP",
				navigationId: 1,
				navigationType: "navigate",
				rating: "good",
				value: 81.1,
			});

			expect(ReactGA.event).toHaveBeenCalledWith(
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					input_delay: 2,
					interaction_target: "(unmounted element)",
					interaction_type: "keyboard",
					label: "v3-subsequent-inp",
					load_state: "complete",
					metric_name: "INP",
					nonInteraction: true,
					presentation_delay: 36,
					processing_duration: 43,
					value: 81,
				}),
			);

			const lcpCallback = vi.mocked(onLCP).mock.calls[0][0];
			lcpCallback({
				attribution: {
					elementRenderDelay: 0,
					resourceLoadDelay: 0,
					resourceLoadDuration: 0,
					target: "main.app-shell>h1",
					timeToFirstByte: 0,
				},
				delta: 1850.2,
				entries: [],
				id: "v3-lcp-attr",
				name: "LCP",
				navigationId: 1,
				navigationType: "navigate",
				rating: "good",
				value: 1850.2,
			});

			expect(ReactGA.event).toHaveBeenCalledWith(
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					interaction_target: "main.app-shell>h1",
					label: "v3-lcp-attr",
					metric_name: "LCP",
					nonInteraction: true,
					value: 1850,
				}),
			);
		});
	});
});
