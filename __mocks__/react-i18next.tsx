import { vi } from "vitest";

const useTranslation = () => ({
	i18n: {
		changeLanguage: vi.fn(),
		language: "en",
		options: {
			fallbackLng: ["en"],
			supportedLngs: ["en", "es", "fr", "de", "pt", "it"],
		},
		services: {
			resourceStore: {
				data: {},
			},
		},
	},
	t: (key: string) => key,
});

const initReactI18next = {
	init: vi.fn(),
	type: "3rdParty",
};

const Trans = ({ children, i18nKey }: { children?: React.ReactNode; i18nKey?: string }) => children || i18nKey;

export { initReactI18next, Trans, useTranslation };
