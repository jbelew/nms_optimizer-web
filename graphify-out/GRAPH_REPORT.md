# Graph Report - nms_optimizer-web  (2026-10-10)

## Corpus Check
- 453 files · ~212,159 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1754 nodes · 4230 edges · 150 communities (129 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9cd7068`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- RoutedDialogs.integration.test.tsx
- tracking.ts
- InstallPrompt.stories.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useMainAppLogic.tsx
- FakeCommandRunnerAdapter
- MainAppLayout.tsx
- ConditionalTooltip.tsx
- Root.tsx
- bootPipeline.tsx
- preview.tsx
- LifecycleCoordinator
- page-metadata.js
- AppDialog
- __init__.py
- OptimizationAlertDialog.tsx
- Logger
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- useTechTree.tsx
- userStatsData.tsx
- generate-sitemap.mjs
- ShipSelectionProvider.tsx
- TechTreeRow.test.tsx
- optimizationManager.ts
- lifecycleCoordinator.ts
- uiStore.ts
- ShareLinkDialog.tsx
- BuildNameContent.tsx
- AppFooter.tsx
- check-remote-sync.test.mjs
- useGridStore
- useDialog
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- useAnalytics
- props.ts
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- TechTree
- GridTableButtons.test.tsx
- App.tsx
- useBreakpoint
- generate-radix-colors.mjs
- environment.ts
- sentryMock.ts
- store-helpers.ts
- process_stream
- useOptimizeStore
- create_screenshot_video.py
- update-lighthouse-history.mjs
- platformStore.ts
- techStore.ts
- TechTreeRow.tsx
- CliAgentRunnerAdapter
- gridStore.ts
- TechTreePresetsCard.tsx
- GridTable.tsx
- AppHeader.tsx
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
- useRecommendedBuild.tsx
- OfflineBanner.stories.tsx
- useOptimize.test.tsx
- TechTreeItem
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
- monitoring.ts
- check-commit-msg-early.mjs
- cloudflare-function.test.mjs
- PrerenderedMarkdownRenderer.tsx
- generate-ssg.mjs
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
- MainAppContent.stories.tsx
- reportWebVitals.ts
- iconRegistry.ts
- techRules.ts
- Cell
- Seo.tsx
- useToast.ts
- LanguageSelector.tsx
- UpdatePromptWrapper.tsx
- usePlatformStore
- RecommendedBuild.stories.tsx
- dialogContext.tsx
- bootstrap.ts
- useMarkdownContent.ts
- AppDialog.tsx
- AppHeader.stories.tsx
- TechTree.stories.tsx
- PWA Runtime Caching and Update Resilience
- seo-schema.js
- youTubeEmbed.tsx

## God Nodes (most connected - your core abstractions)
1. `Logger` - 93 edges
2. `useGridStore` - 81 edges
3. `usePlatformStore` - 48 edges
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

## Communities (150 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.16
Nodes (12): getRoutedDialogs(), PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer (+4 more)

### Community 2 - "tracking.ts"
Cohesion: 0.15
Nodes (16): NotFound(), CLOUDFLARE_BEACON_CONFIG, CLOUDFLARE_BEACON_SRC, TRACKING_ID, AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent() (+8 more)

### Community 3 - "InstallPrompt.stories.tsx"
Cohesion: 0.18
Nodes (9): Default, Story, NmsToast(), Default, Error, Story, Success, ToastProps (+1 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.08
Nodes (6): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.11
Nodes (19): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, DialogBody(), DialogFooter(), formatLabel(), formatParentheses(), ModuleCheckbox, ModuleGroup() (+11 more)

### Community 6 - "useMainAppLogic.tsx"
Cohesion: 0.16
Nodes (16): mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), useLatest(), SCROLL_OPTIONS, useOptimize(), UseOptimizeReturn (+8 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "MainAppLayout.tsx"
Cohesion: 0.13
Nodes (24): AppHeader, MainAppProvider(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter() (+16 more)

### Community 9 - "ConditionalTooltip.tsx"
Cohesion: 0.22
Nodes (10): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext (+2 more)

### Community 10 - "Root.tsx"
Cohesion: 0.20
Nodes (10): MainAppContent(), Root(), languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes (+2 more)

### Community 11 - "bootPipeline.tsx"
Cohesion: 0.25
Nodes (13): initializeAnalytics(), initializeAnalyticsClient(), loadCloudflareBeacon(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), isAppHiddenOrIdle() (+5 more)

### Community 12 - "preview.tsx"
Cohesion: 0.15
Nodes (8): hideSplashScreenAndShowBackground(), BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview, SplashHider()

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "page-metadata.js"
Cohesion: 0.17
Nodes (18): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading() (+10 more)

### Community 15 - "AppDialog"
Cohesion: 0.28
Nodes (5): AppDialog, Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 18 - "Logger"
Cohesion: 0.24
Nodes (13): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+5 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "useTechTree.tsx"
Cohesion: 0.17
Nodes (17): App(), API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, cache (+9 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.19
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (19): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+11 more)

### Community 25 - "ShipSelectionProvider.tsx"
Cohesion: 0.12
Nodes (19): ShipSelectionProps, ShipSelectionContent(), ShipSelectionProvider(), ShipSelectionProviderProps, mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer() (+11 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.13
Nodes (12): TechTreeRow, defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+4 more)

### Community 27 - "optimizationManager.ts"
Cohesion: 0.31
Nodes (6): ApiResponse, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions, mockCreateSocket

### Community 28 - "lifecycleCoordinator.ts"
Cohesion: 0.15
Nodes (9): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener (+1 more)

### Community 29 - "uiStore.ts"
Cohesion: 0.14
Nodes (19): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+11 more)

### Community 30 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 31 - "BuildNameContent.tsx"
Cohesion: 0.22
Nodes (11): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType(), getShipTypeName() (+3 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.18
Nodes (9): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+1 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "useGridStore"
Cohesion: 0.18
Nodes (13): mockCellState, GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTableContent() (+5 more)

### Community 35 - "useDialog"
Cohesion: 0.18
Nodes (14): mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, AppFooterProvider(), AppFooterContext, AppFooterContextValue (+6 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.13
Nodes (17): GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap, mockToggleCellActive (+9 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "useAnalytics"
Cohesion: 0.18
Nodes (17): BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useMainAppBuildManagement(), useAnalytics(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager() (+9 more)

### Community 42 - "props.ts"
Cohesion: 0.36
Nodes (6): ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), ModuleSelectionDialogProps, TechTreeRowProps, TechColor

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree"
Cohesion: 0.20
Nodes (12): EmptyState(), EmptyStateProps, RecommendedBuildProps, RecommendedBuildContextValue, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent() (+4 more)

### Community 46 - "GridTableButtons.test.tsx"
Cohesion: 0.16
Nodes (10): GridContext, GridContextValue, GridProvider(), useGridContext(), Default, meta, Story, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
} (+2 more)

### Community 47 - "App.tsx"
Cohesion: 0.15
Nodes (14): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, PlatformStoreSelector (+6 more)

### Community 48 - "useBreakpoint"
Cohesion: 0.13
Nodes (12): BuyMeACoffee(), ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace (+4 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "environment.ts"
Cohesion: 0.42
Nodes (6): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), USER_VISIT_KEY, isIosSafari(), isStandalone(), safeClear()

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "platformStore.ts"
Cohesion: 0.26
Nodes (9): UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, safeGetItem(), getPlatformFromStorage(), getPlatformFromUrl(), PLATFORM_STORAGE_KEY (+1 more)

### Community 58 - "techStore.ts"
Cohesion: 0.12
Nodes (23): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps (+15 more)

### Community 59 - "TechTreeRow.tsx"
Cohesion: 0.17
Nodes (16): TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps (+8 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.19
Nodes (10): createSerializedGrid(), mockNavigate, mockTechTreeData, createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), Grid (+2 more)

### Community 62 - "TechTreePresetsCard.tsx"
Cohesion: 0.23
Nodes (11): PresetCardItem(), PresetCardItemProps, PresetsCardContent(), PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions (+3 more)

### Community 63 - "GridTable.tsx"
Cohesion: 0.18
Nodes (9): GridShake(), GridShakeProps, GridTable, GridTableProps, Default, Solving, Story, GridTableGrid() (+1 more)

### Community 64 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 65 - "AGENTS.md"
Cohesion: 0.20
Nodes (5): Language, NMS Optimizer Web Domain Model, Component Architecture, Prop Drilling Prevention, Triage Labels

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

### Community 76 - "useRecommendedBuild.tsx"
Cohesion: 0.30
Nodes (7): RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildProvider(), RecommendedBuildRoot(), RecommendedBuildContext, useRecommendedBuildContext(), useRecommendedBuild()

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "useOptimize.test.tsx"
Cohesion: 0.25
Nodes (7): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState

### Community 79 - "TechTreeItem"
Cohesion: 0.18
Nodes (10): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState (+2 more)

### Community 80 - "Project Safeguards & Preferences"
Cohesion: 0.40
Nodes (4): Commit Conventions & Automated Releases, iOS Safari Rendering, Project Safeguards & Preferences, SEO (Search Engine Optimization)

### Community 81 - "Testing Guidelines"
Cohesion: 0.33
Nodes (5): End-to-End (E2E) Testing (Playwright), Storybook Testing & Builds, Test Environment, Testing Conventions, Testing Guidelines

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

### Community 95 - "monitoring.ts"
Cohesion: 0.21
Nodes (10): WS_URL, createSocket(), SOCKET_OPTIONS, LogEntry, LogLevel, logs, SentryIntegration, SentrySDK (+2 more)

### Community 99 - "generate-ssg.mjs"
Cohesion: 0.24
Nodes (11): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), LOCALES_DIR (+3 more)

### Community 121 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 130 - "reportWebVitals.ts"
Cohesion: 0.31
Nodes (7): AppHeaderContext, AppHeaderContextValue, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric()

### Community 131 - "iconRegistry.ts"
Cohesion: 0.22
Nodes (8): DynamicRadixIcon(), DynamicRadixIconProps, DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 132 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 133 - "Cell"
Cohesion: 0.21
Nodes (12): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, Cell, GridActions (+4 more)

### Community 134 - "Seo.tsx"
Cohesion: 0.33
Nodes (5): normalizePath(), Seo(), useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 135 - "useToast.ts"
Cohesion: 0.31
Nodes (7): ShipSelection(), Default, Story, ToastConfig, ToastContext, ToastContextType, ToastProvider()

### Community 136 - "LanguageSelector.tsx"
Cohesion: 0.31
Nodes (4): LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames

### Community 137 - "UpdatePromptWrapper.tsx"
Cohesion: 0.38
Nodes (6): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, activateLatestServiceWorker(), evictStaleServiceWorkers()

### Community 138 - "usePlatformStore"
Cohesion: 0.20
Nodes (11): MobileToolbar(), MobileToolbarProps, Default, Story, RouteContext, RouteContextType, useRouteContext(), useFetchShipTypesSuspense() (+3 more)

### Community 139 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 140 - "dialogContext.tsx"
Cohesion: 0.33
Nodes (4): DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, safeSetItem()

### Community 141 - "bootstrap.ts"
Cohesion: 0.44
Nodes (5): safeRemoveItem(), migrateTutorialKey(), performBootstrapMigrations(), performGridCleanup(), runWhenIdle()

### Community 142 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

### Community 143 - "AppDialog.tsx"
Cohesion: 0.13
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+12 more)

### Community 144 - "AppHeader.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 145 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

### Community 147 - "seo-schema.js"
Cohesion: 0.60
Nodes (3): getLocalizedSchema(), OG_LOCALE_MAP, resolveAppVersion()

## Knowledge Gaps
- **441 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+436 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `reportWebVitals.ts`, `iconRegistry.ts`, `tracking.ts`, `useMainAppLogic.tsx`, `UpdatePromptWrapper.tsx`, `usePlatformStore`, `bootPipeline.tsx`, `dialogContext.tsx`, `bootstrap.ts`, `useMarkdownContent.ts`, `LifecycleCoordinator`, `useTechTree.tsx`, `ShipSelectionProvider.tsx`, `optimizationManager.ts`, `lifecycleCoordinator.ts`, `ShareLinkDialog.tsx`, `GridCell.tsx`, `useAnalytics`, `TechTree`, `App.tsx`, `environment.ts`, `platformStore.ts`, `techStore.ts`, `gridStore.ts`, `useRecommendedBuild.tsx`, `monitoring.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useMainAppLogic.tsx`, `MainAppLayout.tsx`, `usePlatformStore`, `RecommendedBuild.stories.tsx`, `bootstrap.ts`, `AppHeader.stories.tsx`, `Logger`, `useTechTree.tsx`, `TechTreeRow.test.tsx`, `BuildNameContent.tsx`, `useDialog`, `GridCell.tsx`, `useAnalytics`, `TechTree`, `GridTableButtons.test.tsx`, `techStore.ts`, `gridStore.ts`, `GridTable.tsx`, `useRecommendedBuild.tsx`, `useOptimize.test.tsx`, `TechTreeItem`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `Root.tsx`, `bootPipeline.tsx`, `preview.tsx`, `App.tsx`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _441 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0642243328810493 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `ModuleSelectionDialog.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._