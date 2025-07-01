// src/App.tsx

import { ScrollArea } from "@radix-ui/themes";
import { type FC, useCallback, useEffect, useMemo, useRef } from "react"; // Added useRef
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation } from "react-router-dom";
// import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

import AppDialog from "./components/AppDialog/AppDialog";
// import AppLoadingFallback from "./components/AppLoadingFallback/AppLoadingFallback";
import ErrorContent from "./components/AppDialog/ErrorContent";
import OptimizationAlertDialog from "./components/AppDialog/OptimizationAlertDialog";
import AppFooter from "./components/AppFooter/AppFooter";
import AppHeader from "./components/AppHeader/AppHeader";
import { GridTable } from "./components/GridTable/GridTable";
import ShipSelection from "./components/ShipSelection/ShipSelection";
import { TRACKING_ID } from "./constants"; // APP_NAME will come from i18n
import { DialogProvider } from "./context/DialogContext";
import { useDialog } from "./context/dialog-utils";
import i18n from "./i18n/i18n"; // Import i18n instance
import { useAppLayout } from "./hooks/useAppLayout";
import { useOptimize } from "./hooks/useOptimize";
import { useFetchShipTypesSuspense, useShipTypesStore } from "./hooks/useShipTypes";
import { useUrlSync } from "./hooks/useUrlSync";
import { useGridStore } from "./store/GridStore";
import { useOptimizeStore } from "./store/OptimizeStore";
import { hideSplashScreen } from "vite-plugin-splash-screen/runtime";

// --- Page Components ---
// const TechTreeComponent = lazy(() => import("./components/TechTree/TechTree"));
import TechTreeComponent from "./components/TechTree/TechTree";

// --- Page Content (for dialogs) ---
import ChangelogContent from "./components/AppDialog/ChangeLogContent";
import MarkdownContentRenderer from "./components/AppDialog/MarkdownContentRenderer";

import React from "react";

import "@radix-ui/themes/tokens/colors/amber.css";
import "@radix-ui/themes/tokens/colors/blue.css";
import "@radix-ui/themes/tokens/colors/green.css";
import "@radix-ui/themes/tokens/colors/iris.css";
import "@radix-ui/themes/tokens/colors/jade.css";
import "@radix-ui/themes/tokens/colors/orange.css";
import "@radix-ui/themes/tokens/colors/red.css";
import "@radix-ui/themes/tokens/colors/sky.css";
import "@radix-ui/themes/tokens/colors/teal.css";
import "@radix-ui/themes/tokens/colors/yellow.css";

/**
 * Renders the main application content.
 * This component will suspend if `useFetchShipTypesSuspense` is fetching initial data.
 */
