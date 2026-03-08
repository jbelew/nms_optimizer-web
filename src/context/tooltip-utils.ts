import { createContext, useContext } from "react";

export interface TooltipState {
	label: string;
	rect: DOMRect | null;
	isOpen: boolean;
	delayDuration: number;
}

export interface TooltipActions {
	show: (label: string, rect: DOMRect, delayDuration?: number) => void;
	hide: () => void;
}

export const TooltipStateContext = createContext<TooltipState | undefined>(undefined);

export const TooltipActionsContext = createContext<TooltipActions | undefined>(undefined);

/**
 * Custom hook to access the tooltip state.
 * Returns default values in test environments if the provider is missing.
 */
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

/**
 * Custom hook to access tooltip actions (show, hide).
 * Returns no-ops in test environments if the provider is missing.
 */
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
