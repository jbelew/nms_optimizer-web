// src/store/SocketStore.ts
import { create } from "zustand";

/**
 * Interface for the WebSocket connection state.
 *
 * @interface SocketState
 * @property {boolean} isConnected - Whether the WebSocket is currently connected.
 * @property {(connected: boolean) => void} setConnected - Function to update the connection status.
 */
interface SocketState {
	isConnected: boolean;
	setConnected: (connected: boolean) => void;
}

/**
 * Zustand store for tracking WebSocket connection status globally.
 */
export const useSocketStore = create<SocketState>((set) => ({
	isConnected: false,
	setConnected: (connected) => set({ isConnected: connected }),
}));
