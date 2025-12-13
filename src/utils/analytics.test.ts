import ReactGA from "react-ga4";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { initializeAnalytics, resetAnalyticsForTesting, sendEvent } from "./analytics";
import { sendEvent as sendAnalyticsEvent } from "./analyticsClient";

// Mock external dependencies
vi.mock("react-ga4", () => ({
	default: {
		initialize: vi.fn(),
		event: vi.fn(),
	},
}));
vi.mock("./analyticsClient", () => ({
	sendEvent: vi.fn(),
}));

describe("analytics.ts", () => {
	const testEvent = {
		category: "Test",
		action: "Test Action",
		label: "Test Label",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		resetAnalyticsForTesting(); // Ensure GA initialization state is clean
		vi.stubGlobal("fetch", vi.fn()); // Mock global fetch
	});

	// Tests for initializeAnalytics
	it("should not initialize GA4 in development mode", () => {
		initializeAnalytics();
		expect(ReactGA.initialize).not.toHaveBeenCalled();
	});

	it("should not initialize GA4 if already initialized", () => {
		initializeAnalytics();
		initializeAnalytics(); // Call again
		expect(ReactGA.initialize).not.toHaveBeenCalled();
	});

	it("should not initialize GA4 for bots", () => {
		vi.stubGlobal("navigator", { userAgent: "Googlebot" });
		initializeAnalytics();
		expect(ReactGA.initialize).not.toHaveBeenCalled();
	});

	// Tests for sendEvent with ad-blocker detection
	it("should call client-side analytics when tracking is not blocked", async () => {
		(fetch as Mock).mockResolvedValue({ status: 200 }); // Mock successful fetch
		await sendEvent(testEvent);

		// Expect fetch to be called once for ad-blocker detection
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			"https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9",
			{ method: "HEAD", mode: "no-cors", cache: "reload" }
		);

		// Expect ReactGA.event to be called
		expect(ReactGA.event).toHaveBeenCalledTimes(1);
		expect(ReactGA.event).toHaveBeenCalledWith(testEvent.action, {
			category: testEvent.category,
			label: testEvent.label,
			tracking_source: "client",
		});
		expect(sendAnalyticsEvent).not.toHaveBeenCalled();
	});

	it("should call server-side analytics when tracking is blocked", async () => {
		(fetch as Mock).mockRejectedValue(new Error("Blocked by ad-blocker")); // Mock failed fetch
		await sendEvent(testEvent);

		// Expect fetch to be called once for ad-blocker detection
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			"https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9",
			{ method: "HEAD", mode: "no-cors", cache: "reload" }
		);

		// Expect sendAnalyticsEvent to be called with user properties
		expect(sendAnalyticsEvent).toHaveBeenCalledTimes(1);
		expect(sendAnalyticsEvent).toHaveBeenCalledWith(testEvent.action, {
			action: testEvent.action,
			category: testEvent.category,
			label: testEvent.label,
			app_version: expect.any(String),
			is_installed: expect.any(String),
			tracking_source: "server",
		});
		expect(ReactGA.event).not.toHaveBeenCalled();
	});

	it("should cache ad-blocker detection result", async () => {
		(fetch as Mock).mockResolvedValue({ status: 200 }); // Mock successful fetch
		await sendEvent(testEvent); // First call
		await sendEvent(testEvent); // Second call

		// Fetch should only be called once, result is cached
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			"https://www.googletagmanager.com/gtag/js?id=G-P5VBZQ69Q9",
			{ method: "HEAD", mode: "no-cors", cache: "reload" }
		);

		expect(ReactGA.event).toHaveBeenCalledTimes(2);
		expect(sendAnalyticsEvent).not.toHaveBeenCalled();
	});
});
