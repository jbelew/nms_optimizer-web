import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetchWithTimeout";

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
		let abortSignal: AbortSignal | undefined;

		vi.mocked(global.fetch).mockImplementation((_url, init) => {
			abortSignal = init?.signal ?? undefined;

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

	it("should use default timeout if none provided", async () => {
		const mockResponse = new Response(null, { status: 200 });
		vi.mocked(global.fetch).mockResolvedValue(mockResponse);

		await fetchWithTimeout("https://example.com");

		vi.advanceTimersByTime(5000);
		expect(global.fetch).toHaveBeenCalled();
	});
});
