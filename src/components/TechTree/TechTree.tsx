// src/components/TechTree/TechTree.tsx
import React, { Suspense, useMemo } from "react";
import { ScrollArea } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useFetchTechTreeSuspense } from "../../hooks/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";
import ErrorBoundary from "../ErrorBoundry/ErrorBoundry";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import RecommendedBuild from "../RecommendedBuild/RecommendedBuild";
import { TechTreeContent } from "./TechTreeContent";

// We need the colors once TechTree loads

// --- Type Definitions ---
interface TechTreeProps {
	handleOptimize: (tech: string) => Promise<void>;
	solving: boolean;
	gridContainerRef: React.RefObject<HTMLDivElement | null>;
	gridTableTotalWidth: number | undefined;
}

/**
 * A skeleton loader for the TechTreeComponent. It mimics the layout of the
 * final component to prevent Cumulative Layout Shift (CLS) during loading.
 */
const TechTreeSkeleton: React.FC = () => {
	const isLarge = useBreakpoint("1024px");
	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";
	const { t } = useTranslation();

	return (
		<>
			{isLarge ? (
				// Skeleton for large screens: A scroll area with a fixed height.
				<ScrollArea
					className="p-4 rounded-md shadow-md gridContainer__sidebar"
					style={{
						height: DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT,
						backgroundColor: "var(--gray-a2)",
					}}
				>
					<MessageSpinner
						isInset={true}
						isVisible={true}
						initialMessage={t("techTree.loading")}
					/>
				</ScrollArea>
			) : (
				// Skeleton for small screens: An aside with a fixed min-height.
				<aside className="flex-grow w-full pt-8" style={{ minHeight: "50vh" }}>
					<MessageSpinner isInset={false} isVisible={true} initialMessage={""} />
				</aside>
			)}
		</>
	);
};

/**
 * This component fetches the tech tree data and renders the complete layout.
 * It's designed to be wrapped in a Suspense boundary. When it suspends,
 * the entire component (including the RecommendedBuild button) is replaced
 * by the Suspense fallback, solving the stale UI issue.
 *
 * @param {TechTreeProps} props - The component props.
 * @param {(tech: string) => Promise<void>} props.handleOptimize - Function to call when optimizing a tech.
 * @param {boolean} props.solving - Indicates if the optimizer is currently solving.
 * @param {React.RefObject<HTMLDivElement | null>} props.gridContainerRef - Ref to the grid container for scroll management.
 * @param {number | undefined} props.gridTableTotalWidth - The total width of the grid table, used for layout adjustments on smaller screens.
 */
const TechTreeWithData: React.FC<TechTreeProps> = ({
	handleOptimize,
	solving,
	gridContainerRef,
	gridTableTotalWidth,
}) => {
	const isLarge = useBreakpoint("1024px");
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const techTree = useFetchTechTreeSuspense(selectedShipType);

	const DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT = "524px";

	const hasRecommendedBuilds =
		techTree.recommended_builds && techTree.recommended_builds.length > 0;

	const scrollAreaHeight = useMemo(() => {
		const baseHeight = parseInt(DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT, 10);
		if (hasRecommendedBuilds) {
			// Adjust height to account for the RecommendedBuild button
			return `${baseHeight - 52}px`;
		}
		return DEFAULT_TECH_TREE_SCROLL_AREA_HEIGHT;
	}, [hasRecommendedBuilds]);

	return (
		<>
			{isLarge ? (
				<>
					<ScrollArea
						className="p-4 rounded-md shadow-md gridContainer__sidebar"
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
				<div style={{ width: gridTableTotalWidth }}>
					<div className="mt-4 sm:mt-5">
						{hasRecommendedBuilds && (
							<RecommendedBuild
								techTree={techTree}
								gridContainerRef={gridContainerRef}
								isLarge={isLarge}
							/>
						)}
					</div>
					<div className={`${!hasRecommendedBuilds ? "mt-8" : "mt-4"}`}>
						<TechTreeContent
							handleOptimize={handleOptimize}
							solving={solving}
							techTree={techTree}
							selectedShipType={selectedShipType}
						/>
					</div>
				</div>
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
 */
const TechTreeComponent: React.FC<TechTreeProps> = (props) => {
	return (
		<ErrorBoundary>
			<Suspense fallback={<TechTreeSkeleton />}>
				<TechTreeWithData {...props} />
			</Suspense>
		</ErrorBoundary>
	);
};

export default TechTreeComponent;
