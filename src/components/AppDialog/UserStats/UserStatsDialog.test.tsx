import React, { act } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Theme } from "@radix-ui/themes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { fetchTechTreeAsync } from "@/hooks/useTechTree/useTechTree";
import { apiCall } from "@/utils/api/network";

import UserStatsDialog, { UserStatsContent } from "./UserStatsDialog";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/utils/api/network", () => ({
	apiCall: vi.fn(),
}));

vi.mock("@/hooks/useTechTree/useTechTree", () => ({
	fetchTechTreeAsync: vi.fn(),
}));

const renderWithDialog = (component: React.ReactElement) => {
	return render(
		<Theme>
			<Dialog.Root open={true}>
				<Dialog.Content>{component}</Dialog.Content>
			</Dialog.Root>
		</Theme>,
	);
};

describe("UserStatsDialog & Resource Module", () => {
	const mockApiCall = vi.mocked(apiCall);
	const mockFetchTechTreeAsync = vi.mocked(fetchTechTreeAsync);

	beforeEach(() => {
		vi.clearAllMocks();
		UserStatsDialog.resetCache();
		mockApiCall.mockResolvedValue([]);
		mockFetchTechTreeAsync.mockResolvedValue({
			Propulsion: [
				{
					color: "blue",
					image: null,
					key: "pulse",
					label: "Pulse Engine",
					module_count: 1,
					modules: [],
				},
			],
		});
	});

	describe("UserStatsContent & UserStatsDialog", () => {
		test("caches popular_data and tech tree color requests across unmount and remount, and evicts on error", async () => {
			mockApiCall.mockResolvedValue([
				{
					event_name: "optimize",
					ship_type: "standard",
					supercharged: "true",
					technology: "pulse",
					total_events: 15,
				},
			]);

			let unmountFn!: ReturnType<typeof render>["unmount"];

			await act(async () => {
				const result = renderWithDialog(<UserStatsContent isOpen={true} />);
				unmountFn = result.unmount;
			});

			expect(mockApiCall).toHaveBeenCalledTimes(1);
			expect(mockFetchTechTreeAsync).toHaveBeenCalledTimes(3);

			unmountFn();

			await act(async () => {
				renderWithDialog(<UserStatsContent isOpen={true} />);
			});

			expect(mockApiCall).toHaveBeenCalledTimes(1);
			expect(mockFetchTechTreeAsync).toHaveBeenCalledTimes(3);
		});

		test("shows loading skeleton while data promise is pending", () => {
			mockApiCall.mockReturnValue(new Promise(() => {}));

			renderWithDialog(<UserStatsContent isOpen={true} />);

			expect(screen.getByText("dialogs.userStats.description")).toBeInTheDocument();
			expect(screen.getByText("dialogs.userStats.starshipChartTitle")).toBeInTheDocument();
		});

		test("shows noDataForChart message when resolved data is empty", async () => {
			mockApiCall.mockResolvedValue([]);

			await act(async () => {
				renderWithDialog(<UserStatsContent isOpen={true} />);
			});

			expect(
				(await screen.findAllByText("dialogs.userStats.noDataForChart")).length,
			).toBeGreaterThan(0);
		});

		test("renders chart titles when supercharged analytics records resolve", async () => {
			mockApiCall.mockResolvedValue([
				{
					event_name: "optimize",
					ship_type: "standard",
					supercharged: "true",
					technology: "pulse-splitter",
					total_events: 100,
				},
				{
					event_name: "optimize",
					ship_type: "standard",
					supercharged: "true",
					technology: "rare-tech",
					total_events: 1,
				},
			]);

			await act(async () => {
				renderWithDialog(<UserStatsContent isOpen={true} />);
			});

			expect(
				await screen.findByText("dialogs.userStats.starshipChartTitle"),
			).toBeInTheDocument();
		});

		test("does not fetch tech tree colors when isOpen is false", async () => {
			mockApiCall.mockResolvedValue([]);

			await act(async () => {
				renderWithDialog(<UserStatsContent isOpen={false} />);
			});

			expect(mockFetchTechTreeAsync).not.toHaveBeenCalled();
		});

		test("renders error boundary message when fetchUserStats rejects", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const rejected = Promise.reject(new Error("API Down"));
			rejected.catch(() => {});
			mockApiCall.mockReturnValue(rejected);

			await act(async () => {
				renderWithDialog(<UserStatsContent isOpen={true} />);
			});

			expect(await screen.findByText("dialogs.userStats.error")).toBeInTheDocument();
			consoleSpy.mockRestore();
		});

		test("renders UserStatsDialog wrapper and close button", async () => {
			const onClose = vi.fn();

			await act(async () => {
				render(
					<Theme>
						<UserStatsDialog
							isOpen={true}
							onClose={onClose}
						/>
					</Theme>,
				);
			});

			expect(await screen.findByText("dialogs.userStats.closeButton")).toBeInTheDocument();
		});
	});
});
