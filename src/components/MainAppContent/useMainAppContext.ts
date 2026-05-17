import { use } from "react";

import {
	MainAppBuildManagementContext,
	MainAppGlobalContext,
	MainAppLayoutContext,
	MainAppOptimizationContext,
} from "./createMainAppContext";

/**
 * Hooks to consume focused MainApp contexts.
 *
 * @throws {Error} If used outside of a MainAppProvider.
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
