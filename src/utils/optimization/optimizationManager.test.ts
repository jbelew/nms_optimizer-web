import type { PlatformState } from "@/store/app/platformStore";
import type { ApiResponse, GridStore } from "@/store/grid/gridStore";
import type { TechState } from "@/store/tech/techStore";
import type { Socket } from "socket.io-client";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { createSocket } from "@/utils/api/socketManager";

import { OptimizationManager } from "./optimizationManager";

vi.mock("@/utils/api/socketManager", () => ({
	createSocket: vi.fn(),
	TRANSPORT_ERROR_MESSAGES: new Set(["timeout", "websocket error"]),
}));

vi.mock("@/store/grid/gridStore", () => ({
	createEmptyCell: vi.fn((sc, active) => ({ active, supercharged: sc, tech: null })),
	useGridStore: {
		getState: vi.fn(),
	},
}));

vi.mock("@/store/tech/techStore", () => ({
	useTechStore: {
		getState: vi.fn(),
	},
}));

vi.mock("@/store/app/platformStore", () => ({
	usePlatformStore: {
		getState: vi.fn(),
	},
}));

vi.mock("@/utils/system/monitoring", () => ({
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
}));

const mockCreateSocket = vi.mocked(createSocket);
const mockUseGridStore = vi.mocked(useGridStore);
const mockUseTechStore = vi.mocked(useTechStore);
const mockUsePlatformStore = vi.mocked(usePlatformStore);

