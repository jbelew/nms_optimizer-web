import { FC, lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import OfflineBanner from "./components/OfflineBanner/OfflineBanner";
import UpdatePrompt from "./components/UpdatePrompt/UpdatePrompt"; // Imported UpdatePrompt
import { useDialog } from "./context/dialog-utils";
// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { useFetchShipTypesSuspense } from "./hooks/useShipTypes/useShipTypes";
import { useUpdateCheck } from "./hooks/useUpdateCheck/useUpdateCheck";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync"; // Added for URL synchronization
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
 * Inner component that loads ship types with Suspense and error boundary
 */
const AppContent: FC = () => {
	const { showError, errorType } = useOptimizeStore();
	const { closeDialog, shareUrl, activeDialog } = useDialog();
	useTranslation();

	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	const shipTypes = useFetchShipTypesSuspense();
	const initializePlatform = usePlatformStore((state) => state.initializePlatform);
	const shipTypeKeys = useMemo(() => Object.keys(shipTypes), [shipTypes]);

	useEffect(() => {
		initializePlatform(shipTypeKeys);
	}, [initializePlatform, shipTypeKeys]);

	useUpdateCheck((updateSW) => {
		updateSWRef.current = updateSW;
		setShowUpdatePrompt(true);
	});

	// Use the URL sync hook at the top level to handle popstate and share-link loading
	useUrlSync();

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
	if (showError && errorType === "fatal") {
		return null;
	}

	return (
		<>
			<Outlet />
			{shareUrl && (
				<ShareLinkDialog
					isOpen={!!shareUrl}
					shareUrl={shareUrl || ""}
					onClose={closeDialog}
				/>
			)}
			{activeDialog && <RoutedDialogs />}
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

	useEffect(() => {
		// Cleanup pre-rendered SSG content
		const prerendered = document.querySelector('[data-prerendered-markdown="true"]');

		if (prerendered) {
			prerendered.remove();
		}
	}, []);

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
