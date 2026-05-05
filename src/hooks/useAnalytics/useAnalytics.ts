import { sendDeferredEvent, sendEvent } from "../../utils/analytics/tracking";

/**
 * Custom hook for accessing Google Analytics event tracking.
 *
 * Provides a React-friendly interface to the global `sendEvent` and
 * `sendDeferredEvent` functions, ensuring consistent event tracking across the
 * application.
 *
 * Use `sendDeferredEvent` from UI interaction handlers (clicks, taps) to keep
 * the main thread free during the interaction. Use `sendEvent` for late-firing
 * events (Web Vitals, `visibilitychange`) that must dispatch synchronously.
 *
 * @returns {{ sendEvent: (event: import('../../utils/analytics/tracking').GA4Event) => void, sendDeferredEvent: (event: import('../../utils/analytics/tracking').GA4Event) => void }} An object containing the tracking functions.
 *
 * @see {@link sendEvent} for the underlying tracking logic.
 * @see {@link sendDeferredEvent} for the INP-friendly deferred variant.
 * @see [Analytics Tracking](../../utils/analytics/tracking.ts)
 * @see [useAnalytics Tests](./useAnalytics.test.ts)
 *
 * @category Hooks
 *
 * @example Dispatching a UI event from a click handler
 * ```tsx
 * const { sendDeferredEvent } = useAnalytics();
 *
 * <button onClick={() => sendDeferredEvent({
 *   category: "ui",
 *   action: "button_click",
 *   label: "start_solve"
 * })} />
 * ```
 */
export const useAnalytics = () => {
	return { sendEvent, sendDeferredEvent };
};
