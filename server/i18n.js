/**
 * @file Server-side internationalization (i18n) configuration
 * @description Initializes i18next for server-side language support using the file system backend.
 * Loads translation files from the dist/assets/locales directory at runtime.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';

import { SUPPORTED_LANGUAGES } from './config.js';

/** Directory of the current module, resolved from ES module metadata */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Initialize i18next for server-side use
 * - Supports all language variants
 * - Loads translations from file system
 * - Defaults to English if language not found
 */
i18next
	.use(i18nextFsBackend)
	.init({
		supportedLngs: SUPPORTED_LANGUAGES,
		preload: SUPPORTED_LANGUAGES,
		fallbackLng: "en",
		ns: ["translation"],
		defaultNS: "translation",
		backend: {
			loadPath: path.join(__dirname, '../dist/assets/locales/{{lng}}/{{ns}}.json'),
		},
	});

/** Configured i18next instance for server-side internationalization */
export default i18next;
