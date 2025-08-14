import type { Mock, MockInstance } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_URL } from "../../constants";
import { useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useOptimize } from "./useOptimize";

// Mock all external dependencies
vi.mock("../useAnalytics/useAnalytics");
vi.mock("../../store/GridStore");
vi.mock("../../store/OptimizeStore");
vi.mock("../../store/TechStore");
vi.mock("../../store/PlatformStore"); // This line is already present and correct
vi.mock("../useBreakpoint/useBreakpoint", () => ({
	useBreakpoint: vi.fn(() => mockUseBreakpointReturnValue),
}));
vi.mock("../../constants", () => ({
	API_URL: "http://mock-api.com/",
}));

// Define mock functions
const mockUseAnalyticsSendEvent = vi.fn();
const mockUseGridStoreSetGrid = vi.fn();
const mockUseGridStoreSetResult = vi.fn();
const mockUseOptimizeStoreSetShowError = vi.fn();
const mockUseOptimizeStoreSetPatternNoFitTech = vi.fn();
const mockUseTechStoreCheckedModules = {}; // This is a value, not a function
const mockUseBreakpoint = useBreakpoint as unknown as Mock;
const mockUsePlatformStoreReturnValue = "standard"; // This is a value, not a function
const mockUseBreakpointReturnValue = true; // This is a value, not a function
const mockWindowScrollTo = vi.fn();
const mockWindowRequestAnimationFrame = vi.fn();
const mockWindowCancelAnimationFrame = vi.fn();
const mockConsoleError = vi.fn();

// Cast mocked hooks
const mockUseGridStore = useGridStore as unknown as Mock;
const mockUseOptimizeStore = useOptimizeStore as unknown as Mock;
const mockUseTechStore = useTechStore as unknown as Mock;
const mockUsePlatformStore = usePlatformStore as unknown as Mock;

/**
 * Test suite for the `useOptimize` hook.
 */
