import { useTranslation } from "react-i18next";

import { useAppLayout } from "@/hooks/useAppLayout/useAppLayout";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useLoadBuild } from "@/hooks/useLoadBuild/useLoadBuild";
import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useSaveBuild } from "@/hooks/useSaveBuild/useSaveBuild";
import { useScrollHide } from "@/hooks/useScrollHide/useScrollHide";
import { build, getBuildDate } from "@/routeConfig";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useDialog } from "@/utils/system/dialogUtils";

/**
 * Hook to access the main application layout state.
 *
 * @remarks
 * Proxies to `useAppLayout` to provide layout dimensions and refs.
 *
 * @returns {object} Layout state and refs.
 *
 * @category Hooks
 */
export const useMainAppLayout = () => {
	return useAppLayout();
};

/**
 * Hook to access the main application optimization logic.
 *
 * @remarks
 * Proxies to `useOptimize` to provide solving status, progress, and handlers.
 *
 * @returns {object} Optimization state and functions.
 *
 * @category Hooks
 */
export const useMainAppOptimization = () => {
	return useOptimize();
};

/**
 * Hook to access the main application build management logic.
 *
 * @remarks
 * Aggregates `useLoadBuild` and `useSaveBuild` for persistence operations.
 *
 * @returns {object} Load/Save handlers and state.
 *
 * @category Hooks
 */
export const useMainAppBuildManagement = () => {
	const loadBuild = useLoadBuild();
	const saveBuild = useSaveBuild();

	return { loadBuild, saveBuild };
};

/**
 * Hook to access global application state and shared handlers.
 *
 * @remarks
 * Consolidates metadata (version, date), screen size breakpoints,
 * shared grid status, and high-level interaction handlers (changelog).
 *
 * @returns {object} Global application state and utilities.
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { buildVersion, isSmallScreen } = useMainAppGlobal();
 * ```
 */
export const useMainAppGlobal = () => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const isSmallScreen = !useBreakpoint("640px");
	const isLargeScreen = useBreakpoint("1024px");
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const { isVisible, toolbarRef } = useScrollHide(80);

	const handleShowChangelog = () => {
		openDialog("changelog");
	};

	return {
		buildDate: getBuildDate(),
		buildVersion: build,
		handleShowChangelog,
		hasModulesInGrid,
		isLargeScreen,
		isSharedGrid,
		isSmallScreen,
		isVisible,
		selectedShipType,
		t,
		toolbarRef,
	};
};
