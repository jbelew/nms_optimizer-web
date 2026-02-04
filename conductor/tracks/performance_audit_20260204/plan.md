# Implementation Plan: Core Web Vitals Performance Audit & Optimization

## Phase 1: Baseline Audit & Analysis
- [ ] Task: Establish Performance Baseline
    - [ ] Run Lighthouse in CI/Local production mode and record initial scores for LCP, INP, and CLS.
    - [ ] Analyze the "Opportunities" and "Diagnostics" sections of the Lighthouse report.
- [ ] Task: Identify Bottlenecks
    - [ ] Use Chrome DevTools Performance panel to record a trace during initial load and grid interactions.
    - [ ] Pinpoint specific assets or scripts causing LCP delays or high INP.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Baseline Audit & Analysis' (Protocol in workflow.md)

## Phase 2: LCP and CLS Optimizations
- [ ] Task: Image and Asset Optimization
    - [ ] Implement `priority` loading for the LCP image.
    - [ ] Ensure all images and icons have explicit `width` and `height` attributes to prevent CLS.
- [ ] Task: Resource Prioritization
    - [ ] Add `<link rel="preload">` or `<link rel="preconnect">` for critical fonts and API endpoints.
    - [ ] Review and optimize Vite's chunking strategy for critical path assets.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: LCP and CLS Optimizations' (Protocol in workflow.md)

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
