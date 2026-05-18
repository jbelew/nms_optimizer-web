import { sendDeferredEvent, sendEvent } from "@/utils/analytics/tracking";

/**
 * Custom hook for accessing Google Analytics event tracking.
 *
 * @remarks
 * Provides a React-friendly interface to the global `sendEvent` and
 * `sendDeferredEvent` functions, ensuring consistent event tracking across the
 * application.
 *
 * Use `sendDeferredEvent` from UI interaction handlers (clicks, taps) to keep
 * the main thread free during the interaction. Use `sendEvent` for late-firing
 * events (Web Vitals, `visibilitychange`) that must dispatch synchronously.
 *
 * @returns {object} An object containing the tracking functions.
 * @returns {Function} returns.sendEvent - Synchronous event dispatcher.
 * @returns {Function} returns.sendDeferredEvent - INP-friendly deferred event dispatcher.
 *
 * @see {@link sendEvent} for the underlying tracking logic.
 * @see {@link sendDeferredEvent} for the INP-friendly deferred variant.
 * @see {@link ../../utils/analytics/tracking.ts Analytics Tracking}
 * @see {@link ./useAnalytics.test.ts Unit Tests}
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
	return { sendDeferredEvent, sendEvent };
};
