import "./GridTable.scss";

import React from "react";
import { useTranslation } from "react-i18next";

import { useGridStore } from "@/store/grid/gridStore";

/**
 * The actual grid DOM element with accessibility attributes.
 */
export const GridTableGrid: React.FC<{
	children: React.ReactNode;
	gridHeight: number;
	gridRef: React.Ref<HTMLDivElement>;
	solving: boolean;
}> = ({ children, gridHeight, gridRef, solving }) => {
	const { t } = useTranslation();
	const gridWidth = useGridStore((state) => state.grid.width);
	const deferredWidth = React.useDeferredValue(gridWidth);
	const totalAriaColumnCount = deferredWidth + 1;

	return (
		<div
			aria-colcount={totalAriaColumnCount}
			aria-label={t("gridTable.ariaLabel") ?? ""}
			aria-rowcount={gridHeight}
			className={`gridTable ${solving ? "opacity-25" : ""}`}
			ref={gridRef}
			role="grid"
		>
			{children}
		</div>
	);
};
