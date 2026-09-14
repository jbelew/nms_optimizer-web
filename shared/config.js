/**
 * @file Shared application configuration and constants.
 * Used by both build scripts (SSG, sitemap) and the frontend.
 *
 * @category Utilities
 */

import { SSG_DIALOG_IDS } from "./page-registry.js";

/** Target production hostname */
export const TARGET_HOST = "nms-optimizer.app";

/** Array of supported ISO 639-1 language codes */
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt", "it"];

/**
 * List of dialog page identifiers that participate in static site generation pre-rendering.
 * Derived from the Unified Page Registry.
 *
 * @type {string[]}
 */
export const KNOWN_DIALOGS = SSG_DIALOG_IDS;
