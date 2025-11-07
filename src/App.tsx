import type { FC } from "react";
import React, { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

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

const RoutedDialogs = lazy(() =>
	import("./components/RoutedDialogs/RoutedDialogs").then((module) => ({
		default: module.RoutedDialogs,
	}))
);

import { routes } from "./router";

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC<{ shipTypes?: any; techTree?: any }> = ({ shipTypes, techTree }) => {
	const { t } = useTranslation();

	const build: string = import.meta.env.VITE_BUILD_VERSION ?? "devmode";

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	const fetchedShipTypes = useFetchShipTypesSuspense(shipTypes);
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);

	// const { showPrompt, dismissPrompt } = useInstallPrompt();

	  useEffect(() => {
	    initializePlatform(Object.keys(fetchedShipTypes));
	  }, [fetchedShipTypes, initializePlatform]);
	    return (
	      <>
	        <OfflineBanner />
	        <MainAppContent buildVersion={build} techTree={techTree} />
	  
	        <Routes>
	          {routes.map((route, index) => (
	            <Route key={index} path={route.path} element={route.element} />
	          ))}
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
	        {/* {showPrompt && <InstallPrompt onDismiss={dismissPrompt} />} */}
	      </>
	    );
	  };export default App;
