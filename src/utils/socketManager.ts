import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { io } from "socket.io-client";

import { WS_URL } from "../constants";
import { Logger } from "./logger";

/**
 * The canonical set of transient transport-level error messages from engine.io-client.
 *
 * These represent network-layer failures (not application errors) and should be
 * retried silently before surfacing to the user.
 */
export const TRANSPORT_ERROR_MESSAGES = new Set(["websocket error", "timeout"]);

/**
 * Standard configuration options for the WebSocket connection.
 *
 * - `reconnection: false` — retry strategy is owned by the application layer.
 * - `forceNew: true` — each optimization request gets a fresh Manager.
 * - `transports: ["websocket", "polling"]` — allows fallback to long-polling.
 */
export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
	transports: ["websocket", "polling"],
	reconnection: false,
	forceNew: true,
	timeout: 20000,
};

/**
 * Creates and initializes a new WebSocket connection instance.
 *
 * Uses the global `WS_URL` and predefined `SOCKET_OPTIONS`.
 *
 * @returns {Socket | null} A new `Socket` instance, or `null` if initialization fails.
 *
 * @example
 * const socket = createSocket();
 * if (socket) {
 *   socket.on("connect", () => console.log("Connected!"));
 * }
 */
export const createSocket = (): Socket | null => {
	try {
		Logger.info("Creating new WebSocket connection", { url: WS_URL });

		return io(WS_URL, SOCKET_OPTIONS);
	} catch (error) {
		Logger.error("Failed to create WebSocket instance", { error });

		return null;
	}
};