describe("useOptimize", () => {
	let fetchSpy: MockInstance<typeof global.fetch>;
	let requestAnimationFrameCallback: FrameRequestCallback | null;

	/**
	 * Resets all mocks and sets up the testing environment before each test.
	 */
	beforeEach(() => {
		vi.clearAllMocks();

		// Reset mock functions
		mockUseAnalyticsSendEvent.mockClear();
		mockUseGridStoreSetGrid.mockClear();
		mockUseGridStoreSetResult.mockClear();
		mockUseOptimizeStoreSetShowError.mockClear();
		mockUseOptimizeStoreSetPatternNoFitTech.mockClear();
		mockWindowScrollTo.mockClear();
		mockWindowRequestAnimationFrame.mockClear();
		mockWindowCancelAnimationFrame.mockClear();
		mockConsoleError.mockClear();

		// Mock global fetch
		fetchSpy = vi.spyOn(global, "fetch");

		// Mock console.error
		mockConsoleError.mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(mockConsoleError);

		// Mock useAnalytics
		vi.mocked(useAnalytics).mockReturnValue({ sendEvent: mockUseAnalyticsSendEvent });

		// Mock useGridStore
		mockUseGridStore.mockImplementation((selector) => {
			const state = {
				setGrid: mockUseGridStoreSetGrid,
				setResult: mockUseGridStoreSetResult,
				grid: { cells: [], width: 0, height: 0 },
			};
			if (typeof selector === "function") {
				return selector(state);
			}
			return state;
		});

		// Mock useOptimizeStore
		mockUseOptimizeStore.mockImplementation((selector) => {
			const state = {
				setShowError: mockUseOptimizeStoreSetShowError,
				patternNoFitTech: null,
				setPatternNoFitTech: mockUseOptimizeStoreSetPatternNoFitTech,
			};
			if (typeof selector === "function") {
				return selector(state);
			}
			return state;
		});

		// Mock useTechStore
		mockUseTechStore.mockReturnValue({
			checkedModules: mockUseTechStoreCheckedModules,
		});

		// Mock usePlatformStore
		mockUsePlatformStore.mockReturnValue(mockUsePlatformStoreReturnValue);

		// Mock window.scrollTo and requestAnimationFrame
		Object.defineProperty(window, "scrollTo", { value: mockWindowScrollTo, writable: true });

		requestAnimationFrameCallback = null;
		Object.defineProperty(window, "requestAnimationFrame", {
			value: mockWindowRequestAnimationFrame.mockImplementation(
				(cb: FrameRequestCallback) => {
					requestAnimationFrameCallback = cb;
					return 1;
				}
			),
			writable: true,
		});
		Object.defineProperty(window, "cancelAnimationFrame", {
			value: mockWindowCancelAnimationFrame,
			writable: true,
		});
		Object.defineProperty(window, "pageYOffset", { value: 0, writable: true });
	});

	afterEach(() => {
		/**
		 * Restores all mocks after each test.
		 */
		vi.restoreAllMocks();
	});

	it("should return initial state correctly", () => {
		const { result } = renderHook(() => useOptimize());
		expect(result.current.solving).toBe(false);
		expect(result.current.patternNoFitTech).toBeNull();
		expect(result.current.gridContainerRef.current).toBeNull();
	});

	/**
	 * Test suite for the `handleOptimize` function within the `useOptimize` hook.
	 */
	describe("handleOptimize", () => {
		it("should successfully optimize and update grid/result", async () => {
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
				max_bonus: 101,
				solved_bonus: 90,
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techA");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseGridStoreSetGrid).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(mockApiResponse, "techA");
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(false);
			expect(mockUseAnalyticsSendEvent).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "optimize_tech",
				platform: "standard",
				tech: "techA",
				solve_method: "Success",
				value: 1,
				supercharged: true,
			});
			expect(mockUseOptimizeStoreSetPatternNoFitTech).not.toHaveBeenCalled();
		});

		it("should successfully optimize with supercharged false", async () => {
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
				max_bonus: 100,
				solved_bonus: 90,
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techA");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseGridStoreSetGrid).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(mockApiResponse, "techA");
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(false);
			expect(mockUseAnalyticsSendEvent).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "optimize_tech",
				platform: "standard",
				tech: "techA",
				solve_method: "Success",
				value: 1,
				supercharged: false,
			});
			expect(mockUseOptimizeStoreSetPatternNoFitTech).not.toHaveBeenCalled();
		});

		it("should handle Pattern No Fit (PNF) response", async () => {
			const mockApiResponse = {
				solve_method: "Pattern No Fit",
				grid: null,
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techB");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith("techB");
			expect(mockUseGridStoreSetGrid).not.toHaveBeenCalled();
			expect(mockUseGridStoreSetResult).not.toHaveBeenCalled();
			expect(mockUseAnalyticsSendEvent).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "no_fit_warning",
				platform: "standard",
				tech: "techB",
				value: 1,
			});
		});

		it("should clear PNF state on forced optimization", async () => {
			// Simulate PNF being set initially
			mockUseOptimizeStore.mockImplementation((selector) => {
				const state = {
					setShowError: mockUseOptimizeStoreSetShowError,
					patternNoFitTech: "techC",
					setPatternNoFitTech: mockUseOptimizeStoreSetPatternNoFitTech,
				};
				if (typeof selector === "function") {
					return selector(state);
				}
				return state;
			});

			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techC", true); // Forced optimization
			});

			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith(null); // PNF should be cleared
			expect(mockUseGridStoreSetGrid).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(mockApiResponse, "techC");
		});

		it("should handle API error with message", async () => {
			const mockErrorResponse = {
				message: "Optimization failed due to server error.",
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockErrorResponse), {
					status: 500,
					statusText: "Internal Server Error",
				})
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techD");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techD");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Error during optimization:",
				expect.any(Error)
			);
			expect(mockConsoleError.mock.calls[0][1].message).toContain(
				"Optimization failed due to server error."
			);
		});

		it("should handle API error without message", async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({}), { status: 400, statusText: "Bad Request" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techE");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techE");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Error during optimization:",
				expect.any(Error)
			);
			expect(mockConsoleError.mock.calls[0][1].message).toContain(
				"Failed to fetch data: 400 Bad Request"
			);
		});

		it("should handle network error", async () => {
			fetchSpy.mockRejectedValueOnce(new TypeError("Failed to fetch"));

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techF");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techF");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Error during optimization:",
				expect.any(TypeError)
			);
			expect(mockConsoleError.mock.calls[0][1].message).toContain("Failed to fetch");
		});

		it("should handle invalid API response structure", async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({ not_a_valid_response: true }), {
					status: 200,
					statusText: "OK",
				})
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techG");
			});

			expect(result.current.solving).toBe(false);
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techG");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Error during optimization:",
				expect.any(Error)
			);
			expect(mockConsoleError.mock.calls[0][1].message).toContain(
				"Invalid API response structure for successful optimization."
			);
		});
	});

	/**
	 * Test suite for the `clearPatternNoFitTech` function within the `useOptimize` hook.
	 */
	describe("clearPatternNoFitTech", () => {
		it("should clear patternNoFitTech state", () => {
			// Simulate PNF being set initially
			mockUseOptimizeStore.mockImplementation((selector) => {
				const state = {
					setShowError: mockUseOptimizeStoreSetShowError,
					patternNoFitTech: "techH",
					setPatternNoFitTech: mockUseOptimizeStoreSetPatternNoFitTech,
				};
				if (typeof selector === "function") {
					return selector(state);
				}
				return state;
			});

			const { result } = renderHook(() => useOptimize());

			act(() => {
				result.current.clearPatternNoFitTech();
			});

			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith(null);
		});
	});

	/**
	 * Test suite for the `handleForceCurrentPnfOptimize` function within the `useOptimize` hook.
	 */
	describe("handleForceCurrentPnfOptimize", () => {
		it("should call handleOptimize with forced true if patternNoFitTech is set", async () => {
			// Simulate PNF being set initially
			mockUseOptimizeStore.mockImplementation((selector) => {
				const state = {
					setShowError: mockUseOptimizeStoreSetShowError,
					patternNoFitTech: "techI",
					setPatternNoFitTech: mockUseOptimizeStoreSetPatternNoFitTech,
				};
				if (typeof selector === "function") {
					return selector(state);
				}
				return state;
			});

			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleForceCurrentPnfOptimize();
			});

			// Verify that handleOptimize was called with the correct arguments
			// This implicitly tests that the PNF tech was passed and forced was true
			expect(fetchSpy).toHaveBeenCalledWith(
				API_URL + "optimize",
				expect.objectContaining({
					body: JSON.stringify({
						ship: "standard",
						tech: "techI",
						player_owned_rewards: [],
						grid: { cells: [], width: 0, height: 0 },
						forced: true,
					}),
				})
			);
			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith(null); // Should be cleared after forced optimize
		});

		it("should not call handleOptimize if patternNoFitTech is null", async () => {
			// PNF is null by default in beforeEach
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleForceCurrentPnfOptimize();
			});

			expect(fetchSpy).not.toHaveBeenCalled();
		});
	});

	/**
	 * Test suite for the scrolling behavior within the `useOptimize` hook.
	 */
	describe("scrolling behavior", () => {
		it.skip("should scroll to gridContainerRef when solving and not large screen", async () => {
			// Simulate not large screen
			mockUseBreakpoint.mockReturnValue(false);

			const { result } = renderHook(() => useOptimize());

			// Attach a mock DOM element to the ref
			const mockDiv = document.createElement("div");
			Object.defineProperty(mockDiv, "getBoundingClientRect", {
				value: () => ({
					top: 100,
					height: 0,
					width: 0,
					x: 0,
					y: 0,
					right: 0,
					bottom: 0,
					left: 0,
				}),
				configurable: true,
			});
			act(() => {
				result.current.gridContainerRef.current = mockDiv;
			});

			// Trigger solving state
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			await act(async () => {
				await result.current.handleOptimize("techJ");
			});

			// Manually trigger the requestAnimationFrame callback
			act(() => {
				if (requestAnimationFrameCallback) {
					requestAnimationFrameCallback(0);
				}
			});

			expect(mockWindowRequestAnimationFrame).toHaveBeenCalled();
			expect(mockWindowScrollTo).toHaveBeenCalledWith({
				top: expect.any(Number),
				behavior: "smooth",
			});
			// Verify the calculated scroll position (100 - 8 = 92)
			expect(mockWindowScrollTo.mock.calls[0][0].top).toBe(92);
		});

		it("should not scroll when solving and is large screen", async () => {
			// isLarge is true by default in beforeEach
			const { result } = renderHook(() => useOptimize());

			const mockDiv = document.createElement("div");
			act(() => {
				result.current.gridContainerRef.current = mockDiv;
			});

			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify(mockApiResponse), { status: 200, statusText: "OK" })
			);

			await act(async () => {
				await result.current.handleOptimize("techK");
			});

			// Manually trigger the requestAnimationFrame callback if it was captured
			act(() => {
				if (requestAnimationFrameCallback) {
					requestAnimationFrameCallback(0);
				}
			});

			expect(mockWindowRequestAnimationFrame).not.toHaveBeenCalled();
			expect(mockWindowScrollTo).not.toHaveBeenCalled();
		});

		it("should not scroll when not solving", async () => {
			// isLarge is true by default in beforeEach
			const { result } = renderHook(() => useOptimize());

			const mockDiv = document.createElement("div");
			act(() => {
				result.current.gridContainerRef.current = mockDiv;
			});

			// Do not call handleOptimize, just trigger a re-render if needed
			// The useEffect for scrolling only triggers when 'solving' changes to true
			// or when 'isLarge' changes.

			// Manually trigger the requestAnimationFrame callback if it was captured
			act(() => {
				if (requestAnimationFrameCallback) {
					requestAnimationFrameCallback(0);
				}
			});

			expect(mockWindowRequestAnimationFrame).not.toHaveBeenCalled();
			expect(mockWindowScrollTo).not.toHaveBeenCalled();
		});
	});
});
