/**
 * @file Route configuration constants and helpers
 * @description Provides configuration data for route definitions
 */

/** Build version string from environment or default to "devmode" */
export const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

/** List of available page routes in the application */
export const pages = ["changelog", "instructions", "about", "translation", "userstats"];

/** List of supported language codes for internationalization */
export const languages = ["en", "es", "fr", "de", "pt"];

/** Get the build date */
export function getBuildDate(): string {
	return __BUILD_DATE__;
}

/** Page names that can appear in routes */
export type PageName = (typeof pages)[number];

/** Language codes that can appear in routes */
export type LanguageCode = (typeof languages)[number];
