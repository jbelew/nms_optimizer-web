import type { FC } from "react";
import React, { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { matchPath } from "react-router-dom"; // Import matchPath

import AppDialog from "./components/AppDialog/AppDialog";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import OfflineBanner from "./components/OfflineBanner/OfflineBanner";
import { useDialog } from "./context/dialog-utils";
// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { useFetchShipTypesSuspense } from "./hooks/useShipTypes/useShipTypes";
import { useUrlValidation } from "./hooks/useUrlValidation/useUrlValidation";
import { useOptimizeStore } from "./store/OptimizeStore";
import { usePlatformStore } from "./store/PlatformStore";

// import { useInstallPrompt } from "./hooks/useInstallPrompt/useInstallPrompt";
// import { InstallPrompt } from "./components/InstallPrompt/InstallPrompt";

const ErrorContent = lazy(() => import("./components/AppDialog/ErrorContent"));
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLinkDialog"));
const NotFound = lazy(() => import("./components/NotFound/NotFound"));

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
	const { t } = useTranslation();

	const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	const shipTypes = useFetchShipTypesSuspense();
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);

	// const { showPrompt, dismissPrompt } = useInstallPrompt();

	useEffect(() => {
		initializePlatform(Object.keys(shipTypes));
	}, [shipTypes, initializePlatform]);

	// Define all known application paths (including dialogs)
	const knownPaths = [
		"/",
		"/changelog",
		"/instructions",
		"/about",
		"/translation",
		"/userstats",
		"/:lang", // Simplified from /:lang(es|fr|de|pt)
		"/:lang/changelog", // Simplified
		"/:lang/instructions", // Simplified
		"/:lang/about", // Simplified
		"/:lang/translation", // Simplified
		"/:lang/userstats", // Simplified
	];

	const currentPathname = window.location.pathname;
	let isKnownRoute = false;
	const validLangs = ["es", "fr", "de", "pt"];

	for (const pathPattern of knownPaths) {
		const match = matchPath(pathPattern, currentPathname);
		if (match) {
			// If it's a language-specific path, validate the 'lang' parameter
			if (match.params.lang) {
				if (validLangs.includes(match.params.lang as string)) {
					isKnownRoute = true;
					break;
				}
			} else {
				// It's a non-language-specific path or a language path without a 'lang' param (e.g., "/")
				isKnownRoute = true;
				break;
			}
		}
	}

	return (
		<>
			<OfflineBanner />
			<Suspense fallback={null}>
				{isKnownRoute ? (
					// Render MainAppContent if it's a known route
					<MainAppContent buildVersion={build} />
				) : (
					// Render NotFound if it's not a known route
					<NotFound />
				)}

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
			{/* {showPrompt && <InstallPrompt onDismiss={dismissPrompt} />} */}
		</>
	);
};

export default App;
