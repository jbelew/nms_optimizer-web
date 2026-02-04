# Implementation Plan: Core Web Vitals Performance Audit & Optimization

## Phase 1: Baseline Audit & Analysis
- [x] Task: Establish Performance Baseline [checkpoint: f213802]
    - [x] Run Lighthouse in CI/Local production mode and record initial scores for LCP, INP, and CLS. (Baseline: LCP 5.3s, TBT 760ms, CLS 0)
    - [x] Analyze the "Opportunities" and "Diagnostics" sections of the Lighthouse report.
- [x] Task: Identify Bottlenecks [checkpoint: f213802]
    - [x] Use Chrome DevTools Performance panel to record a trace during initial load and grid interactions.
    - [x] Pinpoint specific assets or scripts causing LCP delays or high INP. (Bottlenecks: background blurred image for LCP, React script evaluation for TBT)
    - [x] Refactor \`scripts/performance-check.mjs\` to use \`dist/index.html\` as source of truth for accurate critical path analysis.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Baseline Audit & Analysis' (Protocol in workflow.md) [checkpoint: f213802]

## Phase 2: LCP and CLS Optimizations
- [x] Task: Image and Asset Optimization [checkpoint: f213802]
    - [x] Implement \`fetchpriority="high"\` for the LCP background images in \`index.html\`.
    - [x] Corrected invalid Tailwind classes and added explicit \`width\` and \`height\` attributes to the section images in \`TechTreeSection.tsx\`.
    - [x] Verified explicit dimensions for logo and grid cell images.
- [x] Task: Resource Prioritization [checkpoint: f213802]
    - [x] Verified preloading of critical fonts, background images, and translations in \`index.html\`.
    - [x] Further optimized \`manualChunks\` in \`vite.config.ts\` by splitting \`state\` management (Zustand, Immer) from the main React bundle.
    - [x] Added \`fetchpriority="high"\` to entry scripts and primary LCP background image.
- [x] Task: Conductor - User Manual Verification 'Phase 2: LCP and CLS Optimizations' (Protocol in workflow.md) [checkpoint: f213802]

## Phase 3: INP and Main-Thread Optimizations
- [ ] Task: Script Execution Audit
    - [ ] Identify and defer non-critical third-party scripts.
    - [ ] Break up long tasks (>50ms) in the optimization algorithm or grid rendering using `setTimeout` or `requestIdleCallback` if necessary.
- [ ] Task: React Component Optimization
    - [ ] Use `React.memo` or `useMemo` where appropriate to prevent unnecessary re-renders during interactions.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: INP and Main-Thread Optimizations' (Protocol in workflow.md)

## Phase 4: Final Validation
- [ ] Task: Post-Optimization Audit
    - [ ] Run Lighthouse again to verify improvements.
    - [ ] Perform manual testing on mobile to ensure "second-screen" experience is smooth.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Validation' (Protocol in workflow.md)
