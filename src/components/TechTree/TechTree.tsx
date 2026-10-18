// src/components/TechTree/TechTree.tsx
import type { TechTree as TechTreeType } from "@/hooks/useTechTree/useTechTree";
import React, { lazy, Suspense } from "react";

import { useFetchTechTreeSuspense } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";

import { TechTreeContent } from "./TechTreeContent";
import { TechTreeRoot } from "./TechTreeRoot";

export { TechTreeSkeleton } from "./TechTreeSkeleton";

/**
 * Lazy-loaded component for the shared module selection dialog.
 *
 * @remarks
 * This dynamic import is critical for bundle-splitting. It extracts the heavy module
 * selection interface and its Radix UI components (Avatar, Checkbox, Tooltip, etc.)
 * from the critical startup chunk, reducing initial JS load size and TBT.
 */
const ModuleSelectionDialog = lazy(() =>
	import("@/components/ModuleSelectionDialog/ModuleSelectionDialog").then((m) => ({
		default: m.ModuleSelectionDialog,
	}))
);

/**
 * Properties for the {@link TechTree} component.
 */
interface TechTreeProps {
	/** Optional children to render instead of the default TechTreeContent. */
	children?: React.ReactNode;
	/** Optional pre-fetched technology tree data. */
	techTree?: TechTreeType;
}

/**
 * Composite component for rendering the technology tree.
 *
 * @remarks
 * The `TechTree` component acts as the high-level manager for display and interaction
 * within the technology panel. It renders child rows inside {@link TechTreeRoot} and
 * dynamically inserts {@link ModuleSelectionDialog} wrapped in `Suspense`.
 *
 * @param {TechTreeProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered technology tree layout.
 *
 * @see {@link ModuleSelectionDialog}
 * @see {@link ./TechTree.test.tsx Unit Tests}
 * @see {@link ./TechTree.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTree />
 * // renders technology tree list and shared module selection dialog
 * ```
 */
export const TechTree: React.FC<TechTreeProps> = ({ techTree: techTreeProp }) => {
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform) || "standard";
	const fetchedTechTree = useFetchTechTreeSuspense(selectedPlatform);
	const techTree = techTreeProp || fetchedTechTree;

	return (
		<>
			<TechTreeRoot>
				<TechTreeContent techTree={techTree} />
			</TechTreeRoot>
			<Suspense fallback={null}>
				<ModuleSelectionDialog />
			</Suspense>
		</>
	);
};
