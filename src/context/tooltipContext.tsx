import type { TooltipActions, TooltipState } from "../utils/system/tooltipUtils";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { TooltipActionsContext, TooltipStateContext } from "../utils/system/tooltipUtils";

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
 *
 * @returns {JSX.Element} The state and actions context providers.
 *
 * @see {@link import('../utils/system/tooltipUtils').useTooltipState}
 * @see {@link import('../utils/system/tooltipUtils').useTooltipActions}
 * @see {@link TooltipState}
 * @see {@link TooltipActions}
 *
 * @category Components
 *
 * @example Application wrapper
 * <TooltipProvider>
 *   <MainApp />
 * </TooltipProvider>
 */
export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<TooltipState>({
		delayDuration: 500,
		isOpen: false,
		label: "",
		rect: null,
	});

	const timerRef = useRef<null | number>(null);
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
			setState({ delayDuration, isOpen: true, label, rect });
		} else {
			// Show after delay
			setState((prev: TooltipState) => ({ ...prev, delayDuration, label, rect })); // Update position immediately but not isOpen
			timerRef.current = window.setTimeout(() => {
				isOpenRef.current = true;
				setState((prev: TooltipState) => ({ ...prev, isOpen: true }));
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
		setState((prev: TooltipState) => ({ ...prev, isOpen: false, rect: null }));
	}, []); // EMPTY dependency array - perfectly stable

	const actions = useMemo(() => ({ hide, show }) as TooltipActions, [show, hide]);

	return (
		<TooltipStateContext.Provider value={state}>
			<TooltipActionsContext.Provider value={actions}>
				{children}
			</TooltipActionsContext.Provider>
		</TooltipStateContext.Provider>
	);
};
