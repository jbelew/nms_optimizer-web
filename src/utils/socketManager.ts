import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { io } from "socket.io-client";

import { WS_URL } from "../constants";
import { Logger } from "./logger";

/**
 * Standard configuration options for the WebSocket connection.
 */
export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
	transports: ["websocket"],
	autoConnect: true,
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 5000,
	timeout: 20000,
};

/**
 * Creates a new WebSocket connection instance with standard configuration.
 *
 * @returns {Socket} A new socket.io client instance.
 */
export const createSocket = (): Socket => {
	Logger.info("Creating new WebSocket connection", { url: WS_URL });

	return io(WS_URL, SOCKET_OPTIONS);
};
