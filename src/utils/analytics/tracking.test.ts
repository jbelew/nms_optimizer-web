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

vi.mock("web-vitals/attribution", () => ({
	onCLS: vi.fn(),
	onFCP: vi.fn(),
	onINP: vi.fn(),
	onLCP: vi.fn(),
	onTTFB: vi.fn(),
}));

/**
 * Extracts normalized `Array.from(arguments)` entries pushed into `window.dataLayer`.
 */
const getDataLayerEntries = (): unknown[][] =>
	(window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));

describe("Analytics Tracking", () => {
	const testEvent: GA4Event = {
		action: "reset_grid",
		category: "ui",
		platform: "standard",
		reset_scope: "session",
	};

	let documentListeners: Record<string, Array<(event?: Partial<Event>) => void>>;
	let windowListeners: Record<string, Array<() => void>>;
	let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
	let sendBeaconMock: ReturnType<typeof vi.fn<typeof navigator.sendBeacon>>;

	beforeEach(() => {
		vi.clearAllMocks();
		tracking.resetAnalyticsForTesting();
		documentListeners = {};
		windowListeners = {};

		fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
		sendBeaconMock = vi.fn<typeof navigator.sendBeacon>().mockReturnValue(true);

		vi.stubGlobal("fetch", fetchMock);
		vi.stubGlobal("navigator", {
			sendBeacon: sendBeaconMock,
			userAgent: "Mozilla/5.0",
		});

		const sessionStore = new Map<string, string>();

		vi.stubGlobal("window", {
			addEventListener: vi.fn((event: string, handler: () => void) => {
				windowListeners[event] ??= [];
				windowListeners[event].push(handler);
			}),
			dataLayer: undefined,
			google_tag_manager: {},
			gtag: undefined,
			localStorage: {
				clear: vi.fn(() => localStorage.clear()),
				getItem: vi.fn((key: string) => localStorage.getItem(key)),
				removeItem: vi.fn((key: string) => localStorage.removeItem(key)),
				setItem: vi.fn((key: string, value: string) => localStorage.setItem(key, value)),
			},
			location: {
				hostname: "nms-optimizer.app",
				href: "https://nms-optimizer.app/",
				pathname: "/",
				search: "",
			},
			matchMedia: vi.fn().mockReturnValue({ matches: false }),
			removeEventListener: vi.fn(),
			sessionStorage: {
				clear: vi.fn(() => sessionStore.clear()),
				getItem: vi.fn((key: string) => sessionStore.get(key) ?? null),
				removeItem: vi.fn((key: string) => sessionStore.delete(key)),
				setItem: vi.fn((key: string, value: string) => {
					sessionStore.set(key, value);
				}),
			},
		});

		const head = {
			appendChild: vi.fn(
				(script: { onerror?: () => void; onload?: () => void; src: string }) => {
					try {
						const result = fetchMock(script.src);
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
			addEventListener: vi.fn((event: string, handler: (event?: Partial<Event>) => void) => {
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
						async: false,
						onerror: undefined,
						onload: undefined,
						remove: vi.fn(),
						setAttribute: vi.fn(),
						src: "",
					};
				}

				return {};
			}),
			head,
			querySelector: vi.fn().mockReturnValue(null),
			removeEventListener: vi.fn(),
			title: "NMS Starship Optimizer",
			visibilityState: "visible",
		});

		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
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

				expect(window.gtag).toBeUndefined();
				expect(sendBeaconMock).not.toHaveBeenCalled();
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
				sendBeacon: sendBeaconMock,
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

			expect(window.gtag).toBeUndefined();
			expect(sendBeaconMock).not.toHaveBeenCalled();
		});

		it("should suppress analytics when DEV is true outside test mode", async () => {
			vi.stubEnv("MODE", "development");
			vi.stubEnv("DEV", true);

			tracking.sendEvent(testEvent);
			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "hidden",
			});
			documentListeners.visibilitychange?.forEach((fn) => fn());
			windowListeners.pagehide?.forEach((fn) => fn());

			expect(window.gtag).toBeUndefined();
			expect(sendBeaconMock).not.toHaveBeenCalled();
		});

		it.each([
			"localhost",
			"127.0.0.1",
			"[::1]",
			"preview-branch.nms-optimizer.pages.dev",
			"nms-optimizer-service-afebcfd47e2a.herokuapp.com",
		])(
			"should suppress analytics on non-production hostname %s outside test mode",
			async (hostname) => {
				vi.stubEnv("MODE", "production");
				vi.stubEnv("DEV", false);
				Object.defineProperty(window, "location", {
					configurable: true,
					value: { hostname, href: `https://${hostname}/`, pathname: "/", search: "" },
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

				expect(window.gtag).toBeUndefined();
				expect(sendBeaconMock).not.toHaveBeenCalled();
			},
		);

		it("should configure window.gtag directly with app_version, is_installed, and platform_type user_properties on production hostnames", async () => {
			vi.stubEnv("MODE", "production");
			vi.stubEnv("DEV", false);
			localStorage.setItem("selectedPlatform", "corvette");

			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			const entries = getDataLayerEntries();
			expect(entries[0]?.[0]).toBe("js");
			expect(entries[1]).toEqual([
				"config",
				expect.stringMatching(/^G-/),
				expect.objectContaining({
					allow_ad_personalization_signals: false,
					allow_google_signals: false,
					client_id: expect.stringMatching(/^web_\d+_[a-z0-9]+$/),
					send_page_view: false,
					user_properties: {
						app_version: expect.any(String),
						is_installed: "no",
						platform_type: "corvette",
					},
				}),
			]);
			expect(entries[2]).toEqual([
				"event",
				"reset_grid",
				expect.objectContaining({
					app_version: expect.any(String),
					category: "ui",
					is_installed: "no",
					platform: "standard",
					reset_scope: "session",
					tracking_source: "client",
					transport: "gtag",
				}),
			]);
		});

		it("should register Web Vitals observers before the 3s ad-blocker probe timeout finishes", async () => {
			vi.useFakeTimers();

			try {
				fetchMock.mockReturnValue(new Promise(() => {}));

				const initPromise = tracking.initializeAnalytics();

				await vi.waitFor(() => {
					expect(onCLS).toHaveBeenCalledWith(
						expect.any(Function),
						expect.objectContaining({ generateTarget: expect.any(Function) }),
					);
					expect(onINP).toHaveBeenCalledWith(
						expect.any(Function),
						expect.objectContaining({ generateTarget: expect.any(Function) }),
					);
					expect(onFCP).toHaveBeenCalledWith(expect.any(Function));
					expect(onLCP).toHaveBeenCalledWith(
						expect.any(Function),
						expect.objectContaining({ generateTarget: expect.any(Function) }),
					);
					expect(onTTFB).toHaveBeenCalledWith(expect.any(Function));
				});

				await vi.advanceTimersByTimeAsync(3000);
				await initPromise;

				expect(getDataLayerEntries()).toHaveLength(0);
			} finally {
				vi.useRealTimers();
			}
		});

		it.each([
			{ probe: "google-analytics.com", reason: "e.g. Pi-hole DNS sinkhole" },
			{ probe: "googletagmanager.com", reason: "e.g. script blocker" },
		])("should fall back to blocked when $probe fails ($reason)", async ({ probe }) => {
			fetchMock.mockImplementation((input) => {
				const url = String(input);

				if (url.includes(probe)) {
					return Promise.reject(new Error("net::ERR_NAME_NOT_RESOLVED"));
				}

				return Promise.resolve(new Response(null, { status: 200 }));
			});

			await tracking.initializeAnalytics();
			expect(getDataLayerEntries()).toHaveLength(0);
		});

		it("should only call AbortController.abort() when fetchProbe is still in flight and skip aborting once fetchProbe has settled", async () => {
			const abortSpy = vi.spyOn(AbortController.prototype, "abort");

			// 1. Both probes succeed -> abort() should not be called
			fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

			await tracking.initializeAnalytics();

			expect(abortSpy).not.toHaveBeenCalled();
			expect(getDataLayerEntries().length).toBeGreaterThanOrEqual(2);

			// 2. Spoofed GTM script loads while fetchProbe is still pending -> abort() should be called once
			tracking.resetAnalyticsForTesting();
			window.dataLayer = undefined;
			window.gtag = undefined;
			Reflect.deleteProperty(window, "google_tag_manager");

			fetchMock.mockImplementation((input, init) => {
				if (String(input).includes("google-analytics.com")) {
					return new Promise<Response>((_resolve, reject) => {
						init?.signal?.addEventListener("abort", () => {
							reject(init.signal?.reason);
						});
					});
				}

				return Promise.resolve(new Response(null, { status: 200 }));
			});

			await tracking.initializeAnalytics();

			expect(abortSpy).toHaveBeenCalledTimes(1);
			expect(getDataLayerEntries()).toHaveLength(0);
		});
	});

	describe("Event Dispatching, User Properties, PWA Install & Server Relay Parity", () => {
		it("should normalize boolean parameters to strings, map page to page_path, and map nonInteraction to non_interaction", async () => {
			await tracking.initializeAnalytics();
			tracking.sendEvent({
				action: "optimize_tech",
				category: "ui",
				forced: false,
				is_custom_grid: true,
				nonInteraction: true,
				supercharged: true,
			});
			tracking.sendEvent({
				action: "page_view",
				category: "engagement",
				page: "/about",
				page_title: "About",
			});

			const entries = getDataLayerEntries();
			expect(entries).toContainEqual([
				"event",
				"optimize_tech",
				expect.objectContaining({
					app_version: expect.any(String),
					forced: "false",
					is_custom_grid: "true",
					is_installed: "no",
					non_interaction: true,
					supercharged: "true",
					tracking_source: "client",
					transport: "gtag",
				}),
			]);
			expect(entries).toContainEqual([
				"event",
				"page_view",
				expect.objectContaining({
					page_path: "/about",
					page_title: "About",
					tracking_source: "client",
				}),
			]);
		});

		it("should synchronize platform_type user property and track real-time appinstalled PWA events", async () => {
			await tracking.initializeAnalytics();
			tracking.syncAnalyticsPlatformProperty("solar");

			windowListeners.appinstalled?.forEach((fn) => fn());

			const entries = getDataLayerEntries();
			expect(entries).toContainEqual(["set", "user_properties", { platform_type: "solar" }]);
			expect(entries).toContainEqual(["set", "user_properties", { is_installed: "yes" }]);
			expect(entries).toContainEqual([
				"event",
				"app_installed",
				expect.objectContaining({
					category: "engagement",
					is_installed: "yes",
					non_interaction: false,
					platform: "solar",
					tracking_source: "client",
				}),
			]);
		});

		it("should flush pre-init queued events on Safari pagehide even while visibilityState is still visible", () => {
			tracking.sendEvent(testEvent);
			expect(sendBeaconMock).not.toHaveBeenCalled();

			// Safari fires pagehide while document.visibilityState is still "visible"
			expect(document.visibilityState).toBe("visible");
			windowListeners.pagehide?.forEach((fn) => fn());

			expect(sendBeaconMock).toHaveBeenCalledTimes(1);
		});

		it("should enrich server-relayed events with session_id, session_number, engagement_time_msec, default page context, and userProperties", async () => {
			Object.defineProperty(document, "cookie", {
				configurable: true,
				value: "_ga=GA1.1.123456.789012; _ga_P5VBZQ69Q9=GS2.1.s1731369600$o3$g1$t1731369610",
				writable: true,
			});
			sendBeaconMock.mockReturnValue(false);

			fetchMock.mockImplementation((input) => {
				if (String(input).includes("google")) {
					return Promise.reject(new Error("blocked"));
				}

				return Promise.resolve(new Response(null, { status: 200 }));
			});

			tracking.syncAnalyticsPlatformProperty("freighter");
			await tracking.initializeAnalytics();
			tracking.sendEvent(testEvent);

			expect(localStorage.getItem("analytics_client_id")).toBe("123456.789012");

			const relayCall = fetchMock.mock.calls.find(([url]) =>
				String(url).includes("api/events"),
			);
			expect(relayCall).toBeDefined();

			const parsedBody = JSON.parse(String(relayCall?.[1]?.body)) as {
				clientId: string;
				eventName: string;
				params: Record<string, unknown>;
				userProperties: Record<string, unknown>;
			};
			expect(parsedBody).toEqual({
				clientId: "123456.789012",
				eventName: "reset_grid",
				params: expect.objectContaining({
					app_version: expect.any(String),
					category: "ui",
					engagement_time_msec: expect.any(Number),
					is_installed: "no",
					page_location: "https://nms-optimizer.app/",
					page_path: "/",
					page_title: "NMS Starship Optimizer",
					platform: "standard",
					reset_scope: "session",
					session_id: 1731369600,
					session_number: 3,
					tracking_source: "server",
					transport: "fetch-keepalive",
				}),
				userProperties: {
					app_version: expect.any(String),
					is_installed: "no",
					platform_type: "freighter",
				},
			});
			expect(Number(parsedBody.params.engagement_time_msec)).toBeGreaterThanOrEqual(1);
		});

		it("should maintain a rolling 30-minute sessionStorage session_id when _ga_<container> cookie is absent", async () => {
			vi.useFakeTimers();

			try {
				vi.setSystemTime(new Date("2026-11-11T12:00:00Z"));
				sendBeaconMock.mockReturnValue(false);
				fetchMock.mockImplementation((input) => {
					if (String(input).includes("google")) {
						return Promise.reject(new Error("blocked"));
					}

					return Promise.resolve(new Response(null, { status: 200 }));
				});

				await tracking.initializeAnalytics();
				tracking.sendEvent(testEvent);

				// 10 minutes later: same sessionId, sessionNumber = 1
				vi.advanceTimersByTime(10 * 60 * 1000);
				tracking.sendEvent(testEvent);

				// 31 minutes later: expired -> new sessionId, sessionNumber = 2
				vi.advanceTimersByTime(31 * 60 * 1000);
				tracking.sendEvent(testEvent);

				const relayPayloads = fetchMock.mock.calls
					.filter(([url]) => String(url).includes("api/events"))
					.map(
						([, init]) =>
							JSON.parse(String(init?.body)) as { params: Record<string, unknown> },
					);

				expect(relayPayloads).toHaveLength(3);
				expect(relayPayloads[0]?.params.session_number).toBe(1);
				expect(relayPayloads[1]?.params.session_id).toBe(
					relayPayloads[0]?.params.session_id,
				);
				expect(relayPayloads[1]?.params.session_number).toBe(1);
				expect(Number(relayPayloads[2]?.params.session_id)).toBeGreaterThan(
					Number(relayPayloads[1]?.params.session_id),
				);
				expect(relayPayloads[2]?.params.session_number).toBe(2);
			} finally {
				vi.useRealTimers();
			}
		});

		it("should omit engagement_time_msec on passive nonInteraction events while preserving foreground time for the next interactive event", async () => {
			vi.useFakeTimers();

			try {
				vi.setSystemTime(new Date("2026-11-11T12:00:00Z"));
				sendBeaconMock.mockReturnValue(false);
				fetchMock.mockImplementation((input) => {
					if (String(input).includes("google")) {
						return Promise.reject(new Error("blocked"));
					}

					return Promise.resolve(new Response(null, { status: 200 }));
				});

				await tracking.initializeAnalytics();

				// Advance 2.5s of foreground visibility before a passive Web Vitals / error event fires
				vi.advanceTimersByTime(2500);
				tracking.sendEvent({
					action: "exception",
					category: "error",
					description: "Error: passive",
					fatal: false,
					nonInteraction: true,
				});

				// Advance another 1.5s before an interactive event fires
				vi.advanceTimersByTime(1500);
				tracking.sendEvent(testEvent);

				const relayPayloads = fetchMock.mock.calls
					.filter(([url]) => String(url).includes("api/events"))
					.map(
						([, init]) =>
							JSON.parse(String(init?.body)) as {
								eventName: string;
								params: Record<string, unknown>;
							},
					);

				expect(relayPayloads).toHaveLength(2);
				expect(relayPayloads[0]?.eventName).toBe("exception");
				expect(relayPayloads[0]?.params.engagement_time_msec).toBeUndefined();
				expect(relayPayloads[1]?.eventName).toBe("reset_grid");
				expect(relayPayloads[1]?.params.engagement_time_msec).toBe(4000);
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe("Core Web Vitals Telemetry (ADR-0003)", () => {
		it("should emit both value and metric_value and normalize #grid-cell-r-c selectors across CLS, INP, and LCP", async () => {
			await tracking.initializeAnalytics();

			const clsCallback = vi.mocked(onCLS).mock.calls[0]?.[0];
			clsCallback?.({
				attribution: {
					largestShiftTarget: "#grid-cell-2-4>div.cell",
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

			const inpCallback = vi.mocked(onINP).mock.calls[0]?.[0];
			inpCallback?.({
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

			const lcpCallback = vi.mocked(onLCP).mock.calls[0]?.[0];
			lcpCallback?.({
				attribution: {
					elementRenderDelay: 0,
					resourceLoadDelay: 0,
					resourceLoadDuration: 0,
					target: "#grid-cell-0-0>img",
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

			const entries = getDataLayerEntries();
			expect(entries).toContainEqual([
				"event",
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					interaction_target: "#grid-cell>div.cell",
					label: "v3-cls-attr",
					load_state: "dom-interactive",
					metric_name: "CLS",
					metric_value: 55,
					non_interaction: true,
					value: 55,
				}),
			]);
			expect(entries).toContainEqual([
				"event",
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					input_delay: 2,
					interaction_target: "(unmounted element)",
					interaction_type: "keyboard",
					label: "v3-subsequent-inp",
					load_state: "complete",
					metric_name: "INP",
					metric_value: 81,
					non_interaction: true,
					presentation_delay: 36,
					processing_duration: 43,
					value: 81,
				}),
			]);
			expect(entries).toContainEqual([
				"event",
				"performance_metric",
				expect.objectContaining({
					category: "performance",
					interaction_target: "#grid-cell>img",
					label: "v3-lcp-attr",
					metric_name: "LCP",
					metric_value: 1850,
					non_interaction: true,
					value: 1850,
				}),
			]);
		});

		it("should collapse grid-cell-r-c IDs, skip ephemeral radix-* IDs in generateTarget, and recover pre-unmount INP targets", async () => {
			await tracking.initializeAnalytics();

			const inpCall = vi.mocked(onINP).mock.calls[0];
			const inpCallback = inpCall?.[0];
			const inpOpts = inpCall?.[1];
			expect(inpOpts?.generateTarget).toBeTypeOf("function");

			const gridCellButton = {
				classList: ["grid-cell"],
				id: "grid-cell-5-9",
				nodeName: "DIV",
				nodeType: 1,
				parentNode: { nodeType: 9 },
			} as unknown as Node;
			expect(inpOpts?.generateTarget?.(gridCellButton)).toBe("#grid-cell");

			const semanticButton = {
				classList: ["rt-Button"],
				id: "pulse",
				nodeName: "BUTTON",
				nodeType: 1,
				parentNode: { nodeType: 9 },
			} as unknown as Node;
			expect(inpOpts?.generateTarget?.(semanticButton)).toBe("#pulse");

			const radixTrigger = {
				classList: ["rt-Button", "p-2!"],
				id: "radix-_r_c_",
				nodeName: "BUTTON",
				nodeType: 1,
				parentNode: {
					classList: ["ShipSelection"],
					id: "",
					nodeName: "DIV",
					nodeType: 1,
					parentNode: { nodeType: 9 },
				},
			} as unknown as Node;
			expect(inpOpts?.generateTarget?.(radixTrigger)).toBe(
				"div.ShipSelection>button.p-2!.rt-Button",
			);

			const pointerdownHandlers = documentListeners.pointerdown as
				Array<(e: { target: Node }) => void> | undefined;
			expect(pointerdownHandlers?.length).toBeGreaterThan(0);
			pointerdownHandlers?.[0]?.({ target: radixTrigger });

			inpCallback?.({
				attribution: {
					inputDelay: 4,
					interactionTarget: "",
					interactionType: "pointer",
					loadState: "complete",
					longAnimationFrameEntries: [],
					presentationDelay: 40,
					processedEventEntries: [],
					processingDuration: 50,
				},
				delta: 94,
				entries: [],
				id: "v3-unmounted-inp",
				name: "INP",
				navigationId: 1,
				navigationType: "navigate",
				rating: "good",
				value: 94,
			});

			expect(getDataLayerEntries()).toContainEqual([
				"event",
				"performance_metric",
				expect.objectContaining({
					interaction_target: "div.ShipSelection>button.p-2!.rt-Button",
					label: "v3-unmounted-inp",
					metric_name: "INP",
				}),
			]);
		});

		it("should suppress TTFB reports when the page was hidden before responseStart or during reporting, while allowing foreground TTFB", async () => {
			await tracking.initializeAnalytics();
			const ttfbCallback = vi.mocked(onTTFB).mock.calls[0]?.[0];

			const navEntry = {
				activationStart: 0,
				responseStart: 120,
			} as PerformanceNavigationTiming;

			const buildTtfbMetric = (
				id: string,
			): Parameters<NonNullable<typeof ttfbCallback>>[0] => ({
				attribution: {
					cacheDuration: 0,
					connectionDuration: 0,
					dnsDuration: 0,
					navigationEntry: navEntry,
					requestDuration: 120,
					waitingDuration: 0,
				},
				delta: 120,
				entries: [navEntry],
				id,
				name: "TTFB",
				navigationId: 1,
				navigationType: "navigate",
				rating: "good",
				value: 120,
			});

			const initialCount = getDataLayerEntries().length;

			// 1. Page currently hidden when TTFB fires -> suppressed
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "hidden",
			});
			ttfbCallback?.(buildTtfbMetric("v4-ttfb-hidden-now"));
			expect(getDataLayerEntries()).toHaveLength(initialCount);

			// 2. Page now visible, but PerformanceObserver visibility-state recorded hidden before responseStart -> suppressed
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "visible",
			});
			const getEntriesSpy = vi.spyOn(performance, "getEntriesByType").mockImplementation(((
				type: string,
			): PerformanceEntryList => {
				if (type === "visibility-state") {
					return [
						{
							duration: 0,
							entryType: "visibility-state",
							name: "hidden",
							startTime: 0,
							toJSON: () => ({}),
						},
					];
				}

				return [];
			}) as typeof performance.getEntriesByType);

			ttfbCallback?.(buildTtfbMetric("v4-ttfb-hidden-before-response"));
			expect(getDataLayerEntries()).toHaveLength(initialCount);

			// 3. Foreground navigation -> dispatched
			getEntriesSpy.mockReturnValue([]);
			ttfbCallback?.(buildTtfbMetric("v4-ttfb-foreground"));
			expect(getDataLayerEntries()).toContainEqual([
				"event",
				"performance_metric",
				expect.objectContaining({
					label: "v4-ttfb-foreground",
					metric_name: "TTFB",
					metric_value: 120,
					value: 120,
				}),
			]);

			// 4. Page hidden via visibilitychange before responseStart, then refocused before TTFB fires -> suppressed
			const countAfterForeground = getDataLayerEntries().length;
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "hidden",
			});
			documentListeners.visibilitychange?.forEach((fn) => fn({ timeStamp: 40 }));
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "visible",
			});
			ttfbCallback?.(buildTtfbMetric("v4-ttfb-visibilitychange-before-response"));
			expect(getDataLayerEntries()).toHaveLength(countAfterForeground);
		});
	});
});
