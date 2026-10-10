import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateCheck } from "./useUpdateCheck";

describe("useUpdateCheck", () => {
	const onUpdateAvailable = vi.fn();

	beforeEach(() => {
		onUpdateAvailable.mockClear();
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("should call onUpdateAvailable when new-version-available event is dispatched and version.json indicates a new version", async () => {
		const mockUpdateSW = vi.fn();
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "newer-date",
					version: "newer-version",
				}),
				{ status: 200 }
			)
		);

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new CustomEvent("new-version-available", { detail: mockUpdateSW }));

		// Wait for microtask / async fetch to settle
		await vi.waitFor(() => {
			expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
		});

		expect(onUpdateAvailable).toHaveBeenCalledWith(mockUpdateSW);
		expect(mockUpdateSW).not.toHaveBeenCalled();
	});

	it("should NOT call onUpdateAvailable and should silently call updateSW(false) when version.json matches current version", async () => {
		const mockUpdateSW = vi.fn().mockResolvedValue(undefined);
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					buildDate: "test-date",
					version: "test-version",
				}),
				{ status: 200 }
			)
		);

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new CustomEvent("new-version-available", { detail: mockUpdateSW }));

		// Wait for async fetch to settle
		await vi.waitFor(() => {
			expect(mockUpdateSW).toHaveBeenCalledWith(false);
		});

		expect(onUpdateAvailable).not.toHaveBeenCalled();
	});

	it("should call onUpdateAvailable on fetch error as a fail-safe", async () => {
		const mockUpdateSW = vi.fn();
		vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error("Network error"));

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new CustomEvent("new-version-available", { detail: mockUpdateSW }));

		await vi.waitFor(() => {
			expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
		});

		expect(onUpdateAvailable).toHaveBeenCalledWith(mockUpdateSW);
	});

	it("should call onUpdateAvailable when version.json is missing version fields as a fallback", async () => {
		const mockUpdateSW = vi.fn();
		vi.mocked(globalThis.fetch).mockResolvedValueOnce(
			new Response(JSON.stringify({}), { status: 200 })
		);

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		window.dispatchEvent(new CustomEvent("new-version-available", { detail: mockUpdateSW }));

		await vi.waitFor(() => {
			expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
		});

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
