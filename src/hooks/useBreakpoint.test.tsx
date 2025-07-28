import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useBreakpoint } from "./useBreakpoint";

describe("useBreakpoint", () => {
	let matchMediaSpy: vi.SpyInstance;
	let addEventListenerSpy: vi.SpyInstance;
	let removeEventListenerSpy: vi.SpyInstance;
	let mockMediaQueryList: Partial<MediaQueryList>;

	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();

		// Mock MediaQueryList methods
		addEventListenerSpy = vi.fn();
		removeEventListenerSpy = vi.fn();

		mockMediaQueryList = {
			matches: false,
			media: "",
			onchange: null,
			addEventListener: addEventListenerSpy,
			removeEventListener: removeEventListenerSpy,
			dispatchEvent: vi.fn(),
		};

		// Mock window.matchMedia
		matchMediaSpy = vi
			.spyOn(window, "matchMedia")
			.mockReturnValue(mockMediaQueryList as MediaQueryList);
	});

	it("should return initial match state based on window.matchMedia", () => {
		mockMediaQueryList.matches = true;
		const { result } = renderHook(() => useBreakpoint("768px"));
		expect(result.current).toBe(true);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 768px)");
	});

	it("should update match state when media query changes", () => {
		mockMediaQueryList.matches = false;
		const { result } = renderHook(() => useBreakpoint("768px"));
		expect(result.current).toBe(false);

		// Simulate a change event
		act(() => {
			mockMediaQueryList.matches = true;
			// Call the handler that was registered with addEventListener
			const handler = addEventListenerSpy.mock.calls[0][1];
			handler({ matches: true } as MediaQueryListEvent);
		});

		expect(result.current).toBe(true);
	});

	it("should remove event listener on unmount", () => {
		const { unmount } = renderHook(() => useBreakpoint("768px"));
		expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"change",
			addEventListenerSpy.mock.calls[0][1]
		);
	});

	it("should handle different breakpoints", () => {
		mockMediaQueryList.matches = false;
		const { result, rerender } = renderHook(({ bp }) => useBreakpoint(bp), {
			initialProps: { bp: "480px" },
		});
		expect(result.current).toBe(false);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 480px)");

		// Rerender with a new breakpoint
		mockMediaQueryList.matches = true; // Simulate it matching the new breakpoint
		rerender({ bp: "1024px" });

		expect(result.current).toBe(true);
		expect(matchMediaSpy).toHaveBeenCalledWith("(min-width: 1024px)");
		// Ensure old listener is removed and new one is added
		expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
		expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
	});
});
