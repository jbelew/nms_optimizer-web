import type { PerformanceMetric } from "@/hooks/usePerformanceData/usePerformanceData";
import React from "react";
import { Theme } from "@radix-ui/themes";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { PerformanceChart } from "./PerformanceChart";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "en" },
	}),
}));

// Mock useBreakpoint to keep tests deterministic
vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: () => true,
}));

// Mock recharts to a no-op so we can focus on the summary card interactions.
// Each component returns its children (or null) without rendering SVG.
vi.mock("recharts", () => {
	const Passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
	const Empty = () => null;

	return {
		Bar: Empty,
		CartesianGrid: Empty,
		ComposedChart: Passthrough,
		Label: Empty,
		Line: Empty,
		ReferenceArea: Empty,
		ReferenceLine: Empty,
		ResponsiveContainer: Passthrough,
		Tooltip: Empty,
		XAxis: Empty,
		YAxis: Empty,
	};
});

const mockData: PerformanceMetric[] = [
	{
		timestamp: 1619370000000,
		metric_name: "LCP",
		average_value: 1200,
		p50: 1000,
		p75: 1200,
		p90: 1500,
		app_version: "v1.0.0",
	} as PerformanceMetric,
	{
		timestamp: 1619370000000,
		metric_name: "FCP",
		average_value: 800,
		p50: 700,
		p75: 800,
		p90: 1000,
		app_version: "v1.0.0",
	} as PerformanceMetric,
];

const renderChart = (initialEntry = "/performance") =>
	render(
		<Theme>
			<MemoryRouter initialEntries={[initialEntry]}>
				<Routes>
					<Route path="/performance" element={<PerformanceChart data={mockData} />} />
					<Route
						path="/performance/:metric"
						element={<PerformanceChart data={mockData} />}
					/>
				</Routes>
			</MemoryRouter>
		</Theme>
	);

describe("PerformanceChart summary cards", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders summary cards for each metric and overall", () => {
		renderChart();

		expect(
			screen.getByRole("button", { name: /overall performance summary/i })
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /detailed LCP chart/i })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /detailed FCP chart/i })).toBeInTheDocument();
	});

	test("OVERALL card is pressed when no metric is selected", () => {
		renderChart();

		expect(
			screen.getByRole("button", { name: /overall performance summary/i })
		).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("button", { name: /detailed LCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"false"
		);
	});

	test("metric card reflects aria-pressed=true when its metric is selected", () => {
		renderChart("/performance/lcp");

		expect(screen.getByRole("button", { name: /detailed LCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(screen.getByRole("button", { name: /detailed FCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"false"
		);
	});

	test("clicking a metric card navigates and selects that metric", () => {
		renderChart();

		const lcpCard = screen.getByRole("button", { name: /detailed LCP chart/i });
		fireEvent.click(lcpCard);

		expect(screen.getByRole("button", { name: /detailed LCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
	});

	test("Space key activates a metric card and prevents default scroll", () => {
		renderChart();

		const lcpCard = screen.getByRole("button", { name: /detailed LCP chart/i });
		const event = fireEvent.keyDown(lcpCard, { key: " ", code: "Space" });

		// preventDefault was called → fireEvent returns false
		expect(event).toBe(false);
		expect(screen.getByRole("button", { name: /detailed LCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
	});

	test("Enter key activates a metric card", () => {
		renderChart();

		const fcpCard = screen.getByRole("button", { name: /detailed FCP chart/i });
		fireEvent.keyDown(fcpCard, { key: "Enter" });

		expect(screen.getByRole("button", { name: /detailed FCP chart/i })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
	});

	test("clicking OVERALL after selecting a metric clears the selection", () => {
		renderChart("/performance/lcp");

		fireEvent.click(screen.getByRole("button", { name: /overall performance summary/i }));

		expect(
			screen.getByRole("button", { name: /overall performance summary/i })
		).toHaveAttribute("aria-pressed", "true");
	});
});
