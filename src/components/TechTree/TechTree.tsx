// src/components/TechTree/TechTree.tsx
import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React, { lazy, Suspense } from "react";

import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";

import { TechTreeList } from "./TechTreeList";
import { TechTreeProvider } from "./TechTreeProvider";
import { TechTreeRecommended } from "./TechTreeRecommended";
import { TechTreeRoot } from "./TechTreeRoot";

export { TechTreeList } from "./TechTreeList";

export { TechTreeProvider } from "./TechTreeProvider";

export { TechTreeRecommended } from "./TechTreeRecommended";

export { TechTreeRoot } from "./TechTreeRoot";

export { TechTreeSkeleton } from "./TechTreeSkeleton";

/**
 * Lazy-loaded component for the shared module selection dialog.
 *
 * @remarks
 * This dynamic import is critical for bundle-splitting. It extracts the heavy module
 * selection interface and its Radix UI components (Avatar, Checkbox, Tooltip, etc.)
 * from the critical startup chunk, reducing initial JS load size and TBT.
 */
const SharedModuleSelectionDialog = lazy(() =>
	import("@/components/ModuleSelectionDialog/SharedModuleSelectionDialog").then((m) => ({
		default: m.SharedModuleSelectionDialog,
	}))
);

/**
 * Properties for the {@link TechTree} component.
 */
interface TechTreeProps {
	/** Optional children to render instead of the default TechTreeContent. */
	children?: React.ReactNode;
	/** Function to trigger a solver run for a specific technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Whether an optimization solve is currently in progress. */
	solving: boolean;
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * Composite component for rendering the technology tree.
 *
 * @remarks
 * The `TechTree` component acts as the high-level manager for display and interaction
 * within the technology panel. It leverages {@link TechTreeProvider} to pass core optimization states,
 * renders child rows, and dynamically inserts {@link SharedModuleSelectionDialog} wrapped in `Suspense`.
 *
 * @param {TechTreeProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology tree layout.
 *
 * @see {@link TechTreeProvider}
 * @see {@link SharedModuleSelectionDialog}
 * @see {@link ./TechTree.test.tsx Unit Tests}
 * @see {@link ./TechTree.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 */
export const TechTree: React.FC<TechTreeProps> = ({
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
			<Suspense fallback={null}>
				<SharedModuleSelectionDialog />
			</Suspense>
		</TechTreeProvider>
	);
};
