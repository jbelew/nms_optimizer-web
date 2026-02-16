// src/components/MainAppContent/useMainAppLogic.ts
import { useCallback, useEffect } from "react";
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
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";

/**
 * Custom hook that consolidates the logic for MainAppContent.
 *
 * @returns An object containing all state, refs, and handlers needed by MainAppContent.
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

	useEffect(() => {
		if (isSharedGrid) {
			// If it's a shared grid, the tech tree is not actively loading,
			// so ensure the loading spinner is hidden.
			useTechTreeLoadingStore.getState().setLoading(false);
			hideSplashScreenAndShowBackground();
		}
	}, [isSharedGrid]);

	/**
	 * Handles the action to show the changelog dialog by opening the 'changelog' dialog.
	 */
	const handleShowChangelog = useCallback(() => {
		openDialog("changelog");
	}, [openDialog]);

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
