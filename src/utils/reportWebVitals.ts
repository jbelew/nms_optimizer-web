/**
 * Performance monitoring utility for Core Web Vitals.
 *
 * @remarks
 * This module uses the `web-vitals` library to capture and report performance
 * metrics like LCP, CLS, and INP. It facilitates data-driven performance
 * optimizations.
 *
 * @see {@link reportWebVitals}
 * @see {@link ./reportWebVitals.test.ts Unit Tests}
 *
 * @category Utilities
 */

import type { GA4Event } from "./analytics";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

declare const __APP_VERSION__: string;

/** Function type for sending analytics events. */
type SendEventFunction = (event: GA4Event) => void;

/**
 * Sends a web vitals metric to Google Analytics.
 *
 * @remarks
 * Converts the metric value to milliseconds (or multiplies by 1000 for CLS)
 * before sending to GA4. Ensures metrics are tracked as non-interactive events.
 *
 * @param {Metric} metric - The web vitals metric to send.
 * @param {SendEventFunction} sendEvent - The function to send the event.
 *
 * @returns {void} Side-effects only.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * sendVitalsMetric(lcpMetric, myAnalyticsFn);
 * // returns void
 * ```
 */
const sendVitalsMetric = (metric: Metric, sendEvent: SendEventFunction) => {
	sendEvent({
		action: `web_vitals_${metric.name}`,
		category: "Web Vitals",
		label: metric.id,
		value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
		nonInteraction: true,
		metric_name: metric.name,
		app_version: __APP_VERSION__,
	});
};

/**
 * Registers listeners for Core Web Vitals and reports them to analytics.
 *
 * @remarks
 * This function tracks CLS, INP, FCP, LCP, and TTFB using the `web-vitals` library.
 * It is typically called during application initialization.
 *
 * @param {SendEventFunction} sendEvent - The function to call for each metric. **Must be a valid function.**
 *
 * @returns {void} Side-effects only.
 *
 * @see {@link sendVitalsMetric}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * reportWebVitals((event) => console.log("Metric:", event.action));
 * // returns void
 * ```
 */
export function reportWebVitals(sendEvent: SendEventFunction) {
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));
}
