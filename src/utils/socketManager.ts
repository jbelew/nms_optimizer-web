import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

import { WS_URL } from "../constants";
import { useSocketStore } from "../store/SocketStore";
import { Logger } from "./logger";

/**
 * Manages a persistent singleton WebSocket connection using socket.io-client.
 * Provides methods for connecting, disconnecting, and making request-response style calls.
 */
class SocketManager {
	private static instance: SocketManager;
	private socket: Socket | null = null;
	private listenersAttached = false;

	private constructor() {}

	/**
	 * Returns the singleton instance of the SocketManager.
	 *
	 * @returns {SocketManager} The SocketManager instance.
	 */
	public static getInstance(): SocketManager {
		if (!SocketManager.instance) {
			SocketManager.instance = new SocketManager();
		}

		return SocketManager.instance;
	}

	/**
	 * Establishes a WebSocket connection if one doesn't exist or returns the existing one.
	 * Sets up global listeners for connection status tracking.
	 *
	 * @returns {Socket} The socket.io client instance.
	 */
	public connect(): Socket {
		if (this.socket?.connected) {
			return this.socket;
		}

		if (!this.socket) {
			Logger.info("Initializing persistent WebSocket connection", { url: WS_URL });
			this.socket = io(WS_URL, {
				transports: ["websocket"],
				autoConnect: true,
				reconnection: true,
				reconnectionAttempts: Infinity,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				timeout: 20000,
			});
		}

		if (!this.listenersAttached) {
			this.setupGlobalListeners();
		}

		return this.socket;
	}

	/**
	 * Configures global event listeners for the WebSocket to track connection state.
	 * Updates the global SocketStore with the current connection status.
	 * @private
	 */
	private setupGlobalListeners() {
		if (!this.socket) return;

		this.socket.on("connect", () => {
			Logger.info("WebSocket connected");
			useSocketStore.getState().setConnected(true);
		});

		this.socket.on("disconnect", (reason) => {
			if (
				reason === "io client disconnect" ||
				reason === "transport close" ||
				reason === "io server disconnect"
			) {
				Logger.info("WebSocket disconnected", { reason });
			} else {
				Logger.warn("WebSocket disconnected", { reason });
			}

			useSocketStore.getState().setConnected(false);
		});

		this.socket.on("connect_error", (error) => {
			Logger.error("WebSocket connection error", error);
			useSocketStore.getState().setConnected(false);
		});

		this.socket.on("error", (error) => {
			Logger.error("WebSocket generic error", error);
		});

		this.listenersAttached = true;
	}

	/**
	 * Returns the current socket instance without attempting to connect.
	 *
	 * @returns {Socket | null} The current socket or null if not initialized.
	 */
	public getSocket(): Socket | null {
		return this.socket;
	}

	/**
	 * Disconnects the WebSocket and cleans up listeners and store state.
	 */
	public disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.listenersAttached = false;
			useSocketStore.getState().setConnected(false);
		}
	}

	/**
	 * Sends a message and returns a promise that resolves when the response is received.
	 * This implements a request-response pattern over the singleton socket.
	 *
	 * @param {string} event - The event name to emit.
	 * @param {unknown} payload - The data to send with the event.
	 * @param {string} responseEvent - The event name to listen for as a response.
	 * @param {number} [timeout=60000] - Time in milliseconds to wait for a response before rejecting.
	 * @returns {Promise<T>} A promise that resolves with the response data.
	 * @example
	 * const result = await socketManager.request('optimize', payload, 'optimization_result');
	 */
	public async request<T = unknown>(
		event: string,
		payload: unknown,
		responseEvent: string,
		timeout = 60000
	): Promise<T> {
		const socket = this.connect();

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				cleanup();
				reject(new Error(`Socket request timed out after ${timeout}ms`));
			}, timeout);

			const onResponse = (data: T) => {
				cleanup();
				resolve(data);
			};

			const onError = (err: unknown) => {
				cleanup();
				reject(err);
			};

			const cleanup = () => {
				clearTimeout(timer);
				socket.off(responseEvent, onResponse);
				socket.off("connect_error", onError);
				socket.off("error", onError);
			};

			socket.once(responseEvent, onResponse);
			socket.once("connect_error", onError);
			socket.once("error", onError);

			if (socket.connected) {
				socket.emit(event, payload);
			} else {
				socket.once("connect", () => {
					socket.emit(event, payload);
				});
			}
		});
	}
}

export const socketManager = SocketManager.getInstance();
