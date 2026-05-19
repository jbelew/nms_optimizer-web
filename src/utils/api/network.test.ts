import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useOptimizeStore } from "@/store/ui/uiStore";

import { apiCall, fetchJson, fetchWithTimeout, HttpError } from "./network";

// Mock store
vi.mock("@/store/ui/uiStore", () => ({
	useOptimizeStore: {
		getState: vi.fn(() => ({
			setShowError: vi.fn(),
		})),
	},
}));

describe("Network Utilities", () => {
	describe("HttpError", () => {
		it("should create an instance with status and message", () => {
			const error = new HttpError(404, "Not Found", "Resource not found");
			expect(error.status).toBe(404);
			expect(error.statusText).toBe("Not Found");
			expect(error.message).toBe("Resource not found");
			expect(error.name).toBe("HttpError");
		});

		it("should use default message if none provided", () => {
			const error = new HttpError(500, "Internal Server Error");
			expect(error.message).toBe("HTTP error! status: 500");
		});
	});

	describe("fetchWithTimeout", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.stubGlobal("fetch", vi.fn());
		});

		afterEach(() => {
			vi.useRealTimers();
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		});

		it("should resolve when fetch completes before timeout", async () => {
			const mockResponse = new Response(JSON.stringify({ data: "ok" }), { status: 200 });
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			const responsePromise = fetchWithTimeout("https://example.com", {}, 5000);

			const response = await responsePromise;

			expect(response).toBe(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://example.com",
				expect.objectContaining({
					signal: expect.any(AbortSignal),
				})
			);
		});

		it("should throw a timeout error when fetch exceeds timeout", async () => {
			vi.mocked(global.fetch).mockImplementation((_url, init) => {
				const abortSignal = init?.signal;

				return new Promise((_resolve, reject) => {
					abortSignal?.addEventListener("abort", () => {
						const error = new Error("The operation was aborted");
						error.name = "AbortError";
						reject(error);
					});
				});
			});

			const responsePromise = fetchWithTimeout("https://example.com", {}, 1000);

			vi.advanceTimersByTime(1001);

			await expect(responsePromise).rejects.toThrow("Request timeout after 1000ms");
		});

		it("should re-throw other fetch errors", async () => {
			const networkError = new Error("Network failure");
			vi.mocked(global.fetch).mockRejectedValue(networkError);

			const responsePromise = fetchWithTimeout("https://example.com", {}, 5000);

			await expect(responsePromise).rejects.toThrow("Network failure");
		});
	});

	describe("fetchJson", () => {
		beforeEach(() => {
			vi.stubGlobal("fetch", vi.fn());
		});

		afterEach(() => {
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		});

		it("should return parsed JSON on success", async () => {
			const mockData = { id: 1 };
			const mockResponse = new Response(JSON.stringify(mockData), {
				status: 200,
				statusText: "OK",
			});
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			const result = await fetchJson("https://example.com/api");
			expect(result).toEqual(mockData);
		});

		it("should throw HttpError on non-ok response", async () => {
			const mockResponse = new Response(null, {
				status: 404,
				statusText: "Not Found",
			});
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			await expect(fetchJson("https://example.com/api")).rejects.toThrow(HttpError);
		});
	});

	describe("apiCall", () => {
		beforeEach(() => {
			vi.stubGlobal("fetch", vi.fn());
		});

		afterEach(() => {
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		});

		it("should return data on success", async () => {
			const mockData = { success: true };
			const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			const result = await apiCall("https://example.com/api");
			expect(result).toEqual(mockData);
		});

		it("should trigger error dialog and throw on failure", async () => {
			const mockResponse = new Response(null, { status: 500, statusText: "Error" });
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			const setShowErrorMock = vi.fn();
			vi.mocked(useOptimizeStore.getState).mockReturnValue({
				setShowError: setShowErrorMock,
			} as unknown as ReturnType<typeof useOptimizeStore.getState>);

			await expect(apiCall("https://example.com/api")).rejects.toThrow(HttpError);
			expect(setShowErrorMock).toHaveBeenCalledWith(true, "fatal", expect.any(Error));
		});

		it("should not trigger error dialog if skipGlobalError is true", async () => {
			const mockResponse = new Response(null, { status: 500, statusText: "Error" });
			vi.mocked(global.fetch).mockResolvedValue(mockResponse);

			const setShowErrorMock = vi.fn();
			vi.mocked(useOptimizeStore.getState).mockReturnValue({
				setShowError: setShowErrorMock,
			} as unknown as ReturnType<typeof useOptimizeStore.getState>);

			await expect(
				apiCall("https://example.com/api", { skipGlobalError: true })
			).rejects.toThrow(HttpError);
			expect(setShowErrorMock).not.toHaveBeenCalled();
		});
	});
});
