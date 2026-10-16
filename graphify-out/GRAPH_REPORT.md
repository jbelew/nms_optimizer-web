# Graph Report - nms_optimizer-web  (2026-10-16)

## Corpus Check
- 455 files · ~215,048 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1758 nodes · 4233 edges · 143 communities (122 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab43c317`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useMainAppLogic.tsx
- tracking.ts
- ShipSelectionProvider.tsx
- MarkdownContentRenderer.tsx
- generate-sitemap.mjs
- OptimizationAlertDialog.tsx
- FakeCommandRunnerAdapter
- dialogUtils.ts
- AppFooter.tsx
- App.tsx
- uiStore.ts
- preview.tsx
- LifecycleCoordinator
- useTechTree.tsx
- usePlatformStore
- __init__.py
- useOptimize.tsx
- platformStore.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- TechTree
- userStatsData.tsx
- sessionCoordinator.ts
- useTechTreeRow.ts
- TechTreeRow.test.tsx
- page-metadata.js
- lifecycleCoordinator.ts
- environment.ts
- optimizationManager.ts
- generate-ssg.mjs
- AppHeader.tsx
- check-remote-sync.test.mjs
- Logger
- useAnalytics
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- RecommendedBuild.tsx
- ModuleSelectionDialog.tsx
- pwa-config.test.mjs
- vite-plugin-purge-radix-css.mjs
- TechTree.stories.tsx
- gridTypes.ts
- spa-routes.test.mjs
- UpdatePrompt.tsx
- generate-radix-colors.mjs
- ShareLinkDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- AppHeader.stories.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- iconRegistry.ts
- RoutedDialogs.integration.test.tsx
- useTechStore
- CliAgentRunnerAdapter
- gridStore.ts
- dataValidation.ts
- useGridStore
- RecommendedBuild.stories.tsx
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
- useMarkdownContent.ts
- OfflineBanner.stories.tsx
- useBreakpoint
- TechTreePresetsCard.tsx
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
- TechTreeRow.tsx
- check-commit-msg-early.mjs
- cloudflare-function.test.mjs
- PrerenderedMarkdownRenderer.tsx
- dialogContext.tsx
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
- TechTreeSection.tsx
- MainAppContent.stories.tsx
- AppFooter.stories.tsx
- techStore.ts
- applyValidationFeedback.ts
- useOptimizeStore
- useAppHeaderContext.ts
- MainAppLayout.tsx
- bootPipeline.test.tsx
- routes.tsx
- AppDialog.tsx
- monitoring.ts
- PWA Runtime Caching and Update Resilience

## God Nodes (most connected - your core abstractions)
1. `Logger` - 93 edges
2. `useGridStore` - 82 edges
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

## Communities (143 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "useMainAppLogic.tsx"
Cohesion: 0.17
Nodes (18): ErrorMessageRenderer(), mockUseTranslation, MainAppProvider(), useMainAppBuildManagement(), mockShowInfo, useMainAppLogic(), ERROR_THRESHOLDS, useErrorDispatcher() (+10 more)

### Community 2 - "tracking.ts"
Cohesion: 0.17
Nodes (15): NotFound(), API_URL, AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult() (+7 more)

### Community 3 - "ShipSelectionProvider.tsx"
Cohesion: 0.06
Nodes (39): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), Default, Story, USER_VISIT_KEY, ShipSelection(), ShipSelectionProps, Default (+31 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (10): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer (+2 more)

### Community 5 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 6 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "dialogUtils.ts"
Cohesion: 0.24
Nodes (8): mockDialogContext, mockSendEvent, TransProps, build, LanguageCode, PageName, DialogContext, DialogContextType

### Community 9 - "AppFooter.tsx"
Cohesion: 0.26
Nodes (8): AppFooterContent(), AppFooterRating(), AppFooterRoot(), AppFooterProvider(), AppFooterContext, AppFooterContextValue, useAppFooterContext(), DialogType

### Community 10 - "App.tsx"
Cohesion: 0.22
Nodes (8): OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, lazyNamed(), ReactLazyInternal

### Community 11 - "uiStore.ts"
Cohesion: 0.13
Nodes (16): A11yState, ErrorMessage, ErrorState, OptimizeErrorType, OptimizeState, OptimizeStatus, SelectedTechData, SessionState (+8 more)

### Community 12 - "preview.tsx"
Cohesion: 0.09
Nodes (18): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), hideSplashScreenAndShowBackground(), TooltipActions, TooltipActionsContext, TooltipState (+10 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.13
Nodes (3): bootApp(), LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "useTechTree.tsx"
Cohesion: 0.18
Nodes (14): TechTree(), MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, cache, clearTechTreeCache(), fetchTechTree(), fetchTechTreeAsync() (+6 more)

### Community 15 - "usePlatformStore"
Cohesion: 0.14
Nodes (20): AppContent(), BuildNameContent(), BuildNameContentProps, ShipSelectionProvider(), TechTreeRoot(), TechTreeRootProps, RouteContext, RouteContextType (+12 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "useOptimize.tsx"
Cohesion: 0.18
Nodes (11): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+3 more)

### Community 18 - "platformStore.ts"
Cohesion: 0.24
Nodes (10): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl() (+2 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "TechTree"
Cohesion: 0.19
Nodes (11): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, TechTreeProps, TechTreeContent(), TechTreeContentProps, TechTreeList(), TechTreePresetsCard() (+3 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "sessionCoordinator.ts"
Cohesion: 0.16
Nodes (12): createGrid(), createSerializedGrid(), mockNavigate, mockTechTreeData, computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState (+4 more)

### Community 25 - "useTechTreeRow.ts"
Cohesion: 0.20
Nodes (10): GridShake(), GridShakeProps, GridTableRoot(), TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), useTechOptimization(), EMPTY_MODULES_ARRAY (+2 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockOpenDialog, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+3 more)

### Community 27 - "page-metadata.js"
Cohesion: 0.32
Nodes (13): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+5 more)

### Community 28 - "lifecycleCoordinator.ts"
Cohesion: 0.14
Nodes (10): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTask, DeferredTaskHandler (+2 more)

### Community 29 - "environment.ts"
Cohesion: 0.20
Nodes (14): TRACKING_ID, UI_TIMING, debounceSetItem(), SetItemFunction, initializeAnalytics(), isBot(), safeClear(), safeGetItem() (+6 more)

### Community 30 - "optimizationManager.ts"
Cohesion: 0.25
Nodes (9): WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions (+1 more)

### Community 31 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 32 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "Logger"
Cohesion: 0.26
Nodes (9): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+1 more)

### Community 35 - "useAnalytics"
Cohesion: 0.12
Nodes (18): WelcomeContent(), WelcomeContentProps, AppHeaderProvider(), BuyMeACoffee(), LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps (+10 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.13
Nodes (18): GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap, mockToggleCellActive (+10 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "RecommendedBuild.tsx"
Cohesion: 0.26
Nodes (9): RecommendedBuild(), RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext() (+1 more)

### Community 42 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-purge-radix-css.mjs"
Cohesion: 0.11
Nodes (11): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, isResponsiveRefUsed(), purgeRadixCss(), purgeUnusedRadixRules(), RESPONSIVE_PROP_CLASS_MAP (+3 more)

### Community 45 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 46 - "gridTypes.ts"
Cohesion: 0.33
Nodes (7): createCellFromModuleData(), Grid, GridActions, GridComputed, GridState, Module, TechTreeMaps

### Community 47 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 48 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "iconRegistry.ts"
Cohesion: 0.29
Nodes (6): DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 58 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.21
Nodes (9): PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, RoutedDialogs(), useSeoAndTitle(), PerformanceRoute() (+1 more)

### Community 59 - "useTechStore"
Cohesion: 0.22
Nodes (12): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), mockModules (+4 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.23
Nodes (7): useRecommendedBuild(), createEmptyCell(), createGrid(), resetCellContent(), debouncedStorage, useUiStore, StoreResetWrapper()

### Community 62 - "dataValidation.ts"
Cohesion: 0.21
Nodes (12): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+4 more)

### Community 63 - "useGridStore"
Cohesion: 0.13
Nodes (17): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+9 more)

### Community 64 - "RecommendedBuild.stories.tsx"
Cohesion: 0.25
Nodes (5): Desktop, Mobile, mockTechTree, Story, Tablet

### Community 65 - "AGENTS.md"
Cohesion: 0.20
Nodes (5): Language, NMS Optimizer Web Domain Model, Component Architecture, Prop Drilling Prevention, Triage Labels

### Community 66 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

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

### Community 76 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "useBreakpoint"
Cohesion: 0.10
Nodes (21): GridContext, GridContextValue, GridProvider(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS (+13 more)

### Community 79 - "TechTreePresetsCard.tsx"
Cohesion: 0.19
Nodes (14): PresetCardItem(), PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCardProps, compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS (+6 more)

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

### Community 95 - "TechTreeRow.tsx"
Cohesion: 0.24
Nodes (11): TechTreeSectionList(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges() (+3 more)

### Community 99 - "dialogContext.tsx"
Cohesion: 0.17
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 121 - "TechTreeSection.tsx"
Cohesion: 0.38
Nodes (4): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap

### Community 130 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 131 - "AppFooter.stories.tsx"
Cohesion: 0.33
Nodes (5): AppFooter, Desktop, Mobile, Story, Tablet

### Community 132 - "techStore.ts"
Cohesion: 0.17
Nodes (9): mockCellState, MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS, debouncedStorage, debounceSetItem(), SetItemFunction (+1 more)

### Community 133 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 134 - "useOptimizeStore"
Cohesion: 0.11
Nodes (15): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorContent(), ErrorContentProps, PageVariant (+7 more)

### Community 135 - "useAppHeaderContext.ts"
Cohesion: 0.67
Nodes (3): AppHeaderContext, AppHeaderContextValue, GA4Event

### Community 136 - "MainAppLayout.tsx"
Cohesion: 0.13
Nodes (25): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+17 more)

### Community 137 - "bootPipeline.test.tsx"
Cohesion: 0.19
Nodes (13): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, registerDefaultDeferredServices(), activateLatestServiceWorker(), evictStaleServiceWorkers(), isAppHiddenOrIdle() (+5 more)

### Community 139 - "routes.tsx"
Cohesion: 0.29
Nodes (6): languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 143 - "AppDialog.tsx"
Cohesion: 0.10
Nodes (23): getPageByDialogTitleKey(), getPageById(), AppDialog, AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter() (+15 more)

### Community 144 - "monitoring.ts"
Cohesion: 0.18
Nodes (14): Root(), useThemeStore, BootOptions, BootResult, handleFatalBootstrapError(), createAppRouter(), initializeSentry(), LogEntry (+6 more)

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

## Knowledge Gaps
- **443 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+438 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `useMainAppLogic.tsx`, `tracking.ts`, `ShipSelectionProvider.tsx`, `MarkdownContentRenderer.tsx`, `techStore.ts`, `bootPipeline.test.tsx`, `App.tsx`, `LifecycleCoordinator`, `useTechTree.tsx`, `usePlatformStore`, `monitoring.ts`, `useOptimize.tsx`, `platformStore.ts`, `TechTree`, `sessionCoordinator.ts`, `useTechTreeRow.ts`, `lifecycleCoordinator.ts`, `environment.ts`, `optimizationManager.ts`, `useAnalytics`, `GridCell.tsx`, `ShareLinkDialog.tsx`, `gridStore.ts`, `dataValidation.ts`, `useMarkdownContent.ts`, `useBreakpoint`, `TechTreePresetsCard.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useMainAppLogic.tsx`, `MainAppContent.stories.tsx`, `MainAppLayout.tsx`, `useTechTree.tsx`, `usePlatformStore`, `useOptimize.tsx`, `TechTree`, `sessionCoordinator.ts`, `useTechTreeRow.ts`, `TechTreeRow.test.tsx`, `environment.ts`, `Logger`, `useAnalytics`, `GridCell.tsx`, `AppHeader.stories.tsx`, `useTechStore`, `gridStore.ts`, `RecommendedBuild.stories.tsx`, `useBreakpoint`, `TechTreePresetsCard.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `bootPipeline.test.tsx`, `App.tsx`, `routes.tsx`, `preview.tsx`, `monitoring.ts`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `ShipSelectionProvider.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05792349726775956 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07096774193548387 - nodes in this community are weakly interconnected._