import React, { useMemo } from "react";

import { GridContext } from "./createGridContext";

/**
 * Provider for the Grid context.
 *
 * @category Components
 */
export const GridProvider: React.FC<{
	children: React.ReactNode;
	gridRef: React.RefObject<HTMLDivElement | null>;
}> = ({ children, gridRef }) => {
	const contextValue = useMemo(() => ({ gridRef }), [gridRef]);

	return <GridContext.Provider value={contextValue}>{children}</GridContext.Provider>;
};
