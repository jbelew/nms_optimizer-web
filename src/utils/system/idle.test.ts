import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runWhenIdle } from "./idle";

describe("runWhenIdle", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it("uses requestIdleCallback if available", () => {
		const mockRIC = vi.fn((cb: IdleRequestCallback) => {
			setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 10 }), 0);

			return 1;
		});

		vi.stubGlobal("requestIdleCallback", mockRIC);

		const callback = vi.fn();
		runWhenIdle(callback, { timeout: 1000 });

		expect(mockRIC).toHaveBeenCalledWith(expect.any(Function), { timeout: 1000 });

		vi.runAllTimers();
		expect(callback).toHaveBeenCalled();
	});

	it("falls back to setTimeout if requestIdleCallback is not available", () => {
		vi.stubGlobal("requestIdleCallback", undefined);

		const callback = vi.fn();
		runWhenIdle(callback, { timeout: 1000 });

		// delay should be timeout / 2 = 500
		vi.advanceTimersByTime(499);
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalled();
	});

	it("uses default delay of 100 if no timeout and no requestIdleCallback", () => {
		vi.stubGlobal("requestIdleCallback", undefined);

		const callback = vi.fn();
		runWhenIdle(callback);

		vi.advanceTimersByTime(99);
		expect(callback).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(callback).toHaveBeenCalled();
	});
});
