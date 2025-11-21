# Bundle Analysis & Code-Splitting Recommendations

**Target Issue:** JavaScript Parse Time - 277.3ms  
**Current Status:** Analysis Needed  
**Priority:** HIGH

---

## How to Analyze Your Bundle

### Step 1: Build and Analyze
```bash
# Install analyzer
npm install -D source-map-explorer

# Build production bundle
npm run build

# Analyze bundle size
source-map-explorer 'dist/**/*.js'
```

This will open an interactive visualization showing:
- Total bundle size
- Size of each dependency
- Minified vs gzipped sizes
- Duplicate modules

### Step 2: Identify Optimization Opportunities

**Look for:**
- Libraries >100KB (candidates for lazy loading)
- Unused or duplicate modules
- Heavy dependencies loaded on initial page

**Red flags:**
- Multiple copies of the same library
- Large UI libraries loaded upfront
- Admin-only features in main bundle

---

## Likely Candidates for Lazy Loading

Based on the codebase structure, these are likely to be loaded even if user doesn't need them:

### 1. **Dialog Components** (EASY)
```typescript
// BEFORE: All dialogs loaded upfront
import { ModuleSelectionDialog } from "./components/ModuleSelectionDialog";
import { AppFooter } from "./components/AppFooter";
import { OptimizationAlertDialog } from "./components/AppDialog/OptimizationAlertDialog";

// AFTER: Load on demand
const ModuleSelectionDialog = lazy(() => 
  import("./components/ModuleSelectionDialog")
);
const AppFooter = lazy(() => 
  import("./components/AppFooter/AppFooter")
);
const OptimizationAlertDialog = lazy(() => 
  import("./components/AppDialog/OptimizationAlertDialog")
);
```

**Current Status:** ✅ Already using lazy loading
**No changes needed here.**

---

### 2. **Heavy Dependencies to Check**

Run analysis and check for these common large packages:

```bash
npm run build
source-map-explorer 'dist/**/*.js' | grep -i "lodash\|moment\|date-fns\|recharts\|react-table"
```

**If found, consider:**
- Replacing lodash with smaller alternatives (lodash-es)
- Swapping moment.js for day.js (~2KB instead of 67KB)
- Lazy loading chart libraries (only if chart page not always visible)
- Virtual scrolling for large tables instead of loading all rows

---

## Current Code-Splitting Analysis

### ✅ GOOD - Already Implemented
```typescript
// src/App.tsx
const ErrorContent = lazy(() => import("./components/AppDialog/ErrorContent"));
const ShareLinkDialog = lazy(() => import("./components/AppDialog/ShareLinkDialog"));
const RoutedDialogs = lazy(() =>
	import("./components/RoutedDialogs/RoutedDialogs").then((module) => ({
		default: module.RoutedDialogs,
	}))
);

// src/MainAppContent.tsx
const AppFooter = lazy(() => import("../AppFooter/AppFooter"));
const ShipSelection = lazy(() =>
	import("../ShipSelection/ShipSelection").then((m) => ({ default: m.ShipSelection }))
);
const TechTreeComponent = lazy(() => import("../TechTree/TechTree"));
const OptimizationAlertDialog = lazy(() => import("../AppDialog/OptimizationAlertDialog"));
```

**Status:** ✅ Well-structured  
**Recommendation:** No changes needed, maintain this pattern

---

## Performance Optimization Checklist

### Vite Configuration
```bash
# Verify vite.config.ts has:
# ✅ rollupOptions for chunk size optimization
# ✅ minify set to 'terser' or 'esbuild'
# ✅ sourcemap false in production
```

Check `/home/jbelew/projects/nms_optimizer-web/vite.config.ts`:

```typescript
// Should have:
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Split vendor libraries
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-icons', '@radix-ui/themes'],
        // Other heavy deps
      }
    }
  },
  minify: 'terser',
  sourcemap: false // in production
}
```

---

## JavaScript Parsing Optimization Strategy

The 277.3ms parse time is split into:
- **138.6ms** - Background parsing
- **92.5ms** - Script evaluation
- **46.2ms** - Script compilation

### Solution: Break into smaller chunks

**Before:**
```
[App.js - 500KB] → Parse: 138ms → Eval: 92ms → Compile: 46ms
```

**After:**
```
[App.js - 200KB]     → 55ms parse
[vendor.js - 150KB]  → 41ms parse (parallelized)
[route1.js - 80KB]   → 23ms parse (lazy loaded)
[route2.js - 70KB]   → 20ms parse (lazy loaded)
Total: ~60-80ms (vs 277ms)
```

### Implementation Steps

#### Step 1: Identify Largest Imports
```bash
npm run build
source-map-explorer 'dist/**/*.js' --list
```

**Record the top 10 largest modules.**

