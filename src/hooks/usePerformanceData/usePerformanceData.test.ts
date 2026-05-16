import type { PerformanceMetric } from "./usePerformanceData";
import type { ReactNode } from "react";
import { createElement, Suspense } from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as resourceModule from "@/utils/api/performanceResource";

import { usePerformanceData } from "./usePerformanceData";

vi.mock("../../utils/api/network", () => ({
	apiCall: vi.fn(),
}));

vi.mock("../../utils/api/performanceResource", () => ({
	fetchPerformanceData: vi.fn(),
	resetPerformanceDataCache: vi.fn(),
}));

/**
 * Test wrapper with Suspense.
 */
const wrapper = ({ children }: { children: ReactNode }) =>
	createElement(Suspense, { fallback: null }, children);

describe("usePerformanceData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.mocked(resourceModule.resetPerformanceDataCache).mockClear();
	});

	it("should call fetchPerformanceData via the resource", () => {
		const mockData: PerformanceMetric[] = [
			{
				app_version: "v1.0.0",
				average_value: 1200,
				metric_name: "LCP",
				timestamp: 1619370000000,
			},
		];

		vi.mocked(resourceModule.fetchPerformanceData).mockReturnValue(Promise.resolve(mockData));

		renderHook(() => usePerformanceData(), { wrapper });

		expect(resourceModule.fetchPerformanceData).toHaveBeenCalled();
	});
});
