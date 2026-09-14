/**
 * @file Route configuration constants and metadata.
 */

import { SUPPORTED_LANGUAGES } from "@shared/config.js";
import { ROUTED_DIALOG_IDS } from "@shared/page-registry.js";

/**
 * The semantic version string of the current build.
 *
 * @remarks
 * Defaults to `devmode` if the `VITE_BUILD_VERSION` environment variable is not set.
 *
 * @category Routing
 */
export const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

/**
 * List of valid page identifiers that can be navigated to as routed modals.
 * Derived from the Unified Page Registry.
 *
 * @see {@link PageName}
 *
 * @category Routing
 */
const pages = ROUTED_DIALOG_IDS;

/**
 * List of ISO language codes supported by the router's path prefixing.
 *
 * @see {@link LanguageCode}
 *
 * @category Routing
 */
export const languages = SUPPORTED_LANGUAGES;

/**
 * Union type of all valid page identifiers.
 *
 * @see {@link pages}
 *
 * @category Routing
 */
export type PageName = (typeof pages)[number];

/**
 * Union type of all supported language codes.
 *
 * @see {@link languages}
 *
 * @category Routing
 */
type LanguageCode = (typeof languages)[number];

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
