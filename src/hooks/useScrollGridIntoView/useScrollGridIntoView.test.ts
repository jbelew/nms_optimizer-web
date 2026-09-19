import type { Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";

import {
	__resetScrollGridIntoViewRef,
	registerToolbarForceShow,
	useScrollGridIntoView,
} from "./useScrollGridIntoView";

vi.mock("@/hooks/useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(),
}));

/**
 * Unit test suite for the `useScrollGridIntoView` hook.
 *
 * @see {@link useScrollGridIntoView}
 */
describe("useScrollGridIntoView", () => {
	let rafCallbacks: Array<FrameRequestCallback>;
	let scrollToMock: Mock;
	let mockElement: HTMLDivElement;
	let getBoundingClientRectMock: Mock;

	beforeEach(() => {
		vi.clearAllMocks();
		__resetScrollGridIntoViewRef();

		rafCallbacks = [];
		vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
			rafCallbacks.push(cb);

			return rafCallbacks.length;
		});

		scrollToMock = vi.fn();
		Object.defineProperty(window, "scrollTo", { value: scrollToMock, writable: true });
		Object.defineProperty(window, "pageYOffset", { value: 0, writable: true });

		getBoundingClientRectMock = vi.fn().mockReturnValue({
			bottom: 250,
			height: 100,
			left: 0,
			right: 100,
			toJSON: () => {},
			top: 150,
			width: 100,
			x: 0,
			y: 150,
		});

		mockElement = document.createElement("div");
		mockElement.getBoundingClientRect = getBoundingClientRectMock;

		// Default to mobile breakpoint (< 640px)
		(useBreakpoint as Mock).mockImplementation((_bp: string) => false);
	});

	it("defers DOM layout measurement and scrolling across two animation frames", () => {
		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		// Step 1: Call scrollIntoView
		result.current.scrollIntoView();

		// Immediately: DOM measurement and window.scrollTo must NOT have executed synchronously
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();
		expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
		expect(rafCallbacks).toHaveLength(1);

		// Step 2: Flush the first animation frame (pre-paint frame)
		act(() => {
			const frame1Callback = rafCallbacks.shift();
			frame1Callback?.(performance.now());
		});

		// After first frame: DOM measurement and scrolling must STILL NOT have executed
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();
		expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
		expect(rafCallbacks).toHaveLength(1);

		// Step 3: Flush the second animation frame (post-paint frame)
		act(() => {
			const frame2Callback = rafCallbacks.shift();
			frame2Callback?.(performance.now());
		});

		// After second frame: DOM measurement and smooth scroll must now have executed
		expect(getBoundingClientRectMock).toHaveBeenCalledTimes(1);
		expect(scrollToMock).toHaveBeenCalledTimes(1);
		// Small screen offset is 40: 150 + 0 - 40 = 110
		expect(scrollToMock).toHaveBeenCalledWith({ behavior: "smooth", top: 110 });
	});

	it("calculates small screen (< 640px) responsive scroll offset", () => {
		(useBreakpoint as Mock).mockImplementation((bp: string) => {
			if (bp === "640px") return false;
			if (bp === "768px") return false;
			if (bp === "1024px") return false;

			return false;
		});

		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		// Flush frame 1 then frame 2
		act(() => {
			rafCallbacks.shift()?.(performance.now());
			rafCallbacks.shift()?.(performance.now());
		});

		// top: 150 + 0 - 40 = 110
		expect(scrollToMock).toHaveBeenCalledWith({ behavior: "smooth", top: 110 });
	});

	it("calculates medium screen (640px - 768px) responsive scroll offset", () => {
		(useBreakpoint as Mock).mockImplementation((bp: string) => {
			if (bp === "640px") return true;
			if (bp === "768px") return false;
			if (bp === "1024px") return false;

			return false;
		});

		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		// Flush frame 1 then frame 2
		act(() => {
			rafCallbacks.shift()?.(performance.now());
			rafCallbacks.shift()?.(performance.now());
		});

		// Medium screen offset is 0: 150 + 0 - 0 = 150
		expect(scrollToMock).toHaveBeenCalledWith({ behavior: "smooth", top: 150 });
	});

	it("calculates large screen (>= 768px) responsive scroll offset", () => {
		(useBreakpoint as Mock).mockImplementation((bp: string) => {
			if (bp === "640px") return true;
			if (bp === "768px") return true;
			if (bp === "1024px") return false;

			return false;
		});

		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		// Flush frame 1 then frame 2
		act(() => {
			rafCallbacks.shift()?.(performance.now());
			rafCallbacks.shift()?.(performance.now());
		});

		// Large screen offset is 0: 150 + 0 - 0 = 150
		expect(scrollToMock).toHaveBeenCalledWith({ behavior: "smooth", top: 150 });
	});

	it("skips scrolling on large screens when skipOnLargeScreens is true and viewport >= 1024px", () => {
		(useBreakpoint as Mock).mockImplementation((bp: string) => {
			if (bp === "640px") return true;
			if (bp === "768px") return true;
			if (bp === "1024px") return true;

			return false;
		});

		const { result } = renderHook(() => useScrollGridIntoView({ skipOnLargeScreens: true }));
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		expect(rafCallbacks).toHaveLength(0);
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();
	});

	it("does not skip scrolling on large screens when skipOnLargeScreens is false and viewport >= 1024px", () => {
		(useBreakpoint as Mock).mockImplementation((bp: string) => {
			if (bp === "640px") return true;
			if (bp === "768px") return true;
			if (bp === "1024px") return true;

			return false;
		});

		const { result } = renderHook(() => useScrollGridIntoView({ skipOnLargeScreens: false }));
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		expect(rafCallbacks).toHaveLength(1);

		act(() => {
			rafCallbacks.shift()?.(performance.now());
			rafCallbacks.shift()?.(performance.now());
		});

		expect(scrollToMock).toHaveBeenCalledWith({ behavior: "smooth", top: 150 });
	});

	it("does not schedule animation frames or scroll when gridContainerRef is null", () => {
		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = null;

		result.current.scrollIntoView();

		expect(rafCallbacks).toHaveLength(0);
		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();
	});

	it("safely handles element unmounting between first and second animation frame", () => {
		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		// Flush frame 1
		act(() => {
			rafCallbacks.shift()?.(performance.now());
		});

		// Element unmounts before frame 2 fires
		result.current.gridContainerRef.current = null;

		// Flush frame 2
		act(() => {
			rafCallbacks.shift()?.(performance.now());
		});

		expect(getBoundingClientRectMock).not.toHaveBeenCalled();
		expect(scrollToMock).not.toHaveBeenCalled();
	});

	it("triggers registered toolbar forceShow callback synchronously during the call", () => {
		const forceShowMock = vi.fn();
		registerToolbarForceShow(forceShowMock);

		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		result.current.scrollIntoView();

		expect(forceShowMock).toHaveBeenCalledTimes(1);
	});

	it("resets shared ref and callbacks when __resetScrollGridIntoViewRef is called", () => {
		const forceShowMock = vi.fn();
		registerToolbarForceShow(forceShowMock);

		const { result } = renderHook(() => useScrollGridIntoView());
		result.current.gridContainerRef.current = mockElement;

		__resetScrollGridIntoViewRef();

		const { result: newResult } = renderHook(() => useScrollGridIntoView());
		expect(newResult.current.gridContainerRef.current).toBeNull();

		newResult.current.scrollIntoView();
		expect(forceShowMock).not.toHaveBeenCalled();
	});
});
