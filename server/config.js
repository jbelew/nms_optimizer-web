/**
 * @file Server-side configuration constants.
 * @remarks This file contains configuration values used by the Express server and its middleware.
 * These constants define the canonical host, supported languages, and known application routes.
 * @author jbelew
 * @license GPL-3.0
 */

/**
 * The canonical hostname for the production application.
 * @remarks Used for SEO redirects and generating absolute URLs for hreflang and canonical tags.
 * @type {string}
 * @default "nms-optimizer.app"
 * @category Configuration
 */
export const TARGET_HOST = "nms-optimizer.app";

/**
 * A list of all supported language codes.
 * @remarks Includes the default language ('en') and all translated variants.
 * @type {string[]}
 * @category Localization
 */
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt", "it"];

/**
 * A list of supported language codes, excluding the default ('en').
 * @remarks Used primarily by the SEO middleware to identify language-prefixed routes.
 * @type {string[]}
 * @category Localization
 */
export const OTHER_LANGUAGES = ["es", "fr", "de", "pt", "it"];

const isDocker = process.env.VITE_DOCKER === "true" || process.env.DOCKER === "true";

/**
 * A list of known dialog routes that can be accessed via URL paths.
 * @remarks These paths correspond to client-side modal dialogs that are deep-linkable.
 * @type {string[]}
 * @category Routing
 */
export const KNOWN_DIALOGS = [
	"instructions",
	"about",
	"changelog",
	"translation",
	...(isDocker ? [] : ["userstats"]),
	"privacy",
];

/**
 * A list of base known paths for the client-side application.
 * @remarks These paths, along with language prefixes, determine if a request should serve the SPA.
 * @type {string[]}
 * @see {@link isSpaRoute} for usage.
 * @category Routing
 */
export const BASE_KNOWN_PATHS = ["/", ...KNOWN_DIALOGS, ...(isDocker ? [] : ["performance"])];

/**
 * Flag to enable/disable maintenance mode.
 * @remarks When true, all requests will serve the maintenance page with a 503 status code.
 * @type {boolean}
 * @default false
 * @category Configuration
 */
export const MAINTENANCE_MODE = false;
