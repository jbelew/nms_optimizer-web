# Graph Report - nms_optimizer-web  (2026-09-22)

## Corpus Check
- 445 files · ~204,249 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1720 nodes · 4146 edges · 140 communities (118 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `96e4e038`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useGridStore
- tracking.ts
- App.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useTechTree.tsx
- FakeCommandRunnerAdapter
- sessionCoordinator.ts
- useToast.ts
- page-metadata.js
- uiStore.ts
- TechTreePresetsCard.tsx
- LifecycleCoordinator
- TechTreeContent.tsx
- environment.ts
- __init__.py
- ShipSelection.tsx
- Root.tsx
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- dialogUtils.ts
- userStatsData.tsx
- generate-ssg.mjs
- OptimizationAlertDialog.tsx
- SharedModuleSelectionDialog.tsx
- TechTree.tsx
- monitoring.ts
- techStore.ts
- MainAppLayout.tsx
- dataValidation.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- optimizationManager.ts
- useSeoAndTitle.ts
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- gridPersistence.ts
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite.config.ts
- TechTree
- UpdatePromptWrapper.tsx
- RecommendedBuild.stories.tsx
- bootPipeline.tsx
- generate-radix-colors.mjs
- GridTableButtons.stories.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- useMainAppLogic.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- TechTreeRow.test.tsx
- ShareLinkDialog.tsx
- usePlatformStore
- CliAgentRunnerAdapter
- AppHeader.stories.tsx
- Toast.stories.tsx
- MainAppContent.stories.tsx
- useMarkdownContent.ts
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
- spa-routes.test.mjs
- OfflineBanner.stories.tsx
- preview.tsx
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
- MobileToolbar.tsx
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
- RoutedDialogs.tsx
- useBreakpoint
- ModuleSelectionDialog.test.tsx
- GridShake.tsx
- gridStore.ts
- youTubeEmbed.tsx
- AppHeader.tsx
- useOptimizeStore
- Logger
- AppDialog.tsx
- gridSerializer.ts

## God Nodes (most connected - your core abstractions)
1. `Logger` - 89 edges
2. `useGridStore` - 81 edges
3. `usePlatformStore` - 45 edges
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

## Communities (140 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "useGridStore"
Cohesion: 0.16
Nodes (15): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+7 more)

### Community 2 - "tracking.ts"
Cohesion: 0.11
Nodes (23): formatErrorDocumentTitle(), AppHeaderContext, AppHeaderContextValue, NotFound(), API_URL, TRACKING_ID, AnalyticsEventParams, GA4Event (+15 more)

### Community 3 - "App.tsx"
Cohesion: 0.16
Nodes (15): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, PlatformStoreSelector (+7 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.09
Nodes (5): H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.12
Nodes (21): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+13 more)

