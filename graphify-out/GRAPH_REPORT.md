# Graph Report - nms_optimizer-web  (2026-09-22)

## Corpus Check
- 441 files · ~201,573 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1700 nodes · 4104 edges · 137 communities (116 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1cfe5b2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- GridTable.tsx
- tracking.ts
- MobileToolbar.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeCommandRunnerAdapter
- TechTreePresetsCard.tsx
- useMainAppLogic.tsx
- page-metadata.js
- uiStore.ts
- platformStore.ts
- LifecycleCoordinator
- TechTreeItem
- environment.ts
- __init__.py
- App.tsx
- sessionCoordinator.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- Root.tsx
- userStatsData.tsx
- generate-ssg.mjs
- OptimizationAlertDialog.tsx
- ShipSelection.tsx
- TechTree
- ErrorBoundary.tsx
- techStore.ts
- MainAppLayout.tsx
- dataValidation.ts
- AppFooter.tsx
- Cell
- useOptimizeStore
- useDialog
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- src/constants.ts
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite.config.ts
- TechTree.stories.tsx
- useAnalytics
- RecommendedBuild.tsx
- bootPipeline.tsx
- generate-radix-colors.mjs
- useTechTree.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- useScrollGridIntoView.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- TechTreeRow.test.tsx
- ShareLinkDialog.tsx
- usePlatformStore
- CliAgentRunnerAdapter
- RecommendedBuild.stories.tsx
- useToast.ts
- MainAppContent.stories.tsx
- monitoring.ts
- AGENTS.md
- Issue tracker: GitHub
- git-hooks.test.mjs
- Agent Guidelines
- Architecture Guidelines
- Code Style Guidelines
- Domain Docs
- [[path]].js
- performance-check.mjs
- run-bench.mjs
- verify-routes-consistency.mjs
- useTechTreeRow.ts
- OfflineBanner.stories.tsx
- lifecycleCoordinator.ts
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
- useTechTreeContext.ts
- UpdatePrompt.tsx
- useGridStore
- AppHeader.tsx
- useBreakpoint
- Logger
- AppDialog.tsx
- useRecommendedBuild.tsx

## God Nodes (most connected - your core abstractions)
1. `Logger` - 89 edges
2. `useGridStore` - 81 edges
3. `usePlatformStore` - 44 edges
4. `useBreakpoint()` - 43 edges
5. `LifecycleCoordinator` - 40 edges
6. `useAnalytics()` - 39 edges
7. `useTechStore` - 34 edges
8. `createGrid()` - 32 edges
9. `useDialog()` - 32 edges
10. `IssueLifecycle` - 29 edges

## Surprising Connections (you probably didn't know these)
- `TestGate` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_gate.py → scripts/ralph/adapters.py
- `TestGit` --uses--> `FakeCommandRunnerAdapter`  [INFERRED]
  tests/scripts/test_git.py → scripts/ralph/adapters.py
- `MockGate` --uses--> `FakeIssueTrackerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `TestRunner` --uses--> `FakeIssueTrackerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py
- `MockGate` --uses--> `CliAgentRunnerAdapter`  [INFERRED]
  tests/scripts/test_runner.py → scripts/ralph/adapters.py

## Import Cycles
- 2-file cycle: `src/components/ShipSelection/ShipSelection.tsx -> src/components/ShipSelection/ShipSelectionContent.tsx -> src/components/ShipSelection/ShipSelection.tsx`
- 2-file cycle: `src/components/GridTable/GridTable.tsx -> src/components/GridTable/GridTableGrid.tsx -> src/components/GridTable/GridTable.tsx`
- 3-file cycle: `src/components/ErrorBoundary/ErrorBoundary.tsx -> src/components/ErrorBoundary/ErrorContent.tsx -> src/components/ErrorBoundary/ErrorDisplay.tsx -> src/components/ErrorBoundary/ErrorBoundary.tsx`

## Communities (137 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "GridTable.tsx"
Cohesion: 0.14
Nodes (12): GridContext, GridContextValue, GridProvider(), GridTable, GridTableProps, Default, Solving, Story (+4 more)

### Community 2 - "tracking.ts"
Cohesion: 0.13
Nodes (18): NotFound(), AnalyticsEventParams, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), AnalyticsEventPayload, detectAdBlocker() (+10 more)

