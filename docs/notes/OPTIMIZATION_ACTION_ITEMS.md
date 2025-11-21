# Performance Optimization Action Items

Based on trace analysis (Trace-20251116T101135.json.gz), here are prioritized action items:

## 🔴 CRITICAL (Address First)

### 1. Layout Thrashing - 86.9ms Recalculation Time
- [ ] Audit React components for forced layout recalculations
- [ ] Search codebase for patterns:
  ```javascript
  // Pattern: Reading computed styles then modifying DOM
  const width = element.offsetWidth;  // ❌ Forces layout
  element.style.width = width + 'px';
  ```
- [ ] Find all `.offsetWidth`, `.offsetHeight`, `.scrollTop` reads before DOM writes
- [ ] Batch DOM mutations using:
  - DocumentFragment
  - CSS class toggling (bulk style changes)
  - `element.style.cssText` instead of individual properties
- [ ] Implement `requestAnimationFrame` batching for resize/scroll handlers

**Expected Impact:** -20 to 40ms

**Estimated Effort:** 2-4 hours

---

### 2. JavaScript Parse Time - 277.3ms Total
- [ ] Run `npm run build` and analyze bundle size
- [ ] Use source-map-explorer or webpack-bundle-analyzer
- [ ] Identify largest dependencies (check BUNDLE_OPTIMIZATION_CHECKLIST.md)
- [ ] Implement code-splitting:
  ```javascript
  // Instead of:
  import HeavyComponent from './heavy';
  
  // Use:
  const HeavyComponent = lazy(() => import('./heavy'));
  ```
- [ ] Check for unused imports/dead code
- [ ] Consider dynamic imports for:
  - Modal dialogs
  - Rarely used features
  - Admin-only components

**Expected Impact:** -50 to 150ms

**Estimated Effort:** 3-6 hours

---

### 3. Long Function Calls - 95.31ms Max
- [ ] Profile with Chrome DevTools Performance tab
- [ ] Record a trace with the Recorder tab
- [ ] Identify which JavaScript functions take >10ms:
  - Check v8.callFunction events
  - Look for O(n²) algorithms
  - Find expensive calculations
- [ ] Refactor hot paths:
  - Add memoization
  - Use Set/Map for lookups instead of array searches
  - Cache calculations
  - Use Web Workers for heavy computation

**Expected Impact:** -30 to 50ms

**Estimated Effort:** 2-4 hours

---

## 🟠 HIGH PRIORITY

### 4. GPU Task Overhead - 682.9ms
- [ ] Open DevTools → Rendering tab
- [ ] Enable "Paint flashing" and check what's being repainted
- [ ] Check Layers tab for excessive layer count
- [ ] Look for:
  - Heavy shadows or blur effects
  - Complex gradients
  - Large images/canvases
  - Excessive border-radius or opacity changes
- [ ] Solutions:
  - Simplify SVG/canvas complexity
  - Use `will-change: transform` sparingly
  - Batch visual updates
  - Use CSS containment: `contain: paint;`

**Expected Impact:** -100 to 200ms

**Estimated Effort:** 2-3 hours

---

### 5. Input Event Throttling - 128.2ms for 105 events
- [ ] Search for `addEventListener('mousemove'`
- [ ] Search for `addEventListener('scroll'`
- [ ] Search for `addEventListener('resize'`
- [ ] Implement throttling:
  ```javascript
  function throttle(callback, delay) {
    let lastTime = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        callback(...args);
      }
    };
  }
  
  window.addEventListener('mousemove', throttle(handler, 16)); // ~60fps
  ```
- [ ] Consider `passive: true` flag for non-blocking listeners
- [ ] Use Intersection Observer for visibility-based operations

**Expected Impact:** -30 to 60ms

**Estimated Effort:** 1-2 hours

---

### 6. Animation Frame Optimization - 536 Animation Frames
- [ ] Identify all CSS/JavaScript animations running on page load
- [ ] Check if animations run even when not visible
- [ ] Implement visibility detection:
  ```javascript
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAnimation(entry.target);
      } else {
        pauseAnimation(entry.target);
      }
    });
  });
  observer.observe(animatedElement);
  ```
- [ ] Replace JavaScript animations with CSS where possible
- [ ] Add `animation-play-state: paused` when tab is hidden

**Expected Impact:** -50 to 100ms

**Estimated Effort:** 1-2 hours

---

