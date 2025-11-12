import { FC, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react"; // Added useRef
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import OfflineBanner from "./components/OfflineBanner/OfflineBanner";
import UpdatePrompt from "./components/UpdatePrompt/UpdatePrompt"; // Imported UpdatePrompt
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

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t } = useTranslation();

	const { showError, setShowError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog(); // Destructure from useDialog

	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false); // Added state for update prompt
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined); // Declared updateSW using useRef

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	const shipTypes = useFetchShipTypesSuspense();
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);

	// const { showPrompt, dismissPrompt } = useInstallPrompt();

	const shipTypeKeys = useMemo(() => Object.keys(shipTypes), [shipTypes]);

	useEffect(() => {
		initializePlatform(shipTypeKeys);

		// Listen for new version available event
		const handleNewVersion = (event: CustomEvent) => {
			updateSWRef.current = event.detail; // Store in ref
			setShowUpdatePrompt(true);
		};
		window.addEventListener("new-version-available", handleNewVersion as EventListener);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion as EventListener);
		};
	}, [initializePlatform, shipTypeKeys]);

	const handleRefresh = () => {
		if (updateSWRef.current) {
			updateSWRef.current(true); // Call updateServiceWorker to skip waiting and reload
		} else {
			window.location.reload(); // Fallback if updateSW is not available
		}
	};

	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	return (
		<>
			<OfflineBanner />
			<Suspense fallback={null}>
				<Outlet />
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
			<UpdatePrompt
				isOpen={showUpdatePrompt}
				onRefresh={handleRefresh}
				onDismiss={handleDismissUpdatePrompt}
			/>
		</>
	);
};

export default App;
