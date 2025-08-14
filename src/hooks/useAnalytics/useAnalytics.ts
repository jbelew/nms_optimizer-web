import { sendEvent } from "../../utils/analytics";

/**
 * Custom hook for handling Google Analytics event tracking.
 *
 * This hook provides a convenient way to send GA4 events from any component.
 * It encapsulates the `sendEvent` function from the analytics utility.
 *
 * @returns {{sendEvent: (event: GA4Event) => void}} - An object containing the sendEvent function.
 * @example
 * const { sendEvent } = useAnalytics();
 * sendEvent({ category: 'User', action: 'Clicked a button' });
 */
export const useAnalytics = () => {
	return { sendEvent };
};