## 🟡 MEDIUM PRIORITY

### 7. Async Task Optimization - 143.7ms
- [ ] Review Promise chains in data fetching
- [ ] Look for sequential Promises that should be parallel:
  ```javascript
  // ❌ Sequential - Bad
  const data1 = await fetch('/api/1').then(r => r.json());
  const data2 = await fetch('/api/2').then(r => r.json());
  
  // ✅ Parallel - Good
  const [data1, data2] = await Promise.all([
    fetch('/api/1').then(r => r.json()),
    fetch('/api/2').then(r => r.json())
  ]);
  ```
- [ ] Check for unnecessary `await` in loops
- [ ] Profile async operations with DevTools

**Expected Impact:** -20 to 40ms

**Estimated Effort:** 1-2 hours

---

### 8. Update Layout Tree Efficiency - 80.1ms over 111 events
- [ ] Check for:
  - Components re-rendering unnecessarily
  - CSS-in-JS generating new classes repeatedly
  - Style recalculations during render
- [ ] Optimize React:
  - Use `React.memo` for expensive components
  - Implement `useMemo` for expensive calculations
  - Check for missing key props in lists
  - Profile with React DevTools Profiler

**Expected Impact:** -15 to 30ms

**Estimated Effort:** 1-2 hours

---

## ✅ VERIFICATION CHECKLIST

After implementing optimizations, verify with:

- [ ] Run `npm run build` and check bundle size reduction
- [ ] Record new performance trace
- [ ] Compare metrics:
  - [ ] Layout time decreased?
  - [ ] Main thread runtime improved?
  - [ ] Function call times reduced?
  - [ ] GPU tasks optimized?
- [ ] Run Lighthouse audit
- [ ] Test on slow 4G with DevTools throttling
- [ ] Check on mobile device (if applicable)
- [ ] Monitor Core Web Vitals:
  - [ ] Largest Contentful Paint (LCP)
  - [ ] First Input Delay (FID)
  - [ ] Cumulative Layout Shift (CLS)

---

## TOOLS & COMMANDS

### Analyze Bundle Size
```bash
npm install -D source-map-explorer webpack-bundle-analyzer
npm run build
source-map-explorer 'dist/**/*.js'
```

### Profile with DevTools
```bash
# Chrome DevTools
# 1. Open Performance tab
# 2. Click record
# 3. Interact with page
# 4. Click stop
# 5. Analyze: Look for yellow/red marks (>50ms tasks)
```

### Check Core Web Vitals
```javascript
// Add to your page
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.value);
  }
}).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
```

### Test with Slow Network
```bash
# Chrome DevTools → Network tab
# Throttle to "Slow 4G"
# Test page load and interactions
```

---

## ESTIMATED TOTAL IMPACT

| Item | Impact | Effort |
|------|--------|--------|
| Layout Thrashing | -20-40ms | 2-4h |
| JavaScript Parsing | -50-150ms | 3-6h |
| Function Calls | -30-50ms | 2-4h |
| GPU Tasks | -100-200ms | 2-3h |
| Input Events | -30-60ms | 1-2h |
| Animations | -50-100ms | 1-2h |
| Async Tasks | -20-40ms | 1-2h |
| Layout Tree | -15-30ms | 1-2h |
| **TOTAL** | **-315 to 670ms** | **13-25h** |

---

## TIMELINE RECOMMENDATION

**Week 1:** Layout thrashing + Input event throttling (Quick wins, 3-6 hours)
**Week 2:** JavaScript code-splitting (High impact, 3-6 hours)  
**Week 3:** GPU optimization + Animation tuning (Medium impact, 3-5 hours)
**Week 4:** Testing, verification, and fine-tuning (2-4 hours)

---

## MONITORING

After optimizations, add performance monitoring:

```javascript
// Send metrics to analytics
function sendPerformanceMetrics() {
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const lcp = performance.getEntriesByType('largest-contentful-paint');
  
  analytics.track('performance', {
    fcp: paint[0]?.startTime,
    lcp: lcp[0]?.startTime,
    ttfb: nav.responseStart - nav.fetchStart,
    domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
    loadComplete: nav.loadEventEnd - nav.fetchStart
  });
}

window.addEventListener('load', sendPerformanceMetrics);
```

---

**Last Updated:** 2025-11-16
**Status:** Ready to implement
**Contact:** Review with tech lead before starting major refactors
