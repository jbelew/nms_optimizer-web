import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals(sendEvent: (event: { category: string; action: string; label: string; value: number; nonInteraction: boolean; }) => void) {
  onCLS((metric) => sendEvent({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: Math.round((metric.name as string) === 'CLS' ? metric.delta * 1000 : metric.delta),
    nonInteraction: true,
  }));
  onINP((metric) => sendEvent({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: Math.round((metric.name as string) === 'CLS' ? metric.delta * 1000 : metric.delta),
    nonInteraction: true,
  }));
  onFCP((metric) => sendEvent({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: Math.round((metric.name as string) === 'CLS' ? metric.delta * 1000 : metric.delta),
    nonInteraction: true,
  }));
  onLCP((metric) => sendEvent({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: Math.round((metric.name as string) === 'CLS' ? metric.delta * 1000 : metric.delta),
    nonInteraction: true,
  }));
  onTTFB((metric) => sendEvent({
    category: 'Web Vitals',
    action: metric.name,
    label: metric.id,
    value: Math.round((metric.name as string) === 'CLS' ? metric.delta * 1000 : metric.delta),
    nonInteraction: true,
  }));
}
