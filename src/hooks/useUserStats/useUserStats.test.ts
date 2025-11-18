import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserStats } from "./useUserStats";

describe("useUserStats", () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.resetAllMocks();
	});

	it("should return initial state correctly", async () => {
		const { result } = renderHook(() => useUserStats());

		await waitFor(() => {
			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(true);
			expect(result.current.error).toBeNull();
		});
	});

	it("should fetch data successfully", async () => {
		const mockData = [
			{
				event_name: "test",
				ship_type: "test",
				supercharged: "test",
				technology: "test",
				total_events: 1,
			},
		];
		vi.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(mockData),
		} as Response);

		const { result } = renderHook(() => useUserStats());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toEqual(mockData);
			expect(result.current.error).toBeNull();
		});
	});

	it("should handle API error", async () => {
		const errorMessage = "HTTP error! status: 500";
		vi.spyOn(global, "fetch").mockResolvedValueOnce({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		} as Response);

		const { result } = renderHook(() => useUserStats());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toBeNull();
			expect(result.current.error).toBe(errorMessage);
		});
	});

	it("should handle network error", async () => {
		const errorMessage = "Failed to fetch";
		vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error(errorMessage));

		const { result } = renderHook(() => useUserStats());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.data).toBeNull();
			expect(result.current.error).toBe(errorMessage);
		});
	});
});
