import type { FC } from "react";
import { useMemo } from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import ErrorContent from "./components/AppDialog/ErrorContent";
import ShareLinkDialog from "./components/AppDialog/ShareLinkDialog"; // Import ShareLinkDialog

import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { RoutedDialogs } from "./components/RoutedDialogs/RoutedDialogs";
import { useDialog } from "./context/dialog-utils"; // Import useDialog

// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle";
import { useUrlValidation } from "./hooks/useUrlValidation";
import { useOptimizeStore } from "./store/OptimizeStore";
import { initializeAnalytics } from "./utils/analytics";

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t } = useTranslation();

	const appVersion: string = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "devmode";
	const build: string = (import.meta.env.VITE_BUILD_VERSION as string) ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	// Use the new custom hooks
	initializeAnalytics();
	ReactGA.set({ app_version: appVersion });
	useSeoAndTitle();
	useUrlValidation();

	const errorDialogContent = useMemo(() => <ErrorContent />, []);

	return (
		<>
			<MainAppContent buildVersion={build} />

			<Routes>
				<Route path="/" element={null} />
				<Route path="/changelog" element={null} />
				<Route path="/instructions" element={null} />
				<Route path="/about" element={null} />
				<Route path="/translation" element={null} />
				<Route path="/userstats" element={null} />
			</Routes>

			<AppDialog
				isOpen={showError}
				onClose={() => setShowError(false)}
				content={errorDialogContent}
				titleKey="dialogs.titles.serverError"
				title={t("dialogs.titles.serverError")}
			/>

			{/* Render ShareLinkDialog conditionally */}
			<ShareLinkDialog isOpen={!!shareUrl} shareUrl={shareUrl || ""} onClose={closeDialog} />

			<RoutedDialogs />
		</>
	);
};

export default App;
