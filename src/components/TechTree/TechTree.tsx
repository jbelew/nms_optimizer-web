// src/components/TechTree/TechTree.tsx
import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React from "react";

import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import { TechTreeList } from "./TechTreeList";
import { TechTreeProvider } from "./TechTreeProvider";
import { TechTreeRecommended } from "./TechTreeRecommended";
import { TechTreeRoot } from "./TechTreeRoot";

export { TechTreeSkeleton } from "./TechTreeSkeleton";

/**
 * Properties for the {@link TechTree} component.
 */
interface TechTreeProps {
	/** Function to trigger a solver run for a specific technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * Composite component for the TechTree.
 */
const TechTreeComp: React.FC<TechTreeProps> = ({
	handleOptimize,
	solving,
	techTree: techTreeProp,
}) => {
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedShipType);
	const techTree = techTreeProp || fetchedTechTree;
	const isGridFull = useGridStore((state) => state._isGridFull);

	const hasRecommendedBuilds =
		!!techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	return (
		<TechTreeProvider handleOptimize={handleOptimize} isGridFull={isGridFull} solving={solving}>
			<TechTreeRoot hasRecommendedBuilds={hasRecommendedBuilds}>
				<TechTreeList techTree={techTree} />
			</TechTreeRoot>
			<TechTreeRecommended techTree={techTree} />
		</TechTreeProvider>
	);
};

/**
 * Compound component for TechTree.
 */
export const TechTree = Object.assign(TechTreeComp, {
	List: TechTreeList,
	Provider: TechTreeProvider,
	Recommended: TechTreeRecommended,
	Root: TechTreeRoot,
});