const MainAppContentInternal: FC<{
	buildVersion: string;
}> = ({ buildVersion }) => {
	const { t } = useTranslation();

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "520px";

	const { grid, activateRow, deActivateRow, resetGrid, isSharedGrid } = useGridStore();
	const { activeDialog, openDialog, closeDialog } = useDialog();

	const selectedShipType = useShipTypesStore((state) => state.selectedShipType);
	// Call useFetchShipTypesSuspense to ensure data is fetched/cached and to trigger Suspense.
	// The actual shipTypes data is typically consumed by child components (e.g., ShipSelection)
	// which also call this hook and benefit from the cache, or potentially via a store if it were populated there.
	useFetchShipTypesSuspense();
	const {
		solving,
		handleOptimize,
		gridContainerRef,
		patternNoFitTech,
		clearPatternNoFitTech,
		handleForceCurrentPnfOptimize,
	} = useOptimize();
	const { updateUrlForShare, updateUrlForReset } = useUrlSync(); // Destructure functions
	const {
		containerRef: appLayoutContainerRef,
		gridTableRef: appLayoutGridTableRef,
		gridHeight,
		gridTableTotalWidth, // Destructure the new total width
		isLarge,
	} = useAppLayout();

	useEffect(() => {
		hideSplashScreen();
	}, []);

	// --- Dialog Handlers ---
	const handleShowChangelog = useCallback(() => {
		openDialog("changelog");
	}, [openDialog]);

	// Memoize content elements for dialogs
	const aboutDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="about" />,
		[]
	);
	const instructionsDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="instructions" />,
		[]
	);
	const changelogDialogContent = useMemo(() => <ChangelogContent />, []);
	const translationRequestDialogContent = useMemo(
		() => <MarkdownContentRenderer markdownFileName="translation-request" />,
		[]
	);

	return (
		<main className="flex flex-col items-center justify-center lg:min-h-screen">
			<section className="relative mx-auto border rounded-none app lg:rounded-xl bg-white/5 backdrop-blur-xl">
				<AppHeader onShowChangelog={handleShowChangelog} />
				<section
					className="flex flex-col items-start p-4 pt-2 gridContainer sm:pt-4 sm:p-8 lg:flex-row"
					ref={gridContainerRef}
				>
					<div
						className="flex-grow w-auto gridContainer__container lg:flex-shrink-0"
						ref={appLayoutContainerRef}
					>
						<header
							className="flex flex-wrap items-center gap-2 mb-3 text-xl sm:mb-4 sm:text-2xl heading-styled"
							style={{ maxWidth: gridTableTotalWidth ? `${gridTableTotalWidth}px` : undefined }}
						>
							{!isSharedGrid && (
								<span className="self-start flex-shrink-0 shadow-sm">
									<ShipSelection solving={solving} />
								</span>
							)}
							<span className="self-start hidden sm:inline" style={{ color: "var(--accent-11)" }}>
								{t("platformLabel")}
							</span>
							<span
								className="self-start flex-1 min-w-0 mt-[6] sm:mt-0"
								style={{
									textWrap: "balance",
									visibility: gridTableTotalWidth ? "visible" : "hidden",
								}}
							>
								{t(`platforms.${selectedShipType}`)}
							</span>
						</header>
						<GridTable
							grid={grid}
							solving={solving}
							shared={isSharedGrid}
							activateRow={activateRow}
							deActivateRow={deActivateRow}
							ref={appLayoutGridTableRef}
							resetGridAction={resetGrid}
							updateUrlForShare={updateUrlForShare}
							updateUrlForReset={updateUrlForReset}
						/>
					</div>
					{!isSharedGrid &&
						(isLarge ? (
							<ScrollArea
								className={`gridContainer__sidebar p-4 ml-4 shadow-md rounded-xl backdrop-blur-xl`}
								style={{
									height: gridHeight ? `${gridHeight}px` : DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT,
								}}
							>
								<TechTreeComponent handleOptimize={handleOptimize} solving={solving} />
							</ScrollArea>
						) : (
							<aside className="flex-grow w-full pt-8" style={{ minHeight: "550px" }}>
								<TechTreeComponent handleOptimize={handleOptimize} solving={solving} />
							</aside>
						))}
				</section>
			</section>

			<AppFooter buildVersion={buildVersion} />

			{/* Dialogs related to MainAppContent's state */}
			<OptimizationAlertDialog
				isOpen={!!patternNoFitTech}
				technologyName={patternNoFitTech}
				onClose={clearPatternNoFitTech}
				onForceOptimize={handleForceCurrentPnfOptimize}
			/>
			{/* Dialog for "About" information */}
			<AppDialog
				isOpen={activeDialog === "about"}
				onClose={closeDialog}
				titleKey="dialogs.titles.about"
				title={t("dialogs.titles.about")}
				content={aboutDialogContent}
			/>
			{/* Dialog for "Instructions" information */}
			<AppDialog
				isOpen={activeDialog === "instructions"}
				onClose={closeDialog}
				titleKey="dialogs.titles.instructions"
				title={t("dialogs.titles.instructions")}
				content={instructionsDialogContent}
			/>
			{/* Dialog for "Changelog" information */}
			<AppDialog
				isOpen={activeDialog === "changelog"}
				onClose={closeDialog}
				titleKey="dialogs.titles.changelog"
				title={t("dialogs.titles.changelog")}
				content={changelogDialogContent}
			/>
			{/* Dialog for "Translation Request" information */}
			<AppDialog
				isOpen={activeDialog === "translation"}
				onClose={closeDialog}
				titleKey="dialogs.titles.translationRequest" // You'll need to add this key to your i18n files
				title={t("dialogs.titles.translationRequest")}
				content={translationRequestDialogContent}
			/>
		</main>
	);
};

const MainAppContent = React.memo(MainAppContentInternal);

/**
 * Root application component.
 * Sets up routing, Suspense for data loading, and global dialogs.
 */
