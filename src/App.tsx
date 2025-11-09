import { FC, lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";

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

	const currentPathname = window.location.pathname;
	let isKnownRoute = false;
	const validLangs = ["es", "fr", "de", "pt"];

	// Define base known paths without language prefixes
	const baseKnownPaths = [
		"/",
		"/changelog",
		"/instructions",
		"/about",
		"/translation",
		"/userstats",
	];

	// Check if the current pathname is a base known path
	if (baseKnownPaths.includes(currentPathname)) {
		isKnownRoute = true;
	}

	// If not a base path, check for language-specific paths
	if (!isKnownRoute) {
		const parts = currentPathname.split("/");
		// Check if the first part after the root is a valid language
		if (parts.length > 1 && validLangs.includes(parts[1])) {
			const pathWithoutLang = "/" + parts.slice(2).join("/");
			// If the path without language is empty (e.g., "/es"), it's a known language root
			// Otherwise, check if the path without language is a known base path
			if (pathWithoutLang === "/" || baseKnownPaths.includes(pathWithoutLang)) {
				isKnownRoute = true;
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
