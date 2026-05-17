import type { ModuleSelectionDialogProps } from "@/types/props";
import React, { useMemo } from "react";

import { ModuleSelectionContext } from "./createModuleSelectionContext";

/**
 * Provider for the ModuleSelection context.
 *
 * @category Components
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
