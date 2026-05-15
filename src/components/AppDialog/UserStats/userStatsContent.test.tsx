import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { useTechTreeColors } from "@/hooks/useTechTreeColors/useTechTreeColors";
import { useUserStats } from "@/hooks/useUserStats/useUserStats";

import { UserStatsContent } from "./userStatsContent";

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
vi.mock("@/utils/api/userStatsResource", () => ({
	fetchUserStats: vi.fn(),
}));

vi.mock("@/utils/api/techTreeColorsResource", () => ({
	fetchTechTreeColors: vi.fn(),
}));

// Helper to render component within Dialog context
/**
 *
 * @example
 */
const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Dialog.Root open={true}>
			<Dialog.Content>{component}</Dialog.Content>
		</Dialog.Root>
	);
};

// Helper to create a never-resolving promise for Suspense
/**
 *
 * @example
 */
const suspend = () => {
	throw new Promise(() => {});
};

describe("UserStatsContent", () => {
	const mockUseUserStats = useUserStats as ReturnType<typeof vi.fn>;
	const mockUseTechTreeColors = useTechTreeColors as ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		// Default success state
		mockUseUserStats.mockReturnValue([]);
		mockUseTechTreeColors.mockReturnValue({});
	});

	test("should render description text", () => {
		renderWithDialog(<UserStatsContent isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
	});

	test("should show loading state when data is loading (suspending)", async () => {
		// Mock hook to suspend
		mockUseUserStats.mockImplementation(suspend);

		renderWithDialog(<UserStatsContent isOpen={true} />);

		// Check for skeletons which indicate loading state
		expect(screen.getByText("dialogs.userStats.starshipChartTitle")).toBeInTheDocument(); // Inside Skeleton
	});

	test("should show loading state when colors are loading (suspending)", async () => {
		mockUseTechTreeColors.mockImplementation(suspend);

		renderWithDialog(<UserStatsContent isOpen={true} />);

		expect(screen.getByText("dialogs.userStats.starshipChartTitle")).toBeInTheDocument(); // Inside Skeleton
	});

	test("should show error message when data fetch fails", () => {
		// Suppress console.error for this test as ErrorBoundary logs it
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockUseUserStats.mockImplementation(() => {
			throw new Error("Failed to fetch data");
		});

		renderWithDialog(<UserStatsContent isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	test("should show error message when colors fetch fails", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		mockUseTechTreeColors.mockImplementation(() => {
			throw new Error("Failed to fetch colors");
		});

		renderWithDialog(<UserStatsContent isOpen={true} />);
		expect(screen.getByText("dialogs.userStats.error")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	test("should show 'no data for chart' message when data is empty", () => {
		mockUseUserStats.mockReturnValue([]);

		renderWithDialog(<UserStatsContent isOpen={true} />);
		expect(screen.getAllByText("dialogs.userStats.noDataForChart").length).toBeGreaterThan(0);
	});

	test("should render chart titles when not loading and no errors", async () => {
		mockUseUserStats.mockReturnValue([
			{
				ship_type: "standard",
				supercharged: "true",
				technology: "shield-matrix",
				total_events: 10,
			},
		]);
		mockUseTechTreeColors.mockReturnValue({});

		renderWithDialog(<UserStatsContent isOpen={true} />);

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
		renderWithDialog(<UserStatsContent isOpen={true} />);
		// isOpen is true in renderWithDialog
		expect(mockUseTechTreeColors).toHaveBeenCalledWith(true);
	});

	test("should handle tech colors from hook", async () => {
		const techColors = {
			"pulse-cannon": "accent-9",
			"shield-matrix": "accent-8",
		};
		mockUseTechTreeColors.mockReturnValue(techColors);
		mockUseUserStats.mockReturnValue([]);

		renderWithDialog(<UserStatsContent isOpen={true} />);

		expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
	});
});
