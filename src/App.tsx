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
 * Inner component that loads ship types with Suspense and error boundary
 */
const AppContent: FC = () => {
	const { showError } = useOptimizeStore();
	const { closeDialog, shareUrl } = useDialog();
	useTranslation();

	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	const shipTypes = useFetchShipTypesSuspense();
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);
	const shipTypeKeys = useMemo(() => Object.keys(shipTypes), [shipTypes]);

	useEffect(() => {
		initializePlatform(shipTypeKeys);
	}, [initializePlatform, shipTypeKeys]);

	useEffect(() => {
		const handleNewVersion = (event: CustomEvent) => {
			updateSWRef.current = event.detail;
			setShowUpdatePrompt(true);
		};
		window.addEventListener("new-version-available", handleNewVersion as EventListener);

		return () => {
			window.removeEventListener("new-version-available", handleNewVersion as EventListener);
		};
	}, []);

	const handleRefresh = () => {
		if (updateSWRef.current) {
			updateSWRef.current(true);
		} else {
			window.location.reload();
		}
	};

	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	// If an API error occurred during loading, don't render the main app
	if (showError) {
		return null;
	}

	return (
		<>
			<Outlet />

			<ShareLinkDialog isOpen={!!shareUrl} shareUrl={shareUrl || ""} onClose={closeDialog} />

			<RoutedDialogs />

			<UpdatePrompt
				isOpen={showUpdatePrompt}
				onRefresh={handleRefresh}
				onDismiss={handleDismissUpdatePrompt}
			/>
		</>
	);
};

/**
 * The main application component. It sets up routing, analytics, internationalization,
 * and global state providers. It also handles dynamic document titles and SEO tags.
 * @returns {JSX.Element} The rendered App component.
 */
const App: FC = () => {
	const { t } = useTranslation();
	const { showError, setShowError } = useOptimizeStore();

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	return (
		<>
			<OfflineBanner />
			<Suspense fallback={null}>
				<AppContent />
			</Suspense>

			{/* Error dialog - rendered at App level so it's always available */}
			<AppDialog
				isOpen={showError}
				onClose={() => setShowError(false)}
				content={<ErrorContent onClose={() => setShowError(false)} />}
				titleKey="dialogs.titles.serverError"
				title={t("dialogs.titles.serverError")}
			/>
		</>
	);
};

export default App;
