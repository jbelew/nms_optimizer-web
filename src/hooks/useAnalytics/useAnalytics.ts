import { sendEvent } from "../../utils/analytics";

/**
 * Custom hook for handling Google Analytics event tracking.
 * @returns {{sendEvent: (event: GA4Event) => void}} - The sendEvent function.
 */
export const useAnalytics = () => {
	return { sendEvent };
};
