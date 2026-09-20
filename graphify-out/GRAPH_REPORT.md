# Graph Report - nms_optimizer-web  (2026-09-20)

## Corpus Check
- 437 files · ~197,413 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1665 nodes · 4024 edges · 141 communities (119 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc2077ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- uiStore.ts
- AppFooter.tsx
- useToast.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeIssueTrackerAdapter
- Root.tsx
- techStore.ts
- platformStore.ts
- TechTreeRow.test.tsx
- AppDialog.tsx
- LifecycleCoordinator
- useBreakpoint
- useDialog
- __init__.py
- App.tsx
- tracking.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- TechTreeItem
- userStatsData.tsx
- generate-ssg.mjs
- TechTreeContent.tsx
- ErrorBoundary.tsx
- AppHeader.tsx
- environment.ts
- TechTreeRow.tsx
- RoutedDialogs.integration.test.tsx
- buildNameGenerator.ts
- useGridStore
- ShipSelectionProvider.tsx
- dialogContext.tsx
- useTechTree.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- FakeCommandRunnerAdapter
- IssueLifecycle
- src/constants.ts
- page-metadata.js
- useTechTreeRow.ts
- vite-plugin-markdown-bundle.mjs
- TechTree
- useOptimize.test.tsx
- monitoring.ts
- bootPipeline.tsx
- generate-radix-colors.mjs
- OptimizationAlertDialog.tsx
- sentryMock.ts
- store-helpers.ts
- TechTree.tsx
- Logger
- create_screenshot_video.py
- update-lighthouse-history.mjs
- ShareLinkDialog.tsx
- Cell
- useAnalytics
- AgentRunnerAdapter
- ModuleSelectionDialog.stories.tsx
- routes.tsx
- RecommendedBuild.stories.tsx
- lifecycleCoordinator.ts
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
- ErrorBoundary/ErrorContent.tsx
- OfflineBanner.stories.tsx
- sessionCoordinator.ts
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
- preview.tsx
- LanguageSelector.tsx
- GridTableButtons.stories.tsx
- AppHeader.stories.tsx
- useTechOptimization.ts
- useMarkdownContent.ts
- TechTree.stories.tsx
- UpdatePrompt.tsx
- UpdatePromptWrapper.tsx
- reportWebVitals.ts
- youTubeEmbed.tsx

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
10. `IssueLifecycle` - 29 edges

## Surprising Connections (you probably didn't know these)
- `MockGate` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `TestRunner` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `TestIssues` --uses--> `FakeIssueTrackerAdapter`  [INFERRED]
  tests/scripts/test_issues.py → scripts/ralph/adapters.py
- `MockGate` --uses--> `VerificationGate`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/gate.py
- `TestRunner` --uses--> `VerificationGate`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/gate.py

## Import Cycles
- 2-file cycle: `src/components/RecommendedBuild/RecommendedBuild.tsx -> src/components/RecommendedBuild/RecommendedBuildButton.tsx -> src/components/RecommendedBuild/RecommendedBuild.tsx`
- 2-file cycle: `src/components/ShipSelection/ShipSelection.tsx -> src/components/ShipSelection/ShipSelectionContent.tsx -> src/components/ShipSelection/ShipSelection.tsx`
- 2-file cycle: `src/components/GridTable/GridTable.tsx -> src/components/GridTable/GridTableGrid.tsx -> src/components/GridTable/GridTable.tsx`
- 3-file cycle: `src/components/ErrorBoundary/ErrorBoundary.tsx -> src/components/ErrorBoundary/ErrorContent.tsx -> src/components/ErrorBoundary/ErrorDisplay.tsx -> src/components/ErrorBoundary/ErrorBoundary.tsx`

## Communities (141 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "uiStore.ts"
Cohesion: 0.05
Nodes (60): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, MainAppContent(), MainAppProvider(), MainAppGridSection() (+52 more)

### Community 2 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 3 - "useToast.ts"
Cohesion: 0.13
Nodes (16): Default, Story, ShipSelection(), Default, Story, NmsToast(), Default, Error (+8 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.09
Nodes (5): H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.18
Nodes (13): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+5 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.24
Nodes (6): createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), Grid, StoreResetWrapper()

### Community 7 - "FakeIssueTrackerAdapter"
Cohesion: 0.17
Nodes (13): FakeAgentRunnerAdapter, FakeIssueTrackerAdapter, In-memory fake IssueTrackerAdapter for testing., Fake AgentRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "Root.tsx"
Cohesion: 0.18
Nodes (13): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), Root(), useThemeStore, createAppRouter(), TooltipActions (+5 more)

