// src/components/ConditionalTooltip/ConditionalTooltip.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip } from "@radix-ui/themes";

import { isTouchDevice } from "../../utils/isTouchDevice";

/**
 * @interface ConditionalTooltipProps
 * @property {React.ReactNode} children - The content to be wrapped by the tooltip.
 * @property {string} label - The text to display in the tooltip.
 * @property {number} [delayDuration=1000] - The duration from when the mouse enters the trigger until the tooltip opens.
 */
interface ConditionalTooltipProps {
	children: React.ReactNode;
	label: string;
	delayDuration?: number;
}

/**
 * A tooltip that is only displayed on non-touch devices and only rendered when hovered.
 *
 * @param {ConditionalTooltipProps} props - The props for the component.
 * @returns {React.ReactElement} - The rendered component.
 */
export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = ({
	children,
	label,
	delayDuration = 500,
}) => {
	const isTouch = isTouchDevice();
	const [shouldRenderTooltip, setShouldRenderTooltip] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Clear timeout on unmount or when dependencies change
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current);
			}
		};
	}, []);

	// Define handlers unconditionally
	const handleMouseEnter = useCallback(() => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
		hoverTimeoutRef.current = setTimeout(() => {
			setShouldRenderTooltip(true);
		}, delayDuration);
	}, [delayDuration]);

	const handleMouseLeave = useCallback(() => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
		}
		setShouldRenderTooltip(false);
	}, []);

	if (isTouch) {
		return <>{children}</>;
	}

	// --- Only for non-touch devices --- //
	// We need to wrap the children in a div to attach event handlers,
	// as React.cloneElement might not work reliably with all child types
	// and directly modifying props of children can be problematic.
	const wrappedChildren = (
		<div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="inline">
			{children}
		</div>
	);

	return (
		<>
			{shouldRenderTooltip && label ? (
				<Tooltip open={true} content={label}>
					{wrappedChildren}
				</Tooltip>
			) : (
				wrappedChildren
			)}
		</>
	);
};
