import type { Metric } from "web-vitals";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

type SendEventFunction = (event: {
	category: string;
	action: string;
	label: string;
	value: number;
	nonInteraction: boolean;
}) => void;

// Helper to create and send the event object.
const sendVitalsMetric = (metric: Metric, sendEvent: SendEventFunction) => {
	sendEvent({
		category: "Web Vitals",
		action: metric.name,
		label: metric.id,
		value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
		nonInteraction: true,
	});
};

export function reportWebVitals(sendEvent: SendEventFunction) {
	onCLS((metric) => sendVitalsMetric(metric, sendEvent));
	onINP((metric) => sendVitalsMetric(metric, sendEvent));
	onFCP((metric) => sendVitalsMetric(metric, sendEvent));
	onLCP((metric) => sendVitalsMetric(metric, sendEvent));
	onTTFB((metric) => sendVitalsMetric(metric, sendEvent));
}
