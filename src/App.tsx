import type { FC } from "react";
import React, { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { useDialog } from "./context/dialog-utils"; // Import useDialog

// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { useFetchShipTypesSuspense } from "./hooks/useShipTypes/useShipTypes";
import { useUrlValidation } from "./hooks/useUrlValidation/useUrlValidation";
import { useOptimizeStore } from "./store/OptimizeStore";
import { usePlatformStore } from "./store/PlatformStore";

const ErrorContent = lazy(() => import("./components/AppDialog/ErrorContent"));
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLinkDialog"));

const RoutedDialogs = lazy(() =>
	import("./components/RoutedDialogs/RoutedDialogs").then((module) => ({
		default: module.RoutedDialogs,
	}))
);

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t, i18n } = useTranslation();
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

	const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	const shipTypes = useFetchShipTypesSuspense();
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);

	useEffect(() => {
		initializePlatform(Object.keys(shipTypes));
	}, [shipTypes, initializePlatform]);

	return (
		<>
			<MainAppContent buildVersion={build} language={i18n.language} />

			<Suspense fallback={null}>
				<Routes>
					{/* English (default) routes */}
					<Route path="/" element={null} />
					<Route path="/changelog" element={null} />
					<Route path="/instructions" element={null} />
					<Route path="/about" element={null} />
					<Route path="/translation" element={null} />
					<Route path="/userstats" element={null} />

					{/* Other language routes */}
					<Route path="/:lang(es|fr|de|pt)" element={null} />
					<Route path="/:lang(es|fr|de|pt)/changelog" element={null} />
					<Route path="/:lang(es|fr|de|pt)/instructions" element={null} />
					<Route path="/:lang(es|fr|de|pt)/about" element={null} />
					<Route path="/:lang(es|fr|de|pt)/translation" element={null} />
					<Route path="/:lang(es|fr|de|pt)/userstats" element={null} />
					<Route path="*" element={null} />
				</Routes>

				<AppDialog
					isOpen={showError}
					onClose={() => setShowError(false)}
					content={<ErrorContent onClose={() => setShowError(false)} />}
					titleKey="dialogs.titles.serverError"
					title={t("dialogs.titles.serverError")}
				/>

				{/* Render ShareLinkDialog conditionally */}
				<ShareLinkDialog
					isOpen={!!shareUrl}
					shareUrl={shareUrl || ""}
					onClose={closeDialog}
				/>

				<RoutedDialogs />
			</Suspense>
		</>
	);
};

export default App;
