import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTechTreeEnterAnimation } from "./useTechTreeEnterAnimation";

describe("useTechTreeEnterAnimation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize with isEntering as false", () => {
		const { result } = renderHook(() => useTechTreeEnterAnimation(false, true));
		expect(result.current).toBe(false);
	});

	it("should apply entering state when transitioning from shared grid to non-shared on desktop", () => {
		let isShared = true;
		const { rerender, result } = renderHook(() => useTechTreeEnterAnimation(isShared, true));

		expect(result.current).toBe(false);

		isShared = false;
		rerender();

		expect(result.current).toBe(true);

		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(result.current).toBe(false);
	});

	it("should not apply entering state when transitioning on small screen", () => {
		let isShared = true;
		const { rerender, result } = renderHook(() => useTechTreeEnterAnimation(isShared, false));

		expect(result.current).toBe(false);

		isShared = false;
		rerender();

		expect(result.current).toBe(false);
	});
});
