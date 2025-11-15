// src/constants.ts

/** The API endpoint URL for backend communication. Loaded from VITE_API_URL environment variable. */
export const API_URL = import.meta.env.VITE_API_URL;

/** The WebSocket endpoint URL for real-time communication. Loaded from VITE_WS_URL environment variable. */
export const WS_URL = import.meta.env.VITE_WS_URL;

/** Google Analytics tracking ID for analytics data collection. */
export const TRACKING_ID = "G-P5VBZQ69Q9";

// export const APP_VERSION = "v2.91"; // Version now sourced from package.json

/** The display name of the application. */
export const APP_NAME = "No Man's Sky Technology Layout Optimizer";
