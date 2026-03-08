import React, { memo, useCallback } from "react";

import { useTooltipActions } from "../../context/TooltipContext";
import { isTouchDevice } from "../../utils/isTouchDevice";

/**
 * @interface ConditionalTooltipProps
 * @property {React.ReactNode} children - The content to be wrapped by the tooltip.
 * @property {string} label - The text to display in the tooltip.
 * @property {number} [delayDuration=500] - The duration from when the mouse enters the trigger until the tooltip opens.
 */
interface ConditionalTooltipProps {
	children: React.ReactNode;
	label: string;
	delayDuration?: number;
}

/**
 * A tooltip that is only displayed on non-touch devices using an optimized singleton pattern.
 * This component is memoized and depends only on stable tooltip actions to prevent re-renders.
 */
export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = memo(
	({ children, label, delayDuration = 500 }) => {
		const { show, hide } = useTooltipActions();
		const isTouch = isTouchDevice();

		const handlePointerEnter = useCallback(
			(e: React.PointerEvent) => {
				const rect = e.currentTarget.getBoundingClientRect();
				show(label, rect, delayDuration);

				const props = (children as React.ReactElement).props as {
					onPointerEnter?: React.PointerEventHandler;
				};

				if (typeof props.onPointerEnter === "function") {
					props.onPointerEnter(e);
				}
			},
			[children, label, delayDuration, show]
		);

		const handlePointerLeave = useCallback(
			(e: React.PointerEvent) => {
				hide();

				const props = (children as React.ReactElement).props as {
					onPointerLeave?: React.PointerEventHandler;
				};

				if (typeof props.onPointerLeave === "function") {
					props.onPointerLeave(e);
				}
			},
			[children, hide]
		);

		if (isTouch) {
			return <>{children}</>;
		}

		// Attach hover listeners directly to the child to avoid extra wrappers
		return React.isValidElement(children)
			? React.cloneElement(
					children as React.ReactElement,
					{
						onPointerEnter: handlePointerEnter,
						onPointerLeave: handlePointerLeave,
					} as React.HTMLAttributes<HTMLElement>
				)
			: (children as unknown as React.ReactElement);
	}
);

ConditionalTooltip.displayName = "ConditionalTooltip";
