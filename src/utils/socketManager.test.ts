import { describe, it, expect, vi, beforeEach } from "vitest";
import { io } from "socket.io-client";
import { createSocket, SOCKET_OPTIONS } from "./socketManager";
import { WS_URL } from "../constants";
import { Logger } from "./logger";

vi.mock("socket.io-client", () => ({
	io: vi.fn(),
}));

vi.mock("./logger", () => ({
	Logger: {
		info: vi.fn(),
		error: vi.fn(),
	},
}));

describe("socketManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a socket with correct options", () => {
		const mockSocket = { on: vi.fn() };
		(io as any).mockReturnValue(mockSocket);

		const socket = createSocket();

		expect(io).toHaveBeenCalledWith(WS_URL, SOCKET_OPTIONS);
		expect(socket).toBe(mockSocket);
		expect(Logger.info).toHaveBeenCalledWith(expect.stringContaining("Creating new WebSocket connection"), { url: WS_URL });
	});

	it("should return null and log error if creation fails", () => {
		const error = new Error("Failed to connect");
		(io as any).mockImplementation(() => {
			throw error;
		});

		const socket = createSocket();

		expect(socket).toBeNull();
		expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining("Failed to create WebSocket instance"), { error });
	});
});
