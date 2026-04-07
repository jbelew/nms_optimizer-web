# Implementation Plan: UI Integration & Stability

Focus on verifying critical data flows and UI regression.

#### Phase 1: Data Parsing Integration
- [x] Task: Create integration test suite for `useGridDeserializer.tsx` using real `.nms` data fixtures <!-- files: src/hooks/useGridDeserializer.test.tsx, src/__fixtures__/builds/ --> 49886d8
- [~] Task: Conductor - User Manual Verification 'Data Parsing Integration' (Protocol in workflow.md)

#### Phase 2: UI Interaction Testing
- [ ] Task: Add Storybook interaction tests for `ShipSelection.tsx` <!-- files: src/components/ShipSelection/ShipSelection.stories.tsx -->
- [ ] Task: Add Storybook interaction tests for `RecommendedBuild.tsx` <!-- files: src/components/RecommendedBuild/RecommendedBuild.stories.tsx -->
- [ ] Task: Conductor - User Manual Verification 'UI Interaction Testing' (Protocol in workflow.md)

#### Phase 3: Infrastructure & Sharing
- [ ] Task: Create tests for `setupServiceWorker.ts` lifecycle <!-- files: src/utils/setupServiceWorker.test.ts -->
- [ ] Task: Create functional tests for `useScreenshot.ts` across viewports <!-- files: src/hooks/useScreenshot.test.ts -->
- [ ] Task: Conductor - User Manual Verification 'Infrastructure & Sharing' (Protocol in workflow.md)

#### Phase 4: Final Regression Audit
- [ ] Task: Run full regression test suite and verify no UI breakage across browsers <!-- files: playwright.config.ts -->
- [ ] Task: Conductor - User Manual Verification 'Final Regression Audit' (Protocol in workflow.md)
