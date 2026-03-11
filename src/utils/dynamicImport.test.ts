import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { retryImport } from "./dynamicImport";

describe("retryImport", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("should resolve immediately if the import succeeds", async () => {
		const mockModule = { foo: "bar" };
		const importFn = vi.fn().mockResolvedValue(mockModule);

		const result = await retryImport(importFn);

		expect(result).toBe(mockModule);
		expect(importFn).toHaveBeenCalledTimes(1);
	});

	it("should retry the import if it fails and eventually succeed", async () => {
		const mockModule = { foo: "bar" };
		const error = new Error("Importing a module script failed");
		const importFn = vi
			.fn()
			.mockRejectedValueOnce(error)
			.mockRejectedValueOnce(error)
			.mockResolvedValue(mockModule);

		const promise = retryImport(importFn, { retries: 3, delay: 100 });

		// First failure
		await vi.runAllTimersAsync();
		// Second failure
		await vi.runAllTimersAsync();
		// Success
		const result = await promise;

		expect(result).toBe(mockModule);
		expect(importFn).toHaveBeenCalledTimes(3);
	});

	it("should throw if all retries fail", async () => {
		const error = new Error("Importing a module script failed");
		const importFn = vi.fn().mockImplementation(async () => {
			throw error;
		});

		const promise = retryImport(importFn, { retries: 2, delay: 100 });

		// Attach a dummy catch to prevent unhandled rejection warning during timer advancement
		promise.catch(() => {});

		// Step-by-step timer advancement to allow microtasks to process catch blocks
		for (let i = 0; i < 3; i++) {
			await vi.runAllTimersAsync();
		}

		await expect(promise).rejects.toThrow(error);
		expect(importFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
	});

	it("should use exponential backoff", async () => {
		const error = new Error("Importing a module script failed");
		const importFn = vi.fn().mockImplementation(async () => {
			throw error;
		});
		const setTimeoutSpy = vi.spyOn(window, "setTimeout");

		const promise = retryImport(importFn, { retries: 2, delay: 100 });
		promise.catch(() => {});

		// First failure triggers first setTimeout
		await vi.runOnlyPendingTimersAsync();
		expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

		// Second failure triggers second setTimeout
		await vi.runOnlyPendingTimersAsync();
		expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 200);

		// Final failure
		await vi.runOnlyPendingTimersAsync();

		await expect(promise).rejects.toThrow(error);
	});
});
