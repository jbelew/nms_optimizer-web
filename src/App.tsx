import { FC, lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import ErrorDialog from "./components/AppDialog/Error/ErrorDialog";
import UpdatePromptWrapper from "./components/UpdatePrompt/UpdatePromptWrapper";
import { DialogProvider } from "./context/dialogContext";
import { useAnalytics } from "./hooks/useAnalytics/useAnalytics";
import { useFileHandling } from "./hooks/useFileHandling/useFileHandling";
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { fetchTechTree } from "./hooks/useTechTree/useTechTree";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync";
import { useUrlNormalization, useUrlValidation } from "./hooks/useValidation/useValidation";
import { useOptimizeStore } from "./store/app/optimizeStore";
import { isBot } from "./utils/browser/environment";
import { useDialog } from "./utils/system/dialogUtils";
import { hideSplashScreenAndShowBackground } from "./utils/system/splashScreen";

// Lazy-loaded components for performance optimization
const OfflineBanner = lazy(() => import("./components/OfflineBanner/OfflineBanner"));

/**
 * Lazy-loaded dialog for generating and displaying shareable build URLs.
 */
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLink/ShareLinkDialog"));

/**
 * Lazy-loaded component for the base dialog structure.
 */
const AppDialog = lazy(() => import("./components/AppDialog/Base/AppDialog"));

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
 * Lazy-loaded route component for displaying application performance metrics.
 */
const PerformanceRoute = lazy(() =>
	import("./routes/PerformanceRoute").then((module) => ({
		default: module.PerformanceRoute,
	}))
);

/**
 * Inner component that manages core data loading and dialog orchestration.
 *
 * @remarks
 * It uses `useUrlSync` to restore state from URL parameters. It also manages the
 * conditional rendering of routed dialogs and the initial welcome dialog.
 * This component handles the core logic of the application after the initial
 * setup in the `App` component.
 *
 * @returns {JSX.Element | null} The application content, or `null` if a fatal error occurs.
 *
 * @see {@link App}
 * @see {@link useDialog}
 *
 * @category Components
 *
 * @example
 * ```tsx
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
	useUrlSync();
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
	 * @example
	 * handleCloseWelcome();
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

	// If an API error occurred during loading, don't render the main app
	if (showError && errorType === "fatal") {
		return null;
	}

	return (
		<>
			<Outlet />
			{shareUrl ? (
				<Suspense fallback={null}>
					<ShareLinkDialog
						isOpen={!!shareUrl}
						shareUrl={shareUrl || ""}
						onClose={closeDialog}
					/>
				</Suspense>
			) : null}
			{activeDialog && activeDialog !== "userstats" && activeDialog !== "performance" ? (
				<RoutedDialogs />
			) : null}
			{activeDialog === "userstats" ? (
				<Suspense fallback={null}>
					<UserStatsRoute />
				</Suspense>
			) : null}
			{activeDialog === "performance" ? (
				<Suspense fallback={null}>
					<PerformanceRoute />
				</Suspense>
			) : null}

			{showWelcome ? (
				<Suspense fallback={null}>
					<AppDialog
						isOpen={showWelcome}
						onClose={handleCloseWelcome}
						content={<WelcomeContent onClose={handleCloseWelcome} />}
						footer={
							<div className="flex justify-end gap-2">
								<Button
									onClick={handleCloseWelcome}
									mb="1"
									className="cursor-pointer"
								>
									{t("dialogs.welcome.getStarted")}
								</Button>
							</div>
						}
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
 * - Global update detection for the PWA via UpdatePromptWrapper.
 * - Root-level error handling via ErrorDialog.
 *
 * It wraps the entire application in a `DialogProvider` to enable routed modals.
 *
 * @returns {JSX.Element} The rendered root component.
 *
 * @see {@link DialogProvider}
 * @see {@link ErrorDialog}
 * @see {@link UpdatePromptWrapper}
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
	const { showError } = useOptimizeStore();

	// Initialize file handling for PWA file association
	useFileHandling();

	// Automatically hide splash screen if a global error occurs
	useEffect(() => {
		if (showError) {
			hideSplashScreenAndShowBackground();
		}
	}, [showError]);

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

	return (
		<DialogProvider>
			<Suspense fallback={null}>
				<OfflineBanner />
			</Suspense>

			<AppContent />

			{/* Error dialog - rendered at App level so it's always available */}
			<ErrorDialog />

			{/* Update prompt - manages its own lifecycle and analytics */}
			<UpdatePromptWrapper />
		</DialogProvider>
	);
};

export default App;
