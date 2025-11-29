// src/components/GridTable/GridTable.tsx
import "./GridTable.scss";

import React, { useMemo } from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useGridStore } from "../../store/GridStore";
import { useTechTreeLoadingStore } from "../../store/TechTreeLoadingStore";
import { isTouchDevice } from "../../utils/isTouchDevice";
import GridRow from "../GridRow/GridRow";
import GridShake from "../GridShake/GridShake";
import GridTableButtons from "../GridTableButtons/GridTableButtons";
import MessageSpinner from "../MessageSpinner/MessageSpinner";

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
		const superchargedFixed = useGridStore((state) => state.superchargedFixed);
		const isLarge = useBreakpoint("1024px");
		const isTouch = isTouchDevice();
		const { tutorialFinished } = useDialog();
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
				{!isLarge && <Separator size="4" orientation="horizontal" decorative mb="3" />}

				<MessageSpinner
					// isVisible={solving || isTechTreeLoading}
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
					{!isLarge && (
						<div role="row">
							<div
								role="gridcell"
								aria-colspan={totalAriaColumnCount}
								className="col-span-full mt-1 text-sm"
							>
								{isTouch && !superchargedFixed && !tutorialFinished && (
									<Callout.Root className="mt-2 mb-4" size="1">
										<Callout.Icon>
											<InfoCircledIcon />
										</Callout.Icon>
										<Callout.Text>
											{t("gridTable.tapInstructions")}
										</Callout.Text>
									</Callout.Root>
								)}
								<Separator size="4" orientation="horizontal" mt="1" decorative />
							</div>
						</div>
					)}

					<div role="row">
						<GridTableButtons />
					</div>
				</div>
			</GridShake>
		);
	}
);
GridTableInternal.displayName = "GridTable";

/**
 * A memoized version of the GridTableInternal component.
 */
export const GridTable = React.memo(GridTableInternal);
