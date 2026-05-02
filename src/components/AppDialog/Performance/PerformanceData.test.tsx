import React, { Suspense } from "react";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";

import { PerformanceData } from "./PerformanceData";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en" },
	}),
}));

// Mock hooks
vi.mock("@/hooks/usePerformanceData/usePerformanceData", () => ({
	usePerformanceData: vi.fn(),
}));

// Mock resources
vi.mock("@/utils/api/performanceResource", () => ({
	fetchPerformanceData: vi.fn(),
}));

// Mock PerformanceChart to avoid dynamic import issues in tests.
// Render only the metric labels so the parent's data orchestration can be
// asserted without pulling in the full charting stack.
vi.mock("./PerformanceChart", () => {
	const MockPerformanceChart = ({ data }: { data: Array<{ metric_name: string }> }) => {
		const metrics = Array.from(new Set(data.map((d) => d.metric_name)));

		return (
			<div data-testid="performance-chart">
				{metrics.map((m) => (
					<span key={m}>{m}</span>
				))}
			</div>
		);
	};

	return {
		PerformanceChart: MockPerformanceChart,
		default: MockPerformanceChart,
	};
});

const mockData = [
	{
		timestamp: 1619370000000,
		metric_name: "LCP",
		average_value: 1200,
		p50: 1000,
		p75: 1200,
		p90: 1500,
		app_version: "v1.0.0",
	},
	{
		timestamp: 1619370000000,
		metric_name: "FCP",
		average_value: 800,
		p50: 700,
		p75: 800,
		p90: 1000,
		app_version: "v1.0.0",
	},
];

describe("PerformanceData", () => {
	const mockUsePerformanceData = usePerformanceData as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePerformanceData.mockReturnValue(mockData);
	});

	test("should render metric cards", async () => {
		render(
			<Theme>
				<Suspense fallback={<div>Loading...</div>}>
					<PerformanceData isOpen={true} />
				</Suspense>
			</Theme>
		);

		// Card labels should be present
		expect(await screen.findByText("LCP")).toBeInTheDocument();
		expect(await screen.findByText("FCP")).toBeInTheDocument();
	});
});
