import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/**
 * Custom hook for managing the document title.
 * This hook updates the document's title based on the current route and language,
 * and sets the lang attribute on the html tag.
 */
export const useSeoAndTitle = () => {
	const { t, i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const appName = t("appName");
		let pageTitle = appName;

		switch (location.pathname) {
			case "/":
				pageTitle = appName;
				break;
			case "/instructions":
				pageTitle = `${t("dialogs.titles.instructions")} - ${appName}`;
				break;
			case "/about":
				pageTitle = `${t("dialogs.titles.about")} - ${appName}`;
				break;
			case "/changelog":
				pageTitle = `${t("dialogs.titles.changelog")} - ${appName}`;
				break;
			case "/translation":
				pageTitle = `${t("dialogs.titles.translationRequest")} - ${appName}`;
				break;
			case "/userstats":
				pageTitle = `${t("dialogs.titles.userStats")} - ${appName}`;
				break;
			default:
				pageTitle = appName;
		}
		document.title = pageTitle;

		// Set the lang attribute on the html tag
		document.documentElement.lang = i18n.language;
	}, [location.pathname, t, i18n.language]);
};
