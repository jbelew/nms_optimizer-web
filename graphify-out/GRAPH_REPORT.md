# Graph Report - nms_optimizer-web  (2026-10-10)

## Corpus Check
- 451 files · ~210,931 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1746 nodes · 4220 edges · 128 communities (108 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d98a6089`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- RoutedDialogs.integration.test.tsx
- tracking.ts
- InstallPrompt.stories.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useBreakpoint
- FakeCommandRunnerAdapter
- sessionCoordinator.ts
- preview.tsx
- routes.tsx
- bootPipeline.tsx
- lifecycleCoordinator.ts
- LifecycleCoordinator
- page-metadata.js
- UpdatePrompt.tsx
- __init__.py
- OptimizationAlertDialog.tsx
- gridSerializer.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- GridTableButtons.tsx
- network.ts
- generate-ssg.mjs
- MainAppLayout.tsx
- TechTreeRow.test.tsx
- src/constants.ts
- ErrorBoundary.tsx
- uiStore.ts
- ShareLinkDialog.tsx
- buildNameGenerator.ts
- AppHeader.tsx
- check-remote-sync.test.mjs
- useGridStore
- dialogUtils.ts
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- Logger
- useTechTreeRow.ts
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- useTechTree.tsx
- GridTableButtons.stories.tsx
- App.tsx
- generate-radix-colors.mjs
- environment.ts
- sentryMock.ts
- store-helpers.ts
- process_stream
- create_screenshot_video.py
- update-lighthouse-history.mjs
- fetchTechTreeAsync
- techStore.ts
- TechTreeRow.tsx
- CliAgentRunnerAdapter
- gridStore.ts
- spa-routes.test.mjs
- useTechOptimization.ts
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
- OfflineBanner.stories.tsx
- useAnalytics
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
- MainAppContent.stories.tsx
- techRules.ts
- gridTypes.ts
- UpdatePromptWrapper.tsx
- usePlatformStore
- AppDialog.tsx

## God Nodes (most connected - your core abstractions)
1. `Logger` - 92 edges
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

## Communities (128 total, 20 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.12
Nodes (15): AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer (+7 more)

### Community 2 - "tracking.ts"
Cohesion: 0.14
Nodes (20): API_URL, AnalyticsEventParams, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), AnalyticsEventPayload, detectAdBlocker() (+12 more)

### Community 3 - "InstallPrompt.stories.tsx"
Cohesion: 0.13
Nodes (13): Default, Story, NmsToast(), Default, Error, Story, Success, ToastProps (+5 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (14): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+6 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 6 - "useBreakpoint"
Cohesion: 0.11
Nodes (25): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, mockShowInfo (+17 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "sessionCoordinator.ts"
Cohesion: 0.22
Nodes (8): createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState, mockTechStore, mockUiStore, BonusStatusData

### Community 9 - "preview.tsx"
Cohesion: 0.10
Nodes (19): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), Root(), useThemeStore, createAppRouter(), TooltipActions (+11 more)

### Community 10 - "routes.tsx"
Cohesion: 0.22
Nodes (8): LanguageCode, languages, PageName, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 11 - "bootPipeline.tsx"
Cohesion: 0.23
Nodes (11): BootOptions, BootResult, registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), isAppHiddenOrIdle(), lastUserActivityTimestamp, setLastUserActivityForTesting() (+3 more)

### Community 12 - "lifecycleCoordinator.ts"
Cohesion: 0.20
Nodes (8): formatErrorDocumentTitle(), NotFound(), runWhenIdle(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, hideSplashScreenAndShowBackground(), SplashHider()

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.12
Nodes (4): bootApp(), DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "page-metadata.js"
Cohesion: 0.20
Nodes (17): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), getPageMetadata(), getAllPages(), getPageByPath(), getRoutedDialogs(), PAGE_IDS (+9 more)

### Community 15 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 18 - "gridSerializer.ts"
Cohesion: 0.16
Nodes (16): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+8 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "GridTableButtons.tsx"
Cohesion: 0.22
Nodes (8): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }

### Community 23 - "network.ts"
Cohesion: 0.13
Nodes (17): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+9 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 25 - "MainAppLayout.tsx"
Cohesion: 0.05
Nodes (48): MainAppContent(), MainAppProvider(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter() (+40 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.11
Nodes (14): TechTreeProvider(), TechTreeContext, TechTreeContextValue, defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore (+6 more)

### Community 27 - "src/constants.ts"
Cohesion: 0.18
Nodes (12): CLOUDFLARE_BEACON_CONFIG, CLOUDFLARE_BEACON_SRC, TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES (+4 more)

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, handleError(), RouteError(), captureException()

### Community 29 - "uiStore.ts"
Cohesion: 0.07
Nodes (32): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, ErrorMessageRenderer() (+24 more)

### Community 30 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 31 - "buildNameGenerator.ts"
Cohesion: 0.33
Nodes (7): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, sanitizeFilename()

### Community 32 - "AppHeader.tsx"
Cohesion: 0.07
Nodes (23): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+15 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "useGridStore"
Cohesion: 0.17
Nodes (14): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+6 more)

### Community 35 - "dialogUtils.ts"
Cohesion: 0.12
Nodes (17): formatDocumentTitle(), mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, AppFooterProvider(), AppFooterContext (+9 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.12
Nodes (19): GridCell(), GridCellProps, ModuleContent(), mockCellState, getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap (+11 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "Logger"
Cohesion: 0.14
Nodes (20): App(), useMainAppBuildManagement(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), useLoadBuild(), UseLoadBuildReturn, useSaveBuild() (+12 more)

### Community 42 - "useTechTreeRow.ts"
Cohesion: 0.36
Nodes (6): TechTreeRowContext, TechTreeRowContextValue, EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "useTechTree.tsx"
Cohesion: 0.05
Nodes (56): EmptyState(), EmptyStateProps, RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story (+48 more)

### Community 46 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 47 - "App.tsx"
Cohesion: 0.12
Nodes (20): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, AppHeaderProvider() (+12 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "environment.ts"
Cohesion: 0.21
Nodes (16): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), USER_VISIT_KEY, UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isIosSafari() (+8 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "fetchTechTreeAsync"
Cohesion: 0.40
Nodes (7): fetchShipTypes(), fetchTechTreeAsync(), preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl(), PLATFORM_STORAGE_KEY, resolveInitialPlatform()

### Community 58 - "techStore.ts"
Cohesion: 0.22
Nodes (11): useGridCellStyle(), EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), debouncedStorage, debounceSetItem() (+3 more)

### Community 59 - "TechTreeRow.tsx"
Cohesion: 0.27
Nodes (11): useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges(), TechTreeRowLabel() (+3 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.24
Nodes (7): createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), Grid, useUiStore, StoreResetWrapper()

### Community 62 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 63 - "useTechOptimization.ts"
Cohesion: 0.36
Nodes (5): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), useShakeStore

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

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "useAnalytics"
Cohesion: 0.22
Nodes (11): BuyMeACoffee(), useAnalytics(), mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+3 more)

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

### Community 121 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 132 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 133 - "gridTypes.ts"
Cohesion: 0.23
Nodes (9): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, GridComputed, GridStore (+1 more)

### Community 137 - "UpdatePromptWrapper.tsx"
Cohesion: 0.42
Nodes (5): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, activateLatestServiceWorker()

### Community 138 - "usePlatformStore"
Cohesion: 0.17
Nodes (16): ShipSelectionProvider(), ShipSelectionProviderProps, TechTreeRoot(), TechTreeRootProps, RouteContext, RouteContextType, useRouteContext(), cache (+8 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.08
Nodes (29): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+21 more)

## Knowledge Gaps
- **437 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+432 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `MarkdownContentRenderer.tsx`, `useBreakpoint`, `sessionCoordinator.ts`, `UpdatePromptWrapper.tsx`, `usePlatformStore`, `bootPipeline.tsx`, `lifecycleCoordinator.ts`, `LifecycleCoordinator`, `gridSerializer.ts`, `network.ts`, `src/constants.ts`, `ErrorBoundary.tsx`, `ShareLinkDialog.tsx`, `GridCell.tsx`, `useTechTree.tsx`, `App.tsx`, `environment.ts`, `fetchTechTreeAsync`, `techStore.ts`, `gridStore.ts`, `useTechOptimization.ts`, `useAnalytics`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useBreakpoint`, `sessionCoordinator.ts`, `usePlatformStore`, `AppDialog.tsx`, `gridSerializer.ts`, `GridTableButtons.tsx`, `MainAppLayout.tsx`, `TechTreeRow.test.tsx`, `AppHeader.tsx`, `GridCell.tsx`, `Logger`, `useTechTreeRow.ts`, `useTechTree.tsx`, `GridTableButtons.stories.tsx`, `App.tsx`, `environment.ts`, `techStore.ts`, `gridStore.ts`, `useTechOptimization.ts`, `useAnalytics`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `Logger`, `usePlatformStore`, `bootPipeline.tsx`, `lifecycleCoordinator.ts`, `App.tsx`, `ErrorBoundary.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _437 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `RoutedDialogs.integration.test.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12169312169312169 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._