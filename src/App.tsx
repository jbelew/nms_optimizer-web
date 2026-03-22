import { FC, lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";

import AppDialog from "./components/AppDialog/AppDialog";
import OfflineBanner from "./components/OfflineBanner/OfflineBanner";
import UpdatePrompt from "./components/UpdatePrompt/UpdatePrompt"; // Imported UpdatePrompt

import { useDialog } from "./context/dialog-utils";
import { DialogProvider } from "./context/DialogContext";
// Import the new custom hooks
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { fetchTechTree } from "./hooks/useTechTree/useTechTree";
import { useUpdateCheck } from "./hooks/useUpdateCheck/useUpdateCheck";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync"; // Added for URL synchronization
import { useUrlValidation } from "./hooks/useUrlValidation/useUrlValidation";
import { useOptimizeStore } from "./store/OptimizeStore";
import { retryImport } from "./utils/dynamicImport";
import { isBot } from "./utils/isBot";
import { hideSplashScreenAndShowBackground } from "./utils/splashScreen";

const ErrorContent = lazy(() => retryImport(() => import("./components/AppDialog/ErrorContent")));
const ShareLinkDialog = lazy(() =>
	retryImport(() => import("./components/AppDialog/ShareLinkDialog"))
);
const WelcomeContent = lazy(() =>
	retryImport(() => import("./components/AppDialog/WelcomeContent"))
);

const RoutedDialogs = lazy(() =>
	retryImport(() => import("./components/RoutedDialogs/RoutedDialogs")).then((module) => ({
		default: module.RoutedDialogs,
	}))
);

const UserStatsRoute = lazy(() =>
	retryImport(() => import("./routes/UserStatsRoute")).then((module) => ({
		default: module.UserStatsRoute,
	}))
);

/**
 * Inner component that manages core data loading and dialog orchestration.
 *
 * It uses `useFetchShipTypesSuspense` to trigger the initial data fetch and
 * `useUrlSync` to restore state from URL parameters. It also manages the
 * conditional rendering of routed dialogs and the initial welcome dialog.
 *
 * @returns {JSX.Element | null} The application content, or `null` if a fatal error occurs.
 *
 * @see {@link App}
 * @see {@link useDialog}
 * @see {@link useUrlSync}
 * @category Components
 * @example
 */
const AppContent: FC = () => {
	const { showError, errorType } = useOptimizeStore();
	const { closeDialog, shareUrl, activeDialog, userVisited, markUserVisited } = useDialog();
	const { t } = useTranslation();

	const [showWelcome, setShowWelcome] = useState(!userVisited && !activeDialog && !isBot());

	useEffect(() => {
		if (!userVisited && activeDialog) {
			markUserVisited();
		}
	}, [activeDialog, userVisited, markUserVisited]);

	/**
	 * Dismisses the welcome dialog and records the visit.
	 * @example
	 */
	const handleCloseWelcome = () => {
		setShowWelcome(false);
		markUserVisited();
	};

	// useFetchShipTypesSuspense() - Moved down to allow header rendering

	// Use the URL sync hook at the top level to handle popstate and share-link loading
	useUrlSync();

	// If an API error occurred during loading, don't render the main app
	if (showError && errorType === "fatal") {
		return null;
	}

	return (
		<>
			<Outlet />
			{shareUrl ? (
				<ShareLinkDialog
					isOpen={!!shareUrl}
					shareUrl={shareUrl || ""}
					onClose={closeDialog}
				/>
			) : null}
			{activeDialog && activeDialog !== "userstats" ? <RoutedDialogs /> : null}
			{activeDialog === "userstats" ? (
				<Suspense fallback={null}>
					<UserStatsRoute />
				</Suspense>
			) : null}

			{showWelcome ? (
				<Suspense fallback={null}>
					<AppDialog
						isOpen={showWelcome}
						onClose={handleCloseWelcome}
						content={<WelcomeContent onClose={handleCloseWelcome} />}
						titleKey="dialogs.titles.welcome"
						title={t("dialogs.titles.welcome", "Welcome")}
					/>
				</Suspense>
			) : null}
		</>
	);
};

/**
 * The root component of the No Man's Sky Technology Layout Optimizer.
 *
 * This component sets up the high-level application environment, including:
 * - SEO and Title management via `useSeoAndTitle`.
 * - URL validation and sanitization.
 * - Global update detection for the PWA.
 * - Root-level error handling and service worker update prompts.
 *
 * It wraps the entire application in a `DialogProvider` to enable routed modals.
 *
 * @returns {JSX.Element} The rendered root component.
 *
 * @see {@link DialogProvider}
 * @see {@link useSeoAndTitle}
 * @see {@link useUpdateCheck}
 * @category Components
 *
 * @example
 * <App />
 */
const App: FC = () => {
	const { t } = useTranslation();
	const { showError, setShowError } = useOptimizeStore();

	// Automatically hide splash screen if a global error occurs
	useEffect(() => {
		if (showError) {
			hideSplashScreenAndShowBackground();
		}
	}, [showError]);

	// Use the new custom hooks
	useSeoAndTitle();
	useUrlValidation();

	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	useUpdateCheck((updateSW) => {
		updateSWRef.current = updateSW;
		setShowUpdatePrompt(true);
	});

	// Mount-time operations
	useEffect(() => {
		// P0 Optimization: Prefetch tech tree data if platform is in URL
		// This eliminates the waterfall between fetchShipTypes and tech leaf fetches.
		const params = new URLSearchParams(window.location.search);
		const platform = params.get("platform");

		if (platform) {
			void fetchTechTree(platform);
		}

		// Cleanup pre-rendered SSG content
		const prerendered = document.querySelector('[data-prerendered-markdown="true"]');

		if (prerendered) {
			prerendered.remove();
		}
	}, []);

	/**
	 * Triggers a hard reload to activate the newly installed service worker.
	 * @example
	 */
	const handleRefresh = () => {
		if (updateSWRef.current) {
			updateSWRef.current(true).catch((e) => {
				console.error("Failed to update SW:", e);
				window.location.reload();
			});
		} else {
			window.location.reload();
		}
	};

	/**
	 * Hides the application update notification.
	 * @example
	 */
	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	return (
		<DialogProvider>
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

			<UpdatePrompt
				isOpen={showUpdatePrompt}
				onRefresh={handleRefresh}
				onDismiss={handleDismissUpdatePrompt}
			/>
		</DialogProvider>
	);
};

export default App;
