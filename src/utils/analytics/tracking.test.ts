import ReactGA from "react-ga4";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as tracking from "./tracking";

// Mock external dependencies
vi.mock("react-ga4", () => ({
	default: {
		initialize: vi.fn(),
		event: vi.fn(),
	},
}));

describe("Analytics Tracking", () => {
	const testEvent = {
		category: "Test",
		action: "Test Action",
		label: "Test Label",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		tracking.resetAnalyticsForTesting();

		// Use a simple mock that doesn't involve AbortController complexity in tests
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
		vi.stubGlobal("navigator", {
			userAgent: "Mozilla/5.0",
			sendBeacon: vi.fn().mockReturnValue(true),
		});

		// Mock document. The script-injection probe used by `detectAdBlocker`
		// triggers `onload` (not blocked) or `onerror` (blocked) on appendChild,
		// driven by whether the mocked `fetch` resolves or rejects — preserving
		// the existing test contract.
		const head = {
			appendChild: vi.fn((script: { onload?: () => void; onerror?: () => void }) => {
				const probe = (globalThis as unknown as { fetch: Mock }).fetch;

				try {
					const result = probe?.("https://www.googletagmanager.com/gtag/js");
					Promise.resolve(result)
						.then(() => script.onload?.())
						.catch(() => script.onerror?.());
				} catch {
					script.onerror?.();
				}

				return script;
			}),
		};
		vi.stubGlobal("document", {
			cookie: "",
			visibilityState: "visible",
			querySelector: vi.fn().mockReturnValue(null),
			createElement: vi.fn().mockImplementation((tag: string) => {
				if (tag === "script") {
					return {
						setAttribute: vi.fn(),
						remove: vi.fn(),
						onload: undefined,
						onerror: undefined,
					};
				}

				return {};
			}),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			head,
			body: {
				appendChild: vi.fn(),
			},
			title: "Test Title",
		});

		// Mock window
		vi.stubGlobal("window", {
			location: {
				pathname: "/",
				search: "",
			},
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			matchMedia: vi.fn().mockReturnValue({ matches: false }),
			localStorage: {
				getItem: vi.fn((key) => localStorage.getItem(key)),
				setItem: vi.fn((key, value) => localStorage.setItem(key, value)),
				removeItem: vi.fn((key) => localStorage.removeItem(key)),
				clear: vi.fn(() => localStorage.clear()),
			},
		});

		// Mock env.isDevMode to return false by default for tests
		vi.spyOn(tracking.env, "isDevMode").mockReturnValue(false);

		localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	describe("Initialization", () => {
		it("should not initialize GA4 when analytics are disabled via env", async () => {
			const originalEnv = import.meta.env.VITE_ANALYTICS_ENABLED;
			vi.stubEnv("VITE_ANALYTICS_ENABLED", "false");

			try {
				await tracking.initializeAnalytics();
				expect(ReactGA.initialize).not.toHaveBeenCalled();
			} finally {
				if (originalEnv === undefined) {
					vi.unstubAllEnvs();
				} else {
					vi.stubEnv("VITE_ANALYTICS_ENABLED", originalEnv);
				}
			}
		});

		it("should not initialize GA4 if the user is a bot", async () => {
			vi.stubGlobal("navigator", { userAgent: "Googlebot/2.1" });
			await tracking.initializeAnalytics();
			expect(ReactGA.initialize).not.toHaveBeenCalled();
		});

		it("should initialize GA4 if not blocked", async () => {
			(fetch as Mock).mockResolvedValue({ status: 200 });
			await tracking.initializeAnalytics();
			expect(ReactGA.initialize).toHaveBeenCalled();
		});
	});

	describe("Event Dispatching", () => {
		it("should call client-side analytics when tracking is not blocked", async () => {
			(fetch as Mock).mockResolvedValue({ status: 200 });
			tracking.sendEvent(testEvent);

			await vi.waitFor(() => {
				expect(ReactGA.event).toHaveBeenCalledWith(
					testEvent.action,
					expect.objectContaining({
						tracking_source: "client",
					})
				);
			});
		});

		it("should call server-side analytics when tracking is blocked", async () => {
			(fetch as Mock).mockRejectedValue(new Error("Blocked"));
			tracking.sendEvent(testEvent);

			await vi.waitFor(() => {
				expect(navigator.sendBeacon).toHaveBeenCalled();
			});
		});
	});

	describe("Server-Side Client", () => {
		it("should generate a client ID and store it in localStorage", () => {
			const clientId = tracking.initializeAnalyticsClient();
			expect(clientId).toMatch(/^web_\d+_[a-z0-9]+$/);
			expect(localStorage.getItem("analytics_client_id")).toBe(clientId);
		});

		it("should prioritize GA cookie ID over localStorage", () => {
			const gaId = "123456.789012";
			Object.defineProperty(document, "cookie", {
				writable: true,
				value: `_ga=GA1.1.${gaId}`,
			});

			const clientId = tracking.initializeAnalyticsClient();
			expect(clientId).toBe(gaId);
		});

		it("should use sendServerEvent to dispatch events", async () => {
			const fetchMock = vi.fn().mockResolvedValue({ ok: true });
			global.fetch = fetchMock;
			(navigator.sendBeacon as Mock).mockReturnValue(false); // Force fetch fallback

			tracking.sendServerEvent("test_event", { foo: "bar" });

			expect(fetchMock).toHaveBeenCalledWith(
				expect.stringContaining("api/events"),
				expect.objectContaining({
					method: "POST",
					keepalive: true,
				})
			);
		});
	});
});
