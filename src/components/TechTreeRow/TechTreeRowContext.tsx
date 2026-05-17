import type { TechTreeRowProps } from "@/types/props";
import React, { use, useMemo } from "react";

import { useTechTree } from "@/components/TechTree/createTechTreeContext";

import { TechTreeRowContext } from "./createTechTreeRowContext";
import { useTechTreeRow } from "./useTechTreeRow";

/**
 * Hook to consume the TechTreeRow context.
 *
 * @throws {Error} If used outside of a TechTreeRowProvider.
 */
export const useTechTreeRowContext = () => {
	const context = use(TechTreeRowContext);

	if (!context) {
		throw new Error("useTechTreeRowContext must be used within a TechTreeRowProvider");
	}

	return context;
};

/**
 * Provider for the TechTreeRow context.
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
