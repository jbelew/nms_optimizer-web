import { type FC, useEffect, useMemo, useRef } from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import ErrorContent from "./components/AppDialog/ErrorContent";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { TRACKING_ID } from "./constants";
import { DialogProvider } from "./context/DialogContext";
import i18n from "./i18n/i18n";
import { useOptimizeStore } from "./store/OptimizeStore";
import { reportWebVitals } from "./reportWebVitals";

import "@radix-ui/themes/tokens/colors/amber.css";
import "@radix-ui/themes/tokens/colors/blue.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/iris.css";
import "@radix-ui/themes/tokens/colors/jade.css";
import "@radix-ui/themes/tokens/colors/orange.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/teal.css";
import "@radix-ui/themes/tokens/colors/yellow.css";

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate(); // Correct placement for navigate initialization

	const appVersion: string = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "devmode";
	const build: string = (import.meta.env.VITE_BUILD_VERSION as string) ?? "devmode";

	const location = useLocation();
	const { showError, setShowError } = useOptimizeStore();
	const gaInitialized = useRef(false);

	/**
	 * Initializes Google Analytics and sets up web vitals reporting.
	 * This effect runs only once when the component mounts.
	 */
	useEffect(() => {
		if (gaInitialized.current) return;
		ReactGA.initialize(TRACKING_ID, {
			testMode: import.meta.env.DEV,
		});
		ReactGA.set({ app_version: appVersion });
		gaInitialized.current = true;
		reportWebVitals();
	}, [appVersion]);

	const initialPageViewSentRef = useRef(false);

	/**
	 * Handles side effects related to route changes.
	 * - Sets the document title based on the current path and language.
	 * - Sends pageview events to Google Analytics on navigation.
	 * - Manages SEO-related `hreflang` link tags for different languages.
	 */
	useEffect(() => {
		// Grid/Platform check and redirect
		const currentParams = new URLSearchParams(location.search); // Correct placement
		if (currentParams.has("grid") && !currentParams.has("platform")) {
			// Invalid shared URL: grid is present but platform is missing
			currentParams.delete("grid"); // Remove the grid param
			// Navigate to the cleaned URL
			navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
			return; // Exit early as the URL has changed and useEffect will re-run
		}

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
			default:
				pageTitle = appName;
		}
		document.title = pageTitle;

		if (initialPageViewSentRef.current) {
			ReactGA.send({
				hitType: "pageview",
				page: location.pathname + location.search,
				title: pageTitle,
				app_version: appVersion,
			});
		} else {
			initialPageViewSentRef.current = true;
		}

		// Canonical Tag Logic
		let canonicalLink = document.querySelector('link[rel="canonical"]');
		let canonicalUrl = window.location.origin + location.pathname;

		if (currentParams.has("grid")) {
			canonicalUrl += `?grid=${currentParams.get("grid")}`;
		}

		if (!canonicalLink) {
			canonicalLink = document.createElement("link");
			canonicalLink.setAttribute("rel", "canonical");
			document.head.appendChild(canonicalLink);
		}
		if (canonicalLink.getAttribute("href") !== canonicalUrl) {
			canonicalLink.setAttribute("href", canonicalUrl);
		}

		// Hreflang Tags Logic
		const supportedLanguages = i18n.options.supportedLngs || [];
		const defaultLanguage = (i18n.options.fallbackLng as string[])[0] || "en";
		const currentPath = location.pathname;
		const currentSearch = location.search;
		const baseUrl = window.location.origin;

		// Get existing hreflang tags
		const existingHreflangTags = Array.from(
			document.querySelectorAll("link[rel='alternate'][hreflang]")
		);
		const existingHreflangMap = new Map<string, HTMLLinkElement>();
		existingHreflangTags.forEach((tag) => {
			const hreflang = tag.getAttribute("hreflang");
			if (hreflang) {
				existingHreflangMap.set(hreflang, tag as HTMLLinkElement);
			}
		});

		const newHreflangUrls = new Map<string, string>();

		supportedLanguages.forEach((lang) => {
			if (lang === "dev" || lang === "cimode") return;

			const params = new URLSearchParams(currentSearch);
			params.set("lng", lang);
			const href = `${baseUrl}${currentPath}?${params.toString()}`;
			newHreflangUrls.set(lang, href);

			if (lang === defaultLanguage) {
				const defaultParams = new URLSearchParams(currentSearch);
				defaultParams.set("lng", defaultLanguage);
				const xDefaultHref = `${baseUrl}${currentPath}?${defaultParams.toString()}`;
				newHreflangUrls.set("x-default", xDefaultHref);
			}
		});

		// Update or create hreflang tags
		newHreflangUrls.forEach((href, lang) => {
			let linkTag = existingHreflangMap.get(lang);
			if (linkTag) {
				if (linkTag.getAttribute("href") !== href) {
					linkTag.setAttribute("href", href);
				}
				existingHreflangMap.delete(lang); // Mark as processed
			} else {
				linkTag = document.createElement("link");
				linkTag.rel = "alternate";
				linkTag.hreflang = lang;
				linkTag.href = href;
				document.head.appendChild(linkTag);
			}
		});

		// Remove any remaining (unprocessed) existing hreflang tags
		existingHreflangMap.forEach((tag) => tag.remove());
	}, [appVersion, location.pathname, location.search, t, navigate]); // Added navigate to dependencies

	const errorDialogContent = useMemo(() => <ErrorContent />, []);

	return (
		<>
			<DialogProvider>
				<MainAppContent buildVersion={build} />
			</DialogProvider>

			<Routes>
				<Route path="/" element={null} />
				<Route path="/changelog" element={null} />
				<Route path="/instructions" element={null} />
				<Route path="/about" element={null} />
				<Route path="/translation" element={null} />
			</Routes>

			<AppDialog
				isOpen={showError}
				onClose={() => setShowError(false)}
				content={errorDialogContent}
				titleKey="dialogs.titles.serverError"
				title={t("dialogs.titles.serverError")}
			/>
		</>
	);
};

export default App;
