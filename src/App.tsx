import type { FC } from "react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Button } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import {
	AppDialogBody,
	AppDialogFooter,
	AppDialogRoot,
	AppDialogTitle,
} from "@/components/AppDialog/Base/AppDialog";
import { ErrorDialog } from "@/components/AppDialog/Error/ErrorDialog";
import { useOptimizeStore } from "@/store/ui/uiStore";

import { Seo } from "./components/Seo/Seo";
import { UpdatePromptWrapper } from "./components/UpdatePrompt/UpdatePromptWrapper";
import { DialogProvider } from "./context/dialogContext";
import { useAnalytics } from "./hooks/useAnalytics/useAnalytics";
import { useFileHandling } from "./hooks/useFileHandling/useFileHandling";
import { useSeoAndTitle } from "./hooks/useSeoAndTitle/useSeoAndTitle";
import { fetchTechTree } from "./hooks/useTechTree/useTechTree";
import { useUrlSync } from "./hooks/useUrlSync/useUrlSync";
import { useUrlNormalization, useUrlValidation } from "./hooks/useValidation/useValidation";
import { isBot } from "./utils/browser/environment";
import { useDialog } from "./utils/system/dialogUtils";
import { lazyNamed } from "./utils/system/lazyNamed";
import { Logger } from "./utils/system/monitoring";
import { hideSplashScreenAndShowBackground } from "./utils/system/splashScreen";

const IS_DOCKER_BUILD = import.meta.env.VITE_DOCKER === "true";

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
 * Lazy-loaded content for the initial application welcome and introduction.
 */
const WelcomeContent = lazy(() => import("./components/AppDialog/Welcome/WelcomeContent"));

/**
 * Lazy-loaded orchestrator for route-based modal dialogs.
 */
const RoutedDialogs = lazyNamed(
	() => import("./components/RoutedDialogs/RoutedDialogs"),
	"RoutedDialogs"
);

/**
 * Lazy-loaded route component for displaying global user equipment statistics.
 */
const UserStatsRoute = lazyNamed(() => import("./routes/UserStatsRoute"), "UserStatsRoute");

/**
 * Lazy-loaded route component for displaying application performance metrics.
 */
const PerformanceRoute = lazyNamed(() => import("./routes/PerformanceRoute"), "PerformanceRoute");

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
	const status = useOptimizeStore((s) => s.status);
	const isFatal = status.type === "error" && status.severity === "fatal";
	const { activeDialog, closeDialog, markUserVisited, shareUrl, userVisited } = useDialog();
	const { t } = useTranslation();
	const location = useLocation();

	// Use the URL hooks within the DialogProvider context
	useUrlSync();
	useUrlNormalization();
	useSeoAndTitle();
	useUrlValidation();

	const [showWelcome, setShowWelcome] = useState(() => !userVisited && !activeDialog && !isBot());

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
		if (status.type === "error" && status.severity === "fatal") {
			sendEvent({
				action: "page_view",
				category: "engagement",
				nonInteraction: true,
				page: `${location.pathname}${location.search}#error`,
				page_location: window.location.href,
				page_title: `NMS Optimizer: ${t("dialogs.titles.serverError")}`,
			});
		}
	}, [status, sendEvent, t, location.pathname, location.search]);

	// If an API error occurred during loading, don't render the main app
	if (isFatal) {
		return null;
	}

	return (
		<>
			<Seo />
			<Outlet />
			{shareUrl ? (
				<Suspense fallback={null}>
					<ShareLinkDialog
						isOpen={!!shareUrl}
						onClose={closeDialog}
						shareUrl={shareUrl || ""}
					/>
				</Suspense>
			) : null}
			{activeDialog && activeDialog !== "userstats" && activeDialog !== "performance" ? (
				<Suspense fallback={null}>
					<RoutedDialogs />
				</Suspense>
			) : null}
			{activeDialog === "userstats" && !IS_DOCKER_BUILD ? (
				<Suspense fallback={null}>
					<UserStatsRoute />
				</Suspense>
			) : null}
			{activeDialog === "performance" && !IS_DOCKER_BUILD ? (
				<Suspense fallback={null}>
					<PerformanceRoute />
				</Suspense>
			) : null}

			{showWelcome ? (
				<Suspense fallback={null}>
					<AppDialogRoot isOpen={showWelcome} onClose={handleCloseWelcome}>
						<AppDialogTitle titleKey="dialogs.titles.welcome" />
						<AppDialogBody>
							<WelcomeContent onClose={handleCloseWelcome} />
						</AppDialogBody>
						<AppDialogFooter>
							<div className="flex justify-end gap-2">
								<Button
									className="cursor-pointer"
									mb="1"
									onClick={handleCloseWelcome}
								>
									{t("dialogs.welcome.getStarted")}
								</Button>
							</div>
						</AppDialogFooter>
					</AppDialogRoot>
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
	const showError = useOptimizeStore((s) => s.status.type === "error");

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
			<UpdatePromptWrapper />
		</DialogProvider>
	);
};

export default App;
