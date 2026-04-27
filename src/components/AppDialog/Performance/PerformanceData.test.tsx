import React from "react";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
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

// Mock Recharts
// PerformanceData uses LazyChartLoader which imports recharts dynamically.
// We need to mock the dynamic import or the component that uses it.
// Actually PerformanceData renders Suspense + LazyChartLoader.
// LazyChartLoader then renders PerformanceChart which uses the recharts prop.

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
				<PerformanceData isOpen={true} />
			</Theme>
		);

		// Card labels should be present
		expect(await screen.findByText("LCP")).toBeInTheDocument();
		expect(await screen.findByText("FCP")).toBeInTheDocument();
	});

	test("should toggle metric selection on click", async () => {
		render(
			<Theme>
				<PerformanceData isOpen={true} />
			</Theme>
		);

		const lcpCard = await screen.findByRole("button", { name: /LCP/i });

		// Initial state: not selected
		expect(lcpCard).toHaveAttribute("aria-pressed", "false");

		// Click to select
		fireEvent.click(lcpCard);
		expect(lcpCard).toHaveAttribute("aria-pressed", "true");

		// Click to deselect
		fireEvent.click(lcpCard);
		expect(lcpCard).toHaveAttribute("aria-pressed", "false");
	});

	test("should allow switching between metrics", async () => {
		render(
			<Theme>
				<PerformanceData isOpen={true} />
			</Theme>
		);

		const lcpCard = await screen.findByRole("button", { name: /LCP/i });
		const fcpCard = await screen.findByRole("button", { name: /FCP/i });

		fireEvent.click(lcpCard);
		expect(lcpCard).toHaveAttribute("aria-pressed", "true");
		expect(fcpCard).toHaveAttribute("aria-pressed", "false");

		fireEvent.click(fcpCard);
		expect(lcpCard).toHaveAttribute("aria-pressed", "false");
		expect(fcpCard).toHaveAttribute("aria-pressed", "true");
	});
});
