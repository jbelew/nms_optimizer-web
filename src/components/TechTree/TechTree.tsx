// src/components/TechTree/TechTree.tsx
import type { TechTree as TechTreeType } from "../../hooks/useTechTree/useTechTree";
import React, { useEffect, useMemo } from "react";
import { Box, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import ErrorBoundaryInset from "../ErrorBoundary/ErrorBoundaryInset";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { TechTreeContent } from "./TechTreeContent";

/**
 * @interface TechTreeProps
 * @property {(tech: string) => void} handleOptimize - Function to initiate an optimization for a given technology.
 * @property {boolean} solving - Indicates if the optimization process is currently running.
 * @property {number | undefined} gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 */
interface TechTreeProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	gridTableTotalWidth: number | undefined;
	techTree?: TechTreeType; // Optional techTree prop
}

/**
 * This component fetches the tech tree data and renders the complete layout.
 * It's designed to be wrapped in a Suspense boundary. When it suspends,
 * the entire component (including the RecommendedBuild button) is replaced
 * by the Suspense fallback, solving the stale UI issue.
 *
 * @param {object} props - The component props.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Function to call when optimizing a tech.
 * @param {boolean} props.solving - Indicates if the optimizer is currently solving.
 * @param {number | undefined} props.gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 */
const TechTreeWithData: React.FC<TechTreeProps> = ({
	handleOptimize,
	solving,
	techTree: techTreeProp,
}) => {
	const isLarge = useBreakpoint("1024px");
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedShipType);
	const techTree = techTreeProp || fetchedTechTree;

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "521px";

	const hasRecommendedBuilds =
		techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	const scrollAreaHeight = useMemo(() => {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		if (hasRecommendedBuilds) {
			// Adjust height to account for the RecommendedBuild button
			return `${baseHeight - 48}px`;
		}
		return DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT;
	}, [hasRecommendedBuilds]);

	useEffect(() => {
		hideSplashScreenAndShowBackground();
	}, []);

	return (
		<>
			{isLarge ? (
				<>
					<ScrollArea
						className="main-app__tech-tree-sidebar shadow-sm"
						style={{
							height: scrollAreaHeight,
							backgroundColor: "var(--accent-a3)",
							padding: "var(--space-5)",
							borderRadius: "var(--radius-5)",
						}}
					>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
						/>
					</ScrollArea>

					{hasRecommendedBuilds && (
						<RecommendedBuild techTree={techTree} isLarge={isLarge} />
					)}
				</>
			) : (
				<>
					<Box mt="4">
						{hasRecommendedBuilds && (
							<RecommendedBuild techTree={techTree} isLarge={isLarge} />
						)}
					</Box>
					<Box mt="4">
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
						/>
					</Box>
				</>
			)}
		</>
	);
};

/**
 * TechTreeComponent is the main entry point for the Tech Tree feature.
 * It manages the overall layout, error boundaries, and suspense for data loading.
 * It displays a skeleton loader while the tech tree data is being fetched.
 *
 * @param {object} props - The component props.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Function to call when optimizing a tech.
 * @param {boolean} props.solving - Indicates if the optimizer is currently solving.
 * @param {number | undefined} props.gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 * @returns {JSX.Element} The rendered TechTree component.
 */
const TechTree: React.FC<TechTreeProps> = (props) => {
	return (
		<ErrorBoundaryInset>
			<TechTreeWithData {...props} />
		</ErrorBoundaryInset>
	);
};

export default TechTree;
