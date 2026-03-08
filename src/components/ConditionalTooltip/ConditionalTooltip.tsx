import React, { memo, useCallback } from "react";

import { useTooltipActions } from "../../context/tooltip-utils";
import { isTouchDevice } from "../../utils/isTouchDevice";

/**
 * Props for the `ConditionalTooltip` component.
 */
interface ConditionalTooltipProps {
	/** The child element that will trigger the tooltip on hover. **Must be a valid React element.** */
	children: React.ReactNode;
	/** The text content to display within the tooltip. */
	label: string;
	/** The delay in milliseconds before the tooltip appears. Defaults to `500`. */
	delayDuration?: number;
}

/**
 * A specialized tooltip wrapper that intelligently suppresses tooltips on touch devices.
 *
 * This component uses a singleton tooltip pattern (via `useTooltipActions`) to
 * minimize DOM nodes and optimize performance. It memoizes its render to prevent
 * unnecessary updates and correctly forwards pointer events to its children.
 *
 * @param {ConditionalTooltipProps} props - Component properties.
 * @returns {JSX.Element} The child element, potentially enhanced with pointer listeners.
 *
 * @example
 * <ConditionalTooltip label="Helpful text">
 *   <button>Hover me</button>
 * </ConditionalTooltip>
 */
export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = memo(
	({ children, label, delayDuration = 500 }) => {
		const { show, hide } = useTooltipActions();
		const isTouch = isTouchDevice();

		/**
		 * Triggers the tooltip display when the pointer enters the child element.
		 *
		 * @param {React.PointerEvent} e - The pointer entry event.
		 */
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

		/**
		 * Requests to hide the tooltip when the pointer leaves the child element.
		 *
		 * @param {React.PointerEvent} e - The pointer leave event.
		 */
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
