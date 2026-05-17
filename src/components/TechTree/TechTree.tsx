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

import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React, { useState } from "react";
import { Box, Flex, ScrollArea, Skeleton } from "@radix-ui/themes";

import { MessageSpinner } from "@/components/MessageSpinner/messageSpinner";
import RecommendedBuild from "@/components/RecommendedBuild/RecommendedBuild";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";

import { TechTreeContent } from "./TechTreeContent";

/**
 * A skeleton component that displays a loading state for the tech tree.
 *
 * @remarks
 * Generates a randomized set of loading placeholders to simulate the structure
 * of the technology list. This provides a smoother visual transition while
 * data is being fetched.
 *
 * @returns {JSX.Element} The rendered loading state.
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <SuspenseSkeleton />
 * // mounts Component
 * ```
 */
const SuspenseSkeleton = () => {
	const [skeletons] = useState(() => {
		const totalSections = 3 + Math.floor(Math.random() * 3); // 3–5 sections
		const elements: React.JSX.Element[] = [];

		for (let i = 0; i < totalSections; i++) {
			elements.push(
				<Skeleton
					height="44px"
					key={`big-${i}`}
					mt={i === 0 ? "0" : "4"} // first element mt="0", others mt="4"
					width="100%"
				/>
			);

			const smallCount = 1 + Math.floor(Math.random() * 8);

			for (let j = 0; j < smallCount; j++) {
				elements.push(<Skeleton height="32px" key={`small-${i}-${j}`} width="100%" />);
			}
		}

		return elements;
	});

	return (
		<Flex direction="column" gapY="2">
			{skeletons}
		</Flex>
	);
};

/**
 * A responsive skeleton component that displays a loading state for the tech tree.
 *
 * @remarks
 * Adapts its layout based on the viewport size, showing a scrollable message
 * spinner on large screens and a detailed skeleton on smaller ones.
 *
 * @returns {JSX.Element} The rendered skeleton component.
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeSkeleton />
 * // mounts Component
 * ```
 */
export const TechTreeSkeleton: React.FC = () => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "523px";

	return (
		<>
			{isLarge ? (
				<ScrollArea
					className="main-app__tech-tree-sidebar shadow-sm"
					style={{
						borderRadius: "var(--radius-5)",
						height: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT,
						padding: "var(--space-5)",
					}}
				>
					<MessageSpinner initialMessage="Loading Tech" isInlay={true} isVisible={true} />
				</ScrollArea>
			) : (
				<aside className="w-full grow pt-8" style={{ minHeight: "50vh" }}>
					<SuspenseSkeleton />
				</aside>
			)}
		</>
	);
};

/**
 * Props for the {@link TechTree} and {@link TechTreeWithData} components.
 *
 * @remarks
 * Defines the necessary data and handlers for rendering the technology sidebar,
 * including optimization controls and optional pre-fetched tree data.
 *
 * @category Components
 */
interface TechTreeProps {
	/** Total width of the grid table, used for responsive layout matching. */
	gridTableTotalWidth: number | undefined;
	/** Function to trigger a solver run for a specific technology. **Must be asynchronous.** */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * A data-aware component that renders the technology list and recommended builds.
 *
 * @remarks
 * Orchestrates the rendering of categorized technology modules and recommended
 * equipment builds. It utilizes {@link useFetchTechTreeSuspense} for data fetching
 * when pre-fetched data is not provided.
 *
 * @param {TechTreeProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology tree.
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeWithData handleOptimize={optimizeFn} solving={false} gridTableTotalWidth={500} />
 * // mounts Component
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
		borderRadius: "var(--radius-5)",
		height: scrollAreaHeight,
		padding: "var(--space-4)",
		paddingRight: "var(--space-5)",
	};

	return (
		<>
			{isLarge ? (
				<>
					<ScrollArea
						className="main-app__tech-tree-sidebar shadow-sm"
						scrollbars="vertical"
						style={scrollAreaStyle}
						type="always"
					>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
						/>
					</ScrollArea>

					{hasRecommendedBuilds && (
						<RecommendedBuild isLarge={isLarge} techTree={techTree} />
					)}
				</>
			) : (
				<>
					<Box mt="4">
						{hasRecommendedBuilds && (
							<RecommendedBuild isLarge={isLarge} techTree={techTree} />
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
 * @see {@link TechTreeProps}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTree handleOptimize={optimizeFn} solving={false} gridTableTotalWidth={600} />
 * // mounts Component
 * ```
 */
const TechTree: React.FC<TechTreeProps> = (props) => {
	return <TechTreeWithData {...props} />;
};

TechTree.displayName = "TechTree";

export default TechTree;
