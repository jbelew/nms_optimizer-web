/**
 * @file Route configuration constants and metadata.
 */

/** The semantic version string of the current build. Defaults to `devmode`. */
export const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

/** List of valid page identifiers that can be navigated to as routed modals. */
export const pages = ["changelog", "instructions", "about", "translation", "userstats", "privacy"];

/** List of ISO language codes supported by the router's path prefixing. */
export const languages = ["en", "es", "fr", "de", "pt"];

/**
 * Retrieves the application build date string defined at compile time.
 *
 * @returns {string} The ISO date string of the build.
 */
export function getBuildDate(): string {
	return __BUILD_DATE__;
}

/** Union type of all valid page identifiers. */
export type PageName = (typeof pages)[number];

/** Union type of all supported language codes. */
export type LanguageCode = (typeof languages)[number];
