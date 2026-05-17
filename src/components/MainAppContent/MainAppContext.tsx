import React, { use, useMemo } from "react";

import {
	MainAppBuildManagementContext,
	MainAppGlobalContext,
	MainAppLayoutContext,
	MainAppOptimizationContext,
} from "./createMainAppContext";
import { useMainAppLogic } from "./useMainAppLogic";

/**
 * Hooks to consume focused MainApp contexts.
 */
export const useMainAppLayout = () => {
	const context = use(MainAppLayoutContext);
	if (!context) throw new Error("useMainAppLayout must be used within a MainAppProvider");

	return context;
};

/**
 * Hook to consume the MainApp optimization context.
 *
 * @throws {Error} If used outside of a MainAppProvider.
 */
export const useMainAppOptimization = () => {
	const context = use(MainAppOptimizationContext);
	if (!context) throw new Error("useMainAppOptimization must be used within a MainAppProvider");

	return context;
};

/**
 * Hook to consume the MainApp build management context.
 *
 * @throws {Error} If used outside of a MainAppProvider.
 */
export const useMainAppBuildManagement = () => {
	const context = use(MainAppBuildManagementContext);
	if (!context)
		throw new Error("useMainAppBuildManagement must be used within a MainAppProvider");

	return context;
};

/**
 * Hook to consume the MainApp global context.
 *
 * @throws {Error} If used outside of a MainAppProvider.
 */
export const useMainAppGlobal = () => {
	const context = use(MainAppGlobalContext);
	if (!context) throw new Error("useMainAppGlobal must be used within a MainAppProvider");

	return context;
};

/**
 * Provider for the MainApp contexts.
 */
export const MainAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const {
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
		toolbarRef,
	} = useMainAppLogic();

	const layoutValue = useMemo(() => appLayout, [appLayout]);
	const optimizationValue = useMemo(() => optimize, [optimize]);
	const buildManagementValue = useMemo(() => ({ loadBuild, saveBuild }), [loadBuild, saveBuild]);
	const globalValue = useMemo(
		() => ({
			buildDate,
			buildVersion,
			handleShowChangelog,
			hasModulesInGrid,
			isLargeScreen,
			isSharedGrid,
			isSmallScreen,
			isVisible,
			selectedShipType,
			toolbarRef,
		}),
		[
			buildDate,
			buildVersion,
			handleShowChangelog,
			hasModulesInGrid,
			isLargeScreen,
			isSharedGrid,
			isSmallScreen,
			isVisible,
			selectedShipType,
			toolbarRef,
		]
	);

	return (
		<MainAppLayoutContext.Provider value={layoutValue}>
			<MainAppOptimizationContext.Provider value={optimizationValue}>
				<MainAppBuildManagementContext.Provider value={buildManagementValue}>
					<MainAppGlobalContext.Provider value={globalValue}>
						{children}
					</MainAppGlobalContext.Provider>
				</MainAppBuildManagementContext.Provider>
			</MainAppOptimizationContext.Provider>
		</MainAppLayoutContext.Provider>
	);
};
