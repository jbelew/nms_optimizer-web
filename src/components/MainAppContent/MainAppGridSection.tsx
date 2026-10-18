import React from "react";
import { Box } from "@radix-ui/themes";

import { GridTable } from "@/components/GridTable/GridTable";
import { useAppLayout } from "@/hooks/useAppLayout/useAppLayout";
import { useOptimizeStore } from "@/store/ui/uiStore";

import { ShipSelectionHeading } from "./ShipSelectionHeading";

/**
 * Component that renders the technology grid section, platform heading, and grid action buttons.
 *
 * @returns {JSX.Element} The rendered grid section.
 *
 * @see {@link ShipSelectionHeading}
 * @see {@link GridTable}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppGridSection />
 * // renders technology grid section and action buttons
 * ```
 */
export const MainAppGridSection: React.FC = () => {
	const { containerRef, gridTableRef } = useAppLayout();
	const solving = useOptimizeStore((state) => state.status.type === "solving");

	return (
		<Box
			className="main-app__grid-section relative"
			flexShrink={{ initial: "1", md: "0" }}
			ref={containerRef}
		>
			<ShipSelectionHeading />
			<GridTable ref={gridTableRef} solving={solving} />
		</Box>
	);
};
