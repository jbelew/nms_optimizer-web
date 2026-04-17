/**
 * Technology tree sidebar container module.
 *
 * @remarks
 * This module provides the main `TechTree` component, which organizes the
 * equipment sidebar, including categorized technology rows and build
 * recommendations.
 *
 * @see {@link TechTree}
 * @see {@link ./TechTree.test.tsx Unit Tests}
 * @see {@link ./TechTree.stories.tsx Storybook}
 *
 * @category Components
 */

import type { TechTree as TechTreeType } from "../../hooks/useTechTree/useTechTree";
import React from "react";
import { Box, ScrollArea } from "@radix-ui/themes";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/app/platformStore";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { TechTreeContent } from "./TechTreeContent";

/**
 * Props for the `TechTree` and `TechTreeWithData` components.
 */
interface TechTreeProps {
	/** Function to trigger a solver run for a specific technology. **Must be asynchronous.** */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
	/** Total width of the grid table, used for responsive layout matching. */
	gridTableTotalWidth: number | undefined;
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * A data-aware component that renders the technology list and recommended builds.
 *
 * @remarks
 * This component handles the internal scroll area logic on large screens and
 * responsive stack behavior on mobile. It uses `useFetchTechTreeSuspense` to
 * retrieve data, ensuring it integrates with React Suspense.
 *
 * @param {TechTreeProps} props - Component properties.
 *
 * @returns {JSX.Element} The technology tree UI.
 *
 * @see {@link TechTreeContent}
 * @see {@link RecommendedBuild}
 *
 * @component
 *
 * @category Components
 *
 * @example Component usage
 * ```tsx
 * <TechTreeWithData {...props} />
 * // renders sidebar with scroll area
 * ```
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

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "523px";

	const hasRecommendedBuilds =
		techTree?.recommended_builds && techTree.recommended_builds.length > 0;

	const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
	const scrollAreaHeight = hasRecommendedBuilds
		? `${baseHeight - 47}px`
		: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT;

	const scrollAreaStyle = {
		height: scrollAreaHeight,
		backgroundColor: "var(--accent-a3)",
		padding: "var(--space-4)",
		paddingRight: "var(--space-5)",
		borderRadius: "var(--radius-5)",
	};

	return (
		<>
			{isLarge ? (
				<>
					<ScrollArea
						type="always"
						scrollbars="vertical"
						className="main-app__tech-tree-sidebar shadow-sm"
						style={scrollAreaStyle}
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

TechTreeWithData.displayName = "TechTreeWithData";

/**
 * Main entry point for the technology tree feature.
 *
 * @remarks
 * It manages the high-level layout and data fetching for the available technologies
 * and their modules. Designed to be rendered within a `Suspense` boundary.
 *
 * @param {TechTreeProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology tree component.
 *
 * @see {@link TechTreeWithData}
 *
 * @component
 *
 * @category Components
 *
 * @example Component usage
 * ```tsx
 * <TechTree handleOptimize={optimizeFn} solving={false} gridTableTotalWidth={600} />
 * // renders technology tree UI
 * ```
 */
const TechTree: React.FC<TechTreeProps> = (props) => {
	return <TechTreeWithData {...props} />;
};

TechTree.displayName = "TechTree";

export default TechTree;