const App: FC = () => {
	const { t } = useTranslation();

	// Build version, now defined at the App level
	// Uses __APP_VERSION__ injected by Vite from package.json (see vite.config.ts and vite-env.d.ts)
	const appVersion: string = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "devmode";
	const build: string = (import.meta.env.VITE_BUILD_VERSION as string) ?? "devmode";
	const location = useLocation();
	const { showError, setShowError } = useOptimizeStore();
	const gaInitialized = useRef(false);

	useEffect(() => {
		if (gaInitialized.current) return;
		ReactGA.initialize(TRACKING_ID, {
			testMode: import.meta.env.DEV,
			gaOptions: { app_version: appVersion },
		});
		gaInitialized.current = true;
		// This effect runs once on App mount for GA initialization.
	}, [appVersion, build]); // Added build to dependency array

	const initialPageViewSentRef = useRef(false); // Ensuring this is the single, correct declaration

	// Combined Effect for page view tracking, hreflang tags, and title updates
	useEffect(() => {
		// Set document title based on the current path first
		const appName = t("appName");
		let pageTitle = appName; // Default title

		switch (location.pathname) {
			case "/":
				pageTitle = appName;
				break;
			case "/instructions":
				pageTitle = `${t("dialogs.titles.instructions")} - ${appName}`;
				break;
			case "/about":
				pageTitle = `${t("dialogs.titles.about")} - ${appName}`;
				break;
			case "/changelog":
				pageTitle = `${t("dialogs.titles.changelog")} - ${appName}`;
				break;
			case "/translation":
				pageTitle = `${t("dialogs.titles.translationRequest")} - ${appName}`;
				break;
			// Add other cases as needed
			default:
				pageTitle = appName;
		}
		document.title = pageTitle;

		// Send page view to GA using the updated title
		// Only send if it's not the initial page view (which is handled by ReactGA.initialize's config)
		if (initialPageViewSentRef.current) {
			ReactGA.send({
				hitType: "pageview",
				page: location.pathname + location.search,
				title: pageTitle,
			});
		} else {
			// For the very first run of this effect (initial load),
			// ReactGA.initialize() is expected to have already sent the page_view via its 'config' command.
			// So, we just mark that the initial view processing by this effect is done.
			initialPageViewSentRef.current = true;
		}

		// Manage hreflang tags
		const supportedLanguages = i18n.options.supportedLngs || [];
		const defaultLanguage = (i18n.options.fallbackLng as string[])[0] || "en";
		const currentPath = location.pathname;
		const currentSearch = location.search;
		const baseUrl = window.location.origin;

		document.querySelectorAll("link[rel='alternate'][hreflang]").forEach((tag) => tag.remove());

		supportedLanguages.forEach((lang) => {
			if (lang === "dev" || lang === "cimode") return;

			const params = new URLSearchParams(currentSearch);
			params.set("lng", lang);
			const href = `${baseUrl}${currentPath}?${params.toString()}`;

			const link = document.createElement("link");
			link.rel = "alternate";
			link.hreflang = lang;
			link.href = href;
			document.head.appendChild(link);

			if (lang === defaultLanguage) {
				const defaultParams = new URLSearchParams(currentSearch);
				defaultParams.set("lng", defaultLanguage);
				const xDefaultHref = `${baseUrl}${currentPath}?${defaultParams.toString()}`;

				const defaultLink = document.createElement("link");
				defaultLink.rel = "alternate";
				defaultLink.hreflang = "x-default";
				defaultLink.href = xDefaultHref;
				document.head.appendChild(defaultLink);
			}
		});
	}, [location.pathname, location.search, t]); // Added i18n.language to dependencies as t() output can change

	const errorDialogContent = useMemo(() => <ErrorContent />, []);

	return (
		<>
			<DialogProvider>
				{/* <Suspense fallback={<AppLoadingFallback />}> */}
				{/* <FadeIn> */}
				<MainAppContent buildVersion={build} />
				{/* </FadeIn> */}
				{/* </Suspense> */}
			</DialogProvider>

			{/* Routes now render null for dialog-controlled pages */}
			<Routes>
				<Route path="/" element={null} />
				<Route path="/changelog" element={null} />
				<Route path="/instructions" element={null} />
				<Route path="/about" element={null} />
				<Route path="/translation" element={null} />
			</Routes>

			{/* Non-routed Dialogs managed by App (e.g., ErrorDialog) */}
			<AppDialog
				isOpen={showError}
				onClose={() => setShowError(false)}
				content={errorDialogContent}
				titleKey="dialogs.titles.serverError"
				title={t("dialogs.titles.serverError")}
			/>
		</>
	);
};

export default App;
