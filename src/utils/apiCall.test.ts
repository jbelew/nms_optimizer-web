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

	it("should return parsed JSON when fetch is successful", async () => {
		const mockData = { message: "success" };
		const mockResponse = {
			ok: true,
			status: 200,
			json: vi.fn().mockResolvedValue(mockData),
		} as unknown as Response;
		vi.mocked(fetchWithTimeout).mockResolvedValue(mockResponse);

		const result = await apiCall("https://api.example.com/data");

		expect(result).toEqual(mockData);
		expect(fetchWithTimeout).toHaveBeenCalledWith("https://api.example.com/data", {}, 10000);
		expect(hideSplashScreenAndShowBackground).not.toHaveBeenCalled();
	});

	it("should throw HttpError and trigger error dialog when response is not ok", async () => {
		const mockResponse = {
			ok: false,
			status: 404,
			statusText: "Not Found",
		} as unknown as Response;
		vi.mocked(fetchWithTimeout).mockResolvedValue(mockResponse);
		const setShowErrorMock = vi.fn();
		vi.mocked(useOptimizeStore.getState).mockReturnValue({
			setShowError: setShowErrorMock,
		} as unknown as ReturnType<typeof useOptimizeStore.getState>);

		await expect(apiCall("https://api.example.com/data")).rejects.toThrow(HttpError);

		expect(hideSplashScreenAndShowBackground).toHaveBeenCalled();
		expect(setShowErrorMock).toHaveBeenCalledWith(true, "fatal", expect.any(Error));
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
		expect(setShowErrorMock).toHaveBeenCalledWith(true, "fatal", expect.any(Error));
	});

	it("should NOT trigger error dialog when skipGlobalError is true", async () => {
		const mockResponse = {
			ok: false,
			status: 500,
			statusText: "Server Error",
		} as unknown as Response;
		vi.mocked(fetchWithTimeout).mockResolvedValue(mockResponse);
		const setShowErrorMock = vi.fn();
		vi.mocked(useOptimizeStore.getState).mockReturnValue({
			setShowError: setShowErrorMock,
		} as unknown as ReturnType<typeof useOptimizeStore.getState>);

		await expect(
			apiCall("https://api.example.com/data", { skipGlobalError: true })
		).rejects.toThrow(HttpError);

		expect(hideSplashScreenAndShowBackground).not.toHaveBeenCalled();
		expect(setShowErrorMock).not.toHaveBeenCalled();
	});
});
