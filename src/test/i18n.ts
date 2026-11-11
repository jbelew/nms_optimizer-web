/**
 * Shared i18next fixtures and real-locale bundle loaders for Vitest suites.
 *
 * @file Shared i18next test utilities.
 */

import fs from "node:fs";
import path from "node:path";

import type { i18n as I18nInstance } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { SUPPORTED_LANGUAGES } from "@shared/config.js";

i18n.use(initReactI18next).init({
	lng: "en",
	resources: {
		en: {
			translation: {},
		},
		fr: {
			translation: {},
		},
	},
});

/**
 * Loads a locale's production `translation.json` bundle from `public/assets/locales/`.
 *
 * @remarks
 * Reads the static JSON bundle synchronously from disk for deterministic schema and metadata assertions.
 *
 * @param lang - Supported ISO 639-1 locale code (e.g. `"en"`, `"es"`).
 *
 * @returns Parsed translation bundle object.
 *
 * @category Testing
 *
 * @example
 * ```ts
 * const bundle = loadLocaleBundle("es");
 * ```
 */
export const loadLocaleBundle = (lang: string): Record<string, unknown> => {
	const filePath = path.resolve(process.cwd(), `public/assets/locales/${lang}/translation.json`);

	return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, unknown>;
};

/**
 * Creates an isolated `i18next` instance initialized with real `translation.json` bundles.
 *
 * @remarks
 * Avoids mutating the shared empty default `i18n` test fixture while providing production translations.
 *
 * @param initialLang - Initial active locale code (defaults to `"en"`).
 * @param languages - Locale codes to preload (defaults to all `SUPPORTED_LANGUAGES`).
 *
 * @returns Initialized `i18next` instance bound to `react-i18next`.
 *
 * @see {@link loadLocaleBundle}
 * @see {@link SUPPORTED_LANGUAGES}
 *
 * @category Testing
 *
 * @example
 * ```ts
 * const esI18n = await createRealI18nInstance("es", ["en", "es"]);
 * ```
 */
export const createRealI18nInstance = async (
	initialLang = "en",
	languages: readonly string[] = SUPPORTED_LANGUAGES,
): Promise<I18nInstance> => {
	const instance = i18n.createInstance();
	const resources = Object.fromEntries(
		languages.map((lang) => [lang, { translation: loadLocaleBundle(lang) }]),
	);

	await instance.use(initReactI18next).init({
		defaultNS: "translation",
		fallbackLng: "en",
		lng: initialLang,
		resources,
	});

	return instance;
};

export default i18n;
