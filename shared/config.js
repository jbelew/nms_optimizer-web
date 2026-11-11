/**
 * @file Shared application configuration and constants.
 * Used by both build scripts (SSG, sitemap) and the frontend.
 *
 * @category Utilities
 */

import { SUPPORTED_LANGUAGES, TARGET_HOST } from "./constants.js";
import { SSG_DIALOG_IDS } from "./page-registry.js";

export { SUPPORTED_LANGUAGES, TARGET_HOST };

/**
 * List of dialog page identifiers that participate in static site generation pre-rendering,
 * derived from {@link SSG_DIALOG_IDS}.
 *
 * @type {string[]}
 *
 * @see {@link SSG_DIALOG_IDS}
 *
 * @category Configuration
 */
export const KNOWN_DIALOGS = SSG_DIALOG_IDS;
