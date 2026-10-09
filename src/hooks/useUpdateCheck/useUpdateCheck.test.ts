import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateCheck } from "./useUpdateCheck";

describe("useUpdateCheck", () => {
	const onUpdateAvailable = vi.fn();

	beforeEach(() => {
		onUpdateAvailable.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should call onUpdateAvailable when new-version-available event is dispatched", () => {
		const mockUpdateSW = vi.fn();
		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new CustomEvent("new-version-available", { detail: mockUpdateSW }));

		expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
		expect(onUpdateAvailable).toHaveBeenCalledWith(mockUpdateSW);
	});

	it("should ignore non-CustomEvent events", () => {
		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new Event("new-version-available"));

		expect(onUpdateAvailable).not.toHaveBeenCalled();
	});

	it("should clean up event listener on unmount", () => {
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useUpdateCheck(onUpdateAvailable));

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"new-version-available",
			expect.any(Function)
		);
	});
});
