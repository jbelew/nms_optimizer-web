import { vi } from "vitest";

const useTranslation = () => ({
	t: (key: string) => key,
	i18n: {
		changeLanguage: vi.fn(),
		language: "en",
		options: {
			supportedLngs: ["en", "es", "fr", "de", "pt", "it"],
			fallbackLng: ["en"],
		},
		services: {
			resourceStore: {
				data: {},
			},
		},
	},
});

const initReactI18next = {
	type: "3rdParty",
	init: vi.fn(),
};

const Trans = ({ children, i18nKey }: { children?: React.ReactNode; i18nKey?: string }) => children || i18nKey;

export { useTranslation, initReactI18next, Trans };
