/**
 * WebSocket connection management utility.
 *
 * @remarks
 * This module provides functions to create and manage WebSocket connections
 * using `socket.io-client`. It defines standard options and transport error
 * handling logic.
 *
 * @see {@link createSocket}
 *
 * @category Utilities
 */

import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";
import { io } from "socket.io-client";

import { WS_URL } from "../../constants";
import { Logger } from "../system/monitoring";

/**
 * The canonical set of transient transport-level error messages from engine.io-client.
 *
 * These represent network-layer failures (not application errors) and should be
 * retried silently before surfacing to the user.
 */
export const TRANSPORT_ERROR_MESSAGES = new Set(["timeout", "websocket error"]);

/**
 * Standard configuration options for the WebSocket connection.
 *
 * - `reconnection: false` — retry strategy is owned by the application layer.
 * - `forceNew: true` — each optimization request gets a fresh Manager.
 * - `transports: ["websocket", "polling"]` — allows fallback to long-polling.
 */
export const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
	forceNew: true,
	reconnection: false,
	timeout: 20000,
	transports: ["websocket", "polling"],
};

/**
 * Creates and initializes a new WebSocket connection instance.
 *
 * @remarks
 * Uses the global `WS_URL` and predefined `SOCKET_OPTIONS`. Includes
 * internal logging for connection lifecycle tracking.
 *
 * @returns {Socket | null} A new `Socket` instance, or `null` if initialization fails.
 *
 * @see {@link WS_URL}
 * @see {@link SOCKET_OPTIONS}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const socket = createSocket();
 * if (socket) {
 *   socket.on("connect", () => console.log("Connected!"));
 * }
 * // returns Socket or null
 * ```
 */
export const createSocket = (): null | Socket => {
	try {
		Logger.info("Creating new WebSocket connection", { url: WS_URL });

		return io(WS_URL, SOCKET_OPTIONS);
	} catch (error) {
		Logger.error("Failed to create WebSocket instance", { error });

		return null;
	}
};
