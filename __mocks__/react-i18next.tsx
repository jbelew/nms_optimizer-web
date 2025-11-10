import { vi } from "vitest";

const useTranslation = () => ({
	t: (key: string) => key,
	i18n: {
		changeLanguage: vi.fn(),
		language: "en",
		options: {
			supportedLngs: ["en", "es", "fr", "de", "pt"],
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

const Trans = ({ children }: { children: React.ReactNode }) => children;

export { useTranslation, initReactI18next, Trans };
