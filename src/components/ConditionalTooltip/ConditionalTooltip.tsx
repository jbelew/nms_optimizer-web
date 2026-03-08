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
	delayDuration = 500,
}) => {
	const [isHovered, setIsHovered] = React.useState(false);
	const isTouch = isTouchDevice();

	if (isTouch) {
		return <>{children}</>;
	}

	// Attach hover listeners directly to the child to avoid a wrapper with display: contents
	const trigger = React.isValidElement(children)
		? React.cloneElement(
				children as React.ReactElement,
				{
					onPointerEnter: (e: React.PointerEvent) => {
						setIsHovered(true);

						const props = children.props as {
							onPointerEnter?: React.PointerEventHandler;
						};
						const originalOnPointerEnter = props.onPointerEnter;

						if (typeof originalOnPointerEnter === "function") {
							originalOnPointerEnter(e);
						}
					},
					onPointerLeave: (e: React.PointerEvent) => {
						setIsHovered(false);

						const props = children.props as {
							onPointerLeave?: React.PointerEventHandler;
						};
						const originalOnPointerLeave = props.onPointerLeave;

						if (typeof originalOnPointerLeave === "function") {
							originalOnPointerLeave(e);
						}
					},
				} as React.HTMLAttributes<HTMLElement>
			)
		: children;

	return isHovered ? (
		<Tooltip delayDuration={delayDuration} content={label} className="font-medium!">
			{trigger}
		</Tooltip>
	) : (
		trigger
	);
};
