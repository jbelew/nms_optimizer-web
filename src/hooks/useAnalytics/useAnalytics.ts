import { sendEvent } from "../../utils/analytics";

/**
 * Custom hook for accessing Google Analytics event tracking.
 *
 * Provides a React-friendly interface to the global `sendEvent` function,
 * ensuring consistent event tracking across the application.
 *
 * @returns {{ sendEvent: typeof sendEvent }} An object containing the `sendEvent` function.
 *
 * @example
 * const { sendEvent } = useAnalytics();
 * sendEvent({ category: "ui", action: "button_click", label: "start_solve" });
 */
export const useAnalytics = () => {
	return { sendEvent };
};
