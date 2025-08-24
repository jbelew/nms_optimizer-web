import { act, renderHook } from "@testing-library/react";
import type { Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { io } from "socket.io-client";

import { useGridStore } from "../../store/GridStore";
import { useOptimizeStore } from "../../store/OptimizeStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useTechStore } from "../../store/TechStore";
import { useAnalytics } from "../useAnalytics/useAnalytics";
import { useBreakpoint } from "../useBreakpoint/useBreakpoint";
import { useOptimize } from "./useOptimize";

// Mock external dependencies
vi.mock("socket.io-client");
vi.mock("../useAnalytics/useAnalytics");
vi.mock("../../store/GridStore", async (importOriginal) => {
	const mod = await importOriginal<typeof import("../../store/GridStore")>();
	return {
		...mod,
		useGridStore: vi.fn(),
	};
});
vi.mock("../../store/OptimizeStore");
vi.mock("../../store/TechStore");
vi.mock("../../store/PlatformStore");
vi.mock("../useBreakpoint/useBreakpoint");

// Mock constants
vi.mock("../../constants", () => ({
	WS_URL: "ws://mock-ws.com/",
}));

const mockIo = vi.mocked(io);
const mockUseGridStore = vi.mocked(useGridStore);
const mockUseOptimizeStore = vi.mocked(useOptimizeStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUsePlatformStore = vi.mocked(usePlatformStore);
const mockUseBreakpoint = vi.mocked(useBreakpoint);
const mockUseAnalytics = vi.mocked(useAnalytics);

describe("useOptimize", () => {
	const mockSocket = {
		on: vi.fn(),
		once: vi.fn(),
		emit: vi.fn(),
		disconnect: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockIo.mockImplementation(() => mockSocket as unknown as Socket);

		// Mock store and hook return values
		mockUseGridStore.mockReturnValue({
			setGrid: vi.fn(),
			setResult: vi.fn(),
			grid: {
				cells: [],
				width: 7,
				height: 7,
				valid: true,
			},
		});
		mockUseOptimizeStore.mockReturnValue({
			setShowError: vi.fn(),
			patternNoFitTech: null,
			setPatternNoFitTech: vi.fn(),
		});
		mockUseTechStore.mockReturnValue({ checkedModules: {} });
		mockUsePlatformStore.mockReturnValue("standard");
		mockUseBreakpoint.mockReturnValue(true);
		mockUseAnalytics.mockReturnValue({ sendEvent: vi.fn() });
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should return the initial state correctly", () => {
		const { result } = renderHook(() => useOptimize());

		expect(result.current.solving).toBe(false);
		expect(result.current.progressPercent).toBe(0);
		expect(result.current.patternNoFitTech).toBeNull();
	});

	describe("handleOptimize workflow", () => {
		it("should set solving to true and emit optimize on connect", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			// Manually trigger the 'connect' event
			const connectCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "connect"
			)?.[1];
			expect(connectCallback).toBeDefined();
			act(() => {
				connectCallback();
			});

			expect(result.current.solving).toBe(true);
			expect(mockSocket.emit).toHaveBeenCalledWith("optimize", expect.any(Object));
		});

		it("should emit optimize with the correct payload", async () => {
			const tech = "Test Tech";
			const grid = {
				cells: [
					[
						{ tech: "some-other-tech", supercharged: false, active: false },
						{ tech: "Test Tech", supercharged: false, active: false },
					],
				],
				width: 2,
				height: 1,
				valid: true,
			};
			const checkedModules = { "Test Tech": ["module1"] };
			const selectedShipType = "hauler";

			// Setup specific mock state for this test
			mockUseGridStore.mockReturnValue({
				setGrid: vi.fn(),
				setResult: vi.fn(),
				grid,
			});
			mockUseTechStore.mockReturnValue({ checkedModules });
			mockUsePlatformStore.mockReturnValue(selectedShipType);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize(tech);
			});

			// Manually trigger connect to get the emit call
			const connectCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "connect"
			)?.[1];
			act(() => {
				connectCallback();
			});

			// The grid sent to the server should have the 'Test Tech' cells cleared out
			const expectedGrid = {
				...grid,
				cells: [
					[
						{ tech: "some-other-tech", supercharged: false, active: false },
						{
							active: false,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							image: null,
							label: "",
							module: null,
							sc_eligible: false,
							supercharged: false,
							tech: null,
							total: 0,
							type: "",
							value: 0,
						},
					],
				],
			};

			expect(mockSocket.emit).toHaveBeenCalledWith("optimize", {
				ship: selectedShipType,
				tech: tech,
				player_owned_rewards: ["module1"],
				grid: expectedGrid,
				forced: false,
			});
		});

		it("should update progress state on 'progress' event", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			// Manually trigger the 'progress' event
			const progressCallback = mockSocket.on.mock.calls.find(
				(call) => call[0] === "progress"
			)?.[1];
			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback({ progress_percent: 45 });
			});

			expect(result.current.progressPercent).toBe(45);

			act(() => {
				progressCallback({ progress_percent: 90 });
			});

			expect(result.current.progressPercent).toBe(90);
		});
	});

	describe("error and cleanup handling", () => {
		it("should handle connection error", async () => {
			const setShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockReturnValue({
				setShowError: setShowErrorMock,
				patternNoFitTech: null,
				setPatternNoFitTech: vi.fn(),
			});
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const errorCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "connect_error"
			)?.[1];
			expect(errorCallback).toBeDefined();

			act(() => {
				errorCallback(new Error("Connection failed"));
			});

			expect(setShowErrorMock).toHaveBeenCalledWith(true);
			expect(result.current.solving).toBe(false);
			expect(mockSocket.disconnect).toHaveBeenCalled();
		});

		it("should handle invalid API response", async () => {
			const setShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockReturnValue({
				setShowError: setShowErrorMock,
				patternNoFitTech: null,
				setPatternNoFitTech: vi.fn(),
			});
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const resultCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "optimization_result"
			)?.[1];
			expect(resultCallback).toBeDefined();

			act(() => {
				resultCallback({ some: "invalid data" });
			});

			expect(setShowErrorMock).toHaveBeenCalledWith(true);
			expect(result.current.solving).toBe(false);
			expect(mockSocket.disconnect).toHaveBeenCalled();
		});
	});

	describe("remaining hook functions", () => {
		it("should clear patternNoFitTech", () => {
			const setPatternNoFitTechMock = vi.fn();
			mockUseOptimizeStore.mockReturnValue({
				setShowError: vi.fn(),
				patternNoFitTech: "some-tech",
				setPatternNoFitTech: setPatternNoFitTechMock,
			});
			const { result } = renderHook(() => useOptimize());

			act(() => {
				result.current.clearPatternNoFitTech();
			});

			expect(setPatternNoFitTechMock).toHaveBeenCalledWith(null);
		});

		it("should handle force-optimizing a PNF tech", async () => {
			const setPatternNoFitTechMock = vi.fn();
			mockUseOptimizeStore.mockReturnValue({
				setShowError: vi.fn(),
				patternNoFitTech: "PNF Tech",
				setPatternNoFitTech: setPatternNoFitTechMock,
			});
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleForceCurrentPnfOptimize();
			});

			const connectCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "connect"
			)?.[1];
			act(() => {
				connectCallback();
			});

			expect(mockSocket.emit).toHaveBeenCalledWith(
				"optimize",
				expect.objectContaining({
					tech: "PNF Tech",
					forced: true,
				})
			);
		});
	});
});
