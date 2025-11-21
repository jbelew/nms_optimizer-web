# Bundle Optimization Checklist

## ✅ Completed

- [x] Lazy-load UserStatsContent to split recharts into separate chunk
  - File: `src/components/AppDialog/UserStatsDialog.tsx`
  - Result: Recharts (43 KB gzip) now in lazy chunk

- [x] Enhanced vite.config.ts code-splitting strategy
  - File: `vite.config.ts`
  - Added explicit chunks for recharts, markdown, unified, micromark, remark
  - Result: Prevents library leakage into vendor bundle

- [x] Verified markdown already lazy-loaded
  - File: `src/components/AppDialog/MarkdownContentRenderer.tsx`
  - React-markdown (19 KB gzip) already in lazy chunk ✓

## 🔍 Immediate Actions (Run After Deploy)

### 1. Run Lighthouse Audit
```bash
npm start &
CHROME_PATH="/usr/bin/chromium-browser" \
  npx lighthouse http://localhost:3000 \
  --chrome-flags="--no-sandbox" \
  --output=json \
  > lighthouse-report.json
```

**What to check:**
- "Unused JavaScript" score - should be significantly reduced
- "Performance" score - should improve by 3-5 points
- LCP time - should improve slightly

### 2. Compare With Previous Report
```bash
# Compare against PERFORMANCE_REPORT.md baseline
# Previous unused JS: 85.2 KB
# Expected new unused JS: 40-50 KB (recharts won't be "unused")
```

---

## 📋 Medium Priority (1-2 days)

### Audit Unused Dependencies

#### 1. Check Redux Toolkit Usage
```bash
grep -r "@reduxjs/toolkit" src/ --include="*.tsx" --include="*.ts"
```
- **Current size:** 7.3 KB gzipped
- **Status:** Verify if actually used (app uses Zustand instead)
- **Action:** Remove if not imported

#### 2. Check i18next Languages
In `vite.config.ts` rollupOptions:
```javascript
// Consider lazy-loading non-default languages
if (id.includes("i18next")) return "i18n";
// Currently bundling ALL locale files on initial load
```
- **Current size:** 17.6 KB (i18next core)
- **Locale files:** English, German, Spanish, French, Portuguese (100+ KB total)
- **Action:** Verify which locales are actually used

#### 3. Audit Radix UI Icons
```bash
grep -r "@radix-ui/react-icons" src/ --include="*.tsx" --include="*.ts"
```
- **Current size:** 9.1 KB gzipped
- **Status:** Check if all 100+ icons are used
- **Action:** Consider switching to smaller icon library or tree-shaking unused icons

---

## 🧪 Testing After Deployment

### Manual Testing Checklist
- [ ] Open app home page - loads normally
- [ ] Click Help → About - markdown chunk loads, skeleton shows, content renders
- [ ] Click Help → Instructions - same behavior
- [ ] Click Help → Changelog - same behavior
- [ ] Open User Stats dialog - recharts chunk loads, skeleton shows, chart renders
- [ ] Check Network tab in DevTools:
  - [ ] Verify `markdown-*.js` chunk loads on demand
  - [ ] Verify `recharts-*.js` chunk loads on demand
  - [ ] Verify chunks are NOT in the main bundle

### Performance Testing
```bash
# After deploy, test from production
chrome://devtools → Network → Filter by JS
# Should see lazy chunks only when features are used
```

---

## 🚀 Optional Improvements

### 1. Preload Strategy
Add strategic preloading for likely user paths:

```html
<!-- In index.html -->
<!-- Preload markdown if user came from help link -->
<link rel="preload" as="script" href="/assets/markdown-*.js" id="markdown-preload">

<!-- Script to enable conditional preloading -->
<script>
  if (document.referrer.includes('help')) {
    // User likely came from help, preload markdown chunk
    const link = document.getElementById('markdown-preload');
    if (link) link.rel = 'preconnect'; // Actually preload it
  }
</script>
```

### 2. Prefetch on Idle
```typescript
// In App.tsx or main.tsx
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Prefetch markdown for help dialogs
    import('react-markdown');
    import('remark-gfm');
    // Prefetch recharts for stats
    import('recharts');
  }, { timeout: 5000 });
}
```

### 3. Route-Based Code-Splitting
Consider splitting by route:
```typescript
// Future: lazy-load entire route sections
const AdminSection = lazy(() => import('./routes/admin'));
const AnalyticsSection = lazy(() => import('./routes/analytics'));
```

---

## 📊 Metrics to Track

### Bundle Size Metrics
- [ ] Initial JS bundle size (target: < 180 KB gzip)
- [ ] Vendor chunk size (target: < 105 KB gzip)
- [ ] Main chunk size (target: < 30 KB gzip)
- [ ] Total chunks on demand (recharts + markdown): 62 KB

### Performance Metrics
- [ ] First Contentful Paint (FCP) - target: < 2s
- [ ] Largest Contentful Paint (LCP) - target: < 2.5s
- [ ] Time to Interactive (TTI) - target: < 3s
- [ ] Total Blocking Time (TBT) - target: < 200ms

### User Experience Metrics
- [ ] Bounce rate - should not increase
- [ ] Time on page - should not decrease
- [ ] Feature usage rates (stats dialog, help sections)

---

## 🔄 Ongoing Maintenance

### Monthly Checks
1. Review new npm dependencies in PRs
   - Ask: "Does this belong in the main bundle?"
   - Consider: Can it be lazy-loaded?

2. Monitor bundle size in CI
   - Add size limits to CI pipeline
   - Alert on bundle size increases > 5 KB

3. Audit unused code
   ```bash
   npm run build
   open dist/stats.html  # Review visualizer
   ```

### Dependency Reviews
Quarterly, check:
- [ ] Unused packages still in package.json
- [ ] Duplicate dependencies
- [ ] Outdated major versions
- [ ] Lighter alternatives available

---

## 📝 Files Modified

1. **src/components/AppDialog/UserStatsDialog.tsx**
   - Lazy-load UserStatsContent
   - Add Suspense with skeleton fallback

2. **vite.config.ts**
   - Enhanced manualChunks config
   - Added explicit chunk rules for markdown ecosystem

---

## 🎯 Success Criteria

✅ **This optimization is successful if:**

1. Lighthouse "Unused JavaScript" score improves
2. Recharts chunk loads only when stats dialog is opened
3. Markdown chunk loads only when help dialogs are opened
4. No TypeScript errors on build
5. All UI interactions work normally with lazy-loaded chunks
6. Suspense skeletons display correctly while chunks load

---

**Last Updated:** 2025-11-16  
**Next Review:** After Lighthouse audit and deployment
