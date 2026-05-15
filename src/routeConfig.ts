/**
 * @file Route configuration constants and metadata.
 */

/** The semantic version string of the current build. Defaults to `devmode`. */
export const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

/**
 * List of valid page identifiers that can be navigated to as routed modals.
 *
 * @see {@link PageName}
 *
 * @category Routing
 */
export const pages = [
	"changelog",
	"instructions",
	"about",
	"translation",
	"userstats",
	"privacy",
	"performance",
];

/**
 * List of ISO language codes supported by the router's path prefixing.
 *
 * @see {@link LanguageCode}
 *
 * @category Routing
 */
export const languages = ["en", "es", "fr", "de", "pt", "it"];

/**
 * Union type of all supported language codes.
 *
 * @see {@link languages}
 *
 * @category Routing
 */
type LanguageCode = (typeof languages)[number];

/**
 * Union type of all valid page identifiers.
 *
 * @see {@link pages}
 *
 * @category Routing
 */
type PageName = (typeof pages)[number];

/**
 * Retrieves the application build date string defined at compile time.
 *
 * @returns {string} The ISO date string of the build.
 *
 * @category Utilities
 *
 * @example Reading build date
 * ```ts
 * console.log(getBuildDate());
 * ```
 */
export function getBuildDate(): string {
	return __BUILD_DATE__;
}
