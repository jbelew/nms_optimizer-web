import type { Socket } from "socket.io-client";
import { act, renderHook } from "@testing-library/react";
import { io } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PlatformState } from "@/store/app/platformStore";
import type * as GridStoreModule from "@/store/grid/gridStore";
import type { ApiResponse, GridStore } from "@/store/grid/gridStore";
import type { TechStore } from "@/store/tech/techStore";
import { WS_URL } from "@/constants";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useOptimizeStore } from "@/store/ui/uiStore";

import { SOCKET_OPTIONS, useOptimize } from "./useOptimize";

vi.mock("socket.io-client", () => ({
	io: vi.fn(),
}));

vi.mock("@/utils/system/monitoring", () => ({
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

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

const mockIo = vi.mocked(io);
const mockUseBreakpoint = vi.mocked(useBreakpoint);
const mockUseAnalytics = vi.mocked(useAnalytics);
const mockUseGridStore = vi.mocked(useGridStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUsePlatformStore = vi.mocked(usePlatformStore);

describe("useOptimize", () => {
	const createMockSocket = (connected = true) => ({
		connected,
		disconnect: vi.fn(),
		emit: vi.fn(),
		off: vi.fn(),
		on: vi.fn(),
		once: vi.fn(),
	});

	const getSocketListener = <T extends (...args: never[]) => void>(
		calls: unknown[][],
		event: string,
	): T => {
		const listener = calls.find((call) => call[0] === event)?.[1] as T | undefined;

		if (!listener) {
			throw new Error(`Expected socket listener for event "${event}"`);
		}

		return listener;
	};

	let mockSocket: ReturnType<typeof createMockSocket>;
	let mockSetGrid: ReturnType<typeof vi.fn<GridStore["setGrid"]>>;
	let mockSetResult: ReturnType<typeof vi.fn<GridStore["setResult"]>>;
	let mockSendEvent: ReturnType<typeof vi.fn<ReturnType<typeof useAnalytics>["sendEvent"]>>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockSocket = createMockSocket();
		mockIo.mockReturnValue(mockSocket as unknown as Socket);

		useOptimizeStore.setState({
			status: { type: "idle" },
		});

		mockSetGrid = vi.fn<GridStore["setGrid"]>();
		mockSetResult = vi.fn<GridStore["setResult"]>();
		mockSendEvent = vi.fn<ReturnType<typeof useAnalytics>["sendEvent"]>();

		mockUseGridStore.getState.mockReturnValue({
			grid: {
				cells: [],
				height: 7,
				valid: true,
				width: 7,
			},
			setGrid: mockSetGrid,
			setResult: mockSetResult,
		} as unknown as GridStore);

		mockUseTechStore.getState.mockReturnValue({
			activeGroups: {},
			checkedModules: {},
			initializeTechTree: vi.fn(),
			setBonusStatus: vi.fn(),
			setTechMaxBonus: vi.fn(),
			setTechSolvedBonus: vi.fn(),
			setTechSolveMethod: vi.fn(),
			techGroups: {},
		} as unknown as TechStore);

		mockUsePlatformStore.getState.mockImplementation(
			() =>
				({
					selectedPlatform: mockUsePlatformStore(),
				}) as unknown as PlatformState,
		);

		mockUsePlatformStore.mockReturnValue("standard");
		mockUseBreakpoint.mockReturnValue(true);
		mockUseAnalytics.mockReturnValue({
			sendDeferredEvent: vi.fn(),
			sendEvent: mockSendEvent,
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should return the initial state correctly", () => {
		const { result } = renderHook(() => useOptimize());

		expect(result.current.solving).toBe(false);
		expect(result.current.patternNoFitTech).toBeNull();
		expect("progressPercent" in result.current).toBe(false);
	});

	describe("handleOptimize workflow", () => {
		it("should initialize socket with WS_URL and SOCKET_OPTIONS and emit optimize", async () => {
			mockUseTechStore.getState.mockReturnValue({
				activeGroups: { pulse: "max" },
				checkedModules: { pulse: ["module1"] },
				initializeTechTree: vi.fn(),
				techGroups: { pulse: [{ id: "normal" }, { id: "max" }] },
			} as unknown as TechStore);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			expect(mockIo).toHaveBeenCalledWith(WS_URL, SOCKET_OPTIONS);
			expect(result.current.solving).toBe(true);
			expect(mockSocket.emit).toHaveBeenCalledWith(
				"optimize",
				expect.objectContaining({
					available_modules: ["module1"],
					forced: false,
					send_grid_updates: true,
					ship: "standard",
					solve_type: "max",
					tech: "pulse",
				}),
			);
		});

		it("should wait for 'connect' event before emitting when socket is not immediately connected", async () => {
			const delayedSocket = createMockSocket(false);
			mockIo.mockReturnValueOnce(delayedSocket as unknown as Socket);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			expect(delayedSocket.emit).not.toHaveBeenCalled();

			const connectCallback = getSocketListener<() => void>(
				delayedSocket.once.mock.calls,
				"connect",
			);

			act(() => {
				connectCallback();
			});

			expect(delayedSocket.emit).toHaveBeenCalledWith("optimize", expect.any(Object));
		});

		it("should handle socket initialization error", async () => {
			mockIo.mockImplementationOnce(() => {
				throw new Error("Connection failed");
			});

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			expect(useOptimizeStore.getState().status.type).toBe("error");
			expect(result.current.solving).toBe(false);
		});

		it("should update progress state and best_grid on 'progress' event", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const progressCallback = getSocketListener<(data: Record<string, unknown>) => void>(
				mockSocket.on.mock.calls,
				"progress",
			);

			const bestGrid = { cells: [], height: 7, valid: true, width: 7 };

			act(() => {
				progressCallback({ best_grid: bestGrid, progress_percent: 45 });
			});

			expect(useOptimizeStore.getState().status).toEqual({
				progress: 45,
				type: "solving",
			});
			expect(mockSetGrid).toHaveBeenCalledWith(bestGrid);
		});

		it("should commit optimization result and send analytics event on completion", async () => {
			mockUseTechStore.getState.mockReturnValue({
				activeGroups: {},
				checkedModules: { pulse: ["PC"] },
				initializeTechTree: vi.fn(),
				setBonusStatus: vi.fn(),
				setTechMaxBonus: vi.fn(),
				setTechSolvedBonus: vi.fn(),
				setTechSolveMethod: vi.fn(),
				techGroups: {},
			} as unknown as TechStore);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const resultCallback = getSocketListener<(data: Record<string, unknown>) => void>(
				mockSocket.once.mock.calls,
				"optimization_result",
			);

			const solvedGrid = { cells: [], height: 7, valid: true, width: 7 };

			act(() => {
				resultCallback({
					grid: solvedGrid,
					max_bonus: 112,
					solve_method: "Simulated Annealing",
					solved_bonus: 105,
				});
			});

			expect(mockSetResult).toHaveBeenCalledWith({
				grid: solvedGrid,
				maxBonus: 112,
				solvedBonus: 105,
				solveMethod: "Simulated Annealing",
			});
			expect(mockSetGrid).toHaveBeenCalledWith(solvedGrid);
			expect(mockSendEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "optimize_tech",
					active_tech_count: 1,
					bonus_status: "boosted",
					forced: false,
					is_custom_grid: false,
					is_custom_modules: false,
					max_bonus: 112,
					module_count: 1,
					solve_duration_ms: expect.any(Number),
					solve_method: "Simulated Annealing",
					supercharged: true,
					tech: "photonix",
				}),
			);
			expect(result.current.solving).toBe(false);
		});

		it("should handle Pattern No Fit warning and allow Forced Solve via handleForceCurrentPnfOptimize", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const resultCallback = getSocketListener<(data: Record<string, unknown>) => void>(
				mockSocket.once.mock.calls,
				"optimization_result",
			);

			act(() => {
				resultCallback({
					grid: null,
					solveMethod: "Pattern No Fit",
				});
			});

			const status = useOptimizeStore.getState().status;
			expect(status.type).toBe("warning");

			if (status.type === "warning") {
				expect(status.tech).toBe("Test Tech");
			}

			expect(result.current.solving).toBe(false);
			expect(mockSendEvent).toHaveBeenCalledWith(
				expect.objectContaining({
					action: "no_fit_warning",
					module_count: 0,
					platform: "standard",
					tech: "Test Tech",
				}),
			);

			const forcedSocket = createMockSocket();
			mockIo.mockReturnValueOnce(forcedSocket as unknown as Socket);

			await act(async () => {
				await result.current.handleForceCurrentPnfOptimize();
			});

			expect(forcedSocket.emit).toHaveBeenCalledWith(
				"optimize",
				expect.objectContaining({
					forced: true,
					tech: "Test Tech",
				}),
			);
		});

		it("should retry on transient transport errors and fail after MAX_TRANSPORT_RETRIES", async () => {
			const socket1 = createMockSocket();
			const socket2 = createMockSocket();
			const socket3 = createMockSocket();

			mockIo
				.mockReturnValueOnce(socket1 as unknown as Socket)
				.mockReturnValueOnce(socket2 as unknown as Socket)
				.mockReturnValueOnce(socket3 as unknown as Socket);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			expect(mockIo).toHaveBeenCalledTimes(1);

			// 1st transport error -> retries (retryCount = 1)
			const handleError1 = getSocketListener<(err: Error) => void>(
				socket1.once.mock.calls,
				"connect_error",
			);

			await act(async () => {
				handleError1(new Error("websocket error"));
			});

			expect(mockIo).toHaveBeenCalledTimes(2);

			// 2nd transport error -> retries (retryCount = 2)
			const handleError2 = getSocketListener<(err: Error) => void>(
				socket2.once.mock.calls,
				"connect_error",
			);

			await act(async () => {
				handleError2(new Error("timeout"));
			});

			expect(mockIo).toHaveBeenCalledTimes(3);

			// 3rd transport error -> exhausts MAX_TRANSPORT_RETRIES (2) and enters error state
			const handleError3 = getSocketListener<(err: Error) => void>(
				socket3.once.mock.calls,
				"connect_error",
			);

			act(() => {
				handleError3(new Error("websocket error"));
			});

			expect(mockIo).toHaveBeenCalledTimes(3);
			expect(useOptimizeStore.getState().status.type).toBe("error");
			expect(result.current.solving).toBe(false);
		});

		it("should complete successfully after a transient transport error retry", async () => {
			const socket1 = createMockSocket();
			const socket2 = createMockSocket();

			mockIo
				.mockReturnValueOnce(socket1 as unknown as Socket)
				.mockReturnValueOnce(socket2 as unknown as Socket);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const handleError1 = getSocketListener<(err: Error) => void>(
				socket1.once.mock.calls,
				"connect_error",
			);

			await act(async () => {
				handleError1(new Error("websocket error"));
			});

			expect(mockIo).toHaveBeenCalledTimes(2);

			const handleResult2 = getSocketListener<(data: ApiResponse) => void>(
				socket2.once.mock.calls,
				"optimization_result",
			);

			const mockResponse: ApiResponse = {
				grid: { cells: [], height: 7, valid: true, width: 7 },
				maxBonus: 100,
				solvedBonus: 90,
				solveMethod: "Brute Force",
			};

			act(() => {
				handleResult2(mockResponse);
			});

			expect(mockSetResult).toHaveBeenCalledWith(mockResponse);
			expect(result.current.solving).toBe(false);
		});

		it("should disconnect the retried socket when the last consumer unmounts", async () => {
			const socket1 = createMockSocket();
			const socket2 = createMockSocket();

			mockIo
				.mockReturnValueOnce(socket1 as unknown as Socket)
				.mockReturnValueOnce(socket2 as unknown as Socket);

			const { result, unmount } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const handleError1 = getSocketListener<(err: Error) => void>(
				socket1.once.mock.calls,
				"connect_error",
			);

			await act(async () => {
				handleError1(new Error("websocket error"));
			});

			expect(mockIo).toHaveBeenCalledTimes(2);

			unmount();

			expect(socket2.off).toHaveBeenCalled();
			expect(socket2.disconnect).toHaveBeenCalled();
		});

		it("should reset solving state silently on 'transport close' disconnect without showing error modal", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const handleDisconnect = getSocketListener<(reason: string) => void>(
				mockSocket.on.mock.calls,
				"disconnect",
			);

			act(() => {
				handleDisconnect("transport close");
			});

			expect(result.current.solving).toBe(false);
			expect(useOptimizeStore.getState().status.type).toBe("idle");
		});

		it("should surface error modal on unexpected socket disconnect", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const handleDisconnect = getSocketListener<(reason: string) => void>(
				mockSocket.on.mock.calls,
				"disconnect",
			);

			act(() => {
				handleDisconnect("ping timeout");
			});

			expect(result.current.solving).toBe(false);
			expect(useOptimizeStore.getState().status.type).toBe("error");
		});

		it("should surface error modal when optimization_result payload is invalid", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
			});

			const resultCallback = getSocketListener<(data: Record<string, unknown>) => void>(
				mockSocket.once.mock.calls,
				"optimization_result",
			);

			act(() => {
				resultCallback({ invalid: true });
			});

			expect(result.current.solving).toBe(false);
			expect(useOptimizeStore.getState().status.type).toBe("error");
		});

		it("should ignore concurrent handleOptimize calls while a solve is active", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("pulse");
				await result.current.handleOptimize("shield");
			});

			expect(mockIo).toHaveBeenCalledTimes(1);
			expect(mockSocket.emit).toHaveBeenCalledTimes(1);
		});

		it("should trigger shake and skip solve when grid is full and tech is not in grid", async () => {
			const mockTriggerShake = vi.fn();

			mockUseGridStore.getState.mockReturnValue({
				activeTechs: new Set<string>(),
				grid: { cells: [], height: 7, valid: true, width: 7 },
				isGridFull: true,
				resetGridTech: vi.fn(),
				setGrid: vi.fn(),
				setResult: vi.fn(),
			} as unknown as GridStore);

			const { useUiStore } = await import("@/store/ui/uiStore");
			const triggerShakeSpy = vi
				.spyOn(useUiStore.getState(), "triggerShake")
				.mockImplementation(mockTriggerShake);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			expect(mockTriggerShake).toHaveBeenCalledTimes(1);
			expect(result.current.solving).toBe(false);
			expect(mockSocket.emit).not.toHaveBeenCalled();

			triggerShakeSpy.mockRestore();
		});

		it("should execute pre-solve Technology Reset before emitting optimize", async () => {
			const mockResetGridTech = vi.fn();
			const mockClearTechMaxBonus = vi.fn();
			const mockClearTechSolvedBonus = vi.fn();
			const mockClearBonusStatus = vi.fn();
			const mockClearTechSolveMethod = vi.fn();

			mockUseGridStore.getState.mockReturnValue({
				activeTechs: new Set(["Test Tech"]),
				grid: { cells: [], height: 7, valid: true, width: 7 },
				isGridFull: true,
				resetGridTech: mockResetGridTech,
				setGrid: vi.fn(),
				setResult: vi.fn(),
			} as unknown as GridStore);

			mockUseTechStore.getState.mockReturnValue({
				activeGroups: {},
				checkedModules: {},
				clearBonusStatus: mockClearBonusStatus,
				clearTechMaxBonus: mockClearTechMaxBonus,
				clearTechSolvedBonus: mockClearTechSolvedBonus,
				clearTechSolveMethod: mockClearTechSolveMethod,
				initializeTechTree: vi.fn(),
				techGroups: {},
			} as unknown as TechStore);

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			expect(mockResetGridTech).toHaveBeenCalledWith("Test Tech");
			expect(mockClearTechMaxBonus).toHaveBeenCalledWith("Test Tech");
			expect(mockClearTechSolvedBonus).toHaveBeenCalledWith("Test Tech");
			expect(mockClearBonusStatus).toHaveBeenCalledWith("Test Tech");
			expect(mockClearTechSolveMethod).toHaveBeenCalledWith("Test Tech");
			expect(mockSocket.emit).toHaveBeenCalledWith("optimize", expect.any(Object));
		});
	});
});
