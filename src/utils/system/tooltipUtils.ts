import { createContext, useContext } from "react";

/**
 * Functional interface for controlling the tooltip visibility.
 *
 * @see {@link import('./TooltipContext').TooltipProvider}
 *
 * @category Tooltip
 */
export interface TooltipActions {
	/**
	 * Requests to hide the tooltip.
	 */
	hide: () => void;
	/**
	 * Displays the tooltip with specific content and position.
	 *
	 * @param {string} label - The text to show.
	 * @param {DOMRect} rect - The anchor element's layout properties.
	 * @param {number} [delayDuration] - Optional override for the show delay.
	 */
	show: (label: string, rect: DOMRect, delayDuration?: number) => void;
}

/**
 * Represents the visual and data state of the active tooltip.
 *
 * @see {@link import('./TooltipContext').TooltipProvider}
 *
 * @category Tooltip
 */
export interface TooltipState {
	/** The delay in milliseconds before the tooltip appears. */
	delayDuration: number;
	/** Whether the tooltip is currently visible. */
	isOpen: boolean;
	/** The text content to display. */
	label: string;
	/** The bounding rectangle of the target element, used for positioning. */
	rect: DOMRect | null;
}

/** Context for the tooltip's data state. */
export const TooltipStateContext = createContext<TooltipState | undefined>(undefined);

/** Context for the tooltip's control actions. */
export const TooltipActionsContext = createContext<TooltipActions | undefined>(undefined);

/**
 * Custom hook for accessing the active tooltip's state.
 *
 * Provides a graceful fallback for test environments to simplify component testing.
 *
 * @returns {TooltipState} The current tooltip state.
 *
 * @throws {Error} If called outside of a `TooltipProvider` in non-test environments.
 *
 * @see {@link import('./TooltipContext').TooltipProvider}
 * @see {@link TooltipState}
 *
 * @category Hooks
 *
 * @example Hook usage for state
 * ```tsx
 * const { isOpen, label } = useTooltipState();
 * ```
 */
export const useTooltipState = () => {
	const context = useContext(TooltipStateContext);

	if (context === undefined) {
		// Degrade gracefully in tests to avoid needing to wrap every single unit test in a Provider
		if (process.env.NODE_ENV === "test") {
			return { delayDuration: 500, isOpen: false, label: "", rect: null };
		}

		throw new Error("useTooltipState must be used within a TooltipProvider");
	}

	return context;
};

/**
 * Custom hook for accessing tooltip control actions.
 *
 * Provides a graceful fallback for test environments to simplify component testing.
 *
 * @returns {TooltipActions} The show and hide functions.
 *
 * @throws {Error} If called outside of a `TooltipProvider` in non-test environments.
 *
 * @see {@link import('./TooltipContext').TooltipProvider}
 * @see {@link TooltipActions}
 *
 * @category Hooks
 *
 * @example Hook usage for actions
 * ```tsx
 * const { show, hide } = useTooltipActions();
 * ```
 */
export const useTooltipActions = () => {
	const context = useContext(TooltipActionsContext);

	if (context === undefined) {
		// Degrade gracefully in tests to avoid needing to wrap every single unit test in a Provider
		if (process.env.NODE_ENV === "test") {
			return { hide: () => {}, show: () => {} };
		}

		throw new Error("useTooltipActions must be used within a TooltipProvider");
	}

	return context;
};
