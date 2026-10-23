/**
 * Performance monitoring utility for Core Web Vitals.
 *
 * @remarks
 * This module uses the `web-vitals/attribution` library to capture and report
 * performance metrics (`LCP`, `CLS`, `INP`, `FCP`, `TTFB`) with DOM target
 * attribution routed through the registered `interaction_target` and `load_state`
 * GA4 dimensions ([ADR-0003](../../../docs/adr/0003-ga4-bigquery-telemetry-contract.md)).
 *
 * @see {@link reportWebVitals}
 * @see {@link ./reportWebVitals.test.ts Unit Tests}
 *
 * @category Utilities
 */

import type {
	CLSMetricWithAttribution,
	INPMetricWithAttribution,
	LCPMetricWithAttribution,
	Metric,
} from "web-vitals/attribution";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals/attribution";

import type { GA4Event } from "@/types/analytics";
import { Logger } from "@/utils/system/monitoring";

declare const __APP_VERSION__: string;

/** Function type for sending analytics events. */
type SendEventFunction = (event: GA4Event) => void;

/**
 * Sends a Web Vitals metric to Google Analytics.
 *
 * @remarks
 * Converts the metric value to numerical event parameters suitable for GA4 custom metrics
 * while preserving `label: metric.id` (`^v\d+-\d+-\d+$`) for BigQuery delta deduplication.
 * Ensures metrics are tracked as non-interactive events. For `INP`, `LCP`, and `CLS` metrics
 * with attribution, target element selectors and load states are captured via the existing
 * `interaction_target` and `load_state` dimensions.
 *
 * @param metric - The Web Vitals metric to send.
 * @param sendEvent - The function to send the event.
 *
 * @returns Side-effects only.
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
	const rawValue =
		metric.name === "CLS" ? metric.delta * 1000
		: metric.name === "INP" ? (metric.value ?? metric.delta)
		: metric.delta;

	const event: GA4Event = {
		action: "performance_metric",
		app_version: __APP_VERSION__,
		category: "performance",
		label: metric.id,
		metric_name: metric.name,
		nonInteraction: true,
		value: Math.round(rawValue),
	};

	if (metric.name === "INP" && "attribution" in metric) {
		const inpMetric = metric as INPMetricWithAttribution;
		const attribution = inpMetric.attribution;

		if (attribution) {
			const target = attribution.interactionTarget || "(unmounted element)";
			event.interaction_target = target;

			if (attribution.interactionType) {
				event.interaction_type = attribution.interactionType;
			}

			if (typeof attribution.inputDelay === "number") {
				event.input_delay = Math.round(attribution.inputDelay);
			}

			if (typeof attribution.processingDuration === "number") {
				event.processing_duration = Math.round(attribution.processingDuration);
			}

			if (typeof attribution.presentationDelay === "number") {
				event.presentation_delay = Math.round(attribution.presentationDelay);
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}

			Logger.info(`[Web Vitals INP] ${Math.round(metric.value)}ms (${metric.rating})`, {
				inputDelay: Math.round(attribution.inputDelay),
				loadState: attribution.loadState,
				presentationDelay: Math.round(attribution.presentationDelay),
				processingDuration: Math.round(attribution.processingDuration),
				target,
				type: attribution.interactionType,
			});
		}
	} else if (metric.name === "LCP" && "attribution" in metric) {
		const lcpMetric = metric as LCPMetricWithAttribution;
		const attribution = lcpMetric.attribution;

		if (attribution) {
			const target = attribution.target || attribution.url;

			if (target) {
				event.interaction_target = target;
			}
		}
	} else if (metric.name === "CLS" && "attribution" in metric) {
		const clsMetric = metric as CLSMetricWithAttribution;
		const attribution = clsMetric.attribution;

		if (attribution) {
			if (attribution.largestShiftTarget) {
				event.interaction_target = attribution.largestShiftTarget;
			}

			if (attribution.loadState) {
				event.load_state = attribution.loadState;
			}
		}
	}

	sendEvent(event);
};

/**
 * Registers listeners for Core Web Vitals and reports them to analytics.
 *
 * @remarks
 * This function tracks `CLS`, `INP`, `FCP`, `LCP`, and `TTFB` using the `web-vitals/attribution`
 * library. Listeners are registered synchronously so the underlying `PerformanceObserver`
 * instances attach as early as possible and flush final values on `pagehide` / `visibilitychange`.
 *
 * @param sendEvent - The function to call for each metric. **Must be a valid function.**
 *
 * @returns Side-effects only.
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
