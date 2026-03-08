import React from "react";
import { Tooltip } from "@radix-ui/themes";

import { useTooltipState } from "../../context/TooltipContext";

/**
 * TooltipManager renders a single singleton tooltip instance.
 * It uses the high-level @radix-ui/themes Tooltip for perfect styling
 * but controls its lifecycle manually via the singleton context.
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
