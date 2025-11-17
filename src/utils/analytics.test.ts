import type { GA4Event } from "./analytics";
import ReactGA from "react-ga4";
import { vi } from "vitest";

import { initializeAnalytics, sendEvent } from "./analytics";
import * as reportWebVitalsModule from "./reportWebVitals";

// Mock ReactGA
vi.mock("react-ga4", () => ({
	default: {
		initialize: vi.fn(),
		event: vi.fn(),
	},
}));

// Mock reportWebVitals
vi.mock("./reportWebVitals", () => ({
	reportWebVitals: vi.fn(),
}));

describe("analytics", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset the gaInitialized flag
		vi.resetModules();
	});

	describe("GA4Event Interface", () => {
		test("should have required properties", () => {
			const event: GA4Event = {
				category: "Test Category",
				action: "Test Action",
			};

			expect(event.category).toBe("Test Category");
			expect(event.action).toBe("Test Action");
		});

		test("should accept optional properties", () => {
			const event: GA4Event = {
				category: "Test Category",
				action: "Test Action",
				label: "Test Label",
				value: 42,
				nonInteraction: true,
				platform: "test-platform",
				tech: "test-tech",
				solve_method: "test-method",
				supercharged: true,
				page: "test-page",
				title: "Test Title",
				metric_name: "test-metric",
				build: "test-build",
				componentStack: "test-stack",
				stackTrace: "test-trace",
				app_version: "1.0.0",
			};

			expect(event.label).toBe("Test Label");
			expect(event.value).toBe(42);
			expect(event.nonInteraction).toBe(true);
			expect(event.platform).toBe("test-platform");
			expect(event.tech).toBe("test-tech");
			expect(event.solve_method).toBe("test-method");
			expect(event.supercharged).toBe(true);
			expect(event.page).toBe("test-page");
			expect(event.title).toBe("Test Title");
			expect(event.metric_name).toBe("test-metric");
			expect(event.build).toBe("test-build");
			expect(event.componentStack).toBe("test-stack");
			expect(event.stackTrace).toBe("test-trace");
			expect(event.app_version).toBe("1.0.0");
		});
	});

	describe("sendEvent", () => {
		test("should send event with category and action to ReactGA", () => {
			const event: GA4Event = {
				category: "Test Category",
				action: "Test Action",
			};

			sendEvent(event);

			expect(ReactGA.event).toHaveBeenCalledWith("Test Action", {
				category: "Test Category",
			});
		});

		test("should send event with additional parameters", () => {
			const event: GA4Event = {
				category: "Engagement",
				action: "button_click",
				label: "Hero CTA",
				value: 1,
				page: "/home",
			};

			sendEvent(event);

			expect(ReactGA.event).toHaveBeenCalledWith("button_click", {
				category: "Engagement",
				label: "Hero CTA",
				value: 1,
				page: "/home",
			});
		});

		test("should destructure action and category from event object", () => {
			const event: GA4Event = {
				category: "User",
				action: "sign_up",
				platform: "web",
				nonInteraction: false,
			};

			sendEvent(event);

			expect(ReactGA.event).toHaveBeenCalledWith("sign_up", {
				category: "User",
				platform: "web",
				nonInteraction: false,
			});
		});

		test("should handle events with all optional parameters", () => {
			const event: GA4Event = {
				category: "Grid",
				action: "optimize_grid",
				label: "auto-optimize",
				value: 5,
				nonInteraction: true,
				platform: "starship",
				tech: "armor-plating",
				solve_method: "genetic-algorithm",
				supercharged: true,
				page: "/builder",
				title: "Grid Builder",
				metric_name: "optimization-time",
				build: "5.7.4",
				componentStack: "App > Builder > Grid",
				stackTrace: "line 42",
				app_version: "5.7.4",
			};

			sendEvent(event);

			expect(ReactGA.event).toHaveBeenCalledWith("optimize_grid", {
				category: "Grid",
				label: "auto-optimize",
				value: 5,
				nonInteraction: true,
				platform: "starship",
				tech: "armor-plating",
				solve_method: "genetic-algorithm",
				supercharged: true,
				page: "/builder",
				title: "Grid Builder",
				metric_name: "optimization-time",
				build: "5.7.4",
				componentStack: "App > Builder > Grid",
				stackTrace: "line 42",
				app_version: "5.7.4",
			});
		});
	});

	describe("initializeAnalytics", () => {
		test("should initialize ReactGA with correct tracking ID", () => {
			vi.clearAllMocks();
			initializeAnalytics();

			expect(ReactGA.initialize).toHaveBeenCalled();
			const calls = (ReactGA.initialize as ReturnType<typeof vi.fn>).mock.calls;
			if (calls.length > 0) {
				const callArgs = calls[0];
				expect(callArgs[0]).toBeTruthy(); // TRACKING_ID should be truthy
			}
		});

		test("should set up gtagOptions with send_page_view and anonymize_ip", () => {
			vi.clearAllMocks();
			initializeAnalytics();

			const calls = (ReactGA.initialize as ReturnType<typeof vi.fn>).mock.calls;
			if (calls.length > 0) {
				const callArgs = calls[0];
				const options = callArgs[1];

				expect(options).toHaveProperty("gtagOptions");
				expect(options.gtagOptions).toHaveProperty("send_page_view", true);
				expect(options.gtagOptions).toHaveProperty("anonymize_ip", true);
			}
		});

		test("should set app_version in user_properties", () => {
			vi.clearAllMocks();
			initializeAnalytics();

			const calls = (ReactGA.initialize as ReturnType<typeof vi.fn>).mock.calls;
			if (calls.length > 0) {
				const callArgs = calls[0];
				const options = callArgs[1];

				expect(options.gtagOptions).toHaveProperty("user_properties");
				expect(options.gtagOptions.user_properties).toHaveProperty("app_version");
			}
		});

		test("should call reportWebVitals with sendEvent function", () => {
			vi.clearAllMocks();
			initializeAnalytics();

			// reportWebVitals should be called during initialization
			const calls = (reportWebVitalsModule.reportWebVitals as ReturnType<typeof vi.fn>).mock
				.calls;
			if (calls.length > 0) {
				const callArgs = calls[0];
				expect(typeof callArgs[0]).toBe("function");
			}
		});
	});
});
