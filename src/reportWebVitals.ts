import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import ReactGA from 'react-ga4';

const sendToGA = ({ name, delta, value, id }) => {
  ReactGA.event({
    category: 'Web Vitals',
    action: name,
    // Google Analytics metrics must be integers, so the value is rounded.
    label: id, // id unique to current page load
    value: Math.round(name === 'CLS' ? delta * 1000 : delta), // values must be integers
    nonInteraction: true, // avoids affecting bounce rate
  });
}

export function reportWebVitals() {
  onCLS(sendToGA);
  onINP(sendToGA);
  onFCP(sendToGA);
  onLCP(sendToGA);
  onTTFB(sendToGA);
}
