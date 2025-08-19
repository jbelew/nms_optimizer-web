// src/components/GridTable/GridTable.tsx
import "./GridTable.css";

import React, { useMemo } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import GridCell from "../GridCell/GridCell";
import GridControlButtons from "../GridControlButtons/GridControlButtons";
import ShakingWrapper from "../GridShake/GridShake";
import GridTableButtons from "../GridTableButtons/GridTableButtons";
import MessageSpinner from "../MessageSpinner/MessageSpinner";

interface GridTableProps {
	activateRow: (rowIndex: number) => void;
	deActivateRow: (rowIndex: number) => void;
	solving: boolean;
	shared: boolean; // This is isSharedGridProp, used for GridCell
	updateUrlForShare: () => string;
	updateUrlForReset: () => void;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

/**
 * GridTableInternal component displays the main technology grid.
 * It renders individual `GridCell` components and `GridControlButtons` for managing rows.
 * It also handles shaking animations, displays a message spinner during optimization, and provides instructions for touch devices.
 *
 * @param {GridTableProps} props - The props for the GridTableInternal component.
 * @param {(rowIndex: number) => void} props.activateRow - Callback to activate a specific row.
 * @param {(rowIndex: number) => void} props.deActivateRow - Callback to deactivate a specific row.
 * @param {boolean} props.solving - Indicates if an optimization calculation is currently in progress.
 * @param {boolean} props.shared - Indicates if the grid is in a shared (read-only) state.
 * @param {() => string} props.updateUrlForShare - Function to update the URL for sharing the grid state.
 * @param {() => void} props.updateUrlForReset - Function to update the URL for resetting the grid state.
 * @param {React.MutableRefObject<HTMLDivElement | null>} props.gridContainerRef - Ref to the grid container HTML element.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the main grid table div.
 * @returns {JSX.Element} The rendered GridTableInternal component.
 */
const GridTableInternal = React.forwardRef<HTMLDivElement, GridTableProps>(
	(
		{
			activateRow,
			deActivateRow,
			solving,
			shared: isSharedGridProp,
			updateUrlForShare,
			updateUrlForReset,
			gridContainerRef,
		},
		ref
	) => {
		const { shaking } = useShakeStore();
		const { t } = useTranslation();
		const grid = useGridStore((state) => state.grid);
		const hasModulesInGrid = useGridStore((state) => state.selectHasModulesInGrid());
		const gridFixed = useGridStore((state) => state.gridFixed);
		const superchargedFixed = useGridStore((state) => state.superchargedFixed);
		const isLarge = useBreakpoint("1024px");
		const isTouchDevice =
			typeof window !== "undefined" &&
			("ontouchstart" in window || navigator.maxTouchPoints > 0);
		const { tutorialFinished } = useDialog();

		// Calculate derived values from the grid.
		const { firstInactiveRowIndex, lastActiveRowIndex } = useMemo(
			() => {
				if (!grid || !grid.cells) {
					// Return default values if grid is not available
					return { firstInactiveRowIndex: -1, lastActiveRowIndex: -1 };
				}
				return {
					firstInactiveRowIndex: grid.cells.findIndex((r) =>
						r.every((cell) => !cell.active)
					),
					lastActiveRowIndex: grid.cells
						.map((r) => r.some((cell) => cell.active))
						.lastIndexOf(true),
				};
			},
			[grid] // Depend on the whole grid object for safety
		);

		// Early return if grid is not available. This is now safe as hooks are called above.
		if (!grid || !grid.cells) {
			// Render a minimal div if ref is strictly needed for layout, or a loading message.
			return <div ref={ref} className="gridTable-empty"></div>;
		}

		// Determine column count for ARIA properties.
		// This assumes all data rows have the same number of cells.
		// Add 1 for the GridControlButtons column.
		const dataCellColumnCount = grid.cells[0]?.length ?? 0;
		const totalAriaColumnCount = dataCellColumnCount + 1;

		return (
			<ShakingWrapper shaking={shaking} duration={500}>
				<MessageSpinner
					isVisible={solving}
					showRandomMessages={true}
					initialMessage={t("gridTable.optimizing")}
				/>

				{!isLarge && (
					<Separator
						size="4"
						color="cyan"
						orientation="horizontal"
						decorative
						className="mb-4"
					/>
				)}

				<div
					ref={ref}
					role="grid"
					aria-label="Technology Grid"
					aria-rowcount={grid.cells.length}
					aria-colcount={totalAriaColumnCount}
					className={`gridTable ${solving ? "opacity-50" : ""}`}
				>
					{grid.cells.map((row, rowIndex) => (
						<div role="row" key={rowIndex} aria-rowindex={rowIndex + 1}>
							{row.map((_, columnIndex) => (
								<GridCell
									key={`${rowIndex}-${columnIndex}`}
									rowIndex={rowIndex}
									columnIndex={columnIndex} // Use the renamed prop
									isSharedGrid={isSharedGridProp}
								/>
							))}
							{/* Wrap GridControlButtons in a div with role="gridcell" */}
							<div
								role="gridcell"
								className="w-[24px] sm:w-[32px]"
								aria-colindex={totalAriaColumnCount}
							>
								<GridControlButtons
									rowIndex={rowIndex}
									activateRow={activateRow}
									deActivateRow={deActivateRow}
									hasModulesInGrid={hasModulesInGrid}
									// Use pre-calculated indices for these checks
									isFirstInactiveRow={
										row.every((cell) => !cell.active) &&
										rowIndex === firstInactiveRowIndex
									}
									isLastActiveRow={
										row.some((cell) => cell.active) &&
										rowIndex === lastActiveRowIndex &&
										rowIndex >= grid.cells.length - 3 // Keep this specific condition if it's intended
									}
									gridFixed={gridFixed}
								/>
							</div>
						</div>
					))}
					{!isLarge && (
						<div role="row">
							<div className="col-span-full mt-1 text-sm">
								{isTouchDevice && !superchargedFixed && !tutorialFinished && (
									<Callout.Root className="mt-2 mb-4" size="1">
										<Callout.Icon>
											<InfoCircledIcon />
										</Callout.Icon>
										<Callout.Text>
											{t("gridTable.tapInstructions")}
										</Callout.Text>
									</Callout.Root>
								)}
								<Separator
									size="4"
									color="cyan"
									orientation="horizontal"
									className="mt-2"
									decorative
								/>
							</div>
						</div>
					)}
					<div role="row">
						<GridTableButtons
							solving={solving}
							updateUrlForShare={updateUrlForShare}
							updateUrlForReset={updateUrlForReset}
							gridContainerRef={gridContainerRef}
						/>
					</div>
				</div>
			</ShakingWrapper>
		);
	}
);
GridTableInternal.displayName = "GridTable";

export const GridTable = React.memo(GridTableInternal);
