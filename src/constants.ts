/**
 * @remarks
 * This file centralizes environment-sourced configuration and hardcoded
 * tracking identifiers used throughout the application.
 *
 * @file Application-wide constants and configuration defaults.
 *
 */

/**
 * The base API endpoint URL for backend communication.
 *
 * This value is sourced from the `VITE_API_URL` environment variable.
 * **Must be a valid absolute URL.**
 *
 * @category Utilities
 */
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * The WebSocket endpoint URL used for real-time optimization solves.
 *
 * This value is sourced from the `VITE_WS_URL` environment variable.
 * **Must use the `ws://` or `wss://` protocol.**
 *
 * @category Utilities
 */
export const WS_URL = import.meta.env.VITE_WS_URL;

/**
 * The canonical Google Analytics 4 Measurement ID for the application.
 *
 * @category Utilities
 */
export const TRACKING_ID = "G-P5VBZQ69Q9";

/**
 * Common timing and duration constants used across the application.
 * 
 * @category Utilities
 */
export const UI_TIMING = {
	/** Delay in ms before writing to localStorage (debounced) */
	DEBOUNCE_SAVE_MS: 1000,
	/** Max time in ms between taps to register as a double-tap */
	DOUBLE_TAP_THRESHOLD: 400,
	/** Fallback timeout in ms for requestIdleCallback */
	IDLE_TIMEOUT_MS: 2000,
} as const;

