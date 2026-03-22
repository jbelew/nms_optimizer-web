// src/components/MainAppContent/useMainAppLogic.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAppLayout } from "../../hooks/useAppLayout/useAppLayout";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useErrorDispatcher } from "../../hooks/useErrorDispatcher";
import { useLoadBuild } from "../../hooks/useLoadBuild/useLoadBuild";
import { useOptimize } from "../../hooks/useOptimize/useOptimize";
import { useSaveBuild } from "../../hooks/useSaveBuild/useSaveBuild";
import { registerToolbarForceShow } from "../../hooks/useScrollGridIntoView/useScrollGridIntoView";
import { useScrollHide } from "../../hooks/useScrollHide/useScrollHide";
import { useToast } from "../../hooks/useToast/useToast";
import { build, getBuildDate } from "../../routeConfig";
import { useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { useSessionStore } from "../../store/SessionStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";

/**
 * Custom hook that consolidates the high-level orchestration logic for the main application view.
 *
 * It aggregates multiple specialized hooks (layout, optimization, persistence,
 * notifications) into a single unified interface for the `MainAppContent` component.
 * It also manages global lifecycle events like resetting sessions and dismissing
 * the splash screen.
 *
 * @returns {object} A complex object containing state flags, sub-hook results, and event handlers.
 *
 * @example
 * const logic = useMainAppLogic();
 */
export const useMainAppLogic = () => {
	const buildVersion = build;
	const buildDate = getBuildDate();
	const { t } = useTranslation();
	const isSmallScreen = !useBreakpoint("640px");
	const isLargeScreen = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const { openDialog } = useDialog();
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { isVisible, toolbarRef, forceShow } = useScrollHide(80);
	const { resetSession } = useSessionStore();

	const { showSuccess, showError } = useToast();

	const optimize = useOptimize();

	const appLayout = useAppLayout();

	const saveBuild = useSaveBuild();

	const loadBuild = useLoadBuild({
		showSuccess,
		showError,
	});

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
	 * @example
	 */
	const handleShowChangelog = () => {
		openDialog("changelog");
	};

	return {
		buildVersion,
		buildDate,
		t,
		isSmallScreen,
		isLargeScreen,
		isSharedGrid,
		hasModulesInGrid,
		selectedShipType,
		isVisible,
		toolbarRef,
		optimize,
		appLayout,
		saveBuild,
		loadBuild,
		handleShowChangelog,
	};
};
