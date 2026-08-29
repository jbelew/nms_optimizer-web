# Graph Report - src  (2026-08-08)

## Corpus Check
- 339 files · ~147,108 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1096 nodes · 3012 edges · 64 communities (52 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.61)
- Token cost: 20,114 input · 879 output

## Community Hubs (Navigation)
- App Entry and Constants
- Performance Chart Components
- Grid Styling and Selection
- App Dialog System
- Error Boundary Handling
- Ship Selection Feature
- User Stats and Performance
- App Header Components
- Markdown Content Rendering
- Main Content Storybook
- Module Selection Logic
- Main App Layout
- Build Name Management
- Error Messaging System
- Grid Row Controls
- Tech Tree Data Fetching
- Grid Management Hooks
- Grid Cell Components
- Recommended Build Feature
- Build Logic Testing
- API and Optimization Manager
- Grid Interaction Mocking
- Grid Context and Testing
- SEO and Localization
- Tech Tree Component
- Grid State Management
- App Footer System
- Language and Mobile Toolbar
- Optimization Hooks
- Tech Tree Sections
- Routing and Validation
- Error Dialog Components
- Footer and Dialog Testing
- Header and Breakpoint Utilities
- Sentry Monitoring Integration
- App Routing and Lazy Loading
- Analytics and Web Vitals
- Main App Logic Hooks
- Grid Serialization Utilities
- Welcome Content Dialog
- Tech Tree List Views
- Recommended Build Stories
- Grid Data Factories
- Update Prompt UI
- Update Check Logic
- Fireworks Animation
- Offline Status Banner
- Cell Interaction Store
- Vite Environment Types
- Ship Type Testing
- API Adapter Utilities
- Prerendered Markdown
- App Assets
- Markdown Type Definitions
- German Language Support
- Spanish Language Support
- French Language Support
- Italian Language Support
- Portuguese Language Support
- English Language Support
- Placeholder Localization

## God Nodes (most connected - your core abstractions)
1. `useGridStore` - 81 edges
2. `Logger` - 81 edges
3. `usePlatformStore` - 44 edges
4. `useBreakpoint()` - 42 edges
5. `useAnalytics()` - 39 edges
6. `useTechStore` - 31 edges
7. `useDialog()` - 31 edges
8. `createGrid()` - 27 edges
9. `TechTree` - 24 edges
10. `createEmptyCell()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AppFooterContextValue` --references--> `DialogType`  [EXTRACTED]
  components/AppFooter/useAppFooterContext.ts → utils/system/dialogUtils.ts
- `StorybookWrapper()` --calls--> `createGrid()`  [EXTRACTED]
  components/MainAppContent/MainAppContent.stories.tsx → store/grid/gridFactories.ts
- `TechTreeProps` --references--> `TechTree`  [EXTRACTED]
  components/TechTree/TechTree.tsx → types/tech.ts
- `TechTreeContentProps` --references--> `TechTree`  [EXTRACTED]
  components/TechTree/TechTreeContent.tsx → types/tech.ts
- `useAnalytics()` --indirect_call--> `sendEvent()`  [INFERRED]
  hooks/useAnalytics/useAnalytics.ts → utils/analytics/tracking.ts

## Import Cycles
- 2-file cycle: `components/RecommendedBuild/RecommendedBuild.tsx -> components/RecommendedBuild/RecommendedBuildButton.tsx -> components/RecommendedBuild/RecommendedBuild.tsx`
- 2-file cycle: `components/ShipSelection/ShipSelection.tsx -> components/ShipSelection/ShipSelectionContent.tsx -> components/ShipSelection/ShipSelection.tsx`
- 2-file cycle: `components/GridTable/GridTable.tsx -> components/GridTable/GridTableGrid.tsx -> components/GridTable/GridTable.tsx`
- 3-file cycle: `components/ErrorBoundary/ErrorBoundary.tsx -> components/ErrorBoundary/ErrorContent.tsx -> components/ErrorBoundary/ErrorDisplay.tsx -> components/ErrorBoundary/ErrorBoundary.tsx`

## Hyperedges (group relationships)
- **Localization Flag Assets** — src_assets_svg_flags_de, src_assets_svg_flags_es, src_assets_svg_flags_fr, src_assets_svg_flags_it, src_assets_svg_flags_pt, src_assets_svg_flags_us, src_assets_svg_flags_xx [INFERRED 0.90]

## Communities (64 total, 12 thin omitted)

### Community 0 - "App Entry and Constants"
Cohesion: 0.06
Nodes (64): App(), InstallPrompt(), TRACKING_ID, UI_TIMING, WS_URL, useFileHandling(), fetchShipTypes(), bootstrap() (+56 more)

### Community 1 - "Performance Chart Components"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 2 - "Grid Styling and Selection"
Cohesion: 0.07
Nodes (39): useGridCellStyle(), GridShake(), GridShakeProps, EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext (+31 more)

