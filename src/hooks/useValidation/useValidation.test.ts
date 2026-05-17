import type { Location } from "react-router-dom";
import type { Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { useDialog } from "@/utils/system/dialogUtils";

import { useDebouncedValidation, useUrlNormalization, useUrlValidation } from "./useValidation";

type PlatformStoreSelector = (state: PlatformStoreState) => string;

interface PlatformStoreState {
	selectedPlatform: string;
}

// Mock dependencies
vi.mock("react-router-dom", () => ({
	useLocation: vi.fn(),
	useNavigate: vi.fn(),
}));

vi.mock("@/utils/system/dialogUtils", () => ({
	useDialog: vi.fn(),
}));

vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: vi.fn(),
}));

describe("Validation Hooks", () => {
	describe("useDebouncedValidation", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("should initialize with no error", () => {
			const validator = vi.fn(() => null);
			const { result } = renderHook(() => useDebouncedValidation(validator));

			expect(result.current.error).toBeNull();
			expect(validator).not.toHaveBeenCalled();
		});

		it("should debounce validation", () => {
			const validator = vi.fn((val: string) => (val === "invalid" ? "error" : null));
			const { result } = renderHook(() =>
				useDebouncedValidation(validator, { debounceMs: 500 })
			);

			act(() => {
				result.current.handleChange("invalid");
			});

			// Validation should not have run yet
			expect(validator).not.toHaveBeenCalled();
			expect(result.current.error).toBeNull();

			// Advance time partially
			act(() => {
				vi.advanceTimersByTime(250);
			});
			expect(validator).not.toHaveBeenCalled();

			// Advance time fully
			act(() => {
				vi.advanceTimersByTime(250);
			});
			expect(validator).toHaveBeenCalledWith("invalid");
			expect(result.current.error).toBe("error");
		});

		it("should cancel previous timer on multiple changes", () => {
			const validator = vi.fn(() => "error");
			const { result } = renderHook(() =>
				useDebouncedValidation(validator, { debounceMs: 500 })
			);

			act(() => {
				result.current.handleChange("first");
			});

			act(() => {
				vi.advanceTimersByTime(250);
				result.current.handleChange("second");
			});

			act(() => {
				vi.runAllTimers();
			});

			// First call should have been cancelled, validator only runs once for the latest value
			expect(validator).toHaveBeenCalledTimes(1);
			expect(validator).toHaveBeenCalledWith("second");

			act(() => {
				vi.advanceTimersByTime(200);
			});
			expect(validator).toHaveBeenCalledTimes(1);
		});

		it("should cleanup timer on unmount", () => {
			const validator = vi.fn(() => "error");
			const { result, unmount } = renderHook(() =>
				useDebouncedValidation(validator, { debounceMs: 500 })
			);

			act(() => {
				result.current.handleChange("test");
			});

			unmount();

			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(validator).not.toHaveBeenCalled();
		});
	});

	describe("useUrlValidation", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("should redirect if grid is present but platform is missing", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test",
				search: "?grid=some-grid-data",
				state: null,
			} as Location);

			renderHook(() => useUrlValidation());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
			replaceStateSpy.mockRestore();
		});

		it("should not redirect if whitelist parameters are already correct", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test",
				search: "?platform=starship",
				state: null,
			} as Location);

			renderHook(() => useUrlValidation());

			expect(replaceStateSpy).not.toHaveBeenCalled();
			replaceStateSpy.mockRestore();
		});

		it("should redirect to strip non-whitelist parameters", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test",
				search: "?other=param",
				state: null,
			} as Location);

			renderHook(() => useUrlValidation());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test");
			replaceStateSpy.mockRestore();
		});

		it("should strip other params (not in whitelist) while preserving allowed ones", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/test",
				search: "?platform=sentinel&junk=data",
				state: null,
			} as Location);

			renderHook(() => useUrlValidation());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/test?platform=sentinel");
			replaceStateSpy.mockRestore();
		});

		it("should handle extremely corrupted URLs by stripping everything except whitelist", () => {
			const replaceStateSpy = vi
				.spyOn(window.history, "replaceState")
				.mockImplementation(() => {});
			vi.mocked(useLocation).mockReturnValue({
				hash: "",
				key: "default",
				pathname: "/de/",
				search: "?changelog%2F%3Fplatform=sentinel&platform=sentinel",
				state: null,
			} as Location);

			renderHook(() => useUrlValidation());

			expect(replaceStateSpy).toHaveBeenCalledWith({}, "", "/de/?platform=sentinel");
			replaceStateSpy.mockRestore();
		});
	});

	describe("useUrlNormalization", () => {
		const navigateMock = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();
			(useNavigate as Mock).mockReturnValue(navigateMock);
			(useLocation as Mock).mockReturnValue({ pathname: "/", search: "" });
			(useDialog as Mock).mockReturnValue({ userVisited: false });
			(usePlatformStore as unknown as Mock).mockImplementation(
				(selector: PlatformStoreSelector) => selector({ selectedPlatform: "standard" })
			);

			// Mock window.location
			window.history.replaceState({}, "", "/");
		});

		it("should NOT add platform parameter for a new user on root path", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: false });

			renderHook(() => useUrlNormalization());

			expect(navigateMock).not.toHaveBeenCalled();
		});

		it("should add platform parameter for a returning user on root path", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: true });

			renderHook(() => useUrlNormalization());

			expect(navigateMock).toHaveBeenCalledWith("/?platform=standard", { replace: true });
		});

		it("should keep and sync platform parameter if it already exists in the URL (Deep Link)", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: false });
			window.history.replaceState({}, "", "/?platform=solar");
			(usePlatformStore as unknown as Mock).mockImplementation(
				(selector: PlatformStoreSelector) => selector({ selectedPlatform: "solar" })
			);

			renderHook(() => useUrlNormalization());

			expect(navigateMock).not.toHaveBeenCalled();
		});

		it("should update platform parameter if it exists but does not match store", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: false });
			window.history.replaceState({}, "", "/?platform=solar");
			(usePlatformStore as unknown as Mock).mockImplementation(
				(selector: PlatformStoreSelector) => selector({ selectedPlatform: "standard" })
			);

			renderHook(() => useUrlNormalization());

			expect(navigateMock).toHaveBeenCalledWith("/?platform=standard", { replace: true });
		});

		it("should always ensure a trailing slash for non-file paths", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: false });
			window.history.replaceState({}, "", "/about");
			(useLocation as Mock).mockReturnValue({ pathname: "/about", search: "" });

			renderHook(() => useUrlNormalization());

			expect(navigateMock).toHaveBeenCalledWith("/about/", { replace: true });
		});

		it("should ensure trailing slash AND platform for returning users on sub-routes", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: true });
			window.history.replaceState({}, "", "/about");
			(useLocation as Mock).mockReturnValue({ pathname: "/about", search: "" });

			renderHook(() => useUrlNormalization());

			expect(navigateMock).toHaveBeenCalledWith("/about/?platform=standard", {
				replace: true,
			});
		});

		it("should NOT add trailing slash for files with extensions", () => {
			(useDialog as Mock).mockReturnValue({ userVisited: false });
			window.history.replaceState({}, "", "/sitemap.xml");
			(useLocation as Mock).mockReturnValue({ pathname: "/sitemap.xml", search: "" });

			renderHook(() => useUrlNormalization());

			expect(navigateMock).not.toHaveBeenCalled();
		});
	});
});
