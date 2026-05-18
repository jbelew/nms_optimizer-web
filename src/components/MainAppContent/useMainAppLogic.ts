// src/components/MainAppContent/useMainAppLogic.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppLayout } from "@/hooks/useAppLayout/useAppLayout";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useErrorDispatcher } from "@/hooks/useErrorDispatcher";
import { useLoadBuild } from "@/hooks/useLoadBuild/useLoadBuild";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useSaveBuild } from "@/hooks/useSaveBuild/useSaveBuild";
import { registerToolbarForceShow } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useScrollHide } from "@/hooks/useScrollHide/useScrollHide";
import { build, getBuildDate } from "@/routeConfig";
import { usePlatformStore } from "@/store/app/platformStore";
import { useSessionStore } from "@/store/app/sessionStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";
import { hideSplashScreenAndShowBackground } from "@/utils/system/splashScreen";

/**
 * Custom hook that consolidates the high-level orchestration logic for the main application view.
 *
 * @remarks
 * It aggregates multiple specialized hooks (layout, optimization, persistence,
 * notifications) into a single unified interface for the `MainAppContent` component.
 * It also manages global lifecycle events like resetting sessions and dismissing
 * the splash screen.
 *
 * @returns {object} A complex object containing state flags, sub-hook results, and event handlers.
 *
 * @see {@link import('./MainAppContent').MainAppContent} The primary component that consumes this hook.
 * @see {@link ./useMainAppLogic.test.ts Unit Tests}
 * @see {@link ./MainAppContent.stories.tsx Storybook}
 * @see {@link useGridStore}
 * @see {@link usePlatformStore}
 * @see {@link useSessionStore}
 * @see {@link import('./MainAppContent').MainAppContent} for the UI implementation.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const {
 *   buildVersion,
 *   isSmallScreen,
 *   optimize,
 *   saveBuild,
 *   handleShowChangelog
 * } = useMainAppLogic();
 * // returns orchestration logic for the main application
 * ```
 */
export const useMainAppLogic = () => {
	const buildVersion = build;
	const buildDate = getBuildDate();
	const { t } = useTranslation();
	const isSmallScreen = !useBreakpoint("640px");
	const isLargeScreen = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.hasModulesInGrid);
	const { openDialog } = useDialog();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { forceShow, isVisible, toolbarRef } = useScrollHide(80);
	const { resetSession } = useSessionStore();

	const optimize = useOptimize();

	const appLayout = useAppLayout();

	const saveBuild = useSaveBuild();

	const loadBuild = useLoadBuild();

	// Reset error counts when ship type changes
	useEffect(() => {
		resetSession();
	}, [selectedShipType, resetSession]);

	// Monitor session errors and dispatch messages to toast
	useErrorDispatcher();

	// Register the toolbar's forceShow function so useScrollGridIntoView can trigger it
	useEffect(() => {
		registerToolbarForceShow(forceShow);
	}, [forceShow]);

	// Hide splash screen once main app content is mounted
	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	/**
	 * Opens the application changelog modal.
	 *
	 * @example
	 * ```tsx
	 * handleShowChangelog();
	 * // returns void, side-effect: opens "changelog" dialog
	 * ```
	 */
	const handleShowChangelog = () => {
		openDialog("changelog");
	};

	return {
		appLayout,
		buildDate,
		buildVersion,
		handleShowChangelog,
		hasModulesInGrid,
		isLargeScreen,
		isSharedGrid,
		isSmallScreen,
		isVisible,
		loadBuild,
		optimize,
		saveBuild,
		selectedShipType,
		t,
		toolbarRef,
	};
};
