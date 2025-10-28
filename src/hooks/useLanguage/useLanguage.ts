import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export const useLanguage = () => {
	const { i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const supportedLangs = Object.keys(i18n.services.resourceStore.data || {});
		const pathParts = location.pathname.split("/").filter((p) => p);

		let lang = "en";
		if (pathParts.length > 0 && supportedLangs.includes(pathParts[0])) {
			lang = pathParts[0];
		}

		const currentLang = i18n.language.split("-")[0];
		if (currentLang !== lang) {
			i18n.changeLanguage(lang);
		}
	}, [location.pathname, i18n]);

	return i18n.language;
};