### Community 6 - "useTechTree.tsx"
Cohesion: 0.20
Nodes (11): MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, cache, clearTechTreeCache(), fetchTechTree(), apiCall(), ApiCallOptions (+3 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "sessionCoordinator.ts"
Cohesion: 0.22
Nodes (8): createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState, mockTechStore, mockUiStore, BonusStatusData

### Community 9 - "useToast.ts"
Cohesion: 0.17
Nodes (14): ErrorMessageRenderer(), mockUseTranslation, Default, Story, ShipSelection(), Default, Story, ToastRenderer() (+6 more)

### Community 10 - "page-metadata.js"
Cohesion: 0.19
Nodes (19): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath(), getRoutedDialogs() (+11 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.14
Nodes (15): AppHeaderProvider(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType, OptimizeState, OptimizeStatus, SelectedTechData (+7 more)

### Community 12 - "TechTreePresetsCard.tsx"
Cohesion: 0.20
Nodes (13): PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions, GridActions, GridState (+5 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.12
Nodes (5): bootApp(), BootOptions, BootResult, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "TechTreeContent.tsx"
Cohesion: 0.15
Nodes (11): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreeList(), TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader() (+3 more)

### Community 15 - "environment.ts"
Cohesion: 0.14
Nodes (16): ConditionalTooltip, ConditionalTooltipProps, InstallPrompt(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, isTouchDevice(), safeClear() (+8 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "ShipSelection.tsx"
Cohesion: 0.13
Nodes (16): ShipSelectionProps, ShipSelectionContent(), mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), ShipSelectionRoot(), ShipSelectionTrigger() (+8 more)

### Community 18 - "Root.tsx"
Cohesion: 0.16
Nodes (14): TooltipManager(), Root(), DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes, useThemeStore (+6 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "dialogUtils.ts"
Cohesion: 0.15
Nodes (13): DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, build (+5 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 25 - "OptimizationAlertDialog.tsx"
Cohesion: 0.13
Nodes (10): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story, Default, Story (+2 more)

### Community 26 - "SharedModuleSelectionDialog.tsx"
Cohesion: 0.29
Nodes (8): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), useModuleSelectionDialogStore

### Community 27 - "TechTree.tsx"
Cohesion: 0.19
Nodes (9): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeSkeleton() (+1 more)

### Community 28 - "monitoring.ts"
Cohesion: 0.10
Nodes (18): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTask, DeferredTaskHandler (+10 more)

### Community 29 - "techStore.ts"
Cohesion: 0.20
Nodes (12): useGridCellStyle(), mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), debouncedStorage (+4 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.19
Nodes (20): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppLayoutContent() (+12 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.22
Nodes (11): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+3 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.14
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "optimizationManager.ts"
Cohesion: 0.24
Nodes (10): WS_URL, ApiResponse, Grid, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 35 - "useSeoAndTitle.ts"
Cohesion: 0.15
Nodes (11): AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, useLanguage(), useSeoAndTitle(), getSupportedLanguages() (+3 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.14
Nodes (14): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+6 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "gridPersistence.ts"
Cohesion: 0.16
Nodes (13): UI_TIMING, applyValidationFeedback(), feedbackMap, ValidationReason, debouncedStorage, debounceSetItem(), SetItemFunction, validateToggleActive() (+5 more)

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.22
Nodes (11): TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges() (+3 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite.config.ts"
Cohesion: 0.14
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree"
Cohesion: 0.44
Nodes (5): RecommendedBuildProvider(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuild(), TechTree

### Community 46 - "UpdatePromptWrapper.tsx"
Cohesion: 0.57
Nodes (3): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck()

### Community 47 - "RecommendedBuild.stories.tsx"
Cohesion: 0.15
Nodes (13): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+5 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.21
Nodes (14): fetchShipTypes(), initializeAnalytics(), initializeAnalyticsClient(), preloadInitialState(), isBot(), getPlatformFromStorage(), getPlatformFromUrl(), PLATFORM_STORAGE_KEY (+6 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "useMainAppLogic.tsx"
Cohesion: 0.18
Nodes (14): MainAppContent(), MainAppProvider(), ShipTypesLoader(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), ERROR_THRESHOLDS (+6 more)

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
Cohesion: 0.21
Nodes (15): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), useGridDeserializer(), cache, ShipTypes (+7 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 62 - "Toast.stories.tsx"
Cohesion: 0.29
Nodes (6): NmsToast(), Default, Error, Story, Success, ToastProps

### Community 63 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 64 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

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

### Community 76 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "preview.tsx"
Cohesion: 0.14
Nodes (9): TooltipProvider(), hideSplashScreenAndShowBackground(), BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview (+1 more)

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

### Community 99 - "MobileToolbar.tsx"
Cohesion: 0.17
Nodes (8): LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, languages, nativeLanguageNames

### Community 121 - "RoutedDialogs.tsx"
Cohesion: 0.40
Nodes (4): LoremIpsumSkeleton(), MARKDOWN_DIALOGS, MarkdownContentRenderer, RoutedDialogs()

### Community 130 - "useBreakpoint"
Cohesion: 0.08
Nodes (27): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
} (+19 more)

### Community 131 - "ModuleSelectionDialog.test.tsx"
Cohesion: 0.33
Nodes (4): ModuleSelectionDialog, defaultProps, MockAppDialogProps, mockGroupedModules

### Community 132 - "GridShake.tsx"
Cohesion: 0.50
Nodes (3): GridShake(), GridShakeProps, GridTableRoot()

### Community 133 - "gridStore.ts"
Cohesion: 0.24
Nodes (6): createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), useUiStore, StoreResetWrapper()

### Community 136 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 137 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 140 - "Logger"
Cohesion: 0.17
Nodes (19): App(), BuyMeACoffee(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useAnalytics() (+11 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.08
Nodes (29): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+21 more)

### Community 144 - "gridSerializer.ts"
Cohesion: 0.20
Nodes (13): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, fetchTechTreeAsync() (+5 more)

## Knowledge Gaps
- **431 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+426 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `useBreakpoint`, `App.tsx`, `tracking.ts`, `gridStore.ts`, `useTechTree.tsx`, `sessionCoordinator.ts`, `LifecycleCoordinator`, `TechTreeContent.tsx`, `environment.ts`, `gridSerializer.ts`, `dialogUtils.ts`, `monitoring.ts`, `techStore.ts`, `dataValidation.ts`, `optimizationManager.ts`, `gridPersistence.ts`, `TechTree`, `UpdatePromptWrapper.tsx`, `bootPipeline.tsx`, `ShareLinkDialog.tsx`, `usePlatformStore`, `useMarkdownContent.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useBreakpoint`, `gridStore.ts`, `useTechTree.tsx`, `sessionCoordinator.ts`, `uiStore.ts`, `Logger`, `AppDialog.tsx`, `gridSerializer.ts`, `environment.ts`, `SharedModuleSelectionDialog.tsx`, `TechTree.tsx`, `techStore.ts`, `MainAppLayout.tsx`, `GridCell.tsx`, `TechTree`, `RecommendedBuild.stories.tsx`, `GridTableButtons.stories.tsx`, `useMainAppLogic.tsx`, `TechTreeRow.test.tsx`, `usePlatformStore`, `AppHeader.stories.tsx`, `MainAppContent.stories.tsx`, `MobileToolbar.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `App.tsx`, `preview.tsx`, `bootPipeline.tsx`, `Root.tsx`, `monitoring.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _431 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06321334503950835 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._