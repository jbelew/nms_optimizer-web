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

import { useTooltipState } from "../../context/tooltip-utils";

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
	const { label, rect, isOpen } = useTooltipState();

	if (!rect) return null;

	// Calculate position for the dummy trigger
	const style: React.CSSProperties = {
		position: "fixed",
		top: rect.top,
		left: rect.left,
		width: rect.width,
		height: rect.height,
		pointerEvents: "none",
		zIndex: 9999, // Ensure it's above other elements
	};

	return (
		<Tooltip open={isOpen} content={label} className="font-medium!">
			<div style={style} aria-hidden="true" />
		</Tooltip>
	);
};
