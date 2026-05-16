/**
 * Singleton tooltip viewport management module.
 *
 * @remarks
 * This module provides the `TooltipManager` component, which renders the
 * application's unified tooltip instance based on global state.
 *
 * @see {@link TooltipManager}
 *
 * @category Components
 */

import React from "react";
import { Tooltip } from "@radix-ui/themes";

import { useTooltipState } from "@/utils/system/tooltipUtils";

/**
 * A singleton tooltip management component.
 *
 * @remarks
 * It listens to the global `TooltipState` and renders a single `radix-ui` tooltip
 * positioned dynamically over a "dummy" trigger element. This approach ensures
 * that only one tooltip is ever rendered in the DOM, maximizing performance
 * and preventing overlap, while still utilizing high-quality theme-aware styling.
 *
 * @returns {JSX.Element | null} The rendered singleton tooltip, or `null` if no active position is provided.
 *
 * @see {@link useTooltipState}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TooltipManager />
 * // renders active tooltip overlay
 * ```
 */
export const TooltipManager: React.FC = () => {
	const { isOpen, label, rect } = useTooltipState();

	if (!rect) return null;

	// Calculate position for the dummy trigger
	const style: React.CSSProperties = {
		height: rect.height,
		left: rect.left,
		pointerEvents: "none",
		position: "fixed",
		top: rect.top,
		width: rect.width,
		zIndex: 9999, // Ensure it's above other elements
	};

	return (
		<Tooltip className="font-medium!" content={label} open={isOpen}>
			<div aria-hidden="true" style={style} />
		</Tooltip>
	);
};
