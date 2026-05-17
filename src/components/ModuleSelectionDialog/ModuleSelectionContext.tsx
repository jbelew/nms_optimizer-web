import type { ModuleSelectionDialogProps } from "@/types/props";
import React, { use, useMemo } from "react";

import { ModuleSelectionContext } from "./createModuleSelectionContext";

/**
 * Hook to consume the ModuleSelection context.
 *
 * @throws {Error} If used outside of a ModuleSelectionProvider.
 */
export const useModuleSelectionContext = () => {
	const context = use(ModuleSelectionContext);

	if (!context) {
		throw new Error("useModuleSelectionContext must be used within a ModuleSelectionProvider");
	}

	return context;
};

/**
 * Provider for the ModuleSelection context.
 */
export const ModuleSelectionProvider: React.FC<{
	children: React.ReactNode;
	props: ModuleSelectionDialogProps;
}> = ({ children, props }) => {
	const contextValue = useMemo(() => props, [props]);

	return (
		<ModuleSelectionContext.Provider value={contextValue}>
			{children}
		</ModuleSelectionContext.Provider>
	);
};
