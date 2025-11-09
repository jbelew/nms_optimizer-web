/**
 * @file Server-side configuration constants.
 * This file contains configuration values used by the Express server and its middleware.
 */

/**
 * The canonical hostname for the production application.
 * Used for SEO redirects.
 * @type {string}
 */
export const TARGET_HOST = "nms-optimizer.app";

/**
 * A list of all supported language codes.
 * @type {string[]}
 */
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt"];

/**
 * A list of supported language codes, excluding the default ('en').
 * @type {string[]}
 */
export const OTHER_LANGUAGES = ["es", "fr", "de", "pt"];

/**
 * A list of known dialog routes that can be accessed via URL paths.
 * @type {string[]}
 */
export const KNOWN_DIALOGS = ["instructions", "about", "changelog", "translation", "userstats"];

/**
 * A list of base known paths for the client-side application.
 * These paths, along with language prefixes, determine if a request should serve the SPA.
 * @type {string[]}
 */
export const BASE_KNOWN_PATHS = ["/", ...KNOWN_DIALOGS];
