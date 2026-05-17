import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React, { useState } from "react";
import { Box, Flex, ScrollArea, Skeleton } from "@radix-ui/themes";

import { MessageSpinner } from "@/components/MessageSpinner/messageSpinner";
import RecommendedBuild from "@/components/RecommendedBuild/RecommendedBuild";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import { TechTreeContext } from "./createTechTreeContext";
import { TechTreeContent } from "./TechTreeContent";

/**
 * A skeleton component that displays a loading state for the tech tree.
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
 */
interface TechTreeProps {
	/** Optional children to render instead of the default TechTreeContent. */
	children?: React.ReactNode;
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
 */
const TechTreeWithData: React.FC<TechTreeProps> = ({
	children,
	handleOptimize,
	solving,
	techTree: techTreeProp,
}) => {
	const isLarge = useBreakpoint("1024px");
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedShipType);
	const techTree = techTreeProp || fetchedTechTree;
	const isGridFull = useGridStore((state) => state._isGridFull);

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

	const contextValue = React.useMemo(
		() => ({ handleOptimize, isGridFull, solving }),
		[handleOptimize, isGridFull, solving]
	);

	const content = children || <TechTreeContent techTree={techTree} />;

	return (
		<TechTreeContext.Provider value={contextValue}>
			{isLarge ? (
				<>
					<ScrollArea
						className="main-app__tech-tree-sidebar shadow-sm"
						scrollbars="vertical"
						style={scrollAreaStyle}
						type="always"
					>
						{content}
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
					<Box mt="4">{content}</Box>
				</>
			)}
		</TechTreeContext.Provider>
	);
};

TechTreeWithData.displayName = "TechTreeWithData";

/**
 * Main entry point for the technology tree feature.
 */
const TechTree: React.FC<TechTreeProps> = (props) => {
	return <TechTreeWithData {...props} />;
};

TechTree.displayName = "TechTree";

export default TechTree;
