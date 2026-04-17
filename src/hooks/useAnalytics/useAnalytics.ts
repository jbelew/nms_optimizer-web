import { sendEvent } from "../../utils/analytics/tracking";

/**
 * Custom hook for accessing Google Analytics event tracking.
 *
 * Provides a React-friendly interface to the global `sendEvent` function,
 * ensuring consistent event tracking across the application.
 *
 * @returns {{ sendEvent: (event: import('../../utils/analytics/tracking').GA4Event) => void }} An object containing the `sendEvent` function.
 *
 * @see {@link sendEvent} for the underlying tracking logic.
 * @see [Analytics Utilities](../../utils/analytics.ts)
 * @see [useAnalytics Tests](./useAnalytics.test.ts)
 *
 * @category Hooks
 *
 * @example Dispatching a UI event
 * ```tsx
 * const { sendEvent } = useAnalytics();
 *
 * sendEvent({
 *   category: "ui",
 *   action: "button_click",
 *   label: "start_solve"
 * });
 * // Dispatches a GA4 event through the global tracking utility.
 * ```
 */
export const useAnalytics = () => {
	return { sendEvent };
};