describe("OptimizationManager", () => {
	const createMockSocket = () => ({
		connected: true,
		disconnect: vi.fn(),
		emit: vi.fn(),
		off: vi.fn(),
		on: vi.fn(),
		once: vi.fn(),
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateSocket.mockImplementation(() =>
			Promise.resolve(createMockSocket() as unknown as Socket)
		);

		mockUseGridStore.getState.mockReturnValue({
			grid: {
				cells: [],
				height: 7,
				width: 7,
			},
		} as unknown as GridStore);

		mockUseTechStore.getState.mockReturnValue({
			activeGroups: {},
			checkedModules: {},
			techGroups: {},
		} as unknown as TechState);

		mockUsePlatformStore.getState.mockReturnValue({
			selectedPlatform: "standard",
		} as unknown as PlatformState);
	});

	it("should retry on transport error and finally fail after MAX_TRANSPORT_RETRIES", async () => {
		const onError = vi.fn();
		const onComplete = vi.fn();
		const onProgress = vi.fn();
		const onPatternNoFit = vi.fn();

		const manager = new OptimizationManager({
			onComplete,
			onError,
			onPatternNoFit,
			onProgress,
			tech: "pulse",
		});

		await manager.start();
		expect(mockCreateSocket).toHaveBeenCalledTimes(1);
		const firstSocket = await mockCreateSocket.mock.results[0].value;

		// Trigger first transport error
		const handleError1 = (
			(firstSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "connect_error")?.[1] as (err: Error) => void;
		handleError1(new Error("websocket error"));

		// Should have created a new manager and started it (retryCount 1)
		expect(mockCreateSocket).toHaveBeenCalledTimes(2);

		// Trigger second transport error on the new socket
		const secondSocket = await mockCreateSocket.mock.results[1].value;
		const handleError2 = (
			(secondSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "connect_error")?.[1] as (err: Error) => void;
		handleError2(new Error("timeout"));

		// Should have created a new manager and started it (retryCount 2)
		expect(mockCreateSocket).toHaveBeenCalledTimes(3);

		// Trigger third transport error on the third socket (retryCount 2, MAX is 2)
		const thirdSocket = await mockCreateSocket.mock.results[2].value;
		const handleError3 = (
			(thirdSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "connect_error")?.[1] as (err: Error) => void;
		handleError3(new Error("websocket error"));

		// Should NOT retry again
		expect(mockCreateSocket).toHaveBeenCalledTimes(3);
		expect(onError).toHaveBeenCalledWith(expect.any(Error));
	});

	it("should complete successfully after a retry", async () => {
		const onComplete = vi.fn();
		const manager = new OptimizationManager({
			onComplete,
			onError: vi.fn(),
			onPatternNoFit: vi.fn(),
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		const firstSocket = await mockCreateSocket.mock.results[0].value;

		// Trigger transport error
		const handleError = (
			(firstSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "connect_error")?.[1] as (err: Error) => void;
		handleError(new Error("websocket error"));

		expect(mockCreateSocket).toHaveBeenCalledTimes(2);

		// Trigger success on the second attempt
		const secondSocket = await mockCreateSocket.mock.results[1].value;
		const handleResult = (
			(secondSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "optimization_result")?.[1] as (data: ApiResponse) => void;

		const mockResponse: ApiResponse = {
			grid: { cells: [], height: 7, width: 7 },
			max_bonus: 100,
			solve_method: "Brute Force",
			solved_bonus: 90,
		};
		handleResult(mockResponse);

		expect(onComplete).toHaveBeenCalledWith(mockResponse);
	});

	it("should handle progress updates", async () => {
		const onProgress = vi.fn();
		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError: vi.fn(),
			onPatternNoFit: vi.fn(),
			onProgress,
			tech: "pulse",
		});

		await manager.start();
		const firstSocket = await mockCreateSocket.mock.results[0].value;
		const handleProgress = (
			(firstSocket.on as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "progress")?.[1] as (data: {
			progress_percent: number;
		}) => void;

		handleProgress({ progress_percent: 50 });
		expect(onProgress).toHaveBeenCalledWith({ progress_percent: 50 });
	});

	it("should handle Pattern No Fit response", async () => {
		const onPatternNoFit = vi.fn();
		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError: vi.fn(),
			onPatternNoFit,
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		const firstSocket = await mockCreateSocket.mock.results[0].value;
		const handleResult = (
			(firstSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "optimization_result")?.[1] as (data: ApiResponse) => void;

		handleResult({
			grid: null,
			max_bonus: 0,
			solve_method: "Pattern No Fit",
			solved_bonus: 0,
		});
		expect(onPatternNoFit).toHaveBeenCalled();
	});

	it("should handle genuine disconnect as error", async () => {
		const onError = vi.fn();
		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError,
			onPatternNoFit: vi.fn(),
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		const firstSocket = await mockCreateSocket.mock.results[0].value;
		const handleDisconnect = (
			(firstSocket.on as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "disconnect")?.[1] as (reason: string) => void;

		handleDisconnect("ping timeout");
		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("Disconnected") })
		);
	});

	it("should handle transport close by calling onError (for UI state reset)", async () => {
		const onError = vi.fn();
		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError,
			onPatternNoFit: vi.fn(),
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		const firstSocket = await mockCreateSocket.mock.results[0].value;
		const handleDisconnect = (
			(firstSocket.on as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "disconnect")?.[1] as (reason: string) => void;

		handleDisconnect("transport close");
		expect(onError).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining("transport close") })
		);
	});

	it("should handle socket connection if not immediately connected", async () => {
		const mockSocket = createMockSocket();
		Object.defineProperty(mockSocket, "connected", { value: false, writable: true });
		mockCreateSocket.mockImplementation(() => Promise.resolve(mockSocket as unknown as Socket));

		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError: vi.fn(),
			onPatternNoFit: vi.fn(),
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		expect(mockSocket.emit).not.toHaveBeenCalled();

		const handleConnect = (
			(mockSocket.once as unknown as Mock).mock.calls as unknown as [string, unknown][]
		).find((call) => call[0] === "connect")?.[1] as () => void;
		handleConnect();
		expect(mockSocket.emit).toHaveBeenCalledWith("optimize", expect.any(Object));
	});

	it("should include modules and solve_type in the payload", async () => {
		mockUseTechStore.getState.mockReturnValue({
			activeGroups: { pulse: "group1" },
			checkedModules: { pulse: ["module1"] },
			techGroups: { pulse: ["group1", "group2"] },
		} as unknown as TechState);

		const manager = new OptimizationManager({
			onComplete: vi.fn(),
			onError: vi.fn(),
			onPatternNoFit: vi.fn(),
			onProgress: vi.fn(),
			tech: "pulse",
		});

		await manager.start();
		const mockSocket = await mockCreateSocket.mock.results[0].value;
		expect(mockSocket.emit).toHaveBeenCalledWith(
			"optimize",
			expect.objectContaining({
				available_modules: ["module1"],
				solve_type: "group1",
			})
		);
	});
});
