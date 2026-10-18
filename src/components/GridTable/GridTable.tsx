/**
 * Interactive Inventory Grid table component module.
 *
 * @remarks
 * Consolidates the grid DOM container (`role="grid"`), row and cell rendering,
 * row-level {@link GridControlButtons}, solve progress {@link MessageSpinner},
 * {@link GridShake} validation animation wrapper, and {@link GridTableButtons}
 * action bar into a single component with unified store subscriptions.
 *
 * @see {@link ./GridTable.test.tsx Unit Tests}
 * @see {@link ./GridTable.stories.tsx Storybook}
 *
 * @module components/GridTable/GridTable
 */

import "./GridTable.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import GridCell from "@/components/GridCell/GridCell";
import GridControlButtons from "@/components/GridControlButtons/GridControlButtons";
import GridShake from "@/components/GridShake/GridShake";
import GridTableButtons from "@/components/GridTableButtons/GridTableButtons";
import { MessageSpinner } from "@/components/MessageSpinner/MessageSpinner";
import { useGridStore } from "@/store/grid/gridStore";
import { useOptimizeStore } from "@/store/ui/uiStore";

/**
 * Properties for the {@link GridTable} component.
 *
 * @category Components
 */
export interface GridTableProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * Renders the interactive Inventory Grid, solve progress overlay, row controls, and grid action buttons.
 *
 * @remarks
 * Defers `grid.height` and `grid.width` once for the entire table so platform switches
 * and row/column updates do not duplicate subscriptions across wrapper and row subcomponents.
 *
 * @param {GridTableProps} props - Component properties.
 * @param {boolean} props.solving - Whether an optimization solve is currently active.
 * @param {React.ForwardedRef<HTMLDivElement>} ref - Forwarded ref to the `[role="grid"]` DOM element.
 *
 * @returns {JSX.Element} The rendered grid table and action controls.
 *
 * @see {@link GridCell}
 * @see {@link GridControlButtons}
 * @see {@link GridTableButtons}
 * @see {@link MessageSpinner}
 * @see {@link ./GridTable.test.tsx Unit Tests}
 * @see {@link ./GridTable.stories.tsx Storybook}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <GridTable solving={false} />
 * // renders technology grid table and action buttons
 * ```
 */
export const GridTable = React.forwardRef<HTMLDivElement, GridTableProps>(({ solving }, ref) => {
	const { t } = useTranslation();
	const gridHeight = useGridStore((state) => state.grid.height);
	const gridWidth = useGridStore((state) => state.grid.width);
	const isSharedGrid = useGridStore((state) => state.isSharedGrid);
	const progressPercent = useOptimizeStore((state) =>
		state.status.type === "solving" ? state.status.progress : 0
	);

	const deferredHeight = React.useDeferredValue(gridHeight);
	const deferredWidth = React.useDeferredValue(gridWidth);

	if (!deferredHeight || !deferredWidth) {
		return <div className="gridTable-empty" ref={ref}></div>;
	}

	const totalAriaColumnCount = deferredWidth + 1;

	return (
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
				<div
					aria-colcount={totalAriaColumnCount}
					aria-label={t("gridTable.ariaLabel") ?? ""}
					aria-rowcount={deferredHeight}
					className={`gridTable ${solving ? "opacity-25" : ""}`}
					ref={ref}
					role="grid"
				>
					{Array.from({ length: deferredHeight }).map((_, rowIndex) => (
						<div
							aria-rowindex={rowIndex + 1}
							className="gridTable__row"
							key={rowIndex}
							role="row"
						>
							{Array.from({ length: deferredWidth }).map((__, columnIndex) => (
								<GridCell
									columnIndex={columnIndex}
									key={`${rowIndex}-${columnIndex}`}
									rowIndex={rowIndex}
								/>
							))}
							<div
								aria-colindex={totalAriaColumnCount}
								className="w-6"
								role="gridcell"
							>
								<GridControlButtons rowIndex={rowIndex} />
							</div>
						</div>
					))}
				</div>
			</div>
			<GridTableButtons solving={solving} />
		</GridShake>
	);
});

GridTable.displayName = "GridTable";
