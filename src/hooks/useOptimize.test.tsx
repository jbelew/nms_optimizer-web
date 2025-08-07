import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { API_URL } from "../constants";
import { useGridStore } from "../store/GridStore";
import { useOptimizeStore } from "../store/OptimizeStore";
import { usePlatformStore } from "../store/PlatformStore";
import { useTechStore } from "../store/TechStore";
import { useAnalytics } from "./useAnalytics/useAnalytics";
import { useBreakpoint } from "./useBreakpoint";
import { useOptimize } from "./useOptimize";

// Mock all external dependencies
vi.mock("./useAnalytics/useAnalytics", () => ({
	useAnalytics: vi.fn(),
}));
vi.mock("../store/GridStore");
vi.mock("../store/OptimizeStore");
vi.mock("../store/TechStore");
vi.mock("../store/PlatformStore");
vi.mock("./useBreakpoint");
vi.mock("../constants", () => ({
	API_URL: "http://mock-api.com/",
}));

describe("useOptimize", () => {
	let fetchSpy: vi.SpyInstance;
	let sendEventMock: vi.Mock;
	let setGridMock: vi.Mock;
	let setResultMock: vi.Mock;
	let setShowErrorStoreMock: vi.Mock;
	let setPatternNoFitTechMock: vi.Mock;
	let scrollToMock: vi.Mock;
	let requestAnimationFrameCallback: FrameRequestCallback | null;
	let consoleErrorSpy: vi.SpyInstance;

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock global fetch
		fetchSpy = vi.spyOn(global, "fetch");

		// Mock console.error
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		// Mock useAnalytics
		sendEventMock = vi.fn();
		(useAnalytics as vi.Mock).mockReturnValue({ sendEvent: sendEventMock });

		// Mock useGridStore
		setGridMock = vi.fn();
		setResultMock = vi.fn();
		(useGridStore as vi.Mock).mockReturnValue({
			setGrid: setGridMock,
			setResult: setResultMock,
			grid: { cells: [], width: 0, height: 0 }, // Provide a minimal grid structure
		});

		// Mock useOptimizeStore
		setShowErrorStoreMock = vi.fn();
		setPatternNoFitTechMock = vi.fn();
		(useOptimizeStore as vi.Mock).mockReturnValue({
			// showError: false, // Not returned by hook anymore
			setShowError: setShowErrorStoreMock,
			patternNoFitTech: null,
			setPatternNoFitTech: setPatternNoFitTechMock,
		});

		// Mock useTechStore
		(useTechStore as vi.Mock).mockReturnValue({
			checkedModules: {},
		});

		// Mock usePlatformStore
		(usePlatformStore as vi.Mock).mockReturnValue("standard");

		// Mock useBreakpoint
		(useBreakpoint as vi.Mock).mockReturnValue(true); // Assume large screen by default

		// Mock window.scrollTo and requestAnimationFrame
		scrollToMock = vi.fn();
		Object.defineProperty(window, "scrollTo", { value: scrollToMock, writable: true });

		// Capture the requestAnimationFrame callback without immediately executing it
		requestAnimationFrameCallback = null;
		Object.defineProperty(window, "requestAnimationFrame", {
			value: vi.fn((cb) => {
				requestAnimationFrameCallback = cb;
				return 1; // Return a dummy ID
			}),
			writable: true,
		});
		Object.defineProperty(window, "cancelAnimationFrame", { value: vi.fn(), writable: true });
		Object.defineProperty(window, "pageYOffset", { value: 0, writable: true });
	});

	afterEach(() => {
		fetchSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it("should return initial state correctly", () => {
		const { result } = renderHook(() => useOptimize());
		expect(result.current.solving).toBe(false);
		expect(result.current.patternNoFitTech).toBeNull();
		expect(result.current.gridContainerRef.current).toBeNull();
	});

	describe("handleOptimize", () => {
		it("should successfully optimize and update grid/result", async () => {
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
				max_bonus: 101,
				solved_bonus: 90,
			};
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techA");
			});

			expect(result.current.solving).toBe(false);
			expect(setGridMock).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(setResultMock).toHaveBeenCalledWith(mockApiResponse, "techA");
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(false);
			expect(sendEventMock).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "optimize_tech",
				platform: "standard",
				tech: "techA",
				solve_method: "Success",
				value: 1,
				supercharged: true,
			});
			expect(setPatternNoFitTechMock).not.toHaveBeenCalled();
		});

		it("should successfully optimize with supercharged false", async () => {
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
				max_bonus: 100,
				solved_bonus: 90,
			};
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techA");
			});

			expect(result.current.solving).toBe(false);
			expect(setGridMock).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(setResultMock).toHaveBeenCalledWith(mockApiResponse, "techA");
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(false);
			expect(sendEventMock).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "optimize_tech",
				platform: "standard",
				tech: "techA",
				solve_method: "Success",
				value: 1,
				supercharged: false,
			});
			expect(setPatternNoFitTechMock).not.toHaveBeenCalled();
		});

		it("should handle Pattern No Fit (PNF) response", async () => {
			const mockApiResponse = {
				solve_method: "Pattern No Fit",
				grid: null,
			};
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techB");
			});

			expect(result.current.solving).toBe(false);
			expect(setPatternNoFitTechMock).toHaveBeenCalledWith("techB");
			expect(setGridMock).not.toHaveBeenCalled();
			expect(setResultMock).not.toHaveBeenCalled();
			expect(sendEventMock).toHaveBeenCalledWith({
				category: "User Interactions",
				action: "no_fit_warning",
				platform: "standard",
				tech: "techB",
				value: 1,
			});
		});

		it("should clear PNF state on forced optimization", async () => {
			// Simulate PNF being set initially
			(useOptimizeStore as vi.Mock).mockReturnValue({
				setShowError: setShowErrorStoreMock,
				patternNoFitTech: "techC",
				setPatternNoFitTech: setPatternNoFitTechMock,
			});

			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techC", true); // Forced optimization
			});

			expect(setPatternNoFitTechMock).toHaveBeenCalledWith(null); // PNF should be cleared
			expect(setGridMock).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(setResultMock).toHaveBeenCalledWith(mockApiResponse, "techC");
		});

		it("should handle API error with message", async () => {
			const mockErrorResponse = {
				message: "Optimization failed due to server error.",
			};
			fetchSpy.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				json: () => Promise.resolve(mockErrorResponse),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techD");
			});

			expect(result.current.solving).toBe(false);
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(true);
			expect(setResultMock).toHaveBeenCalledWith(null, "techD");
			expect(consoleErrorSpy).toHaveBeenCalledWith("Error during optimization:", expect.any(Error));
			expect(consoleErrorSpy.mock.calls[0][1].message).toContain(
				"Optimization failed due to server error."
			);
		});

		it("should handle API error without message", async () => {
			fetchSpy.mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
				json: () => Promise.resolve({}), // Empty error response
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techE");
			});

			expect(result.current.solving).toBe(false);
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(true);
			expect(setResultMock).toHaveBeenCalledWith(null, "techE");
			expect(consoleErrorSpy).toHaveBeenCalledWith("Error during optimization:", expect.any(Error));
			expect(consoleErrorSpy.mock.calls[0][1].message).toContain(
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
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(true);
			expect(setResultMock).toHaveBeenCalledWith(null, "techF");
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error during optimization:",
				expect.any(TypeError)
			);
			expect(consoleErrorSpy.mock.calls[0][1].message).toContain("Failed to fetch");
		});

		it("should handle invalid API response structure", async () => {
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ not_a_valid_response: true }),
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("techG");
			});

			expect(result.current.solving).toBe(false);
			expect(setShowErrorStoreMock).toHaveBeenCalledWith(true);
			expect(setResultMock).toHaveBeenCalledWith(null, "techG");
			expect(consoleErrorSpy).toHaveBeenCalledWith("Error during optimization:", expect.any(Error));
			expect(consoleErrorSpy.mock.calls[0][1].message).toContain(
				"Invalid API response structure for successful optimization."
			);
		});
	});

	describe("clearPatternNoFitTech", () => {
		it("should clear patternNoFitTech state", () => {
			// Simulate PNF being set initially
			(useOptimizeStore as vi.Mock).mockReturnValue({
				setShowError: setShowErrorStoreMock,
				patternNoFitTech: "techH",
				setPatternNoFitTech: setPatternNoFitTechMock,
			});

			const { result } = renderHook(() => useOptimize());

			act(() => {
				result.current.clearPatternNoFitTech();
			});

			expect(setPatternNoFitTechMock).toHaveBeenCalledWith(null);
		});
	});

	describe("handleForceCurrentPnfOptimize", () => {
		it("should call handleOptimize with forced true if patternNoFitTech is set", async () => {
			// Simulate PNF being set initially
			(useOptimizeStore as vi.Mock).mockReturnValue({
				setShowError: setShowErrorStoreMock,
				patternNoFitTech: "techI",
				setPatternNoFitTech: setPatternNoFitTechMock,
			});

			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
			};
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

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
			expect(setPatternNoFitTechMock).toHaveBeenCalledWith(null); // Should be cleared after forced optimize
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

	describe("scrolling behavior", () => {
		it.skip("should scroll to gridContainerRef when solving and not large screen", async () => {
			// Simulate not large screen
			(useBreakpoint as vi.Mock).mockReturnValue(false);

			const { result } = renderHook(() => useOptimize());

			// Attach a mock DOM element to the ref
			const mockDiv = document.createElement("div");
			Object.defineProperty(mockDiv, "getBoundingClientRect", {
				value: () => ({ top: 100, height: 0, width: 0, x: 0, y: 0, right: 0, bottom: 0, left: 0 }),
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
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			await act(async () => {
				await result.current.handleOptimize("techJ");
			});

			// Manually trigger the requestAnimationFrame callback
			act(() => {
				if (requestAnimationFrameCallback) {
					requestAnimationFrameCallback();
				}
			});

			expect(window.requestAnimationFrame).toHaveBeenCalled();
			expect(scrollToMock).toHaveBeenCalledWith({
				top: expect.any(Number),
				behavior: "smooth",
			});
			// Verify the calculated scroll position (100 - 8 = 92)
			expect(scrollToMock.mock.calls[0][0].top).toBe(92);
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
			fetchSpy.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockApiResponse),
			});

			await act(async () => {
				await result.current.handleOptimize("techK");
			});

			// Manually trigger the requestAnimationFrame callback if it was captured
			act(() => {
				if (requestAnimationFrameCallback) {
					requestAnimationFrameCallback();
				}
			});

			expect(window.requestAnimationFrame).not.toHaveBeenCalled();
			expect(scrollToMock).not.toHaveBeenCalled();
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
					requestAnimationFrameCallback();
				}
			});

			expect(window.requestAnimationFrame).not.toHaveBeenCalled();
			expect(scrollToMock).not.toHaveBeenCalled();
		});
	});
});
