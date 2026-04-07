# Implementation Plan: Finalize Agentic-JSDoc Standards Migration

This plan follows a batch-based approach to systematically complete the JSDoc migration.

#### Phase 1: Core Utilities - Batch 1 <!-- depends: --> <!-- execution: parallel -->
- [~] Task: Update JSDoc for `src/utils/` (Files 1-8: `analytics.ts` to `dialogIconMapping.ts`) <!-- files: src/utils/analytics.ts, src/utils/analyticsClient.ts, src/utils/api.ts, src/utils/apiCall.ts, src/utils/apiPreload.ts, src/utils/buildFileValidation.ts, src/utils/buildNameGenerator.ts, src/utils/dialogIconMapping.ts -->
- [ ] Task: Update JSDoc for `src/utils/` (Files 9-16: `fetchWithTimeout.ts` to `logger.ts`) <!-- files: src/utils/fetchWithTimeout.ts, src/utils/filenameValidation.ts, src/utils/hashUtils.ts, src/utils/HttpError.ts, src/utils/isBot.ts, src/utils/isTouchDevice.ts, src/utils/logger.ts -->
- [ ] Task: Conductor - User Manual Verification 'Core Utilities - Batch 1' (Protocol in workflow.md) <!-- depends: task1, task2 -->

#### Phase 2: Core Utilities - Batch 2 <!-- execution: parallel -->
- [ ] Task: Update JSDoc for `src/utils/` (Files 17-24: `platformResolver.ts` to `storage.ts`) <!-- files: src/utils/platformResolver.ts, src/utils/radixIconRegistry.ts, src/utils/recommendedBuildValidation.ts, src/utils/reportWebVitals.ts, src/utils/sentry.ts, src/utils/setupServiceWorker.ts, src/utils/socketManager.ts, src/utils/splashScreen.ts, src/utils/storage.ts -->
- [ ] Task: Update `docs/JSDOC_PROGRESS.md` for all completed Utilities. <!-- files: docs/JSDOC_PROGRESS.md -->
- [ ] Task: Conductor - User Manual Verification 'Core Utilities - Batch 2' (Protocol in workflow.md) <!-- depends: task1, task2 -->

#### Phase 3: UI Components - Batch 1 <!-- depends: --> <!-- execution: parallel -->
- [ ] Task: Update JSDoc for `src/components/` (Items 1-8: `BuyMeACoffee/` to `GridShake/`) <!-- files: src/components/BuyMeACoffee/, src/components/ConditionalTooltip/, src/components/ErrorBoundary/, src/components/ErrorMessageRenderer/, src/components/GridShake/ -->
- [ ] Task: Update JSDoc for `src/components/` (Items 9-16: `Icons/` to `NotFound/`) <!-- files: src/components/Icons/, src/components/InstallPrompt/, src/components/LanguageSelector/, src/components/MessageSpinner/, src/components/MobileToolbar/, src/components/ModuleSelectionDialog/, src/components/NotFound/ -->
- [ ] Task: Conductor - User Manual Verification 'UI Components - Batch 1' (Protocol in workflow.md) <!-- depends: task1, task2 -->

#### Phase 4: UI Components - Batch 2 <!-- execution: parallel -->
- [ ] Task: Update JSDoc for `src/components/` (Items 17-24: `OfflineBanner/` to `UpdatePrompt/`) <!-- files: src/components/OfflineBanner/, src/components/RecommendedBuild/, src/components/RoutedDialogs/, src/components/ShipSelection/, src/components/Snowfall/, src/components/SplashScreen/, src/components/TapInstructions/, src/components/TechTree/, src/components/TechTreeRow/, src/components/Toast/, src/components/TooltipManager/, src/components/UpdatePrompt/ -->
- [ ] Task: Update `docs/JSDOC_PROGRESS.md` for all completed Components. <!-- files: docs/JSDOC_PROGRESS.md -->
- [ ] Task: Conductor - User Manual Verification 'UI Components - Batch 2' (Protocol in workflow.md) <!-- depends: task1, task2 -->

#### Phase 5: Final Audit & Compliance
- [ ] Task: Run project-wide ESLint/JSDoc check to verify 100% compliance.
- [ ] Task: Final update to `docs/JSDOC_PROGRESS.md` (Mark all as complete). <!-- files: docs/JSDOC_PROGRESS.md -->
- [ ] Task: Conductor - User Manual Verification 'Final Audit & Compliance' (Protocol in workflow.md)
