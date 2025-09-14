// src/components/ConditionalTooltip/ConditionalTooltip.tsx
import React from "react";
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
 * A tooltip that is only displayed on non-touch devices.
 *
 * @param {ConditionalTooltipProps} props - The props for the component.
 * @returns {React.ReactElement} - The rendered component.
 */
export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = ({
	children,
	label,
	delayDuration = 1000,
}) => {
	const isTouch = isTouchDevice();

	if (isTouch) {
		return <>{children}</>;
	}

	return (
		<Tooltip delayDuration={delayDuration} content={label}>
			{children}
		</Tooltip>
	);
};
