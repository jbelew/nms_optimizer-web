import type { TechTreeRowProps } from "@/types/props";
import React, { useMemo } from "react";

import { useTechTree } from "@/components/TechTree/createTechTreeContext";

import { TechTreeRowContext } from "./createTechTreeRowContext";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Provider for the TechTreeRow context.
 *
 * @category Components
 */
export const TechTreeRowProvider: React.FC<{
	children: React.ReactNode;
	props: TechTreeRowProps;
}> = ({ children, props }) => {
	const { handleOptimize, isGridFull, solving } = useTechTree();
	const hookData = useTechTreeRow({ ...props, handleOptimize, isGridFull, solving });

	const contextValue = useMemo(() => hookData, [hookData]);

	return (
		<TechTreeRowContext.Provider value={contextValue}>{children}</TechTreeRowContext.Provider>
	);
};
