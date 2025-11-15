import type { GA4Event } from "./analytics";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

declare const __APP_VERSION__: string;

/** Function type for sending analytics events. */
type SendEventFunction = (event: GA4Event) => void;

/**
 * Sends a web vitals metric to Google Analytics.
 * Converts the metric value to milliseconds (or multiplies by 1000 for CLS).
 *
 * @param {Metric} metric - The web vitals metric to send.
 * @param {SendEventFunction} sendEvent - The function to send the event.
 * @returns {void}
 * @private
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
 * Reports web vitals metrics to Google Analytics.
 * Registers listeners for all Core Web Vitals (CLS, INP, FCP, LCP, TTFB)
 * and sends them to Google Analytics via the provided send function.
 *
 * @param {SendEventFunction} sendEvent - The function to send the event.
 * @returns {void}
 *
 * @example
 * reportWebVitals(sendEvent);
 */
export function reportWebVitals(sendEvent: SendEventFunction) {
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));
}
