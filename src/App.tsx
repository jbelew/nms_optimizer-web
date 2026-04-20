import { FC, lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import AppDialog from "./components/AppDialog/Base/AppDialog";
import { DialogProvider } from "./context/dialogContext";
// Import the new custom hooks
import { useAnalytics } from "./hooks/useAnalytics/useAnalytics";
import { useFileHandling } from "./hooks/useFileHandling/useFileHandling";
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { fetchTechTree } from "./hooks/useTechTree/useTechTree";
import { useUpdateCheck } from "./hooks/useUpdateCheck/useUpdateCheck";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync"; // Added for URL synchronization
import { useUrlNormalization, useUrlValidation } from "./hooks/useValidation/useValidation";
import { useOptimizeStore } from "./store/app/optimizeStore";
import { sendEvent } from "./utils/analytics/tracking";
import { isBot } from "./utils/browser/environment";
import { useDialog } from "./utils/system/dialogUtils";
import { hideSplashScreenAndShowBackground } from "./utils/system/splashScreen";

// Lazy-loaded components for performance optimization
const OfflineBanner = lazy(() => import("./components/OfflineBanner/OfflineBanner"));
const UpdatePrompt = lazy(() => import("./components/UpdatePrompt/UpdatePrompt"));

/**
 * Lazy-loaded component for displaying technical error details and recovery actions.
 */
const ErrorContent = lazy(() => import("./components/AppDialog/Error/ErrorContent"));

/**
 * Lazy-loaded dialog for generating and displaying shareable build URLs.
 */
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLink/ShareLinkDialog"));

/**
 * Lazy-loaded content for the initial application welcome and introduction.
 */
const WelcomeContent = lazy(() => import("./components/AppDialog/Welcome/WelcomeContent"));

/**
 * Lazy-loaded orchestrator for route-based modal dialogs.
 */
const RoutedDialogs = lazy(() =>
	import("./components/RoutedDialogs/RoutedDialogs").then((module) => ({
		default: module.RoutedDialogs,
	}))
);

/**
 * Lazy-loaded route component for displaying global user equipment statistics.
 */
const UserStatsRoute = lazy(() =>
	import("./routes/UserStatsRoute").then((module) => ({
		default: module.UserStatsRoute,
	}))
);

/**
 * Inner component that manages core data loading and dialog orchestration.
 *
 * @remarks
 * It uses `useFetchShipTypesSuspense` to trigger the initial data fetch and
 * `useUrlSync` to restore state from URL parameters. It also manages the
 * conditional rendering of routed dialogs and the initial welcome dialog.
 * This component handles the core logic of the application after the initial
 * setup in the `App` component.
 *
 * @returns {JSX.Element | null} The application content, or `null` if a fatal error occurs.
 *
 * @see {@link App}
 * @see {@link useDialog}
 * @see {@link useUrlSync}
 *
 * @category Components
 *
 * @example
 * ```tsx
 * // Typically rendered within App's DialogProvider
 * <AppContent />
 * ```
 */
const AppContent: FC = () => {
	const { sendEvent } = useAnalytics();
	const { showError, errorType } = useOptimizeStore();
	const { closeDialog, shareUrl, activeDialog, userVisited, markUserVisited } = useDialog();
	const { t } = useTranslation();
	const location = useLocation();

	// Use the URL hooks within the DialogProvider context
	useUrlNormalization();
	useSeoAndTitle();
	useUrlValidation();

	const [showWelcome, setShowWelcome] = useState(!userVisited && !activeDialog && !isBot());

	useEffect(() => {
		if (!userVisited && activeDialog) {
			markUserVisited();
		}
	}, [activeDialog, userVisited, markUserVisited]);

	/**
	 * Dismisses the welcome dialog and records the visit.
	 *
	 * @remarks
	 * This ensures that the user doesn't see the welcome dialog on subsequent
	 * visits to the application.
	 *
	 * @example
	 * ```tsx
	 * handleCloseWelcome();
	 * // returns void, side-effect: sets showWelcome to false and marks visit
	 * ```
	 */
	const handleCloseWelcome = () => {
		setShowWelcome(false);
		markUserVisited();
	};

	// Track error screen if shown
	useEffect(() => {
		if (showError && errorType === "fatal") {
			sendEvent({
				category: "engagement",
				action: "page_view",
				page_title: `NMS Optimizer: ${t("dialogs.titles.serverError")}`,
				page_location: window.location.href,
				page: `${location.pathname}${location.search}#error`,
				nonInteraction: true,
			});
		}
	}, [showError, errorType, sendEvent, t, location.pathname, location.search]);

	// useUrlSync() and other hooks...
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
 * @remarks
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
 * @see {@link ./App.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
const App: FC = () => {
	const { t } = useTranslation();
	const { showError, setShowError } = useOptimizeStore();

	// Initialize file handling for PWA file association
	useFileHandling();

	// Automatically hide splash screen if a global error occurs
	useEffect(() => {
		if (showError) {
			hideSplashScreenAndShowBackground();
		}
	}, [showError]);

	const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
	const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

	// Centralized update prompt tracking
	useEffect(() => {
		if (showUpdatePrompt) {
			sendEvent({
				category: "engagement",
				action: "page_view",
				page_title: "NMS Optimizer: Update Available",
				page_location: window.location.href,
				page: `${window.location.pathname}${window.location.search}#update`,
				nonInteraction: true,
			});
		}
	}, [showUpdatePrompt]);

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
	 *
	 * @remarks
	 * Calls `updateSW(true)` if the reference exists, which should trigger a page
	 * reload after the worker updates. Fallback to `window.location.reload()`
	 * if the update function is not available.
	 *
	 * @example
	 * ```tsx
	 * handleRefresh();
	 * // returns void, side-effect: triggers a page reload
	 * ```
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
	 *
	 * @remarks
	 * Dismisses the `UpdatePrompt` dialog, allowing the user to continue using
	 * the application without updating immediately.
	 *
	 * @example
	 * ```tsx
	 * handleDismissUpdatePrompt();
	 * // returns void, side-effect: sets showUpdatePrompt to false
	 * ```
	 */
	const handleDismissUpdatePrompt = () => {
		setShowUpdatePrompt(false);
	};

	return (
		<DialogProvider>
			<Suspense fallback={null}>
				<OfflineBanner />
			</Suspense>

			<AppContent />

			{/* Error dialog - rendered at App level so it's always available */}
			<Suspense fallback={null}>
				<AppDialog
					isOpen={showError}
					onClose={() => setShowError(false)}
					content={<ErrorContent onClose={() => setShowError(false)} />}
					titleKey="dialogs.titles.serverError"
					title={t("dialogs.titles.serverError")}
				/>
			</Suspense>

			<Suspense fallback={null}>
				<UpdatePrompt
					isOpen={showUpdatePrompt}
					onRefresh={handleRefresh}
					onDismiss={handleDismissUpdatePrompt}
				/>
			</Suspense>
		</DialogProvider>
	);
};

export default App;
