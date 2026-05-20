import type { PlatformState } from "@/store/app/platformStore";
import type * as GridStoreModule from "@/store/grid/gridStore";
import type { GridStore } from "@/store/grid/gridStore";
import type { TechStore } from "@/store/tech/techStore";
import type { Socket } from "socket.io-client";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useOptimizeStore } from "@/store/ui/uiStore";
import { createSocket } from "@/utils/api/socketManager";

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

const mockCreateSocket = vi.mocked(createSocket);
const mockUseBreakpoint = vi.mocked(useBreakpoint);
const mockUseAnalytics = vi.mocked(useAnalytics);
const mockUseGridStore = vi.mocked(useGridStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUsePlatformStore = vi.mocked(usePlatformStore);

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

	beforeEach(() => {
		vi.clearAllMocks();
		mockSocket = createMockSocket();
		mockCreateSocket.mockReturnValue(Promise.resolve(mockSocket as unknown as Socket));

		useOptimizeStore.setState({
			status: { type: "idle" },
		});

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
		} as unknown as TechStore);

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

		it("should handle socket connection error", async () => {
			mockCreateSocket.mockReturnValueOnce(Promise.reject(new Error("Connection failed")));

			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			expect(useOptimizeStore.getState().status.type).toBe("error");
			expect(result.current.solving).toBe(false);
		});

		it("should update progress state on 'progress' event", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const progressCallback = mockSocket.on.mock.calls.find(
				(call) => call[0] === "progress"
			)?.[1];

			act(() => {
				progressCallback({ progress_percent: 45 });
			});

			expect(result.current.progressPercent).toBe(45);
		});

		it("should handle pattern no fit result", async () => {
			const { result } = renderHook(() => useOptimize());

			await act(async () => {
				await result.current.handleOptimize("Test Tech");
			});

			const resultCallback = mockSocket.once.mock.calls.find(
				(call) => call[0] === "optimization_result"
			)?.[1];

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
		});
	});
});
