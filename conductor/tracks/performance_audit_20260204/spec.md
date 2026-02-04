# Specification: Core Web Vitals Performance Audit & Optimization

## 1. Goal
The primary objective of this track is to audit and optimize the application's performance to achieve and maintain "Good" scores for Core Web Vitals (LCP, INP, CLS) as measured by Lighthouse and Chrome User Experience Report (CrUX) standards.

## 2. Scope
- **LCP (Largest Contentful Paint):** Optimize image loading, resource prioritization, and server response times (where applicable to frontend assets).
- **INP (Interaction to Next Paint):** Reduce main-thread blocking, optimize event handlers, and minimize heavy script execution.
- **CLS (Cumulative Layout Shift):** Ensure stable layouts by using explicit dimensions for assets and avoiding dynamic content shifts.
- **Tools:** Use Lighthouse, Web Vitals library, and Chrome DevTools Performance tab.

## 3. Success Criteria
- LCP < 2.5s on mobile and desktop.
- INP < 200ms.
- CLS < 0.1.
- No regression in existing functionality.

## 4. Technical Constraints
- Must maintain the existing React/Vite architecture.
- Must not introduce breaking changes to the UI/UX as defined in the product guidelines.
