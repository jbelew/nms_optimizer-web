/**
 * @file Server-side internationalization (i18n) configuration.
 * @remarks This module initializes `i18next` for server-side language support using the filesystem backend.
 * It loads translation files from the `dist/assets/locales` directory at runtime to support SEO and SSR tags.
 * @author jbelew
 * @license GPL-3.0
 */

import path from 'path';
import { fileURLToPath } from 'url';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';

import { SUPPORTED_LANGUAGES } from './config.js';

/**
 * Directory of the current module, resolved from ES module metadata.
 * @type {string}
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configure and initialize i18next for server-side use.
 * @remarks
 * - Supports all language variants defined in `SUPPORTED_LANGUAGES`.
 * - Preloads all supported languages to avoid I/O blocking during requests.
 * - Loads translations from the filesystem using the `i18next-fs-backend`.
 * - Defaults to English ("en") if a requested translation is not found.
 * @see {@link SUPPORTED_LANGUAGES}
 * @see {@link https://www.i18next.com/ i18next Documentation}
 * @category Localization
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

/**
 * Configured i18next instance for server-side internationalization.
 * @type {import('i18next').i18n}
 */
export default i18next;
