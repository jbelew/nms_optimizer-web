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

import type { GA4Event } from "../../types/analytics";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

declare const __APP_VERSION__: string;

/** Function type for sending analytics events. */
type SendEventFunction = (event: GA4Event) => void;

/**
 * Sends a web vitals metric to Google Analytics.
 *
 * @remarks
 * Converts the metric value to numerical event parameters suitable for GA4 custom metrics.
 * Ensures metrics are tracked as non-interactive events.
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
		action: "performance_metric",
		app_version: __APP_VERSION__,
		category: "performance",
		label: metric.id,
		metric_name: metric.name,
		nonInteraction: true,
		value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
	});
};

/**
 * Captures Total Blocking Time (TBT) and reports it to analytics.
 *
 * @param {SendEventFunction} sendEvent - The function to send the event.
 *
 * @example
 * ```ts
 * reportTBT(sendEvent);
 * ```
 */
const reportTBT = (sendEvent: SendEventFunction) => {
	if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;

	let tbt = 0;
	const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0];
	const fcpTime = fcpEntry ? fcpEntry.startTime : 0;

	try {
		const observer = new PerformanceObserver((list) => {
			list.getEntries().forEach((entry) => {
				// Only track long tasks after FCP
				if (entry.startTime >= fcpTime) {
					tbt += entry.duration - 50;
				}
			});
		});

		observer.observe({ buffered: true, type: "longtask" });

		// Report TBT after a delay to capture initial load tasks
		// In a production app, you might want to report this on page visibility change or at a fixed interval
		setTimeout(() => {
			if (tbt > 0) {
				sendEvent({
					action: "performance_metric",
					app_version: __APP_VERSION__,
					category: "performance",
					label: `tbt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					metric_name: "TBT",
					nonInteraction: true,
					value: Math.round(tbt),
				});
			}

			observer.disconnect();
		}, 10000);
	} catch (_e) {
		// Silent catch for browsers that don't support longtask type
	}
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
	// Register CWV listeners synchronously so the underlying PerformanceObservers
	// attach as early as possible. This minimizes the chance of missing the first
	// LCP/FCP/CLS entries on slow devices and ensures the web-vitals library can
	// flush its final values on `pagehide` / `visibilitychange`.
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));

	// Defer only the longer-running TBT longtask observer to idle time.
	const startTBT = () => reportTBT(sendEvent);

	if (typeof window !== "undefined" && "requestIdleCallback" in window) {
		window.requestIdleCallback(startTBT);
	} else {
		setTimeout(startTBT, 2000);
	}
}
