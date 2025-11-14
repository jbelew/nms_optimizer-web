// src/components/TechTree/TechTree.tsx
import React, { useEffect, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { TechTree, useFetchTechTreeSuspense } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";
import { hideSplashScreenAndShowBackground } from "../../utils/splashScreen";
import ErrorBoundaryInset from "../ErrorBoundry/ErrorBoundryInset";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { TechTreeContent } from "./TechTreeContent";

/**
 * @interface TechTreeProps
 * @property {(tech: string) => Promise<void>} handleOptimize - Function to initiate an optimization for a given technology.
 * @property {boolean} solving - Indicates if the optimization process is currently running.
 * @property {React.RefObject<HTMLDivElement | null>} gridContainerRef - Ref to the main grid container element, used for scrolling.
 * @property {number | undefined} gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 */
interface TechTreeProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	gridContainerRef: React.RefObject<HTMLDivElement | null>;
	gridTableTotalWidth: number | undefined;
	techTree?: TechTree; // Optional techTree prop
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
 * @param {React.RefObject<HTMLDivElement | null>} props.gridContainerRef - Ref to the grid container for scroll management.
 * @param {number | undefined} props.gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 */
const TechTreeWithData: React.FC<TechTreeProps> = ({
	handleOptimize,
	solving,
	gridContainerRef,
	techTree: techTreeProp,
}) => {
	const isLarge = useBreakpoint("1024px");
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedShipType);
	const techTree = techTreeProp || fetchedTechTree;

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";

	const hasRecommendedBuilds =
		techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	const scrollAreaHeight = useMemo(() => {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		if (hasRecommendedBuilds) {
			// Adjust height to account for the RecommendedBuild button
			return `${baseHeight - 52}px`;
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
						className="gridContainer__sidebar rounded-md p-4 shadow-md"
						style={{ height: scrollAreaHeight, backgroundColor: "var(--accent-a2)" }}
					>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
							selectedShipType={selectedShipType}
						/>
					</ScrollArea>

					{hasRecommendedBuilds && (
						<RecommendedBuild
							techTree={techTree}
							gridContainerRef={gridContainerRef}
							isLarge={isLarge}
						/>
					)}
				</>
			) : (
				<>
					<div className="mt-4 sm:mt-5">
						{hasRecommendedBuilds && (
							<RecommendedBuild
								techTree={techTree}
								gridContainerRef={gridContainerRef}
								isLarge={isLarge}
							/>
						)}
					</div>
					<div className={`${!hasRecommendedBuilds ? "mt-4" : "mt-4"}`}>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
							selectedShipType={selectedShipType}
						/>
					</div>
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
 * @param {React.RefObject<HTMLDivElement | null>} props.gridContainerRef - Ref to the grid container for scroll management.
 * @param {number | undefined} props.gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 * @returns {JSX.Element} The rendered TechTreeComponent component.
 */
const TechTreeComponent: React.FC<TechTreeProps> = (props) => {
	return (
		<ErrorBoundaryInset>
			<TechTreeWithData {...props} />
		</ErrorBoundaryInset>
	);
};

export default TechTreeComponent;
