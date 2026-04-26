import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { usePerformanceData } from "@/hooks/usePerformanceData/usePerformanceData";

import { PerformanceContent } from "./PerformanceContent";

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

// Mock Recharts (LazyPerformanceChart)
// Since it's lazy loaded and contains complex SVG logic, we mock the parent PerformanceData
// or just ensure the fallback/error states work.
// For this test, we focus on PerformanceContent.

/**
 * Helper to render component within Dialog context.
 */
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

/**
 * Helper to create a never-resolving promise for Suspense.
 */
const suspend = () => {
	throw new Promise(() => {});
};

describe("PerformanceContent", () => {
	const mockOnClose = vi.fn();
	const mockUsePerformanceData = usePerformanceData as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePerformanceData.mockReturnValue([]);
	});

	test("should render description text", () => {
		renderWithDialog(<PerformanceContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.performance.description")).toBeInTheDocument();
	});

	test("should render close button", () => {
		renderWithDialog(<PerformanceContent onClose={mockOnClose} isOpen={true} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.performance\.closeButton/i,
		});
		expect(closeButton).toBeInTheDocument();
	});

	test("should show loading state when data is loading (suspending)", () => {
		mockUsePerformanceData.mockImplementation(suspend);
		const { container } = renderWithDialog(
			<PerformanceContent onClose={mockOnClose} isOpen={true} />
		);

		// The skeleton is rendered inside Suspense
		const skeleton = container.querySelector(".rt-Skeleton");
		expect(skeleton).toBeInTheDocument();
	});

	test("should show error message when data fetch fails", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockUsePerformanceData.mockImplementation(() => {
			throw new Error("Failed to fetch data");
		});

		renderWithDialog(<PerformanceContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.performance.error")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	test("should call onClose when close button is clicked", () => {
		renderWithDialog(<PerformanceContent onClose={mockOnClose} isOpen={true} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.performance\.closeButton/i,
		});
		fireEvent.click(closeButton);
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should render no data message when data is empty", () => {
		mockUsePerformanceData.mockReturnValue([]);
		renderWithDialog(<PerformanceContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.performance.noData")).toBeInTheDocument();
	});
});
