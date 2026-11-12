import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scheduleAfterNextPaint, useAfterNextPaint } from "./postPaint";

describe("postPaint scheduler", () => {
	let rafCallbacks: FrameRequestCallback[];
	let nextRafId: number;

	beforeEach(() => {
		vi.useFakeTimers();
		rafCallbacks = [];
		nextRafId = 1;

		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
			const id = nextRafId++;
			rafCallbacks[id] = cb;

			return id;
		});
		vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
			delete rafCallbacks[id];
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	const flushNextAnimationFrame = () => {
		const pending = [...Object.entries(rafCallbacks)];
		rafCallbacks = [];

		for (const [, cb] of pending) {
			cb?.(performance.now());
		}
	};

	it("defers execution until after requestAnimationFrame and a subsequent macrotask", () => {
		const callback = vi.fn();

		scheduleAfterNextPaint(callback);

		// Frame 1 has not painted yet
		expect(callback).not.toHaveBeenCalled();

		// Animation frame runs before paint; macrotask still pending after paint
		flushNextAnimationFrame();
		expect(callback).not.toHaveBeenCalled();

		// Post-paint macrotask runs
		vi.runAllTimers();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("cancels scheduled work cleanly during either the animation-frame or macrotask stage", () => {
		const cancelBeforeFrame = vi.fn();
		const cancelAfterFrame = vi.fn();

		const stopFirst = scheduleAfterNextPaint(cancelBeforeFrame);
		stopFirst();
		flushNextAnimationFrame();
		vi.runAllTimers();
		expect(cancelBeforeFrame).not.toHaveBeenCalled();

		const stopSecond = scheduleAfterNextPaint(cancelAfterFrame);
		flushNextAnimationFrame();
		stopSecond();
		vi.runAllTimers();
		expect(cancelAfterFrame).not.toHaveBeenCalled();
	});

	it("enforces latest-wins per slot on rapid double-taps and cancels pending callbacks on unmount", () => {
		const firstOpen = vi.fn();
		const secondOpen = vi.fn();
		const resetAction = vi.fn();
		const unmountedAction = vi.fn();

		const { result, unmount } = renderHook(() => useAfterNextPaint());

		act(() => {
			result.current(firstOpen, "dialog");
			result.current(secondOpen, "dialog");
			result.current(resetAction, "reset");
		});

		flushNextAnimationFrame();
		vi.runAllTimers();

		expect(firstOpen).not.toHaveBeenCalled();
		expect(secondOpen).toHaveBeenCalledTimes(1);
		expect(resetAction).toHaveBeenCalledTimes(1);

		act(() => {
			result.current(unmountedAction, "dialog");
		});
		unmount();

		flushNextAnimationFrame();
		vi.runAllTimers();
		expect(unmountedAction).not.toHaveBeenCalled();
	});
});