### Community 9 - "techStore.ts"
Cohesion: 0.16
Nodes (15): useGridCellStyle(), EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree() (+7 more)

### Community 10 - "platformStore.ts"
Cohesion: 0.24
Nodes (10): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl() (+2 more)

### Community 11 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.12
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialog, AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter() (+12 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "useBreakpoint"
Cohesion: 0.22
Nodes (10): {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, ShipSelectionSkeleton(), useBreakpoint(), useRecommendedBuild(), __resetScrollGridIntoViewRef(), sharedGridContainerRef (+2 more)

### Community 15 - "useDialog"
Cohesion: 0.10
Nodes (24): DynamicRadixIcon(), DynamicRadixIconProps, UserStatsDialog(), mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps (+16 more)

### Community 16 - "__init__.py"
Cohesion: 0.16
Nodes (19): CommandRunnerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, Module for running the verification gatekeeper and reporting distilled results., commit() (+11 more)

### Community 17 - "App.tsx"
Cohesion: 0.10
Nodes (27): App(), AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent (+19 more)

### Community 18 - "tracking.ts"
Cohesion: 0.17
Nodes (14): NotFound(), AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult(), getClientId() (+6 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.10
Nodes (10): CliIssueTrackerAdapter, IssueTrackerAdapter, Any, Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+2 more)

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "TechTreeItem"
Cohesion: 0.22
Nodes (9): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, GridActions, GridState, Module, TechTreeItem (+1 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.17
Nodes (13): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), UserStatsDialogProps, useTechTreeColors() (+5 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 25 - "TechTreeContent.tsx"
Cohesion: 0.31
Nodes (5): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreeList()

### Community 26 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, handleError(), RouteError(), captureException()

### Community 27 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 28 - "environment.ts"
Cohesion: 0.25
Nodes (13): InstallPrompt(), UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isTouchDevice(), safeClear(), safeGetItem() (+5 more)

### Community 29 - "TechTreeRow.tsx"
Cohesion: 0.24
Nodes (10): TechTreeSectionList(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges() (+2 more)

### Community 30 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.13
Nodes (16): getRoutedDialogs(), PAGE_REGISTRY, LoremIpsumSkeleton(), PerformanceDialog(), PerformanceDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer (+8 more)

### Community 31 - "buildNameGenerator.ts"
Cohesion: 0.36
Nodes (6): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES

### Community 32 - "useGridStore"
Cohesion: 0.16
Nodes (15): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+7 more)

### Community 33 - "ShipSelectionProvider.tsx"
Cohesion: 0.25
Nodes (9): ShipSelectionProps, ShipSelectionContent(), ShipSelectionRoot(), ShipSelectionTrigger(), GroupedShipType, ShipSelectionContext, ShipSelectionContextValue, useShipSelectionContext() (+1 more)

### Community 34 - "dialogContext.tsx"
Cohesion: 0.17
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 35 - "useTechTree.tsx"
Cohesion: 0.19
Nodes (13): API_URL, MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, cache, clearTechTreeCache(), fetchTechTree(), fetchTechTreeAsync() (+5 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.14
Nodes (13): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+5 more)

### Community 39 - "FakeCommandRunnerAdapter"
Cohesion: 0.12
Nodes (11): FakeCommandRunnerAdapter, In-memory fake CommandRunnerAdapter for testing., distill_gate_output(), Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi() (+3 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.13
Nodes (14): main(), check_all_tasks(), extract_blockers(), extract_parent_issue(), IssueLifecycle, Domain module for GitHub issue lifecycle, blocker graph resolution, and task…, Assign issue to indicate work has started., Mark all task list items resolved in issue body, close the issue, and unblock… (+6 more)

### Community 41 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 42 - "page-metadata.js"
Cohesion: 0.14
Nodes (20): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading() (+12 more)

### Community 43 - "useTechTreeRow.ts"
Cohesion: 0.26
Nodes (9): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), SelectedTechData, TechTreeRowProps (+1 more)

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "TechTree"
Cohesion: 0.32
Nodes (9): RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildProvider(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext() (+1 more)

### Community 46 - "useOptimize.test.tsx"
Cohesion: 0.20
Nodes (9): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState, GridStore (+1 more)

### Community 47 - "monitoring.ts"
Cohesion: 0.24
Nodes (7): LogEntry, LogLevel, logs, SentryIntegration, SentrySDK, __setSentryInstance(), sentryMock

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

### Community 53 - "TechTree.tsx"
Cohesion: 0.21
Nodes (9): MessageSpinner(), MessageSpinnerProps, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeRecommended(), TechTreeRoot(), TechTreeSkeleton() (+1 more)

### Community 54 - "Logger"
Cohesion: 0.22
Nodes (14): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+6 more)

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 58 - "Cell"
Cohesion: 0.26
Nodes (9): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, Cell, GridComputed (+1 more)

### Community 59 - "useAnalytics"
Cohesion: 0.20
Nodes (16): BuyMeACoffee(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useAnalytics(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
} (+8 more)

### Community 60 - "AgentRunnerAdapter"
Cohesion: 0.13
Nodes (12): Protocol, format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout)., AgentRunnerAdapter (+4 more)

### Community 61 - "ModuleSelectionDialog.stories.tsx"
Cohesion: 0.14
Nodes (10): ModuleSelectionDialog, Corvette, Default, meta, Story, defaultProps, MockAppDialogProps, mockGroupedModules (+2 more)

### Community 62 - "routes.tsx"
Cohesion: 0.33
Nodes (5): DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 63 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 64 - "lifecycleCoordinator.ts"
Cohesion: 0.26
Nodes (6): runWhenIdle(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, hideSplashScreenAndShowBackground(), SplashHider()

### Community 65 - "AGENTS.md"
Cohesion: 0.29
Nodes (3): Language, NMS Optimizer Web Domain Model, Triage Labels

### Community 66 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 67 - "MainAppContent.stories.tsx"
Cohesion: 0.20
Nodes (8): Desktop, Mobile, Story, StorybookWrapper(), Tablet, AppLayout, useAppLayout(), useUiStore

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

### Community 76 - "ErrorBoundary/ErrorContent.tsx"
Cohesion: 0.16
Nodes (9): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, ErrorDisplay() (+1 more)

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "sessionCoordinator.ts"
Cohesion: 0.22
Nodes (8): createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState, mockTechStore, mockUiStore, BonusStatusData

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

### Community 130 - "preview.tsx"
Cohesion: 0.18
Nodes (6): BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview

### Community 131 - "LanguageSelector.tsx"
Cohesion: 0.29
Nodes (7): ErrorMessageRenderer(), mockUseTranslation, LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames, useErrorStore

### Community 132 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 133 - "AppHeader.stories.tsx"
Cohesion: 0.22
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 134 - "useTechOptimization.ts"
Cohesion: 0.36
Nodes (5): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), useShakeStore

### Community 135 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

### Community 136 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 137 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 138 - "UpdatePromptWrapper.tsx"
Cohesion: 0.57
Nodes (3): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck()

### Community 139 - "reportWebVitals.ts"
Cohesion: 0.53
Nodes (4): reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric()

## Knowledge Gaps
- **409 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `uiStore.ts`, `useTechOptimization.ts`, `useMarkdownContent.ts`, `gridStore.ts`, `techStore.ts`, `platformStore.ts`, `UpdatePromptWrapper.tsx`, `reportWebVitals.ts`, `LifecycleCoordinator`, `useBreakpoint`, `useDialog`, `App.tsx`, `tracking.ts`, `TechTreeContent.tsx`, `ErrorBoundary.tsx`, `environment.ts`, `ShipSelectionProvider.tsx`, `useTechTree.tsx`, `src/constants.ts`, `monitoring.ts`, `bootPipeline.tsx`, `ShareLinkDialog.tsx`, `useAnalytics`, `lifecycleCoordinator.ts`, `sessionCoordinator.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `uiStore.ts`, `GridTableButtons.stories.tsx`, `AppHeader.stories.tsx`, `useTechOptimization.ts`, `gridStore.ts`, `techStore.ts`, `TechTreeRow.test.tsx`, `useBreakpoint`, `useDialog`, `App.tsx`, `environment.ts`, `useTechTree.tsx`, `GridCell.tsx`, `useTechTreeRow.ts`, `useOptimize.test.tsx`, `TechTree.tsx`, `Logger`, `useAnalytics`, `RecommendedBuild.stories.tsx`, `MainAppContent.stories.tsx`, `sessionCoordinator.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `lifecycleCoordinator.ts`, `monitoring.ts`, `bootPipeline.tsx`, `App.tsx`, `tracking.ts`, `ErrorBoundary.tsx`, `routes.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _409 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `uiStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05088919288645691 - nodes in this community are weakly interconnected._
- **Should `useToast.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12681159420289856 - nodes in this community are weakly interconnected._