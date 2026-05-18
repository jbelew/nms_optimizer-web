import React, { useMemo } from "react";

import {
	MainAppBuildManagementContext,
	MainAppGlobalContext,
	MainAppLayoutContext,
	MainAppOptimizationContext,
} from "./createMainAppContext";
import { useMainAppLogic } from "./useMainAppLogic";

/**
 * Provider for the MainApp contexts.
 *
 * @category Components
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
