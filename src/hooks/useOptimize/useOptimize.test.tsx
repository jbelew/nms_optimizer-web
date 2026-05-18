import type * as Constants from "@/constants";
import type { OptimizeState } from "@/store/app/optimizeStore";
import type { PlatformState } from "@/store/app/platformStore";
import type * as GridStoreModule from "@/store/grid/gridStore";
import type { GridStore } from "@/store/grid/gridStore";
import type { TechState } from "@/store/tech/techStore";
import type { Socket } from "socket.io-client";
import type { Mock } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useOptimizeStore } from "@/store/app/optimizeStore";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { createSocket } from "@/utils/api/socketManager";
import { Logger } from "@/utils/system/monitoring";

import { useOptimize } from "./useOptimize";

// Mock external dependencies
vi.mock("@/hooks/useAnalytics/useAnalytics");
vi.mock("@/store/grid/gridStore", async (importOriginal) => {
	const mod = (await importOriginal()) as typeof GridStoreModule;

	return {
		...mod,
		useGridStore: {
			getState: vi.fn(),
		},
	};
});
vi.mock("@/store/app/optimizeStore");
vi.mock("@/store/tech/techStore", () => ({
	useTechStore: {
		getState: vi.fn(),
	},
}));
vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: Object.assign(vi.fn(), {
		getState: vi.fn(),
	}),
}));
vi.mock("@/hooks/useBreakpoint/useBreakpoint");
vi.mock("@/utils/api/socketManager", () => ({
	createSocket: vi.fn(),
	SOCKET_OPTIONS: {},
	TRANSPORT_ERROR_MESSAGES: new Set(["timeout", "websocket error"]),
}));

// Mock constants
vi.mock("@/constants", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof Constants;

	return {
		...actual,
		WS_URL: "ws://mock-ws.com/",
	};
});

