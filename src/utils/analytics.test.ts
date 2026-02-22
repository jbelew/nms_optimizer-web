import ReactGA from "react-ga4";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import * as analytics from "./analytics";
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

	let mockScript: {
		src: string;
		defer: boolean;
		setAttribute: Mock;
		onload: (() => void) | null;
		onerror: (() => void) | null;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		analytics.resetAnalyticsForTesting(); // Ensure GA initialization state is clean

		// Use a simple mock that doesn't involve AbortController complexity in tests
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 200 }));
		vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0" });

		mockScript = {
			src: "",
			defer: false,
			setAttribute: vi.fn(),
			onload: null,
			onerror: null,
		};

		// Mock document
		vi.stubGlobal("document", {
			querySelector: vi.fn().mockReturnValue(null),
			createElement: vi.fn().mockImplementation((tag: string) => {
				if (tag === "script") return mockScript;

				return {};
			}),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
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
			matchMedia: vi.fn().mockReturnValue({ matches: false }),
		});

		// Mock env.isDevMode to return false by default for tests
		vi.spyOn(analytics.env, "isDevMode").mockReturnValue(false);
	});

	// Tests for initializeAnalytics
	it("should not initialize GA4 in development mode", async () => {
		vi.spyOn(analytics.env, "isDevMode").mockReturnValue(true);

		await analytics.initializeAnalytics();
		expect(ReactGA.initialize).not.toHaveBeenCalled();
	});

	it("should not initialize GA4 if blocked", async () => {
		(fetch as Mock).mockRejectedValue(new Error("Blocked"));

		await analytics.initializeAnalytics();
		expect(ReactGA.initialize).not.toHaveBeenCalled();
	});

	it("should initialize GA4 if not blocked", async () => {
		(fetch as Mock).mockResolvedValue({ status: 200 });

		await analytics.initializeAnalytics();
		expect(ReactGA.initialize).toHaveBeenCalled();
	});

	// Tests for sendEvent with ad-blocker detection
	it("should call client-side analytics when tracking is not blocked", async () => {
		(fetch as Mock).mockResolvedValue({ status: 200 }); // Mock successful fetch
		analytics.sendEvent(testEvent);

		// waitFor allows the fire-and-forget promise to resolve
		await vi.waitFor(() => {
			expect(ReactGA.event).toHaveBeenCalledWith(
				testEvent.action,
				expect.objectContaining({
					tracking_source: "client",
				})
			);
			expect(sendAnalyticsEvent).not.toHaveBeenCalled();
		});
	});

	it("should call server-side analytics when tracking is blocked", async () => {
		(fetch as Mock).mockRejectedValue(new Error("Blocked"));
		analytics.sendEvent(testEvent);

		await vi.waitFor(() => {
			expect(sendAnalyticsEvent).toHaveBeenCalledWith(
				testEvent.action,
				expect.objectContaining({
					tracking_source: "server",
				})
			);
			expect(ReactGA.event).not.toHaveBeenCalled();
		});
	});

	it("should initialize Cloudflare RUM if not blocked", async () => {
		(fetch as Mock).mockResolvedValue({ status: 200 });

		analytics.initializeCloudflareRUM();

		await vi.waitFor(() => {
			expect(document.createElement).toHaveBeenCalledWith("script");
			expect(document.body.appendChild).toHaveBeenCalledWith(mockScript);
		});
	});

	it("should not initialize Cloudflare RUM if blocked", async () => {
		(fetch as Mock).mockRejectedValue(new Error("Blocked"));

		analytics.initializeCloudflareRUM();

		// Wait a bit to ensure it doesn't happen
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(document.createElement).not.toHaveBeenCalledWith("script");
	});
});
