import type { UserStat } from "./useUserStats";
import type { ReactNode } from "react";
import { createElement, Suspense } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as apiCallModule from "../../utils/apiCall";
import { resetUserStatsCache } from "./userStatsResource";
import { useUserStats } from "./useUserStats";

vi.mock("../../utils/apiCall", () => ({
	apiCall: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) =>
	createElement(Suspense, { fallback: null }, children);

describe("useUserStats", () => {
	beforeEach(() => {
		resetUserStatsCache();
		vi.clearAllMocks();
	});

	afterEach(() => {
		resetUserStatsCache();
	});

	it("should call fetchUserStats", () => {
		const mockData: UserStat[] = [
			{
				event_name: "test",
				ship_type: "test",
				supercharged: "test",
				technology: "test",
				total_events: 1,
			},
		];

		const mockFetch = vi.fn().mockResolvedValue(mockData);
		vi.mocked(apiCallModule.apiCall).mockImplementation(mockFetch);

		renderHook(() => useUserStats(), { wrapper });

		expect(mockFetch).toHaveBeenCalled();
	});

	it("should call apiCall with correct URL", async () => {
		const mockData: UserStat[] = [];
		vi.mocked(apiCallModule.apiCall).mockResolvedValueOnce(mockData);

		renderHook(() => useUserStats(), { wrapper });

		await waitFor(() => {
			expect(apiCallModule.apiCall).toHaveBeenCalledWith(
				expect.stringContaining("analytics/popular_data"),
				{},
				10000
			);
		});
	});
});
