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
import { io } from "socket.io-client"; // Import io for mocking

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
	WS_URL: "ws://mock-ws.com/",
	API_URL: "http://mock-api.com/", // Keep API_URL for other tests if needed
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

// Mock socket.io-client
vi.mock("socket.io-client", () => {
	const mockSocket = {
		on: vi.fn(),
		emit: vi.fn(),
		disconnect: vi.fn(),
	};
	return {
		io: vi.fn(() => mockSocket),
	};
});

// Cast mocked io
const mockIo = io as unknown as Mock;

describe("useOptimize", () => {
	let requestAnimationFrameCallback: FrameRequestCallback | null;
	let mockSocketInstance: { on: Mock; emit: Mock; disconnect: Mock }; // Rename to avoid confusion

	/**
	 * Resets all mocks and sets up the testing environment before each test.
	 */
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers(); // Use fake timers

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

		// Mock console.error
		mockConsoleError.mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(mockConsoleError);

		// Reset mockIo and capture the mockSocket instance
		mockIo.mockClear();
		mockSocketInstance = {
			on: vi.fn(),
			emit: vi.fn(),
			disconnect: vi.fn(),
		};
		mockIo.mockReturnValue(mockSocketInstance);

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
		vi.useRealTimers(); // Use real timers
	});

	it("should return initial state correctly", () => {
		const { result } = renderHook(() => useOptimize());
		expect(result.current.solving).toBe(false);
		expect(result.current.patternNoFitTech).toBeNull();
		expect(result.current.gridContainerRef.current).toBeNull();
	});

	/**
	 * Test suite for the `handleOptimize` function within the `useOptimize` hook.
	 */	describe("handleOptimize", () => {
		it("should successfully optimize and update grid/result", async () => {
			const mockApiResponse = {
				solve_method: "Success",
				grid: { cells: [[]], width: 1, height: 1 },
				max_bonus: 101,
				solved_bonus: 90,
			};

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			// Simulate connection and optimization request
			act(() => {
				result.current.handleOptimize("techA");
			});

			// Expect solving to be true immediately after calling handleOptimize
			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			// Simulate socket connection
			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			// Expect emit to be called
			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techA",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			// Simulate progress update
			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 50 });
			});
			expect(result.current.progressPercent).toBe(50);

			// Simulate optimization result
			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockApiResponse);
			});

			// Expect solving to be false and progress to be reset after result
			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

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

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techA");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techA",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 75 });
			});
			expect(result.current.progressPercent).toBe(75);

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockApiResponse);
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

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

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techB");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techB",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 25 });
			});
			expect(result.current.progressPercent).toBe(25);

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockApiResponse);
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

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

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techC", true); // Forced optimization
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techC",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: true,
			});

			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 80 });
			});
			expect(result.current.progressPercent).toBe(80);

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockApiResponse);
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith(null); // PNF should be cleared
			expect(mockUseGridStoreSetGrid).toHaveBeenCalledWith(mockApiResponse.grid);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(mockApiResponse, "techC");
		});

		it("should handle API error with message", async () => {
			const mockErrorResponse = {
				message: "Optimization failed due to server error.",
			};

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techD");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techD",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockErrorResponse);
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techD");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Invalid API response structure for successful optimization:",
				mockErrorResponse
			);
		});

		it("should handle API error without message", async () => {
			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techE");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techE",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!({}); // Simulate empty error response
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techE");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Invalid API response structure for successful optimization:",
				{}
			);
		});

		it("should handle network error", async () => {
			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techF");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectErrorCallback).toBeDefined();
			act(() => {
				connectErrorCallback!(new Error("Network error"));
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockConsoleError).toHaveBeenCalledWith(
				"WebSocket connection error:",
				expect.any(Error)
			);
			expect(mockConsoleError.mock.calls[0][1].message).toContain("Network error");
		});

		it("should handle invalid API response structure", async () => {
			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleOptimize("techG");
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techG",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: false,
			});

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!({ not_a_valid_response: true });
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

			expect(mockUseOptimizeStoreSetShowError).toHaveBeenCalledWith(true);
			expect(mockUseGridStoreSetResult).toHaveBeenCalledWith(null, "techG");
			expect(mockConsoleError).toHaveBeenCalledWith(
				"Invalid API response structure for successful optimization:",
				{ not_a_valid_response: true }
			);
		});
	});

	/**
	 * Test suite for the `clearPatternNoFitTech` function within the `useOptimize` hook.
	 */	describe("clearPatternNoFitTech", () => {
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
	 */	describe("handleForceCurrentPnfOptimize", () => {
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

			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleForceCurrentPnfOptimize();
			});

			expect(result.current.solving).toBe(true);
			expect(result.current.progressPercent).toBe(0);

			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback!();
			});

			expect(mockSocketInstance.emit).toHaveBeenCalledWith("optimize", {
				ship: "standard",
				tech: "techI",
				player_owned_rewards: {},
				grid: { cells: [], width: 0, height: 0 },
				forced: true,
			});

			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 90 });
			});
			expect(result.current.progressPercent).toBe(90);

			expect(resultCallback).toBeDefined();
			act(() => {
				resultCallback!(mockApiResponse);
			});

			expect(result.current.solving).toBe(false);
			expect(result.current.progressPercent).toBe(0);
			expect(mockSocketInstance.disconnect).toHaveBeenCalled();

			expect(mockUseOptimizeStoreSetPatternNoFitTech).toHaveBeenCalledWith(null); // Should be cleared after forced optimize
		});

		it("should not call handleOptimize if patternNoFitTech is null", async () => {
			// PNF is null by default in beforeEach
			const { result } = renderHook(() => useOptimize());

			// Capture callbacks after renderHook
			let connectCallback: Function | undefined;
			let progressCallback: Function | undefined;
			let resultCallback: Function | undefined;
			let connectErrorCallback: Function | undefined;
			let disconnectCallback: Function | undefined;

			mockSocketInstance.on.mockImplementation((event, cb) => {
				if (event === "connect") connectCallback = cb;
				if (event === "progress") progressCallback = cb;
				if (event === "optimization_result") resultCallback = cb;
				if (event === "connect_error") connectErrorCallback = cb;
				if (event === "disconnect") disconnectCallback = cb;
			});

			act(() => {
				result.current.handleForceCurrentPnfOptimize();
			});

			expect(mockSocketInstance.emit).not.toHaveBeenCalled();
		});
	});

	/**
	 * Test suite for the scrolling behavior within the `useOptimize` hook.
	 */	describe("scrolling behavior", () => {
		it("should scroll to gridContainerRef when solving and not large screen", async () => {
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
			act(() => {
				result.current.handleOptimize("techJ");
			});

			await vi.advanceTimersByTimeAsync(0); // Allow useEffect to run

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

			act(() => {
				result.current.handleOptimize("techK");
			});

			await vi.advanceTimersByTimeAsync(0); // Allow useEffect to run

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