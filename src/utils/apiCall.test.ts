import { afterEach, describe, expect, it, vi } from "vitest";

import { useOptimizeStore } from "../store/OptimizeStore";
import { apiCall } from "./apiCall";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { HttpError } from "./HttpError";
import { hideSplashScreenAndShowBackground } from "./splashScreen";

// Mock dependencies
vi.mock("./fetchWithTimeout");
vi.mock("./splashScreen");
vi.mock("../store/OptimizeStore", () => ({
	useOptimizeStore: {
		getState: vi.fn(() => ({
			setShowError: vi.fn(),
		})),
	},
}));

describe("apiCall", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should return response when fetch is successful", async () => {
		const mockResponse = { ok: true, status: 200 } as Response;
		vi.mocked(fetchWithTimeout).mockResolvedValue(mockResponse);

		const result = await apiCall("https://api.example.com/data");

		expect(result).toBe(mockResponse);
		expect(fetchWithTimeout).toHaveBeenCalledWith(
			"https://api.example.com/data",
			undefined,
			10000
		);
		expect(hideSplashScreenAndShowBackground).not.toHaveBeenCalled();
	});

	it("should throw HttpError and trigger error dialog when response is not ok", async () => {
		const mockResponse = { ok: false, status: 404, statusText: "Not Found" } as Response;
		vi.mocked(fetchWithTimeout).mockResolvedValue(mockResponse);
		const setShowErrorMock = vi.fn();
		vi.mocked(useOptimizeStore.getState).mockReturnValue({
			setShowError: setShowErrorMock,
		} as unknown as ReturnType<typeof useOptimizeStore.getState>);

		await expect(apiCall("https://api.example.com/data")).rejects.toThrow(HttpError);

		expect(hideSplashScreenAndShowBackground).toHaveBeenCalled();
		expect(setShowErrorMock).toHaveBeenCalledWith(true);
	});

	it("should throw Error and trigger error dialog when fetch fails (network error)", async () => {
		const networkError = new Error("Network Error");
		vi.mocked(fetchWithTimeout).mockRejectedValue(networkError);
		const setShowErrorMock = vi.fn();
		vi.mocked(useOptimizeStore.getState).mockReturnValue({
			setShowError: setShowErrorMock,
		} as unknown as ReturnType<typeof useOptimizeStore.getState>);

		await expect(apiCall("https://api.example.com/data")).rejects.toThrow("Network Error");

		expect(hideSplashScreenAndShowBackground).toHaveBeenCalled();
		expect(setShowErrorMock).toHaveBeenCalledWith(true);
	});
});
