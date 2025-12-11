import { sendEvent } from "../../utils/analytics";

/**
 * Custom hook for handling Google Analytics event tracking.
 *
 * This hook provides a convenient way to send GA4 events from any component
 * by returning the globally configured `sendEvent` function.
 *
 * @returns {{sendEvent: typeof sendEvent}} - Object containing the sendEvent function.
 * @example
 * const { sendEvent } = useAnalytics();
 * await sendEvent({ category: 'ui', action: 'button_clicked', label: 'submit' });
 */
export const useAnalytics = () => {
	return { sendEvent };
};
