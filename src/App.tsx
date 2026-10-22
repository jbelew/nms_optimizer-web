import type { FC } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import { ErrorDialog } from "@/components/AppDialog/Error/ErrorDialog";
import { UpdatePromptDialog } from "@/components/AppDialog/UpdatePrompt/UpdatePromptDialog";
import { useOptimizeStore } from "@/store/ui/uiStore";
import { formatErrorDocumentTitle } from "@shared/page-metadata.js";

import { Seo } from "./components/Seo/Seo";
import { useAnalytics } from "./hooks/useAnalytics/useAnalytics";
import { useFileHandling } from "./hooks/useBuildFileManager/useBuildFileManager";
import { fetchTechTree } from "./hooks/useTechTree/useTechTree";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync";
import { isBot } from "./utils/browser/environment";
import { DialogProvider, useDialog } from "./utils/system/dialogUtils";
import { lazyNamed } from "./utils/system/lazyNamed";
import { lifecycleCoordinator } from "./utils/system/lifecycleCoordinator";
import { Logger } from "./utils/system/monitoring";

/**
 * Lazy-loaded component that displays a banner when the user is offline.
 *
 * @category Components
 */
const OfflineBanner = lazy(() => import("./components/OfflineBanner/OfflineBanner"));

/**
 * Lazy-loaded dialog for generating and displaying shareable build URLs.
 */
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLink/ShareLinkDialog"));

/**
 * Lazy-loaded dialog for the initial application welcome and introduction.
 */
const WelcomeDialog = lazy(() => import("./components/AppDialog/Welcome/WelcomeDialog"));

/**
 * Lazy-loaded orchestrator for route-based modal dialogs.
 */
const RoutedDialogs = lazyNamed(
	() => import("./components/RoutedDialogs/RoutedDialogs"),
	"RoutedDialogs",
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
 * @returns The application content, or `null` if a fatal error occurs.
 *
 * @see {@link App}
 * @see {@link useDialog}
 * @see {@link formatErrorDocumentTitle}
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
	const status = useOptimizeStore((s) => s.status);
	const isFatal = status.type === "error" && status.severity === "fatal";
	const { activeDialog, closeDialog, markUserVisited, shareUrl, userVisited } = useDialog();
	const { t } = useTranslation();
	const location = useLocation();

	// Synchronize URL parameters with store state within the DialogProvider context
	useUrlSync();

	const [isIdle, setIsIdle] = useState(() => lifecycleCoordinator.getPhase() === "IDLE");
	const [welcomeDismissed, setWelcomeDismissed] = useState(false);

	useEffect(() => {
		if (!userVisited && activeDialog) {
			markUserVisited();

			return;
		}

		if (userVisited || activeDialog || isBot()) {
			return;
		}

		return lifecycleCoordinator.onPhase("IDLE", () => {
			setIsIdle(true);
		});
	}, [activeDialog, userVisited, markUserVisited]);

	const showWelcome = !welcomeDismissed && !userVisited && !activeDialog && !isBot() && isIdle;

	/**
	 * Dismisses the welcome dialog and records the visit.
	 *
	 * @example
	 * handleCloseWelcome();
	 */
	const handleCloseWelcome = () => {
		setWelcomeDismissed(true);
		markUserVisited();
	};

	// Track error screen if shown
	useEffect(() => {
		if (status.type === "error" && status.severity === "fatal") {
			const appName = t("appName", { defaultValue: "NMS Optimizer" });
			const errorTopic = t("dialogs.titles.serverError");
			const pageTitle = formatErrorDocumentTitle(500, errorTopic, appName);

			sendEvent({
				action: "page_view",
				category: "engagement",
				nonInteraction: true,
				page: `${location.pathname}${location.search}#error`,
				page_location: window.location.href,
				page_title: pageTitle,
			});
		}
	}, [status, sendEvent, t, location.pathname, location.search]);

	// If an API error occurred during loading, don't render the main app
	if (isFatal) {
		const appName = t("appName", { defaultValue: "NMS Optimizer" });
		const errorTopic = t("dialogs.titles.serverError");
		const pageTitle = formatErrorDocumentTitle(500, errorTopic, appName);

		return (
			<>
				<title>{pageTitle}</title>
				<meta
					content="noindex, nofollow"
					name="robots"
				/>
			</>
		);
	}

	return (
		<>
			<Seo />
			<Outlet />
			{shareUrl ?
				<Suspense fallback={null}>
					<ShareLinkDialog
						isOpen={!!shareUrl}
						onClose={closeDialog}
						shareUrl={shareUrl}
					/>
				</Suspense>
			:	null}
			{activeDialog ?
				<Suspense fallback={null}>
					<RoutedDialogs />
				</Suspense>
			:	null}

			{showWelcome ?
				<Suspense fallback={null}>
					<WelcomeDialog
						isOpen={showWelcome}
						onClose={handleCloseWelcome}
					/>
				</Suspense>
			:	null}
		</>
	);
};

/**
 * The root component of the No Man's Sky Technology Layout Optimizer.
 *
 * @remarks
 * This component sets up the high-level application environment, including:
 * - SEO metadata, document title, and `page_view` telemetry via {@link Seo}.
 * - URL validation and sanitization.
 * - Global update detection for the PWA via {@link UpdatePromptDialog}.
 * - Root-level error handling via ErrorDialog.
 *
 * It wraps the entire application in a `DialogProvider` to enable routed modals.
 *
 * @returns The rendered root component.
 *
 * @see {@link DialogProvider}
 * @see {@link Seo}
 * @see {@link ErrorDialog}
 * @see {@link UpdatePromptDialog}
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
	const showError = useOptimizeStore((s) => s.status.type === "error");

	// Initialize file handling for PWA file association
	useFileHandling();

	// Automatically signal readiness to dismiss splash screen if a global error occurs
	useEffect(() => {
		if (showError) {
			lifecycleCoordinator.markReady();
		}
	}, [showError]);

	// Mount-time operations
	useEffect(() => {
		// Signal primary view readiness to the Lifecycle Coordinator
		lifecycleCoordinator.markReady();

		// P0 Optimization: Prefetch tech tree data if platform is in URL
		// This eliminates the waterfall between fetchShipTypes and tech leaf fetches.
		const params = new URLSearchParams(window.location.search);
		const platform = params.get("platform");

		if (platform) {
			void fetchTechTree(platform).catch((err) => {
				Logger.warn("Failed to prefetch tech tree during app mount:", err);
			});
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
			<UpdatePromptDialog />
		</DialogProvider>
	);
};

export default App;
