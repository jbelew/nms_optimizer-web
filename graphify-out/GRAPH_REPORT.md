# Graph Report - nms_optimizer-web  (2026-09-20)

## Corpus Check
- 437 files · ~197,185 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1661 nodes · 4009 edges · 130 communities (109 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 110 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52aa2772`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- MainAppLayout.tsx
- AppHeader.tsx
- useToast.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- IssueLifecycle
- preview.tsx
- techStore.ts
- Logger
- uiStore.ts
- AppDialog.tsx
- LifecycleCoordinator
- useBreakpoint
- useAnalytics
- __init__.py
- App.tsx
- tracking.ts
- CliIssueTrackerAdapter
- AgentClient
- No Man's Sky Technology Layout Optimizer (Web UI)
- useTechTree.tsx
- userStatsData.tsx
- generate-sitemap.mjs
- TechTree
- lifecycleCoordinator.ts
- useMainAppContext.ts
- environment.ts
- TechTreeRow.tsx
- RoutedDialogs.integration.test.tsx
- dataValidation.ts
- GridTable.tsx
- generate-ssg.mjs
- dialogContext.tsx
- useShipTypes.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- check_all_tasks
- src/constants.ts
- page-metadata.js
- useOptimizeStore
- vite-plugin-markdown-bundle.mjs
- RecommendedBuild.tsx
- useOptimize.tsx
- monitoring.ts
- bootPipeline.tsx
- generate-radix-colors.mjs
- OptimizationAlertDialog.tsx
- sentryMock.ts
- store-helpers.ts
- FakeCommandRunnerAdapter
- gridSerializer.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- ShareLinkDialog.tsx
- applyValidationFeedback.ts
- GridTableButtons.tsx
- process_stream
- spa-routes.test.mjs
- routes.tsx
- RecommendedBuild.stories.tsx
- iconRegistry.ts
- AGENTS.md
- Issue tracker: GitHub
- MainAppContent.stories.tsx
- Agent Guidelines
- Architecture Guidelines
- Code Style Guidelines
- Domain Docs
- [[path]].js
- performance-check.mjs
- run-bench.mjs
- verify-routes-consistency.mjs
- ErrorContent.stories.tsx
- OfflineBanner.stories.tsx
- sessionCoordinator.test.ts
- techRules.ts
- Project Safeguards & Preferences
- Testing Guidelines
- Gemini Agent: Core Directives & Protocols
- Security Policy
- vite-env.d.ts
- eslint.config.js
- react-i18next.tsx
- process-images.mjs
- serve-ssg.mjs
- verify-deployment.mjs
- useShipTypes.test.tsx
- jest-dom-vitest.d.ts
- apiAdapter.ts
- radix-themes.d.ts
- virtual.d.ts
- component-architecture.md
- check-commit-msg-early.mjs
- cloudflare-function.test.mjs
- PrerenderedMarkdownRenderer.tsx
- hashUtils.ts
- critical.d.ts
- virtual-pwa-register.ts
- ralph.sh
- ralph_once.sh
- generate-mobile-background.sh
- generate-ssg.test.mjs
- screenshot.mjs
- screenshot-blurred-background.js
- vite-env-markdown.d.ts
- main.ts
- vitest.config.ts
- vitest.setup.ts

## God Nodes (most connected - your core abstractions)
1. `Logger` - 89 edges
2. `useGridStore` - 81 edges
3. `useBreakpoint()` - 43 edges
4. `usePlatformStore` - 43 edges
5. `LifecycleCoordinator` - 40 edges
6. `useAnalytics()` - 39 edges
7. `useTechStore` - 33 edges
8. `useDialog()` - 32 edges
9. `createGrid()` - 30 edges
10. `IssueLifecycle` - 28 edges

## Surprising Connections (you probably didn't know these)
- `TestGate` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_gate.py → scripts/ralph/adapters.py
- `MockGate` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `TestRunner` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `MockGate` --uses--> `AgentClient`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/agent.py
- `TestRunner` --uses--> `AgentClient`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/agent.py

## Import Cycles
- 2-file cycle: `src/components/RecommendedBuild/RecommendedBuild.tsx -> src/components/RecommendedBuild/RecommendedBuildButton.tsx -> src/components/RecommendedBuild/RecommendedBuild.tsx`
- 2-file cycle: `src/components/ShipSelection/ShipSelection.tsx -> src/components/ShipSelection/ShipSelectionContent.tsx -> src/components/ShipSelection/ShipSelection.tsx`
- 2-file cycle: `src/components/GridTable/GridTable.tsx -> src/components/GridTable/GridTableGrid.tsx -> src/components/GridTable/GridTable.tsx`
- 3-file cycle: `src/components/ErrorBoundary/ErrorBoundary.tsx -> src/components/ErrorBoundary/ErrorContent.tsx -> src/components/ErrorBoundary/ErrorDisplay.tsx -> src/components/ErrorBoundary/ErrorBoundary.tsx`

## Communities (130 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "MainAppLayout.tsx"
Cohesion: 0.07
Nodes (40): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+32 more)

### Community 2 - "AppHeader.tsx"
Cohesion: 0.06
Nodes (29): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+21 more)

### Community 3 - "useToast.ts"
Cohesion: 0.08
Nodes (27): ErrorMessageRenderer(), mockUseTranslation, GridContext, GridContextValue, GridProvider(), Default, meta, Story (+19 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (14): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+6 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (26): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+18 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.16
Nodes (15): mockCellState, GridTableGrid(), useCell(), createGrid(), createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent() (+7 more)

### Community 7 - "IssueLifecycle"
Cohesion: 0.13
Nodes (15): main(), FakeAgentRunnerAdapter, FakeIssueTrackerAdapter, In-memory fake IssueTrackerAdapter for testing., Fake AgentRunnerAdapter for testing., VerificationResult, IssueLifecycle, Assign issue to indicate work has started. (+7 more)

### Community 8 - "preview.tsx"
Cohesion: 0.09
Nodes (18): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), hideSplashScreenAndShowBackground(), TooltipActions, TooltipActionsContext, TooltipState (+10 more)

### Community 9 - "techStore.ts"
Cohesion: 0.15
Nodes (15): useGridCellStyle(), EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY (+7 more)

### Community 10 - "Logger"
Cohesion: 0.16
Nodes (20): App(), ShipSelectionProvider(), RouteContext, RouteContextType, useRouteContext(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling() (+12 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.08
Nodes (25): GridShake(), GridShakeProps, GridTableRoot(), defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore (+17 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.09
Nodes (24): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+16 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "useBreakpoint"
Cohesion: 0.15
Nodes (13): ErrorContent(), ErrorContentProps, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, RecommendedBuildProvider(), TechTreeRoot(), useBreakpoint() (+5 more)

### Community 15 - "useAnalytics"
Cohesion: 0.14
Nodes (16): AppHeaderProvider(), BuyMeACoffee(), LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story (+8 more)

### Community 16 - "__init__.py"
Cohesion: 0.17
Nodes (18): CommandRunnerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.13
Nodes (21): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, mockDialogContext (+13 more)

### Community 18 - "tracking.ts"
Cohesion: 0.13
Nodes (19): NotFound(), TRACKING_ID, AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+11 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.10
Nodes (10): CliIssueTrackerAdapter, IssueTrackerAdapter, Any, Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+2 more)

### Community 20 - "AgentClient"
Cohesion: 0.12
Nodes (17): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Real adapter running `agy` and formatting the NDJSON stream in-process., AgentClient, format_initial_prompt() (+9 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "useTechTree.tsx"
Cohesion: 0.14
Nodes (17): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow, MockGridStoreState, MockTechStoreState (+9 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "TechTree"
Cohesion: 0.14
Nodes (14): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree() (+6 more)

### Community 26 - "lifecycleCoordinator.ts"
Cohesion: 0.15
Nodes (9): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener (+1 more)

### Community 27 - "useMainAppContext.ts"
Cohesion: 0.20
Nodes (15): MainAppProvider(), useMainAppBuildManagement(), useMainAppLogic(), AppLayout, useAppLayout(), useLoadBuild(), UseLoadBuildReturn, useSaveBuild() (+7 more)

### Community 28 - "environment.ts"
Cohesion: 0.21
Nodes (14): InstallPrompt(), UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isTouchDevice(), safeClear(), safeGetItem() (+6 more)

### Community 29 - "TechTreeRow.tsx"
Cohesion: 0.17
Nodes (16): TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps (+8 more)

### Community 30 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.16
Nodes (12): AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer (+4 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (15): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType(), getShipTypeName() (+7 more)

### Community 32 - "GridTable.tsx"
Cohesion: 0.14
Nodes (13): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+5 more)

### Community 33 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 34 - "dialogContext.tsx"
Cohesion: 0.18
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 35 - "useShipTypes.tsx"
Cohesion: 0.20
Nodes (13): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, fetchTechTreeAsync(), preloadInitialState() (+5 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.16
Nodes (11): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged, useGridCellInteraction() (+3 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "check_all_tasks"
Cohesion: 0.12
Nodes (10): check_all_tasks(), extract_blockers(), extract_parent_issue(), Find the first open issue with the 'ready-for-agent' label., Fetch an issue, its comments, and its parent spec if declared., Mark all task list items resolved in issue body, close the issue, and unblock…, Extract blocking issue numbers from a 'Blocked by' section in markdown body., Detect parent spec/epic issue number (e.g., 'Part of #738' or 'Parent #738'). (+2 more)

### Community 41 - "src/constants.ts"
Cohesion: 0.24
Nodes (9): WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions (+1 more)

### Community 42 - "page-metadata.js"
Cohesion: 0.32
Nodes (13): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+5 more)

### Community 43 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "RecommendedBuild.tsx"
Cohesion: 0.27
Nodes (9): RecommendedBuild(), RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext() (+1 more)

### Community 46 - "useOptimize.tsx"
Cohesion: 0.16
Nodes (12): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+4 more)

### Community 47 - "monitoring.ts"
Cohesion: 0.22
Nodes (10): Root(), useThemeStore, createAppRouter(), LogEntry, LogLevel, logs, SentryIntegration, SentrySDK (+2 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.35
Nodes (9): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), setupServiceWorkerRegistration(), mockRegisterSW (+1 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 52 - "store-helpers.ts"
Cohesion: 0.31
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "FakeCommandRunnerAdapter"
Cohesion: 0.24
Nodes (3): FakeCommandRunnerAdapter, In-memory fake CommandRunnerAdapter for testing., TestGit

### Community 54 - "gridSerializer.ts"
Cohesion: 0.31
Nodes (8): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, getTechTreeMaps()

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 58 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 59 - "GridTableButtons.tsx"
Cohesion: 0.31
Nodes (7): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useScreenshot(), UseScreenshotReturn

### Community 60 - "process_stream"
Cohesion: 0.32
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 61 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 62 - "routes.tsx"
Cohesion: 0.29
Nodes (6): languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 63 - "RecommendedBuild.stories.tsx"
Cohesion: 0.25
Nodes (5): Desktop, Mobile, mockTechTree, Story, Tablet

### Community 64 - "iconRegistry.ts"
Cohesion: 0.29
Nodes (6): DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 65 - "AGENTS.md"
Cohesion: 0.29
Nodes (3): Language, NMS Optimizer Web Domain Model, Triage Labels

### Community 66 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 67 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 68 - "Agent Guidelines"
Cohesion: 0.33
Nodes (6): Agent Guidelines, Core Directives, Key Commands & Gotchas, Reference Guides (Progressive Disclosure), Verification Gate (Definition of Done), Workflow References

### Community 69 - "Architecture Guidelines"
Cohesion: 0.33
Nodes (5): Architecture Guidelines, Bundle Strategy, Directory Structure, Hybrid Rendering Flow, Tech Stack

### Community 70 - "Code Style Guidelines"
Cohesion: 0.33
Nodes (6): Code Style Guidelines, Error Handling, React Hook Usage, Tailwind v4, Tooling & Configuration, Zustand & Immer

### Community 71 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 72 - "[[path]].js"
Cohesion: 0.53
Nodes (5): LOCALE_LANGS, onRequest(), NOTE: Some routes may be "Hybrid" (have SSG output for the base path but, SPA_ROUTES, SUPPORTED_LANGS

### Community 73 - "performance-check.mjs"
Cohesion: 0.47
Nodes (5): analyzeBundle(), __dirname, distDir, formatSize(), main()

### Community 74 - "run-bench.mjs"
Cohesion: 0.33
Nodes (3): configPath, __dirname, repoRoot

### Community 75 - "verify-routes-consistency.mjs"
Cohesion: 0.40
Nodes (5): __dirname, DIST, getAllHtmlFiles(), ROUTES_JSON, verify()

### Community 76 - "ErrorContent.stories.tsx"
Cohesion: 0.33
Nodes (5): PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "sessionCoordinator.test.ts"
Cohesion: 0.33
Nodes (5): computeBonusStatus(), mockGridStore, mockPlatformStoreState, mockTechStore, mockUiStore

### Community 79 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 80 - "Project Safeguards & Preferences"
Cohesion: 0.40
Nodes (4): Commit Conventions, iOS Safari Rendering, Project Safeguards & Preferences, SEO (Search Engine Optimization)

### Community 81 - "Testing Guidelines"
Cohesion: 0.40
Nodes (4): Storybook Testing & Builds, Test Environment, Testing Conventions, Testing Guidelines

### Community 82 - "Gemini Agent: Core Directives & Protocols"
Cohesion: 0.40
Nodes (4): Gemini Agent: Core Directives & Protocols, Graphify (Knowledge Graph), JSDoc Guidelines, Tool Protocols

### Community 83 - "Security Policy"
Cohesion: 0.40
Nodes (4): Our Response Process, Reporting a Vulnerability, Security Policy, Supported Versions

### Community 84 - "vite-env.d.ts"
Cohesion: 0.40
Nodes (3): ImportMeta, ImportMetaEnv, Window

### Community 85 - "eslint.config.js"
Cohesion: 0.50
Nodes (3): blankLineRules, jsdocRules, shared

### Community 88 - "serve-ssg.mjs"
Cohesion: 0.50
Nodes (3): __dirname, DIST_DIR, server

### Community 89 - "verify-deployment.mjs"
Cohesion: 0.67
Nodes (3): getHeaders(), LOCALES, verify()

### Community 90 - "useShipTypes.test.tsx"
Cohesion: 0.50
Nodes (3): localStorageMock, mockPushState, mockReplaceState

### Community 91 - "jest-dom-vitest.d.ts"
Cohesion: 0.50
Nodes (3): Assertion, AsymmetricMatchersContaining, vitest

### Community 93 - "radix-themes.d.ts"
Cohesion: 0.50
Nodes (3): @radix-ui/themes/*.css, @radix-ui/themes/tokens/colors/*.css, @radix-ui/themes/tokens/*.css

### Community 94 - "virtual.d.ts"
Cohesion: 0.50
Nodes (3): RegisterSWOptions, virtual:markdown-bundle, virtual:pwa-register

## Knowledge Gaps
- **408 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+403 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `MarkdownContentRenderer.tsx`, `gridStore.ts`, `techStore.ts`, `LifecycleCoordinator`, `useBreakpoint`, `useAnalytics`, `App.tsx`, `tracking.ts`, `useTechTree.tsx`, `TechTree`, `lifecycleCoordinator.ts`, `useMainAppContext.ts`, `environment.ts`, `dataValidation.ts`, `useShipTypes.tsx`, `src/constants.ts`, `useOptimize.tsx`, `monitoring.ts`, `bootPipeline.tsx`, `gridSerializer.ts`, `ShareLinkDialog.tsx`, `GridTableButtons.tsx`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `MainAppLayout.tsx`, `AppHeader.tsx`, `useToast.ts`, `techStore.ts`, `Logger`, `uiStore.ts`, `useBreakpoint`, `useAnalytics`, `useTechTree.tsx`, `TechTree`, `useMainAppContext.ts`, `environment.ts`, `dataValidation.ts`, `GridTable.tsx`, `GridCell.tsx`, `useOptimize.tsx`, `gridSerializer.ts`, `GridTableButtons.tsx`, `RecommendedBuild.stories.tsx`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `preview.tsx`, `bootPipeline.tsx`, `App.tsx`, `tracking.ts`, `lifecycleCoordinator.ts`, `routes.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _408 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `MainAppLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06715063520871144 - nodes in this community are weakly interconnected._
- **Should `AppHeader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06280193236714976 - nodes in this community are weakly interconnected._