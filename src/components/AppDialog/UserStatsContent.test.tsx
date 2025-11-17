import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useTechTreeColors } from "@/hooks/useTechTreeColors/useTechTreeColors";
import { useUserStats } from "@/hooks/useUserStats/useUserStats";

import { UserStatsContent } from "./UserStatsContent";

// Mock react-i18next
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

// Mock hooks
vi.mock("@/hooks/useUserStats/useUserStats", () => ({
	useUserStats: vi.fn(),
}));

vi.mock("@/hooks/useTechTreeColors/useTechTreeColors", () => ({
	useTechTreeColors: vi.fn(),
}));

// Helper to render component within Dialog context
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

describe("UserStatsContent", () => {
	const mockOnClose = vi.fn();
	const mockUseUserStats = useUserStats as ReturnType<typeof vi.fn>;
	const mockUseTechTreeColors = useTechTreeColors as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseUserStats.mockReturnValue({
			data: null,
			loading: false,
			error: null,
		});
		mockUseTechTreeColors.mockReturnValue({
			techColors: {},
			loading: false,
			error: null,
		});
	});

	test("should render description text", () => {
		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
	});

	test("should render close button", () => {
		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.userStats\.closeButton/i,
		});
		expect(closeButton).toBeInTheDocument();
	});

	test("should show loading state when data is loading", () => {
		mockUseUserStats.mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		// When loading, chart titles should not be visible
		expect(screen.queryByText("dialogs.userStats.starshipChartTitle")).not.toBeInTheDocument();
	});

	test("should show loading state when colors are loading", () => {
		mockUseUserStats.mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});
		mockUseTechTreeColors.mockReturnValue({
			techColors: {},
			loading: true,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		// When loading, chart titles should not be visible
		expect(screen.queryByText("dialogs.userStats.starshipChartTitle")).not.toBeInTheDocument();
	});

	test("should show error message when data fetch fails", () => {
		mockUseUserStats.mockReturnValue({
			data: null,
			loading: false,
			error: "Failed to fetch data",
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();
	});

	test("should show error message when colors fetch fails", () => {
		mockUseTechTreeColors.mockReturnValue({
			techColors: {},
			loading: false,
			error: "Failed to fetch colors",
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();
	});

	test("should show 'no data for chart' message when data is empty", () => {
		mockUseUserStats.mockReturnValue({
			data: [],
			loading: false,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getAllByText("dialogs.userStats.noDataForChart").length).toBeGreaterThan(0);
	});

	test("should call onClose when close button is clicked", () => {
		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		const closeButton = screen.getByRole("button", {
			name: /dialogs\.userStats\.closeButton/i,
		});
		closeButton.click();
		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	test("should render chart titles when not loading and no errors", () => {
		mockUseUserStats.mockReturnValue({
			data: [
				{
					ship_type: "standard",
					technology: "shield-matrix",
					supercharged: "true",
					total_events: 10,
				},
			],
			loading: false,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		// When data is present, chart titles should render
		expect(screen.getByText("dialogs.userStats.starshipChartTitle")).toBeInTheDocument();
	});

	test("should render no chart titles when loading", () => {
		mockUseUserStats.mockReturnValue({
			data: null,
			loading: true,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		// When loading, chart titles should not render (only skeletons)
		expect(screen.queryByText("dialogs.userStats.starshipChartTitle")).not.toBeInTheDocument();
	});

	test("should pass isOpen to useTechTreeColors hook", () => {
		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(mockUseTechTreeColors).toHaveBeenCalledWith(true);
	});

	test("should handle tech colors from hook", () => {
		const techColors = {
			"shield-matrix": "accent-8",
			"pulse-cannon": "accent-9",
		};
		mockUseTechTreeColors.mockReturnValue({
			techColors,
			loading: false,
			error: null,
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		// Component should render without errors
		expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
	});
});
