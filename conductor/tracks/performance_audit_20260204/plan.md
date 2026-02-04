# Implementation Plan: Core Web Vitals Performance Audit & Optimization

## Phase 1: Baseline Audit & Analysis [checkpoint: a4fe73f]
- [x] Task: Establish Performance Baseline [checkpoint: a4fe73f]
    - [x] Run Lighthouse in CI/Local production mode and record initial scores for LCP, INP, and CLS. (Baseline: LCP 5.3s, TBT 760ms, CLS 0)
    - [x] Analyze the "Opportunities" and "Diagnostics" sections of the Lighthouse report.
- [x] Task: Identify Bottlenecks [checkpoint: a4fe73f]
    - [x] Use Chrome DevTools Performance panel to record a trace during initial load and grid interactions.
    - [x] Pinpoint specific assets or scripts causing LCP delays or high INP. (Bottlenecks: background blurred image for LCP, React script evaluation for TBT)
    - [x] Refactor \`scripts/performance-check.mjs\` to use \`dist/index.html\` as source of truth for accurate critical path analysis.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Baseline Audit & Analysis' (Protocol in workflow.md) [checkpoint: a4fe73f]

## Phase 2: LCP and CLS Optimizations [checkpoint: a4fe73f]
- [x] Task: Image and Asset Optimization [checkpoint: a4fe73f]
    - [x] Implement \`fetchpriority="high"\` for the LCP background images in \`index.html\`.
    - [x] Corrected invalid Tailwind classes and added explicit \`width\` and \`height\` attributes to the section images in \`TechTreeSection.tsx\`.
    - [x] Verified explicit dimensions for logo and grid cell images.
- [x] Task: Resource Prioritization [checkpoint: a4fe73f]
    - [x] Verified preloading of critical fonts, background images, and translations in \`index.html\`.
    - [x] Further optimized \`manualChunks\` in \`vite.config.ts\` by splitting \`state\` management (Zustand, Immer) from the main React bundle.
    - [x] Added \`fetchpriority="high"\` to entry scripts and primary LCP background image.
- [x] Task: Conductor - User Manual Verification 'Phase 2: LCP and CLS Optimizations' (Protocol in workflow.md) [checkpoint: a4fe73f]

## Phase 3: INP and Main-Thread Optimizations
- [x] Task: Script Execution Audit [checkpoint: a4fe73f]
    - [x] Refactored \`initializeAnalytics\` and \`initializeCloudflareRUM\` to use \`requestIdleCallback\`, reducing boot-up TBT.
    - [x] Optimized \`useOptimize\` hook by using \`requestAnimationFrame\` for progress updates and \`queueMicrotask\` for final result processing, ensuring main-thread availability during complex solves.
- [x] Task: React Component Optimization [checkpoint: a4fe73f]
    - [x] Verified that critical components (\`GridCell\`, \`TechTreeRow\`, etc.) are already memoized.
    - [x] Acknowledged the use of the React compiler for automatic memoization and optimization of the component tree.
- [x] Task: Conductor - User Manual Verification 'Phase 3: INP and Main-Thread Optimizations' (Protocol in workflow.md) [checkpoint: a4fe73f]

## Phase 4: Final Validation [checkpoint: a4fe73f]
- [x] Task: Post-Optimization Audit [checkpoint: a4fe73f]
    - [x] Run Lighthouse again to verify improvements. (Final metrics: LCP 4.7s, TBT 500ms, CLS 0, TTI 4.7s).
    - [x] Verified 50% reduction in CSS bundle size (1.1MB -> 532KB) by stripping P3/light-mode tokens.
    - [x] Perform manual testing on mobile to ensure "second-screen" experience is smooth.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Validation' (Protocol in workflow.md) [checkpoint: a4fe73f]
