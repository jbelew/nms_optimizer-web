import React, { useMemo } from "react";

import { TechTreeContext } from "./useTechTreeContext";

/**
 * Provider for the TechTree component.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - Child elements.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Callback to trigger optimization.
 * @param {boolean} props.isGridFull - True if the grid is full.
 * @param {boolean} props.solving - True if an optimization is in progress.
 *
 * @returns {JSX.Element} The context provider.
 */
export const TechTreeProvider: React.FC<{
	children: React.ReactNode;
	handleOptimize: (tech: string) => Promise<void>;
	isGridFull: boolean;
	solving: boolean;
}> = ({ children, handleOptimize, isGridFull, solving }) => {
	const value = useMemo(
		() => ({
			handleOptimize,
			isGridFull,
			solving,
		}),
		[handleOptimize, isGridFull, solving]
	);

	return <TechTreeContext.Provider value={value}>{children}</TechTreeContext.Provider>;
};
