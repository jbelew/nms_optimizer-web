import type { FC } from "react";
import React, { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import { MainAppContent } from "./components/MainAppContent/MainAppContent";
import { useDialog } from "./context/dialog-utils"; // Import useDialog

// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { useUrlValidation } from "./hooks/useUrlValidation/useUrlValidation";
import { useOptimizeStore } from "./store/OptimizeStore";

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
	const { t } = useTranslation();

	const build: string = (import.meta.env.VITE_BUILD_VERSION as string) ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	return (
		<>
			<MainAppContent buildVersion={build} />

			<Suspense fallback={null}>
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
