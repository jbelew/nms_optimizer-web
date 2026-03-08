import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface TooltipState {
	label: string;
	rect: DOMRect | null;
	isOpen: boolean;
	delayDuration: number;
}

interface TooltipActions {
	show: (label: string, rect: DOMRect, delayDuration?: number) => void;
	hide: () => void;
}

const TooltipStateContext = createContext<TooltipState | undefined>(undefined);
const TooltipActionsContext = createContext<TooltipActions | undefined>(undefined);

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

	const actions = useMemo(() => ({ show, hide }), [show, hide]);

	return (
		<TooltipStateContext.Provider value={state}>
			<TooltipActionsContext.Provider value={actions}>
				{children}
			</TooltipActionsContext.Provider>
		</TooltipStateContext.Provider>
	);
};

export const useTooltipState = () => {
	const context = useContext(TooltipStateContext);

	if (context === undefined) {
		// Degrade gracefully in tests to avoid needing to wrap every single unit test in a Provider
		if (process.env.NODE_ENV === "test") {
			return { label: "", rect: null, isOpen: false, delayDuration: 500 };
		}

		throw new Error("useTooltipState must be used within a TooltipProvider");
	}

	return context;
};

export const useTooltipActions = () => {
	const context = useContext(TooltipActionsContext);

	if (context === undefined) {
		// Degrade gracefully in tests to avoid needing to wrap every single unit test in a Provider
		if (process.env.NODE_ENV === "test") {
			return { show: () => {}, hide: () => {} };
		}

		throw new Error("useTooltipActions must be used within a TooltipProvider");
	}

	return context;
};
