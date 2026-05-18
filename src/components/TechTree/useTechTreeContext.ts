import { createContext, use } from "react";

/**
 * Context interface for the technology tree.
 */
export interface TechTreeContextValue {
	/** Function to trigger a solver run for a specific technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether the grid has reached its module capacity. */
	isGridFull: boolean;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
}

export const TechTreeContext = createContext<null | TechTreeContextValue>(null);

/**
 * Custom hook to consume the TechTreeContext.
 *
 * @returns {TechTreeContextValue} The tech tree context values.
 *
 * @throws {Error} If used outside of a TechTreeProvider.
 */
export const useTechTree = () => {
	const context = use(TechTreeContext);

	if (!context) {
		throw new Error("useTechTree must be used within a TechTreeProvider");
	}

	return context;
};
