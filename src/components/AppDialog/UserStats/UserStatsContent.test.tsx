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

// Mock resources to avoid real calls
vi.mock("@/hooks/useUserStats/userStatsResource", () => ({
	fetchUserStats: vi.fn(),
}));

vi.mock("@/hooks/useTechTreeColors/techTreeColorsResource", () => ({
	fetchTechTreeColors: vi.fn(),
}));

// Helper to render component within Dialog context
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

// Helper to create a never-resolving promise for Suspense
const suspend = () => {
	throw new Promise(() => {});
};

describe("UserStatsContent", () => {
	const mockOnClose = vi.fn();
	const mockUseUserStats = useUserStats as ReturnType<typeof vi.fn>;
	const mockUseTechTreeColors = useTechTreeColors as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		// Default success state
		mockUseUserStats.mockReturnValue([]);
		mockUseTechTreeColors.mockReturnValue({});
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

	test("should show loading state when data is loading (suspending)", async () => {
		// Mock hook to suspend
		mockUseUserStats.mockImplementation(suspend);

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		// Check for skeletons which indicate loading state
		expect(screen.getByText("Starship Technologies")).toBeInTheDocument(); // Inside Skeleton
		// Chart titles should NOT be visible yet (they are inside the suspended component)
		expect(screen.queryByText("dialogs.userStats.starshipChartTitle")).not.toBeInTheDocument();
	});

	test("should show loading state when colors are loading (suspending)", async () => {
		mockUseTechTreeColors.mockImplementation(suspend);

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		expect(screen.getByText("Starship Technologies")).toBeInTheDocument(); // Inside Skeleton
		expect(screen.queryByText("dialogs.userStats.starshipChartTitle")).not.toBeInTheDocument();
	});

	test("should show error message when data fetch fails", () => {
		// Suppress console.error for this test as ErrorBoundary logs it
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockUseUserStats.mockImplementation(() => {
			throw new Error("Failed to fetch data");
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	test("should show error message when colors fetch fails", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockUseTechTreeColors.mockImplementation(() => {
			throw new Error("Failed to fetch colors");
		});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	test("should show 'no data for chart' message when data is empty", () => {
		mockUseUserStats.mockReturnValue([]);

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

	test("should render chart titles when not loading and no errors", async () => {
		mockUseUserStats.mockReturnValue([
			{
				ship_type: "standard",
				technology: "shield-matrix",
				supercharged: "true",
				total_events: 10,
			},
		]);
		mockUseTechTreeColors.mockReturnValue({});

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		// When data is present, chart titles should render
		// Need waitFor because Recharts or internal suspense might cause async rendering?
		// Actually our mock returns immediately, but Suspense boundaries sometimes bubble up async.
		// However, with direct return, it should render synchronously unless there is another suspense.
		// LazyRechartsChart IS a lazy component, so that WILL suspend.
		// We need to wait for the lazy component to resolve or mock it.
		// The test didn't mock LazyRechartsChart before, but `lazy(() => import...)` is async.

		expect(await screen.findByText("dialogs.userStats.starshipChartTitle")).toBeInTheDocument();
	});

	test("should pass isOpen to useTechTreeColors hook", () => {
		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);
		// isOpen is true in renderWithDialog
		expect(mockUseTechTreeColors).toHaveBeenCalledWith(true);
	});

	test("should handle tech colors from hook", async () => {
		const techColors = {
			"shield-matrix": "accent-8",
			"pulse-cannon": "accent-9",
		};
		mockUseTechTreeColors.mockReturnValue(techColors);
		mockUseUserStats.mockReturnValue([]);

		renderWithDialog(<UserStatsContent onClose={mockOnClose} isOpen={true} />);

		expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
	});
});