### Community 3 - "App Dialog System"
Cohesion: 0.05
Nodes (33): AppDialog, AppDialogBody(), AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogProps, AppDialogRoot(), AppDialogTitle() (+25 more)

### Community 4 - "Error Boundary Handling"
Cohesion: 0.06
Nodes (26): ErrorBoundary, Props, State, ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack (+18 more)

### Community 5 - "Ship Selection Feature"
Cohesion: 0.09
Nodes (31): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionProvider(), ShipSelectionRoot(), ShipSelectionSkeleton() (+23 more)

### Community 6 - "User Stats and Performance"
Cohesion: 0.10
Nodes (21): PerformanceDialog(), PerformanceDialogProps, UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData() (+13 more)

### Community 7 - "App Header Components"
Cohesion: 0.08
Nodes (24): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+16 more)

### Community 8 - "Markdown Content Rendering"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 9 - "Main Content Storybook"
Cohesion: 0.08
Nodes (23): Default, Solving, Story, Default, Story, MainAppContent(), Desktop, Mobile (+15 more)

### Community 10 - "Module Selection Logic"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 11 - "Main App Layout"
Cohesion: 0.16
Nodes (22): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppLayoutContent() (+14 more)

### Community 12 - "Build Name Management"
Cohesion: 0.14
Nodes (17): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, mockRestoreGridState, useBuildFileManager(), useDebouncedValidation() (+9 more)

### Community 13 - "Error Messaging System"
Cohesion: 0.13
Nodes (21): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+13 more)

### Community 14 - "Grid Row Controls"
Cohesion: 0.19
Nodes (13): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+5 more)

### Community 15 - "Tech Tree Data Fetching"
Cohesion: 0.19
Nodes (14): API_URL, MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, cache, clearTechTreeCache(), fetchTechTree(), fetchTechTreeAsync() (+6 more)

### Community 16 - "Grid Management Hooks"
Cohesion: 0.24
Nodes (14): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, useMainAppBuildManagement(), useAnalytics(), useLoadBuild(), UseLoadBuildReturn (+6 more)

### Community 17 - "Grid Cell Components"
Cohesion: 0.18
Nodes (10): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, useGridCellInteraction(), EmptyCellIcon(), EmptyCellIconProps (+2 more)

### Community 18 - "Recommended Build Feature"
Cohesion: 0.26
Nodes (11): RecommendedBuild(), RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildProvider(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue (+3 more)

### Community 19 - "Build Logic Testing"
Cohesion: 0.20
Nodes (11): createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore, mockInteractionStore, mockModuleSelectionStore, mockTechBonusStore, mockTechStore (+3 more)

### Community 20 - "API and Optimization Manager"
Cohesion: 0.18
Nodes (12): ApiResponse, Grid, GridStore, TechStore, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions (+4 more)

### Community 21 - "Grid Interaction Mocking"
Cohesion: 0.13
Nodes (14): mockClearInitialCellStateForTap, mockHandleCellDoubleTap, mockHandleCellTap, mockIncrementGridFixed, mockIncrementModuleLocked, mockIncrementRowLimit, mockIncrementSuperchargedFixed, mockIncrementSuperchargedLimit (+6 more)

### Community 22 - "Grid Context and Testing"
Cohesion: 0.17
Nodes (9): GridContext, GridContextValue, GridProvider(), Default, meta, Story, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef (+1 more)

### Community 23 - "SEO and Localization"
Cohesion: 0.25
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 24 - "Tech Tree Component"
Cohesion: 0.18
Nodes (9): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeRoot() (+1 more)

### Community 25 - "Grid State Management"
Cohesion: 0.31
Nodes (4): createEmptyCell(), createGrid(), resetCellContent(), debouncedStorage

### Community 26 - "App Footer System"
Cohesion: 0.23
Nodes (8): AppFooterContent(), AppFooterRating(), AppFooterRoot(), AppFooterProvider(), AppFooterContext, AppFooterContextValue, useAppFooterContext(), BuyMeACoffee()

### Community 27 - "Language and Mobile Toolbar"
Cohesion: 0.21
Nodes (9): LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, languages, nativeLanguageNames (+1 more)

### Community 28 - "Optimization Hooks"
Cohesion: 0.18
Nodes (11): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+3 more)

### Community 29 - "Tech Tree Sections"
Cohesion: 0.23
Nodes (8): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow, TechTreeItem, TechTreeMaps

### Community 30 - "Routing and Validation"
Cohesion: 0.27
Nodes (9): AppContent(), MarkdownContentRenderer, RoutedDialogs(), PlatformStoreSelector, PlatformStoreState, UseDebouncedValidationOptions, useUrlNormalization(), useUrlValidation() (+1 more)

### Community 31 - "Error Dialog Components"
Cohesion: 0.30
Nodes (6): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, useOptimizeStore

### Community 32 - "Footer and Dialog Testing"
Cohesion: 0.17
Nodes (5): AppFooter, Desktop, Mobile, Story, Tablet