### Community 3 - "MobileToolbar.tsx"
Cohesion: 0.16
Nodes (11): AppHeaderProvider(), AppHeaderContext, LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story (+3 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (14): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+6 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (24): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+16 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.26
Nodes (5): createEmptyCell(), createGrid(), resetCellContent(), useUiStore, StoreResetWrapper()

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "TechTreePresetsCard.tsx"
Cohesion: 0.28
Nodes (8): PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions, RecommendedBuild, countBuildModules()

### Community 9 - "useMainAppLogic.tsx"
Cohesion: 0.17
Nodes (16): MainAppProvider(), useMainAppLogic(), AppLayout, useAppLayout(), ERROR_THRESHOLDS, useErrorDispatcher(), useLatest(), SCROLL_OPTIONS (+8 more)

### Community 10 - "page-metadata.js"
Cohesion: 0.12
Nodes (24): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading() (+16 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.12
Nodes (18): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+10 more)

### Community 12 - "platformStore.ts"
Cohesion: 0.24
Nodes (10): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl() (+2 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "TechTreeItem"
Cohesion: 0.24
Nodes (8): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow, TechTreeItem, TechTreeMaps

### Community 15 - "environment.ts"
Cohesion: 0.05
Nodes (44): ConditionalTooltip, ConditionalTooltipProps, InstallPrompt(), Default, Story, NmsToast(), Default, Error (+36 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.15
Nodes (16): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, BuildNameContent() (+8 more)

### Community 18 - "sessionCoordinator.ts"
Cohesion: 0.18
Nodes (11): createGrid(), mockNavigate, mockTechTreeData, Grid, computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState (+3 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "Root.tsx"
Cohesion: 0.22
Nodes (9): Root(), languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes, useThemeStore (+1 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 25 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 26 - "ShipSelection.tsx"
Cohesion: 0.18
Nodes (12): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionRoot(), ShipSelectionTrigger(), GroupedShipType (+4 more)

### Community 27 - "TechTree"
Cohesion: 0.23
Nodes (10): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent(), TechTreeContentProps, TechTreeList() (+2 more)

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (5): ErrorBoundary, Props, State, handleError(), RouteError()

### Community 29 - "techStore.ts"
Cohesion: 0.21
Nodes (12): mockCellState, EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), debouncedStorage, debounceSetItem() (+4 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.13
Nodes (24): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+16 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.22
Nodes (11): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+3 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.13
Nodes (15): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+7 more)

### Community 33 - "Cell"
Cohesion: 0.19
Nodes (13): applyValidationFeedback(), feedbackMap, ValidationReason, createCellFromModuleData(), validateToggleActive(), validateToggleSupercharged(), ValidationResult, Cell (+5 more)

### Community 34 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 35 - "useDialog"
Cohesion: 0.10
Nodes (22): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, mockDialogContext, mockSendEvent (+14 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.15
Nodes (12): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged, useGridCellInteraction() (+4 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.28
Nodes (10): useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges(), TechTreeRowLabel() (+2 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite.config.ts"
Cohesion: 0.14
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 46 - "useAnalytics"
Cohesion: 0.18
Nodes (12): RecommendedBuildProvider(), UpdatePrompt, UpdatePromptWrapper(), useAnalytics(), mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore (+4 more)

### Community 47 - "RecommendedBuild.tsx"
Cohesion: 0.24
Nodes (10): RecommendedBuild(), RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext() (+2 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.38
Nodes (8): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), setupServiceWorkerRegistration(), mockRegisterSW, mockUpdateSW

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "useTechTree.tsx"
Cohesion: 0.20
Nodes (13): API_URL, MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, cache, clearTechTreeCache(), fetchTechTree(), fetchTechTreeAsync() (+5 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "useScrollGridIntoView.ts"
Cohesion: 0.23
Nodes (8): {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, mockShowInfo, registerToolbarForceShow(), __resetScrollGridIntoViewRef(), sharedGridContainerRef, useScrollGridIntoView()

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 58 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 59 - "usePlatformStore"
Cohesion: 0.31
Nodes (10): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), useGridDeserializer(), useFetchShipTypesSuspense(), mockNavigate (+2 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "RecommendedBuild.stories.tsx"
Cohesion: 0.25
Nodes (5): Desktop, Mobile, mockTechTree, Story, Tablet

### Community 62 - "useToast.ts"
Cohesion: 0.32
Nodes (7): ErrorMessageRenderer(), mockUseTranslation, ToastConfig, ToastContext, ToastContextType, ToastProvider(), useErrorStore

### Community 63 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 64 - "monitoring.ts"
Cohesion: 0.24
Nodes (9): captureException(), initializeSentry(), LogEntry, LogLevel, logs, SentryIntegration, SentrySDK, __setSentryInstance() (+1 more)

### Community 65 - "AGENTS.md"
Cohesion: 0.29
Nodes (3): Language, NMS Optimizer Web Domain Model, Triage Labels

### Community 66 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 67 - "git-hooks.test.mjs"
Cohesion: 0.33
Nodes (4): __dirname, LEFTHOOK_PATH, PACKAGE_PATH, ROOT

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

### Community 76 - "useTechTreeRow.ts"
Cohesion: 0.36
Nodes (6): TechTreeRowContext, TechTreeRowContextValue, EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "lifecycleCoordinator.ts"
Cohesion: 0.33
Nodes (5): AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, hideSplashScreenAndShowBackground(), SplashHider()

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

### Community 121 - "useTechTreeContext.ts"
Cohesion: 0.50
Nodes (3): TechTreeProvider(), TechTreeContext, TechTreeContextValue

### Community 130 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 133 - "useGridStore"
Cohesion: 0.24
Nodes (10): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTableContent(), useCell() (+2 more)

### Community 136 - "AppHeader.tsx"
Cohesion: 0.12
Nodes (14): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+6 more)

### Community 137 - "useBreakpoint"
Cohesion: 0.12
Nodes (14): BuyMeACoffee(), ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace (+6 more)

### Community 140 - "Logger"
Cohesion: 0.18
Nodes (18): App(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useMainAppBuildManagement(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
} (+10 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.10
Nodes (25): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+17 more)

### Community 144 - "useRecommendedBuild.tsx"
Cohesion: 0.22
Nodes (11): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useRecommendedBuild() (+3 more)

## Knowledge Gaps
- **425 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+420 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `MarkdownContentRenderer.tsx`, `gridStore.ts`, `useMainAppLogic.tsx`, `uiStore.ts`, `platformStore.ts`, `LifecycleCoordinator`, `environment.ts`, `useRecommendedBuild.tsx`, `App.tsx`, `sessionCoordinator.ts`, `TechTree`, `ErrorBoundary.tsx`, `techStore.ts`, `dataValidation.ts`, `src/constants.ts`, `useAnalytics`, `bootPipeline.tsx`, `useTechTree.tsx`, `useScrollGridIntoView.ts`, `ShareLinkDialog.tsx`, `usePlatformStore`, `monitoring.ts`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `GridTable.tsx`, `MobileToolbar.tsx`, `gridStore.ts`, `AppHeader.tsx`, `useMainAppLogic.tsx`, `uiStore.ts`, `Logger`, `environment.ts`, `useRecommendedBuild.tsx`, `App.tsx`, `sessionCoordinator.ts`, `TechTree`, `techStore.ts`, `MainAppLayout.tsx`, `GridCell.tsx`, `useAnalytics`, `useTechTree.tsx`, `useScrollGridIntoView.ts`, `TechTreeRow.test.tsx`, `usePlatformStore`, `RecommendedBuild.stories.tsx`, `MainAppContent.stories.tsx`, `useTechTreeRow.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `usePlatformStore` connect `usePlatformStore` to `ModuleSelectionDialog.tsx`, `gridStore.ts`, `useMainAppLogic.tsx`, `Logger`, `TechTree.stories.tsx`, `useAnalytics`, `platformStore.ts`, `App.tsx`, `sessionCoordinator.ts`, `Root.tsx`, `useScrollGridIntoView.ts`, `ShipSelection.tsx`, `TechTree`, `RecommendedBuild.stories.tsx`, `MainAppLayout.tsx`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `GridTable.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1368421052631579 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1282051282051282 - nodes in this community are weakly interconnected._