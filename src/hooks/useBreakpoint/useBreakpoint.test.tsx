import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";

import { useBreakpoint } from "./useBreakpoint";

// Helper to mock window.matchMedia
const createMatchMediaMock = (matches: boolean) => {
	// Use a more specific type for listeners
	const listeners: Array<(this: MediaQueryList, ev: MediaQueryListEvent) => void> = [];

	const addEventListenerMock = vi.fn(function (
		this: MediaQueryList,
		type: string,
		listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
	) {
		if (type === "change") {
			listeners.push(listener);
		}
	});

	const removeEventListenerMock = vi.fn(function (
		this: MediaQueryList,
		type: string,
		listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
	) {
		if (type === "change") {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	});

	return {
		matches,
		media: "",
		onchange: null,
		addEventListener: addEventListenerMock,
		removeEventListener: removeEventListenerMock,
		// Alias for older methods
		addListener: vi.fn(function (
			this: MediaQueryList,
			listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
		) {
			listeners.push(listener);
		}),
		removeListener: vi.fn(function (
			this: MediaQueryList,
			listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
		) {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}),
		dispatchEvent: vi.fn(function (this: MediaQueryList, event: Partial<MediaQueryListEvent>) {
			// Call listeners with the correct 'this' context
			listeners.forEach((listener) => listener.call(this, event as MediaQueryListEvent));
			return true;
		}),
	};
};

describe("useBreakpoint", () => {
	let matchMediaMock: ReturnType<typeof createMatchMediaMock>;
	let matchMediaSpy: MockInstance;

	beforeEach(() => {
		vi.clearAllMocks();
		matchMediaMock = createMatchMediaMock(false); // Default to not matching
		matchMediaSpy = vi
			.spyOn(window, "matchMedia")
			.mockReturnValue(matchMediaMock as MediaQueryList);
	});

	it("should return initial match state based on window.matchMedia", () => {
		matchMediaMock.matches = true;
		const { result } = renderHook(() => useBreakpoint("768px"));
		expect(result.current).toBe(true);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 768px)");
	});

	it("should update match state when media query changes", () => {
		matchMediaMock.matches = false;
		const { result } = renderHook(() => useBreakpoint("768px"));
		expect(result.current).toBe(false);

		// Simulate a change event
		act(() => {
			matchMediaMock.matches = true;
			matchMediaMock.dispatchEvent({ matches: true } as MediaQueryListEvent);
		});

		expect(result.current).toBe(true);
	});

	it("should remove event listener on unmount", () => {
		const { unmount } = renderHook(() => useBreakpoint("768px"));
		expect(matchMediaMock.addEventListener).toHaveBeenCalledTimes(1);

		unmount();

		expect(matchMediaMock.removeEventListener).toHaveBeenCalledTimes(1);
		expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
			"change",
			matchMediaMock.addEventListener.mock.calls[0][1]
		);
	});

	it("should handle different breakpoints", () => {
		matchMediaMock.matches = false;
		const { result, rerender } = renderHook(({ bp }) => useBreakpoint(bp), {
			initialProps: { bp: "480px" },
		});
		expect(result.current).toBe(false);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 480px)");

		// Rerender with a new breakpoint
		matchMediaMock.matches = true; // Simulate it matching the new breakpoint
		rerender({ bp: "1024px" });

		expect(result.current).toBe(true);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 1024px)");
		// Ensure old listener is removed and new one is added
		expect(matchMediaMock.removeEventListener).toHaveBeenCalledTimes(1);
		expect(matchMediaMock.addEventListener).toHaveBeenCalledTimes(2);
	});
});
