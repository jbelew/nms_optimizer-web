import { io } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Logger } from "./logger";
import { socketManager } from "./socketManager";

// Mock socket.io-client
const mockSocketInternal = {
	on: vi.fn(),
	once: vi.fn(),
	off: vi.fn(),
	emit: vi.fn(),
	disconnect: vi.fn(),
	connected: true,
};

vi.mock("socket.io-client", () => ({
	io: vi.fn(() => mockSocketInternal),
}));

// Mock Logger
vi.mock("./logger", () => ({
	Logger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock SocketStore
vi.mock("../store/SocketStore", () => ({
	useSocketStore: {
		getState: vi.fn(() => ({
			setConnected: vi.fn(),
		})),
	},
}));

const mockIo = vi.mocked(io);
const mockLogger = vi.mocked(Logger);

describe("SocketManager", () => {
	let mockSocket: typeof mockSocketInternal;

	beforeEach(() => {
		vi.clearAllMocks();
		socketManager.disconnect(); // Ensure fresh state
		mockSocket = mockIo.mock.results[0]?.value || mockIo();
	});

	afterEach(() => {
		socketManager.disconnect();
	});

	it("should set up global listeners on connect", () => {
		socketManager.connect();
		expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith("connect_error", expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
	});

	it("should log info for benign disconnect: transport close", () => {
		socketManager.connect();
		const disconnectCallback = mockSocket.on.mock.calls.find(
			(call) => call[0] === "disconnect"
		)?.[1] as (reason: string) => void;
		expect(disconnectCallback).toBeDefined();

		disconnectCallback("transport close");

		expect(mockLogger.info).toHaveBeenCalledWith("WebSocket disconnected", {
			reason: "transport close",
		});
		expect(mockLogger.warn).not.toHaveBeenCalled();
	});

	it("should log info for benign disconnect: io client disconnect", () => {
		socketManager.connect();
		const disconnectCallback = mockSocket.on.mock.calls.find(
			(call) => call[0] === "disconnect"
		)?.[1] as (reason: string) => void;

		disconnectCallback("io client disconnect");

		expect(mockLogger.info).toHaveBeenCalledWith("WebSocket disconnected", {
			reason: "io client disconnect",
		});
		expect(mockLogger.warn).not.toHaveBeenCalled();
	});

	it("should log info for benign disconnect: io server disconnect", () => {
		socketManager.connect();
		const disconnectCallback = mockSocket.on.mock.calls.find(
			(call) => call[0] === "disconnect"
		)?.[1] as (reason: string) => void;

		disconnectCallback("io server disconnect");

		expect(mockLogger.info).toHaveBeenCalledWith("WebSocket disconnected", {
			reason: "io server disconnect",
		});
		expect(mockLogger.warn).not.toHaveBeenCalled();
	});

	it("should log warning for genuine disconnect: ping timeout", () => {
		socketManager.connect();
		const disconnectCallback = mockSocket.on.mock.calls.find(
			(call) => call[0] === "disconnect"
		)?.[1] as (reason: string) => void;

		disconnectCallback("ping timeout");

		expect(mockLogger.warn).toHaveBeenCalledWith("WebSocket disconnected", {
			reason: "ping timeout",
		});
		expect(mockLogger.info).not.toHaveBeenCalledWith(
			"WebSocket disconnected",
			expect.any(Object)
		);
	});

	it("should log warning for connection errors", () => {
		socketManager.connect();
		const errorCallback = mockSocket.on.mock.calls.find(
			(call) => call[0] === "connect_error"
		)?.[1] as (error: Error) => void;

		const error = new Error("Connection failed");
		errorCallback(error);

		expect(mockLogger.warn).toHaveBeenCalledWith("WebSocket connection error", {
			message: "Connection failed",
		});
	});

	it("should log generic errors to console", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		socketManager.connect();
		const errorCallback = mockSocket.on.mock.calls.find((call) => call[0] === "error")?.[1] as (
			error: Error
		) => void;

		const error = new Error("Generic error");
		errorCallback(error);

		expect(consoleSpy).toHaveBeenCalledWith("[ERROR] WebSocket generic error", error);
		consoleSpy.mockRestore();
	});
});