### Community 33 - "Header and Breakpoint Utilities"
Cohesion: 0.27
Nodes (5): AppHeaderProvider(), MessageSpinner(), MessageSpinnerProps, TechTreeSkeleton(), useBreakpoint()

### Community 35 - "App Routing and Lazy Loading"
Cohesion: 0.22
Nodes (8): OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, lazyNamed(), ReactLazyInternal

### Community 36 - "Analytics and Web Vitals"
Cohesion: 0.29
Nodes (8): AppHeaderContext, AppHeaderContextValue, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), DialogType

### Community 37 - "Main App Logic Hooks"
Cohesion: 0.33
Nodes (7): useMainAppLogic(), registerToolbarForceShow(), __resetScrollGridIntoViewRef(), sharedGridContainerRef, useScrollHide(), UseScrollHideReturn, getBuildDate()

### Community 38 - "Grid Serialization Utilities"
Cohesion: 0.38
Nodes (8): decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, useRecommendedBuild(), useScrollGridIntoView(), RecommendedBuild, getTechTreeMaps(), isValidRecommendedBuild()

### Community 39 - "Welcome Content Dialog"
Cohesion: 0.33
Nodes (6): mockDialogContext, TransProps, WelcomeContent(), WelcomeContentProps, DialogContext, DialogContextType

### Community 40 - "Tech Tree List Views"
Cohesion: 0.31
Nodes (5): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreeList()

### Community 41 - "Recommended Build Stories"
Cohesion: 0.25
Nodes (5): Desktop, Mobile, mockTechTree, Story, Tablet

### Community 42 - "Grid Data Factories"
Cohesion: 0.43
Nodes (5): createCellFromModuleData(), GridActions, GridComputed, GridState, Module

### Community 43 - "Update Prompt UI"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 44 - "Update Check Logic"
Cohesion: 0.57
Nodes (3): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck()

### Community 45 - "Fireworks Animation"
Cohesion: 0.40
Nodes (3): FireworkProps, Fireworks, NMS_COLORS

### Community 46 - "Offline Status Banner"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 47 - "Cell Interaction Store"
Cohesion: 0.70
Nodes (3): Cell, InteractionState, useInteractionStore

### Community 48 - "Vite Environment Types"
Cohesion: 0.40
Nodes (3): ImportMeta, ImportMetaEnv, Window

### Community 49 - "Ship Type Testing"
Cohesion: 0.50
Nodes (3): localStorageMock, mockPushState, mockReplaceState

## Knowledge Gaps
- **282 isolated node(s):** `OfflineBanner`, `ShareLinkDialog`, `WelcomeContent`, `RoutedDialogs`, `UserStatsRoute` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `App Entry and Constants` to `App Dialog System`, `App Routing and Lazy Loading`, `Error Boundary Handling`, `Ship Selection Feature`, `Grid Serialization Utilities`, `Tech Tree List Views`, `Markdown Content Rendering`, `User Stats and Performance`, `Build Name Management`, `Update Check Logic`, `Cell Interaction Store`, `Grid Management Hooks`, `Grid Cell Components`, `Tech Tree Data Fetching`, `API and Optimization Manager`, `Grid State Management`, `Optimization Hooks`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `Grid Row Controls` to `App Entry and Constants`, `Grid Styling and Selection`, `Ship Selection Feature`, `App Header Components`, `Main Content Storybook`, `Main App Layout`, `Build Name Management`, `Tech Tree Data Fetching`, `Grid Management Hooks`, `Grid Cell Components`, `Build Logic Testing`, `API and Optimization Manager`, `Grid Interaction Mocking`, `Grid Context and Testing`, `Tech Tree Component`, `Grid State Management`, `Language and Mobile Toolbar`, `Optimization Hooks`, `Header and Breakpoint Utilities`, `Main App Logic Hooks`, `Grid Serialization Utilities`, `Recommended Build Stories`, `Cell Interaction Store`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `useBreakpoint()` connect `Header and Breakpoint Utilities` to `Grid Styling and Selection`, `Error Boundary Handling`, `Main App Logic Hooks`, `Ship Selection Feature`, `Grid Serialization Utilities`, `Main App Layout`, `Update Prompt UI`, `Grid Row Controls`, `Grid Management Hooks`, `Recommended Build Feature`, `Grid Context and Testing`, `Tech Tree Component`, `App Footer System`, `Language and Mobile Toolbar`, `Optimization Hooks`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `useAnalytics()` (e.g. with `sendDeferredEvent()` and `sendEvent()`) actually correct?**
  _`useAnalytics()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `OfflineBanner`, `ShareLinkDialog`, `WelcomeContent` to the rest of the system?**
  _282 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Entry and Constants` be split into smaller, more focused modules?**
  _Cohesion score 0.05696636925188744 - nodes in this community are weakly interconnected._
- **Should `Performance Chart Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._