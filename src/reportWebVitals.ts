import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

type SendEventFunction = (event: {
	category: string;
	action: string;
	label: string;
	value: number;
	nonInteraction: boolean;
	metric_name?: string;
}) => void;

// Helper to create and send the event object.
const sendVitalsMetric = (metric: Metric, sendEvent: SendEventFunction) => {
	sendEvent({
		category: "Web Vitals",
		action: `web_vitals_${metric.name}`, // Specific action for each web vital metric
		label: metric.id,
		value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
		nonInteraction: true,
		metric_name: metric.name, // Specific metric name as a custom parameter
	});
};

export function reportWebVitals(sendEvent: SendEventFunction) {
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));
}
