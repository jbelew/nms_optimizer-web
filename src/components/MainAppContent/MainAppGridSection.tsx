import React from "react";
import { Box } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import {
	GridProvider,
	GridTableButtons,
	GridTableContent,
	GridTableGrid,
	GridTableRoot,
} from "@/components/GridTable/GridTable";
import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechTreeLoadingStore } from "@/store/tech/techTreeLoadingStore";

import { SharedBuildCallout } from "./SharedBuildCallout";
import { ShipSelectionHeading } from "./ShipSelectionHeading";
import { useMainAppGlobal, useMainAppLayout, useMainAppOptimization } from "./useMainAppContext";

/**
 * Component that renders the grid section.
 */
export const MainAppGridSection: React.FC = () => {
	const { t } = useTranslation();
	const { containerRef, gridTableRef } = useMainAppLayout();
	const { isSharedGrid } = useMainAppGlobal();
	const { progressPercent, solving } = useMainAppOptimization();
	const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);
	const gridHeight = useGridStore((state) => state.grid.height);

	return (
		<Box
			className="main-app__grid-section relative"
			flexShrink={{ initial: "1", md: "0" }}
			ref={containerRef}
		>
			{isSharedGrid && <SharedBuildCallout />}

			{!isSharedGrid && (
				<MessageSpinner
					initialMessage={
						isTechTreeLoading ? t("techTree.loading") : t("gridTable.optimizing")
					}
					isVisible={solving}
					progressPercent={progressPercent}
					showProgress={!isTechTreeLoading}
				/>
			)}

			<ShipSelectionHeading />

			<GridProvider gridRef={gridTableRef as React.RefObject<HTMLDivElement | null>}>
				<GridTableRoot>
					<GridTableGrid gridHeight={gridHeight} gridRef={gridTableRef} solving={solving}>
						<GridTableContent gridHeight={gridHeight} />
					</GridTableGrid>
					<GridTableButtons solving={solving} />
				</GridTableRoot>
			</GridProvider>
		</Box>
	);
};
