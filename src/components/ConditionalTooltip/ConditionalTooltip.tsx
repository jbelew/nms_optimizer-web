/**
 * Specialized tooltip component with device awareness.
 *
 * @remarks
 * This module provides the `ConditionalTooltip` component, which optimizes the
 * user experience by suppressing tooltips on touch devices while maintaining
 * full accessibility on pointer-driven hardware.
 *
 * @see {@link ConditionalTooltip}
 * @see {@link ./ConditionalTooltip.test.tsx Unit Tests}
 *
 * @category Components
 */

import React, { memo, useCallback } from "react";

import { isTouchDevice } from "@/utils/browser/environment";
import { useTooltipActions } from "@/utils/system/tooltipUtils";

/**
 * Props for the `ConditionalTooltip` component.
 */
interface ConditionalTooltipProps {
	/** The child element that will trigger the tooltip on hover. **Must be a valid React element.** */
	children: React.ReactNode;
	/** The delay in milliseconds before the tooltip appears. Defaults to `500`. */
	delayDuration?: number;
	/** The text content to display within the tooltip. */
	label: string;
}

/**
 * A specialized tooltip wrapper that intelligently suppresses tooltips on touch devices.
 *
 * @remarks
 * This component uses a singleton tooltip pattern (via `useTooltipActions`) to
 * minimize DOM nodes and optimize performance. It memoizes its render to prevent
 * unnecessary updates and correctly forwards pointer events to its children.
 *
 * @param {ConditionalTooltipProps} props - Component properties.
 *
 * @returns {JSX.Element} The child element, potentially enhanced with pointer listeners.
 *
 * @see {@link useTooltipActions}
 * @see {@link isTouchDevice}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ConditionalTooltip label="Helpful text">
 *   <button>Hover me</button>
 * </ConditionalTooltip>
 * // renders Tooltip on hover (desktop) or just button (mobile)
 * ```
 */
export const ConditionalTooltip: React.FC<ConditionalTooltipProps> = memo(
	({ children, delayDuration = 500, label }) => {
		const { hide, show } = useTooltipActions();
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

		/**
		 * Requests to hide the tooltip when the child element is clicked.
		 *
		 * @param {React.MouseEvent} e - The click event.
		 */
		const handleClick = useCallback(
			(e: React.MouseEvent) => {
				hide();

				const props = (children as React.ReactElement).props as {
					onClick?: React.MouseEventHandler;
				};

				if (typeof props.onClick === "function") {
					props.onClick(e);
				}
			},
			[children, hide]
		);

		if (isTouch) {
			return <>{children}</>;
		}

		// Attach hover and click listeners directly to the child to avoid extra wrappers
		return React.isValidElement(children)
			? React.cloneElement(
					children as React.ReactElement,
					{
						onClick: handleClick,
						onPointerEnter: handlePointerEnter,
						onPointerLeave: handlePointerLeave,
					} as React.HTMLAttributes<HTMLElement>
				)
			: (children as unknown as React.ReactElement);
	}
);

ConditionalTooltip.displayName = "ConditionalTooltip";
