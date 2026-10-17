import React from "react";
import { Box } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import GridShake from "@/components/GridShake/GridShake";
import {
	GridTableButtons,
	GridTableContent,
	GridTableGrid,
} from "@/components/GridTable/GridTable";
import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { useAppLayout } from "@/hooks/useAppLayout/useAppLayout";
import { useGridStore } from "@/store/grid/gridStore";
import { useOptimizeStore } from "@/store/ui/uiStore";

import { ShipSelectionHeading } from "./ShipSelectionHeading";

/**
 * Component that renders the technology grid section, platform heading, and grid action buttons.
 *
 * @returns {JSX.Element} The rendered grid section.
 *
 * @see {@link ShipSelectionHeading}
 * @see {@link GridTableButtons}
 * @see {@link ./MainAppLayout.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <MainAppGridSection />
 * ```
 */
export const MainAppGridSection: React.FC = () => {
	const { t } = useTranslation();
	const { containerRef, gridTableRef } = useAppLayout();
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const gridHeight = useGridStore((state) => state.grid.height);
	const solving = useOptimizeStore((state) => state.status.type === "solving");
	const progressPercent = useOptimizeStore((state) =>
		state.status.type === "solving" ? state.status.progress : 0
	);

	return (
		<Box
			className="main-app__grid-section relative"
			flexShrink={{ initial: "1", md: "0" }}
			ref={containerRef}
		>
			<ShipSelectionHeading />

			<GridShake duration={500}>
				<div className="relative">
					{!isSharedGrid && (
						<MessageSpinner
							initialMessage={t("gridTable.optimizing")}
							isVisible={solving}
							progressPercent={progressPercent}
							showProgress={true}
						/>
					)}
					<GridTableGrid gridHeight={gridHeight} gridRef={gridTableRef} solving={solving}>
						<GridTableContent gridHeight={gridHeight} />
					</GridTableGrid>
				</div>
				<GridTableButtons solving={solving} />
			</GridShake>
		</Box>
	);
};
