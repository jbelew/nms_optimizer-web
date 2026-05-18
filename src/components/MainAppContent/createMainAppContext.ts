import type { useMainAppLogic } from "./useMainAppLogic";
import { createContext } from "react";

type MainAppLogic = ReturnType<typeof useMainAppLogic>;

export const MainAppLayoutContext = createContext<MainAppLogic["appLayout"] | null>(null);

export const MainAppOptimizationContext = createContext<MainAppLogic["optimize"] | null>(null);

export const MainAppBuildManagementContext = createContext<null | {
	loadBuild: MainAppLogic["loadBuild"];
	saveBuild: MainAppLogic["saveBuild"];
}>(null);

export const MainAppGlobalContext = createContext<null | {
	buildDate: MainAppLogic["buildDate"];
	buildVersion: MainAppLogic["buildVersion"];
	handleShowChangelog: MainAppLogic["handleShowChangelog"];
	hasModulesInGrid: MainAppLogic["hasModulesInGrid"];
	isLargeScreen: MainAppLogic["isLargeScreen"];
	isSharedGrid: MainAppLogic["isSharedGrid"];
	isSmallScreen: MainAppLogic["isSmallScreen"];
	isVisible: MainAppLogic["isVisible"];
	selectedShipType: MainAppLogic["selectedShipType"];
	toolbarRef: MainAppLogic["toolbarRef"];
}>(null);
