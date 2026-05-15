// src/constants.ts

/**
 * Application constants and configuration defaults.
 * (Triggering release workflow test)
 */

/**
 * The base API endpoint URL for backend communication.
 *
 * This value is sourced from the `VITE_API_URL` environment variable.
 * **Must be a valid absolute URL.**
 */
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * The WebSocket endpoint URL used for real-time optimization solves.
 *
 * This value is sourced from the `VITE_WS_URL` environment variable.
 * **Must use the `ws://` or `wss://` protocol.**
 */
export const WS_URL = import.meta.env.VITE_WS_URL;

/**
 * The canonical Google Analytics 4 Measurement ID for the application.
 */
export const TRACKING_ID = "G-P5VBZQ69Q9";
