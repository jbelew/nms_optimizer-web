import React, { useCallback, useMemo, useRef, useState } from "react";

import {
	TooltipActions,
	TooltipActionsContext,
	TooltipState,
	TooltipStateContext,
} from "./tooltip-utils";

const WARM_THRESHOLD = 500; // ms to keep the "warm" state for instant re-opening

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
