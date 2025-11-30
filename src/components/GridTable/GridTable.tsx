// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import GridRow from "../GridRow/GridRow";
import GridShake from "../GridShake/GridShake";
import GridTableButtons from "../GridTableButtons/GridTableButtons";
import MessageSpinner from "../MessageSpinner/MessageSpinner";
import { TapInstructions } from "../TapInstructions";

/**
 * @interface GridTableProps
 * @property {(rowIndex: number) => void} activateRow - Function to activate a specific row in the grid.
 * @property {(rowIndex: number) => void} deActivateRow - Function to deactivate a specific row in the grid.
 * @property {boolean} solving - Indicates if the optimization process is currently running.
 * @property {number} progressPercent - The progress percentage of the optimization process.
 * @property {boolean} shared - Indicates if the grid is in a shared, read-only state.
 * @property {() => string} updateUrlForShare - Function that generates and returns a shareable URL for the current grid state.
 * @property {() => void} updateUrlForReset - Function that resets the grid to its default state.
 * @property {React.MutableRefObject<HTMLDivElement | null>} gridContainerRef - Ref to the main grid container element, used for scrolling.
 */
interface GridTableProps {
	solving: boolean;
	progressPercent: number;
	status?: string;
	shared: boolean; // This is isSharedGridProp, used for GridCell
}

/**
 * GridTableInternal component displays the main technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing rows.
 * It also handles shaking animations, displays a message spinner during optimization, and provides instructions for touch devices.
 *
 * @param {GridTableProps} props - The props for the GridTableInternal component.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the main grid table div.
 * @returns {JSX.Element} The rendered GridTableInternal component.
 */
const GridTableInternal = React.forwardRef<HTMLDivElement, GridTableProps>(
	({ solving, progressPercent, status }, ref) => {
		const { t } = useTranslation();
		const gridHeight = useGridStore((state) => state.grid.height);
		const gridWidth = useGridStore((state) => state.grid.width);
		const isLarge = useBreakpoint("1024px");
		const isTechTreeLoading = useTechTreeLoadingStore((state) => state.isLoading);

		// Memoize grid rows - must be called unconditionally
		const gridRows = useMemo(() => {
			if (!gridHeight) return [];
			return Array.from({ length: gridHeight }).map((_, rowIndex) => (
				<GridRow key={rowIndex} rowIndex={rowIndex} isLoading={isTechTreeLoading} />
			));
		}, [gridHeight, isTechTreeLoading]);

		// Early return if grid is not available. This is now safe as hooks are called above.
		if (!gridHeight || !gridWidth) {
			// Render a minimal div if ref is strictly needed for layout, or a loading message.
			return <div ref={ref} className="gridTable-empty"></div>;
		}

		// Determine column count for ARIA properties.
		// This assumes all data rows have the same number of cells.
		// Add 1 for the GridControlButtons column.
		const totalAriaColumnCount = gridWidth + 1;

		return (
			<GridShake duration={500}>
				<MessageSpinner
					isVisible={solving}
					useNMSFont={isTechTreeLoading}
					initialMessage={
						isTechTreeLoading ? t("techTree.loading") : t("gridTable.optimizing")
					}
					progressPercent={progressPercent}
					status={status}
				/>

				<div
					ref={ref}
					role="grid"
					aria-label="Technology Grid"
					aria-rowcount={gridHeight}
					aria-colcount={totalAriaColumnCount}
					className={`gridTable ${solving || isTechTreeLoading ? "opacity-25" : ""}`}
				>
					{gridRows}
				</div>

				{!isLarge && <TapInstructions />}

				<GridTableButtons />
			</GridShake>
		);
	}
);
GridTableInternal.displayName = "GridTable";

/**
 * A memoized version of the GridTableInternal component.
 */
export const GridTable = React.memo(GridTableInternal);
