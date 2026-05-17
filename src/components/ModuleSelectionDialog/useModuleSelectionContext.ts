import { use } from "react";

import { ModuleSelectionContext } from "./createModuleSelectionContext";

/**
 * Hook to consume the ModuleSelection context.
 *
 * @returns {import('./createModuleSelectionContext').ModuleSelectionContextValue} The module selection context value.
 *
 * @throws {Error} If used outside of a ModuleSelectionProvider.
 *
 */
export const useModuleSelectionContext = () => {
	const context = use(ModuleSelectionContext);

	if (!context) {
		throw new Error("useModuleSelectionContext must be used within a ModuleSelectionProvider");
	}

	return context;
};
