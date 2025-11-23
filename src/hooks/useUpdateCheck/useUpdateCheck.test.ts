import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateCheck } from "./useUpdateCheck";

describe("useUpdateCheck", () => {
	const onUpdateAvailable = vi.fn();
	const mockBuildDate = "2023-10-27T10:00:00.000Z";

	beforeEach(() => {
		vi.stubGlobal("__BUILD_DATE__", mockBuildDate);
		onUpdateAvailable.mockClear();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("should call onUpdateAvailable when server returns different build date", async () => {
		// Mock fetch to return a different build date
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ buildDate: "2023-10-28T10:00:00.000Z" }),
		} as Response);

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		await act(async () => {
			window.dispatchEvent(new CustomEvent("new-version-available", { detail: vi.fn() }));
			// Wait for async fetch to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
	});

	it("should NOT call onUpdateAvailable when server returns same build date", async () => {
		// Mock fetch to return the same build date
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			json: async () => ({ buildDate: mockBuildDate }),
		} as Response);

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		await act(async () => {
			window.dispatchEvent(new CustomEvent("new-version-available", { detail: vi.fn() }));
			// Wait for async fetch to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(onUpdateAvailable).not.toHaveBeenCalled();
	});

	it("should call onUpdateAvailable on fetch error (fail-safe)", async () => {
		// Mock fetch to throw an error
		vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

		renderHook(() => useUpdateCheck(onUpdateAvailable));

		await act(async () => {
			window.dispatchEvent(new CustomEvent("new-version-available", { detail: vi.fn() }));
			// Wait for async fetch to complete
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		// Should show prompt as a fail-safe
		expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
	});
});
