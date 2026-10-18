import React, { act } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { apiCall } from "@/utils/api/network";

import type { PerformanceMetric } from "./PerformanceUtils";
import PerformanceDialog, { PerformanceContent } from "./PerformanceDialog";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		i18n: { language: "en" },
		t: (key: string) => key,
	}),
}));

vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn(),
}));

vi.mock("./performanceChart", () => {
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
		default: MockPerformanceChart,
		PerformanceChart: MockPerformanceChart,
	};
});

const mockMetrics: PerformanceMetric[] = [
	{
		app_version: "v1.0.0",
		average_value: 1200,
		metric_name: "LCP",
		p50: 1000,
		p75: 1200,
		p90: 1500,
		timestamp: 1619370000000,
	},
	{
		app_version: "v1.0.0",
		average_value: 800,
		metric_name: "FCP",
		p50: 700,
		p75: 800,
		p90: 1000,
		timestamp: 1619370000000,
	},
];

const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Theme>
			<Dialog.Root open={true}>
				<Dialog.Content>{component}</Dialog.Content>
			</Dialog.Root>
		</Theme>,
	);
};

describe("PerformanceDialog & Resource Module", () => {
	const mockApiCall = vi.mocked(apiCall);

	beforeEach(() => {
		vi.clearAllMocks();
		PerformanceDialog.resetCache();
		mockApiCall.mockResolvedValue([]);
	});

	describe("PerformanceContent & PerformanceDialog", () => {
		test("caches performance_data request across unmount and remount", async () => {
			mockApiCall.mockResolvedValue(mockMetrics);

			let unmountFn!: ReturnType<typeof render>["unmount"];

			await act(async () => {
				const result = renderWithDialog(<PerformanceContent />);
				unmountFn = result.unmount;
			});

			expect(mockApiCall).toHaveBeenCalledTimes(1);

			unmountFn();

			await act(async () => {
				renderWithDialog(<PerformanceContent />);
			});

			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		test("shows loading spinner while performance data is suspending", () => {
			mockApiCall.mockReturnValue(new Promise(() => {}));

			renderWithDialog(<PerformanceContent />);

			expect(screen.getByRole("status")).toBeInTheDocument();
		});

		test("renders description and noData message when resolved data is empty", async () => {
			mockApiCall.mockResolvedValue([]);

			await act(async () => {
				renderWithDialog(<PerformanceContent />);
			});

			expect(await screen.findByText("dialogs.performance.description")).toBeInTheDocument();
			expect(await screen.findByText("dialogs.performance.noData")).toBeInTheDocument();
		});

		test("renders metric cards when performance data resolves and issues only 1 network request", async () => {
			mockApiCall.mockResolvedValue(mockMetrics);

			await act(async () => {
				renderWithDialog(<PerformanceContent />);
			});

			expect(await screen.findByText("LCP")).toBeInTheDocument();
			expect(await screen.findByText("FCP")).toBeInTheDocument();
			expect(mockApiCall).toHaveBeenCalledTimes(1);
		});

		test("shows error message when performance data fetch rejects", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const rejected = Promise.reject(new Error("Failed to fetch data"));
			rejected.catch(() => {});
			mockApiCall.mockReturnValue(rejected);

			await act(async () => {
				renderWithDialog(<PerformanceContent />);
			});

			expect(await screen.findByText("dialogs.performance.error")).toBeInTheDocument();
			consoleSpy.mockRestore();
		});

		test("renders PerformanceDialog wrapper and close button", async () => {
			const onClose = vi.fn();

			await act(async () => {
				render(
					<Theme>
						<PerformanceDialog
							isOpen={true}
							onClose={onClose}
						/>
					</Theme>,
				);
			});

			expect(await screen.findByText("dialogs.performance.closeButton")).toBeInTheDocument();
		});
	});
});
