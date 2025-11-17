import type { GA4Event } from "./analytics";
import { vi } from "vitest";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

import { reportWebVitals } from "./reportWebVitals";

// Mock web-vitals library
vi.mock("web-vitals", () => ({
	onCLS: vi.fn(),
	onFCP: vi.fn(),
	onINP: vi.fn(),
	onLCP: vi.fn(),
	onTTFB: vi.fn(),
}));

describe("reportWebVitals", () => {
	let mockSendEvent: (event: GA4Event) => void;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSendEvent = vi.fn();
	});

	test("should register callback for CLS metric", () => {
		reportWebVitals(mockSendEvent);

		expect(onCLS).toHaveBeenCalled();
		expect(onCLS).toHaveBeenCalledWith(expect.any(Function));
	});

	test("should register callback for INP metric", () => {
		reportWebVitals(mockSendEvent);

		expect(onINP).toHaveBeenCalled();
		expect(onINP).toHaveBeenCalledWith(expect.any(Function));
	});

	test("should register callback for FCP metric", () => {
		reportWebVitals(mockSendEvent);

		expect(onFCP).toHaveBeenCalled();
		expect(onFCP).toHaveBeenCalledWith(expect.any(Function));
	});

	test("should register callback for LCP metric", () => {
		reportWebVitals(mockSendEvent);

		expect(onLCP).toHaveBeenCalled();
		expect(onLCP).toHaveBeenCalledWith(expect.any(Function));
	});

	test("should register callback for TTFB metric", () => {
		reportWebVitals(mockSendEvent);

		expect(onTTFB).toHaveBeenCalled();
		expect(onTTFB).toHaveBeenCalledWith(expect.any(Function));
	});

	test("should send CLS metric with delta multiplied by 1000", () => {
		reportWebVitals(mockSendEvent);

		// Get the callback for CLS
		const clsCallback = (onCLS as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Create a mock metric
		const mockMetric = {
			name: "CLS",
			delta: 0.05,
			id: "v3-1234567890",
			rating: "good" as const,
		};

		clsCallback(mockMetric);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "web_vitals_CLS",
			category: "Web Vitals",
			label: "v3-1234567890",
			value: 50, // 0.05 * 1000
			nonInteraction: true,
			metric_name: "CLS",
			app_version: expect.any(String),
		});
	});

	test("should send INP metric with delta in milliseconds", () => {
		reportWebVitals(mockSendEvent);

		// Get the callback for INP
		const inpCallback = (onINP as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Create a mock metric
		const mockMetric = {
			name: "INP",
			delta: 150.5,
			id: "v3-1234567890",
			rating: "good" as const,
		};

		inpCallback(mockMetric);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "web_vitals_INP",
			category: "Web Vitals",
			label: "v3-1234567890",
			value: 151, // Math.round(150.5)
			nonInteraction: true,
			metric_name: "INP",
			app_version: expect.any(String),
		});
	});

	test("should send FCP metric with delta in milliseconds", () => {
		reportWebVitals(mockSendEvent);

		// Get the callback for FCP
		const fcpCallback = (onFCP as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Create a mock metric
		const mockMetric = {
			name: "FCP",
			delta: 1200.7,
			id: "v3-1234567890",
			rating: "good" as const,
		};

		fcpCallback(mockMetric);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "web_vitals_FCP",
			category: "Web Vitals",
			label: "v3-1234567890",
			value: 1201, // Math.round(1200.7)
			nonInteraction: true,
			metric_name: "FCP",
			app_version: expect.any(String),
		});
	});

	test("should send LCP metric with delta in milliseconds", () => {
		reportWebVitals(mockSendEvent);

		// Get the callback for LCP
		const lcpCallback = (onLCP as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Create a mock metric
		const mockMetric = {
			name: "LCP",
			delta: 2500.4,
			id: "v3-1234567890",
			rating: "poor" as const,
		};

		lcpCallback(mockMetric);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "web_vitals_LCP",
			category: "Web Vitals",
			label: "v3-1234567890",
			value: 2500, // Math.round(2500.4)
			nonInteraction: true,
			metric_name: "LCP",
			app_version: expect.any(String),
		});
	});

	test("should send TTFB metric with delta in milliseconds", () => {
		reportWebVitals(mockSendEvent);

		// Get the callback for TTFB
		const ttfbCallback = (onTTFB as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Create a mock metric
		const mockMetric = {
			name: "TTFB",
			delta: 500.6,
			id: "v3-1234567890",
			rating: "good" as const,
		};

		ttfbCallback(mockMetric);

		expect(mockSendEvent).toHaveBeenCalledWith({
			action: "web_vitals_TTFB",
			category: "Web Vitals",
			label: "v3-1234567890",
			value: 501, // Math.round(500.6)
			nonInteraction: true,
			metric_name: "TTFB",
			app_version: expect.any(String),
		});
	});

	test("should use provided sendEvent function for all metrics", () => {
		reportWebVitals(mockSendEvent);

		// Trigger all callbacks
		const callbacks = {
			CLS: (onCLS as ReturnType<typeof vi.fn>).mock.calls[0][0],
			INP: (onINP as ReturnType<typeof vi.fn>).mock.calls[0][0],
			FCP: (onFCP as ReturnType<typeof vi.fn>).mock.calls[0][0],
			LCP: (onLCP as ReturnType<typeof vi.fn>).mock.calls[0][0],
			TTFB: (onTTFB as ReturnType<typeof vi.fn>).mock.calls[0][0],
		};

		callbacks.CLS({ name: "CLS", delta: 0.05, id: "test-cls", rating: "good" as const });
		callbacks.INP({ name: "INP", delta: 100, id: "test-inp", rating: "good" as const });
		callbacks.FCP({ name: "FCP", delta: 1000, id: "test-fcp", rating: "good" as const });
		callbacks.LCP({ name: "LCP", delta: 2000, id: "test-lcp", rating: "good" as const });
		callbacks.TTFB({
			name: "TTFB",
			delta: 500,
			id: "test-ttfb",
			rating: "good" as const,
		});

		expect(mockSendEvent).toHaveBeenCalledTimes(5);
	});

	test("should set nonInteraction to true for all metrics", () => {
		reportWebVitals(mockSendEvent);

		const metric = {
			name: "CLS",
			delta: 0.05,
			id: "test-id",
			rating: "good" as const,
		};

		const clsCallback = (onCLS as ReturnType<typeof vi.fn>).mock.calls[0][0];
		clsCallback(metric);

		expect(mockSendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				nonInteraction: true,
			})
		);
	});

	test("should set category to 'Web Vitals' for all metrics", () => {
		reportWebVitals(mockSendEvent);

		const metric = {
			name: "INP",
			delta: 100,
			id: "test-id",
			rating: "good" as const,
		};

		const inpCallback = (onINP as ReturnType<typeof vi.fn>).mock.calls[0][0];
		inpCallback(metric);

		expect(mockSendEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				category: "Web Vitals",
			})
		);
	});

	test("should round metric values correctly", () => {
		reportWebVitals(mockSendEvent);

		const clsCallback = (onCLS as ReturnType<typeof vi.fn>).mock.calls[0][0];

		// Test rounding for CLS (delta * 1000)
		clsCallback({
			name: "CLS",
			delta: 0.0549,
			id: "test-round-down",
			rating: "good" as const,
		});

		expect(mockSendEvent).toHaveBeenLastCalledWith(
			expect.objectContaining({
				value: 55, // Math.round(0.0549 * 1000) = 55
			})
		);
	});
});
