# JSDoc Update Progress

Task: Update JSDoc tags across the codebase to improve LLM parsing and documentation quality using `agentic-jsdoc` standards.

## Progress Tracking

- [x] `src/hooks/`
    - [x] `useErrorDispatcher.ts`
    - [x] `useAnalytics/useAnalytics.ts`
    - [x] `useAppLayout/useAppLayout.tsx`
    - [x] `useBreakpoint/useBreakpoint.tsx`
    - [x] `useBuildFileManager/useBuildFileManager.ts`
    - [x] `useCell/`
    - [x] `useDebouncedValidation/`
    - [x] `useGridDeserializer/`
    - [x] `useInstallPrompt/`
    - [x] `useLanguage/`
    - [x] `useLatest/`
    - [x] `useLoadBuild/`
    - [x] `useMarkdownContent/`
    - [x] `useOptimize/`
    - [x] `useRecommendedBuild/`
    - [x] `useSaveBuild/`
    - [x] `useScrollGridIntoView/`
    - [x] `useScrollHide/`
    - [x] `useSeoAndTitle/`
    - [x] `useShipTypes/`
    - [x] `useTechTree/`
    - [x] `useTechTreeColors/`
    - [x] `useToast/`
    - [x] `useUpdateCheck/`
    - [x] `useUrlSync/`
    - [x] `useUrlValidation/`
    - [x] `useUserStats/`
- [ ] `src/components/` (In Progress)
    - [x] `AppDialog/`
        - [x] `OptimizationAlert/`
        - [x] `ShareLink/`
        - [x] `UserStats/`
        - [x] `Welcome/`
    - [x] `AppFooter/`
    - [x] `AppHeader/`
    - [ ] `BuyMeACoffee/`
    - [ ] `ConditionalTooltip/`
    - [ ] `ErrorBoundary/`
    - [ ] `ErrorMessageRenderer/`
    - [x] `GridCell/`
    - [x] `GridControlButtons/`
    - [ ] `GridShake/`
    - [x] `GridTable/`
    - [x] `GridTableButtons/`
    - [ ] `Icons/`
    - [ ] `InstallPrompt/`
    - [ ] `LanguageSelector/`
    - [x] `MainAppContent/`
    - [ ] `MessageSpinner/`
    - [ ] `MobileToolbar/`
    - [ ] `ModuleSelectionDialog/`
    - [ ] `NotFound/`
    - [ ] `OfflineBanner/`
    - [ ] `RecommendedBuild/`
    - [ ] `RoutedDialogs/`
    - [ ] `ShipSelection/`
    - [ ] `Snowfall/`
    - [ ] `SplashScreen/`
    - [ ] `TapInstructions/`
    - [ ] `TechTree/`
    - [ ] `TechTreeRow/`
    - [ ] `Toast/`
    - [ ] `TooltipManager/`
    - [ ] `UpdatePrompt/`
- [x] `src/utils/`
    - [x] `analytics.ts`
    - [x] `analyticsClient.ts`
    - [x] `api.ts`
    - [x] `apiCall.ts`
    - [x] `apiPreload.ts`
    - [x] `buildFileValidation.ts`
    - [x] `buildNameGenerator.ts`
    - [x] `dialogIconMapping.ts`
    - [x] `fetchWithTimeout.ts`
    - [x] `filenameValidation.ts`
    - [x] `hashUtils.ts`
    - [x] `HttpError.ts`
    - [x] `isBot.ts`
    - [x] `isTouchDevice.ts`
    - [x] `logger.ts`
    - [x] `platformResolver.ts`
    - [x] `radixIconRegistry.ts`
    - [x] `recommendedBuildValidation.ts`
    - [x] `reportWebVitals.ts`
    - [x] `sentry.ts`
    - [x] `setupServiceWorker.ts`
    - [x] `socketManager.ts`
    - [x] `splashScreen.ts`
    - [x] `storage.ts`

## Completed Files

| File Path | Date Updated | Notes |
| :--- | :--- | :--- |
| `src/hooks/useErrorDispatcher.ts` | 2026-03-21 | Added @category, @see links to stores, and improved @example. |
| `src/hooks/useAnalytics/useAnalytics.ts` | 2026-03-21 | Added @category, file @see links, and improved @example. |
| `src/hooks/useAppLayout/useAppLayout.tsx` | 2026-03-21 | Added @category, @see links, and detailed @example. |
| `src/hooks/useBreakpoint/useBreakpoint.tsx" | 2026-03-21 | Added @category, file @see link, and detailed @example. |
| `src/hooks/useBuildFileManager/useBuildFileManager.ts` | 2026-03-21 | Added @category, file @see links, @throws, and detailed @example. |
| `src/hooks/useCell/useCell.ts` | 2026-03-31 | Updated to agentic-jsdoc standards with @remarks and @hook. |
| `src/hooks/useDebouncedValidation/useDebouncedValidation.ts` | 2026-03-31 | Updated to agentic-jsdoc standards with @remarks, @hook, and @example. |
| `src/hooks/useGridDeserializer/useGridDeserializer.tsx` | 2026-03-31 | Updated compression utilities and hook to agentic-jsdoc standards. |
| `src/hooks/useInstallPrompt/useInstallPrompt.ts` | 2026-03-31 | Updated to agentic-jsdoc standards with @remarks and @hook. |
| `src/hooks/useLanguage/useLanguage.ts` | 2026-03-31 | Updated to agentic-jsdoc standards with @remarks, @hook, and @default. |
| `src/hooks/useLatest/useLatest.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useLoadBuild/useLoadBuild.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useMarkdownContent/useMarkdownContent.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useOptimize/useOptimize.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useRecommendedBuild/useRecommendedBuild.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useSaveBuild/useSaveBuild.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useScrollGridIntoView/useScrollGridIntoView.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useScrollHide/useScrollHide.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useSeoAndTitle/useSeoAndTitle.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useShipTypes/useShipTypes.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useTechTree/useTechTree.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useTechTreeColors/useTechTreeColors.ts" | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useToast/useToast.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useUpdateCheck/useUpdateCheck.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useUrlSync/useUrlSync.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/hooks/useUrlValidation/useUrlValidation.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks, @hook, and @category. |
| `src/components/AppDialog/OptimizationAlert/OptimizationAlertContent.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/OptimizationAlert/OptimizationAlertDialog.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/ShareLink/ShareLinkContent.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/ShareLink/ShareLinkDialog.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/UserStats/UserStatsContent.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/UserStats/UserStatsDialog.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/AppDialog/UserStats/UserStatsData.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards. |
| `src/components/GridCell/GridCell.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and helpers documented. |
| `src/components/GridCell/useGridCellInteraction.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and internal logic documented. |
| `src/components/GridCell/useGridCellStyle.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and return object documentation. |
| `src/components/GridTable/GridTable.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and performance notes. |
| `src/components/GridControlButtons/GridControlButtons.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with disabled states documented. |
| `src/components/GridControlButtons/useGridRowState.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @hook and threshold documented. |
| `src/components/GridTableButtons/GridTableButtons.tsx` | 2026-04-07 | Updated to agentic-jsdoc standards with internal helpers documented. |
| `src/components/MainAppContent/SharedBuildCallout.tsx" | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and @component. |
| `src/components/MainAppContent/ShipSelectionHeading.tsx" | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and @component. |
| `src/components/MainAppContent/useMainAppLogic.ts` | 2026-04-07 | Updated to agentic-jsdoc standards with @remarks and @hook. |
| `src/utils/` (All files) | 2026-04-07 | Updated all 24 utility files to agentic-jsdoc standards with @category, @remarks, and expected return values in @example blocks. |
