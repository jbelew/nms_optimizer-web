import type { GA4Event } from "./analytics";
import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

declare const __APP_VERSION__: string;

type SendEventFunction = (event: GA4Event) => void;

// Helper to create and send the event object.
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

export function reportWebVitals(sendEvent: SendEventFunction) {
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));
}
