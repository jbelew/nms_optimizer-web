import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/**
 * Updates a meta tag in the document's head.
 * @param {string} name - The name of the meta tag to update.
 * @param {string} content - The new content for the meta tag.
 */
const updateMetaTag = (name: string, content: string) => {
	let element = document.querySelector(`meta[name="${name}"]`);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute("name", name);
		document.head.appendChild(element);
	}
	element.setAttribute("content", content);
};

/**
 * Custom hook for managing document title and SEO meta tags.
 * Updates based on the current route and language.
 */
export const useSeoAndTitle = () => {
	const { t, i18n } = useTranslation();
	const location = useLocation();

	useEffect(() => {
		const appName = "NMS Optimizer"; // Use a consistent short name
		const defaultTitle = t("seo.mainPageTitle", {
			defaultValue: `${appName} | No Man’s Sky Layout Builder for Ships & More`,
		});
		const defaultDescription = t("seo.appDescription", {
			defaultValue:
				"Find the best No Man's Sky technology layouts for your Starship, Corvette, Multitool, Exosuit, and Exocraft. Optimize adjacency bonuses and supercharged slots to create the ultimate NMS builds.",
		});

		let pageTitle = defaultTitle;
		let pageDescription = defaultDescription;

		// Handle language-prefixed routes
		const pathParts = location.pathname.split("/").filter(Boolean);
		const supportedLangs = Object.keys(i18n.services.resourceStore.data || {});
		const basePath = supportedLangs.includes(pathParts[0])
			? `/${pathParts.slice(1).join("/")}`
			: location.pathname;

		switch (basePath === "" ? "/" : basePath) {
			case "/":
				// Uses default title and description
				break;
			case "/instructions":
				pageTitle = t("seo.instructionsPageTitle", {
					defaultValue: `How to Use the NMS Optimizer | Instructions & Tips`,
				});
				pageDescription = t("seo.instructionsDescription", {
					defaultValue:
						"Get detailed instructions and pro tips on how to use the NMS Optimizer. Learn to master supercharged slots, adjacency bonuses, and create the best technology layouts in No Man's Sky.",
				});
				break;
			case "/about":
				pageTitle = t("seo.aboutPageTitle", {
					defaultValue: `About the NMS Optimizer | AI-Powered Tech Layouts & Builds`,
				});
				pageDescription = t("seo.aboutDescription", {
					defaultValue:
						"Learn about the NMS Optimizer, an AI-powered tool for No Man's Sky. Discover how it uses machine learning to create optimal Starship, Corvette, Multitool, Exosuit, and Exocraft builds.",
				});
				break;
			case "/changelog":
				pageTitle = `${t("dialogs.titles.changelog")} | ${appName}`;
				break;
			case "/translation":
				pageTitle = `${t("dialogs.titles.translationRequest")} | ${appName}`;
				break;
			case "/userstats":
				pageTitle = `${t("dialogs.titles.userStats")} | ${appName}`;
				break;
		}

		document.title = pageTitle;
		updateMetaTag("description", pageDescription);

		document.documentElement.lang = i18n.language;
	}, [location.pathname, t, i18n]);
};
