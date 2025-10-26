import path from 'path';
import { fileURLToPath } from 'url';
import i18next from 'i18next';
import i18nextFsBackend from 'i18next-fs-backend';

import { SUPPORTED_LANGUAGES } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

export default i18next;
