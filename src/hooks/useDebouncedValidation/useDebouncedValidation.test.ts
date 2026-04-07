import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDebouncedValidation } from "./useDebouncedValidation";

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
		const { result } = renderHook(() => useDebouncedValidation(validator, { debounceMs: 500 }));

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
		const { result } = renderHook(() => useDebouncedValidation(validator, { debounceMs: 500 }));

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