#### Step 2: Create Vendor Bundle
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-core': ['react', 'react-dom'],
        'vendor-router': ['react-router-dom'],
        'vendor-i18n': ['react-i18next'],
        'vendor-ui': ['@radix-ui/themes', '@radix-ui/react-icons'],
        'vendor-other': ['zustand', 'axios'] // or whatever you use
      }
    }
  }
}
```

#### Step 3: Lazy Load Non-Critical Routes
```typescript
// routes.tsx
const NotFound = lazy(() => import("./components/NotFound/NotFound"));
// Other page routes already lazy - ✅ GOOD

// Ensure each route is its own chunk
```

#### Step 4: Monitor Bundle Size in CI/CD
```json
// package.json - Add script
{
  "scripts": {
    "analyze": "source-map-explorer 'dist/**/*.js'",
    "check-size": "bundlesize"
  }
}
```

---

## Bundle Size Targets

Based on analysis, set these targets:

```
Initial (critical path):
├─ App shell (HTML/CSS)      <50KB
├─ React runtime              ~45KB
├─ Core app code              <150KB
└─ Vendor (shared libs)        <200KB
Total: ~445KB (uncompressed)
     ~90KB (gzipped)  ← Target

Non-critical (lazy loaded):
├─ Route chunks               <50KB each
├─ Dialog components          <30KB each
└─ Feature modules            <100KB each
```

---

## Monitoring & Testing

### Before Optimization
```bash
npm run build
# Record:
# - Total bundle size
# - Parse time from trace
# - Load time in DevTools
```

### After Each Change
```bash
npm run build
source-map-explorer 'dist/**/*.js'
# Verify:
# ✓ Total size decreased
# ✓ No new duplicates
# ✓ Main chunk <200KB
```

### Real-World Testing
```bash
# On Chrome DevTools:
# 1. Network tab → Throttle to "Slow 4G"
# 2. Disable cache
# 3. Load page
# 4. Verify parse time < 100ms
# 5. Check LCP < 2.5s
```

---

## Common Issues & Solutions

### Issue 1: Duplicate Dependencies
**Symptom:** Multiple versions of same library in bundle

**Solution:**
```bash
npm ls lodash
# Upgrade all to same version
npm install lodash@latest
```

### Issue 2: Unused Imports
**Symptom:** Large libraries partially used

**Solution:**
```typescript
// ❌ BAD - Imports entire lodash
import _ from 'lodash';
const result = _.map(items, x => x.id);

// ✅ GOOD - Import only what you use
import map from 'lodash/map';
const result = map(items, x => x.id);

// ✅ BETTER - Use native alternatives
const result = items.map(x => x.id);
```

### Issue 3: Side Effects in Imports
**Symptom:** Libraries run code on import, slowing parse

**Solution:**
```typescript
// vite.config.ts
{
  "sideEffects": false  // Tell bundler to tree-shake aggressively
}
```

---

## Recommended Dependency Audit

Check if you're using these "heavy hitters":

| Package | Size | Alternative | Size |
|---------|------|-------------|------|
| lodash | 71KB | lodash-es | 71KB* |
| moment | 67KB | day.js | 2KB ✅ |
| chart.js | 150KB | Lazy load | - |
| date-fns | 80KB | day.js | 2KB |
| axios | 28KB | fetch | 0KB |
| recharts | 500KB | Lazy load | - |

*But with tree-shaking enabled, only ~10KB for commonly used functions

---

## Final Recommendations

### Quick Wins (Already Done ✅)
- [x] Lazy load dialogs and modals
- [x] Code-split routes
- [x] Use Suspense for async components

### Next Steps (Implement)
- [ ] Run `source-map-explorer` and analyze results
- [ ] Create vendor bundle for shared dependencies
- [ ] Check for unused/duplicate dependencies
- [ ] Set up bundle size monitoring
- [ ] Test on slow network

### Expected Impact
- **Parse Time:** 277ms → 80-120ms (70% reduction)
- **Load Time:** Faster by ~200ms
- **Main Bundle:** Current → 60-80KB gzipped

---

## Commands to Run Now

```bash
# 1. Build and analyze
npm run build
npm install -D source-map-explorer
source-map-explorer 'dist/**/*.js'

# 2. Check dependency sizes
npm ls

# 3. List largest modules
source-map-explorer 'dist/**/*.js' --list | head -20

# 4. Compare sizes over time
npm run build && echo $(date) $(stat -c%s dist/index.js) >> bundle-history.txt
```

---

## References

- [Vite Rollup Configuration](https://vitejs.dev/config/build-options.html#build-rollupoptions)
- [Code Splitting Best Practices](https://webpack.js.org/guides/code-splitting/)
- [Bundle Analysis Tools](https://www.npmjs.com/package/source-map-explorer)
- [Web.dev Bundle Size Guide](https://web.dev/reduce-javascript-for-faster-site-performance/)

---

**Status:** Ready to analyze  
**Est. Time:** 2-3 hours to identify and implement optimizations  
**Expected Savings:** 100-200ms on initial load

Run `source-map-explorer` to get started!
