import React, { useCallback, useMemo, useRef, useState } from "react";

import {
	TooltipActions,
	TooltipActionsContext,
	TooltipState,
	TooltipStateContext,
} from "./tooltip-utils";

/** Time in milliseconds to maintain a "warm" state for instant tooltip re-opening. */
const WARM_THRESHOLD = 500;

/**
 * Provider component for the global custom tooltip system.
 *
 * It manages the shared state of the single active tooltip, including its content,
 * screen position, and visibility logic (delays, "warm" transitions). Using a
 * single provider prevents multiple tooltips from overlapping and optimizes performance.
 *
 * @param {object} props - Component properties.
 * @param {React.ReactNode} props.children - The application tree to wrap.
 * @returns {JSX.Element} The state and actions context providers.
 *
 * @see {@link import('./tooltip-utils').useTooltipState}
 * @see {@link import('./tooltip-utils').useTooltipActions}
 * @see {@link TooltipState}
 * @see {@link TooltipActions}
 * @category Components
 *
 * @example Application wrapper
 * <TooltipProvider>
 *   <MainApp />
 * </TooltipProvider>
 */
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<TooltipState>({
		label: "",
		rect: null,
		isOpen: false,
		delayDuration: 500,
	});

	const timerRef = useRef<number | null>(null);
	const lastCloseTimeRef = useRef<number>(0);
	const isOpenRef = useRef(false);

	/**
	 * Requests to show the tooltip with the specified content and position.
	 *
	 * Handles delay logic and instant-open if moving between elements.
	 *
	 * @param {string} label - The text to display.
	 * @param {DOMRect} rect - The bounding rectangle of the anchor element.
	 * @param {number} [delayDuration=500] - Time in ms before showing.
	 */
	const show = useCallback((label: string, rect: DOMRect, delayDuration = 500) => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		const now = Date.now();
		const isWarm = now - lastCloseTimeRef.current < WARM_THRESHOLD;

		if (isWarm || isOpenRef.current) {
			// Show immediately if we were just open or are moving between elements
			isOpenRef.current = true;
			setState({ label, rect, isOpen: true, delayDuration });
		} else {
			// Show after delay
			setState((prev) => ({ ...prev, label, rect, delayDuration })); // Update position immediately but not isOpen
			timerRef.current = window.setTimeout(() => {
				isOpenRef.current = true;
				setState((prev) => ({ ...prev, isOpen: true }));
				timerRef.current = null;
			}, delayDuration);
		}
	}, []); // EMPTY dependency array - perfectly stable

	/**
	 * Hides the tooltip and records the close time for warmth logic.
	 */
	const hide = useCallback(() => {
		if (timerRef.current) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}

		isOpenRef.current = false;
		lastCloseTimeRef.current = Date.now();
		setState((prev) => ({ ...prev, rect: null, isOpen: false }));
	}, []); // EMPTY dependency array - perfectly stable

	const actions = useMemo(() => ({ show, hide }) as TooltipActions, [show, hide]);

	return (
		<TooltipStateContext.Provider value={state}>
			<TooltipActionsContext.Provider value={actions}>
				{children}
			</TooltipActionsContext.Provider>
		</TooltipStateContext.Provider>
	);
};
