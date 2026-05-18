import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WS_URL } from "@/constants";
import { Logger } from "@/utils/system/monitoring";

import { createSocket, SOCKET_OPTIONS } from "./socketManager";

vi.mock("socket.io-client", () => ({
	io: vi.fn(),
}));

vi.mock("@/utils/system/monitoring", () => ({
	Logger: {
		error: vi.fn(),
		info: vi.fn(),
	},
}));

describe("socketManager", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a socket with correct options", () => {
		const mockSocket = { on: vi.fn() } as unknown as Socket;
		vi.mocked(io).mockReturnValue(mockSocket);

		const socket = createSocket();

		expect(io).toHaveBeenCalledWith(WS_URL, SOCKET_OPTIONS);
		expect(socket).toBe(mockSocket);
		expect(Logger.info).toHaveBeenCalledWith(
			expect.stringContaining("Creating new WebSocket connection"),
			{ url: WS_URL }
		);
	});

	it("should return null and log error if creation fails", () => {
		const error = new Error("Failed to connect");
		vi.mocked(io).mockImplementation(() => {
			throw error;
		});

		const socket = createSocket();

		expect(socket).toBeNull();
		expect(Logger.error).toHaveBeenCalledWith(
			expect.stringContaining("Failed to create WebSocket instance"),
			{ error }
		);
	});
});
