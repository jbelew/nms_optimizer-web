import { createContext, use } from "react";

import { type TechTree } from "@/hooks/useTechTree/useTechTree";

/**
 * Context interface for the recommended build component.
 */
export interface RecommendedBuildContextValue {
	/** Function to apply a selected build to the grid. */
	handleApply: (build: NonNullable<TechTree["recommended_builds"]>[number]) => void;
	/** Navigates to the instructions dialog. */
	handleOpenInstructions: () => void;
	/** Whether the screen matches the 'large' (desktop) breakpoint. */
	isLarge: boolean;
	/** The technology tree data containing available builds. */
	techTree: TechTree;
}

export const RecommendedBuildContext = createContext<null | RecommendedBuildContextValue>(null);

/**
 * Hook to access the RecommendedBuild context.
 *
 * @returns {RecommendedBuildContextValue} The recommended build context value.
 *
 * @throws {Error} If used outside of RecommendedBuildProvider.
 */
export const useRecommendedBuildContext = () => {
	const context = use(RecommendedBuildContext);

	if (!context) {
		throw new Error("useRecommendedBuildContext must be used within RecommendedBuildProvider");
	}

	return context;
};