const mockUseGridStore = vi.mocked(useGridStore);
const mockUseOptimizeStore = vi.mocked(useOptimizeStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUsePlatformStore = vi.mocked(usePlatformStore);
const mockUseBreakpoint = vi.mocked(useBreakpoint);
const mockUseAnalytics = vi.mocked(useAnalytics);
const mockCreateSocket = vi.mocked(createSocket);

vi.mock("@/utils/system/monitoring", () => ({
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

const mockLogger = vi.mocked(Logger);

describe("useOptimize", () => {
	const createMockSocket = () => ({
		connected: true,
		disconnect: vi.fn(),
		emit: vi.fn(),
		off: vi.fn(),
		on: vi.fn(),
		once: vi.fn(),
	});

	let mockSocket: ReturnType<typeof createMockSocket>;

	const setShowErrorMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockSocket = createMockSocket();
		mockCreateSocket.mockReturnValue(mockSocket as unknown as Socket);

		// Mock store and hook return values
		const mockOptimizeState: OptimizeState = {
			error: null,
			errorType: null,
			patternNoFitTech: null,
			setPatternNoFitTech: vi.fn(),
			setShowError: setShowErrorMock,
			showError: false,
		};

		mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
			selector(mockOptimizeState)
		);

		mockUseGridStore.getState.mockReturnValue({
			grid: {
				cells: [],
				height: 7,
				valid: true,
				width: 7,
			},
			setGrid: vi.fn(),
			setResult: vi.fn(),
		} as unknown as GridStore);

		mockUseTechStore.getState.mockReturnValue({
			activeGroups: {},
			checkedModules: {},
			initializeTechTree: vi.fn(),
			techGroups: {},
		} as unknown as TechState);

		mockUsePlatformStore.getState.mockImplementation(
			() =>
				({
					selectedPlatform: mockUsePlatformStore(),
				}) as unknown as PlatformState
		);

		mockUsePlatformStore.mockReturnValue("standard");
		mockUseBreakpoint.mockReturnValue(true);
		mockUseAnalytics.mockReturnValue({ sendDeferredEvent: vi.fn(), sendEvent: vi.fn() });
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
		it("should set solving to true and emit optimize", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			expect(result.current.solving).toBe(true);
			expect(mockSocket.emit).toHaveBeenCalledWith("optimize", expect.any(Object));
		});

		it("should emit optimize with the correct payload", async () => {
			const tech = "Test Tech";
			const grid = {
				cells: [
					[
						{ active: false, supercharged: false, tech: "some-other-tech" },
						{ active: false, supercharged: false, tech: "Test Tech" },
					],
				],
				height: 1,
				valid: true,
				width: 2,
			};
			const checkedModules = { "Test Tech": ["module1"] };
			const selectedShipType = "hauler";

			// Setup specific mock state for this test
			mockUseGridStore.getState.mockReturnValue({
				grid,
				setGrid: vi.fn(),
				setResult: vi.fn(),
			} as unknown as GridStore);
			mockUseTechStore.getState.mockReturnValue({
				activeGroups: { "Test Tech": "group1" },
				checkedModules,
				techGroups: { "Test Tech": ["module1", "module2"] },
			} as unknown as TechState);
			mockUsePlatformStore.mockReturnValue(selectedShipType);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize(tech);
			});

			// The grid sent to the server should have the 'Test Tech' cells cleared out
			const expectedGrid = {
				...grid,
				cells: [
					[
						{ active: false, supercharged: false, tech: "some-other-tech" },
						{
							active: false,
							adjacency: "none",
							adjacency_bonus: 0,
							bonus: 0,
							group_adjacent: false,
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
				available_modules: ["module1"],
				forced: false,
				grid: expectedGrid,
				send_grid_updates: true,
				ship: selectedShipType,
				solve_type: "group1",
				tech: tech,
			});
		});

		it("should update progress state on 'progress' event", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			// Manually trigger the 'progress' event
			const progressCallback = (
				(mockSocket.on as unknown as Mock).mock.calls as unknown as [
					string,
					(data: { progress_percent: number }) => void,
				][]
			).find((call) => call[0] === "progress")?.[1];
			expect(progressCallback).toBeDefined();
			act(() => {
				progressCallback!({ progress_percent: 45 });
			});

			expect(result.current.progressPercent).toBe(45);

			act(() => {
				progressCallback!({ progress_percent: 90 });
			});

			expect(result.current.progressPercent).toBe(90);
		});
	});

	describe("error and cleanup handling", () => {
		it("should handle connection error", async () => {
			const localSetShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: null,
					setPatternNoFitTech: vi.fn(),
					setShowError: localSetShowErrorMock,
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const errorCallback = (
				(mockSocket.once as unknown as Mock).mock.calls as unknown as [
					string,
					(err: Error) => void,
				][]
			).find((call) => call[0] === "connect_error")?.[1];
			expect(errorCallback).toBeDefined();

			act(() => {
				errorCallback!(new Error("Connection failed"));
			});

			expect(localSetShowErrorMock).toHaveBeenCalledWith(
				true,
				"recoverable",
				expect.any(Error)
			);
			expect(result.current.solving).toBe(false);
			expect(mockSocket.off).toHaveBeenCalled();
		});

		it("should handle invalid API response", async () => {
			const localSetShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: null,
					setPatternNoFitTech: vi.fn(),
					setShowError: localSetShowErrorMock,
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const resultCallback = (
				(mockSocket.once as unknown as Mock).mock.calls as unknown as [
					string,
					(data: unknown) => void,
				][]
			).find((call) => call[0] === "optimization_result")?.[1];
			expect(resultCallback).toBeDefined();

			act(() => {
				resultCallback!({ some: "invalid data" });
			});

			expect(localSetShowErrorMock).toHaveBeenCalledWith(
				true,
				"recoverable",
				expect.any(Error)
			);
			expect(result.current.solving).toBe(false);
			expect(mockSocket.off).toHaveBeenCalled();
		});

		it("should silence benign disconnects (transport close)", async () => {
			const localSetShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: null,
					setPatternNoFitTech: vi.fn(),
					setShowError: localSetShowErrorMock,
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const disconnectCallback = (
				(mockSocket.on as unknown as Mock).mock.calls as unknown as [
					string,
					(reason: string) => void,
				][]
			).find((call) => call[0] === "disconnect")?.[1];
			expect(disconnectCallback).toBeDefined();

			act(() => {
				disconnectCallback!("transport close");
			});

			expect(mockLogger.info).toHaveBeenCalledWith(
				expect.stringContaining("(transport close)"),
				expect.any(Object)
			);
			expect(mockLogger.warn).not.toHaveBeenCalledWith(
				expect.stringContaining("disconnected during optimization"),
				expect.any(Object)
			);

			// Initial handleOptimize calls setShowError(false)
			// resetProgress() calls setShowError(false) again on cleanup
			expect(localSetShowErrorMock).toHaveBeenCalledWith(false);

			// Ensure it was never called with true (which would show the error modal)
			const calledWithTrue = localSetShowErrorMock.mock.calls.some(
				(args) => args[0] === true
			);
			expect(calledWithTrue).toBe(false);

			expect(result.current.solving).toBe(false);
			expect(mockSocket.off).toHaveBeenCalled();
		});

		it("should warn on genuine disconnects (ping timeout)", async () => {
			const localSetShowErrorMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: null,
					setPatternNoFitTech: vi.fn(),
					setShowError: localSetShowErrorMock,
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const disconnectCallback = (
				(mockSocket.on as unknown as Mock).mock.calls as unknown as [
					string,
					(reason: string) => void,
				][]
			).find((call) => call[0] === "disconnect")?.[1];
			expect(disconnectCallback).toBeDefined();

			act(() => {
				disconnectCallback!("ping timeout");
			});

			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining("disconnected during optimization"),
				expect.any(Object)
			);
			expect(localSetShowErrorMock).toHaveBeenCalledWith(
				true,
				"recoverable",
				expect.any(Error)
			);
			expect(result.current.solving).toBe(false);
		});
	});

	describe("remaining hook functions", () => {
		it("should clear patternNoFitTech", () => {
			const setPatternNoFitTechMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: "some-tech",
					setPatternNoFitTech: setPatternNoFitTechMock,
					setShowError: vi.fn(),
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			act(() => {
				result.current.clearPatternNoFitTech();
			});

			expect(setPatternNoFitTechMock).toHaveBeenCalledWith(null);
		});

		it("should handle force-optimizing a PNF tech", async () => {
			const setPatternNoFitTechMock = vi.fn();
			mockUseOptimizeStore.mockImplementation((selector: (s: OptimizeState) => unknown) =>
				selector({
					error: null,
					errorType: null,
					patternNoFitTech: "PNF Tech",
					setPatternNoFitTech: setPatternNoFitTechMock,
					setShowError: vi.fn(),
					showError: false,
				})
			);
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleForceCurrentPnfOptimize();
			});

			expect(mockSocket.emit).toHaveBeenCalledWith(
				"optimize",
				expect.objectContaining({
					forced: true,
					tech: "PNF Tech",
				})
			);
		});
	});
});
