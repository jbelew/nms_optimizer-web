# Graph Report - nms_optimizer-web  (2026-10-12)

## Corpus Check
- 454 files · ~212,793 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1754 nodes · 4228 edges · 136 communities (116 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c87cfc7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- uiStore.ts
- tracking.ts
- ShipSelectionProvider.tsx
- MarkdownContentRenderer.tsx
- TechTreePresetsCard.tsx
- useMainAppLogic.tsx
- FakeCommandRunnerAdapter
- useOptimize.test.tsx
- tooltipUtils.ts
- useSeoAndTitle.ts
- bootPipeline.tsx
- lifecycleCoordinator.ts
- LifecycleCoordinator
- page-metadata.js
- UpdatePrompt.tsx
- __init__.py
- OptimizationAlertDialog.tsx
- AppHeader.tsx
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- useAppHeaderContext.ts
- network.ts
- generate-sitemap.mjs
- MainAppLayout.tsx
- TechTreeRow.test.tsx
- src/constants.ts
- ErrorBoundary.tsx
- iconRegistry.ts
- ShareLinkDialog.tsx
- dataValidation.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- MainAppContent.stories.tsx
- dialogUtils.ts
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- useAnalytics
- ModuleSelectionDialog.tsx
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- useTechTree.tsx
- routes.tsx
- AppHeader.stories.tsx
- useBreakpoint
- generate-radix-colors.mjs
- ConditionalTooltip.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- useOptimizeStore
- create_screenshot_video.py
- update-lighthouse-history.mjs
- environment.ts
- techStore.ts
- TechTreeRow.tsx
- CliAgentRunnerAdapter
- gridStore.ts
- useShakeStore
- GridTable.tsx
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
- RecommendedBuild.stories.tsx
- OfflineBanner.stories.tsx
- gridSerializer.ts
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
- Logger
- applyValidationFeedback.ts
- Seo.tsx
- UpdatePromptWrapper.tsx
- App.tsx
- usePlatformStore
- PWA Runtime Caching and Update Resilience
- spa-routes.test.mjs

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

## Communities (136 total, 20 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "uiStore.ts"
Cohesion: 0.15
Nodes (15): ErrorMessageRenderer(), mockUseTranslation, A11yState, ErrorMessage, ErrorState, OptimizeErrorType, OptimizeState, OptimizeStatus (+7 more)

### Community 2 - "tracking.ts"
Cohesion: 0.14
Nodes (16): AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), AnalyticsEventPayload, detectAdBlocker() (+8 more)

### Community 3 - "ShipSelectionProvider.tsx"
Cohesion: 0.08
Nodes (31): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionProvider(), ShipSelectionProviderProps, mockNavigate (+23 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "TechTreePresetsCard.tsx"
Cohesion: 0.18
Nodes (14): PresetCardItem(), PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), mockHandleApply, mockHandleOpenInstructions, GridActions, GridComputed (+6 more)

### Community 6 - "useMainAppLogic.tsx"
Cohesion: 0.15
Nodes (21): MainAppProvider(), useMainAppBuildManagement(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), ERROR_THRESHOLDS, useErrorDispatcher() (+13 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "useOptimize.test.tsx"
Cohesion: 0.18
Nodes (11): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState, MODULE_RANK_ORDER (+3 more)

### Community 9 - "tooltipUtils.ts"
Cohesion: 0.33
Nodes (7): TooltipManager(), TooltipProvider(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext, useTooltipState()

### Community 10 - "useSeoAndTitle.ts"
Cohesion: 0.19
Nodes (9): AppDialog, PerformanceContent(), PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, useSeoAndTitle(), PerformanceRoute() (+1 more)

### Community 11 - "bootPipeline.tsx"
Cohesion: 0.27
Nodes (12): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), isAppHiddenOrIdle(), lastUserActivityTimestamp (+4 more)

### Community 12 - "lifecycleCoordinator.ts"
Cohesion: 0.23
Nodes (6): NotFound(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, hideSplashScreenAndShowBackground(), SplashHider()

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "page-metadata.js"
Cohesion: 0.24
Nodes (16): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+8 more)

### Community 15 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 18 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "useAppHeaderContext.ts"
Cohesion: 0.31
Nodes (6): AppFooterProvider(), AppFooterContext, AppFooterContextValue, AppHeaderContext, AppHeaderContextValue, DialogType

### Community 23 - "network.ts"
Cohesion: 0.10
Nodes (25): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), API_URL, fetchShipTypes() (+17 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "MainAppLayout.tsx"
Cohesion: 0.16
Nodes (21): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+13 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.12
Nodes (15): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockOpenDialog, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+7 more)

### Community 27 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, handleError(), RouteError(), captureException()

### Community 29 - "iconRegistry.ts"
Cohesion: 0.29
Nodes (6): DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 30 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 31 - "dataValidation.ts"
Cohesion: 0.22
Nodes (11): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+3 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.20
Nodes (9): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+1 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "MainAppContent.stories.tsx"
Cohesion: 0.14
Nodes (12): Desktop, Mobile, Story, StorybookWrapper(), Tablet, TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader() (+4 more)

### Community 35 - "dialogUtils.ts"
Cohesion: 0.22
Nodes (9): DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, DialogContext (+1 more)

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
Cohesion: 0.15
Nodes (14): AppHeaderProvider(), BuyMeACoffee(), LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story (+6 more)

### Community 42 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "useTechTree.tsx"
Cohesion: 0.14
Nodes (21): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent(), TechTreeContentProps, TechTreeList() (+13 more)

### Community 46 - "routes.tsx"
Cohesion: 0.33
Nodes (5): DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 47 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 48 - "useBreakpoint"
Cohesion: 0.07
Nodes (32): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, GridContext (+24 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "ConditionalTooltip.tsx"
Cohesion: 0.53
Nodes (3): ConditionalTooltip, ConditionalTooltipProps, useTooltipActions()

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

### Community 57 - "environment.ts"
Cohesion: 0.06
Nodes (39): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), Default, Story, USER_VISIT_KEY, NmsToast(), Default, Error (+31 more)

### Community 58 - "techStore.ts"
Cohesion: 0.16
Nodes (16): mockCellState, EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY (+8 more)

### Community 59 - "TechTreeRow.tsx"
Cohesion: 0.17
Nodes (16): TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps (+8 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.13
Nodes (20): useCell(), createGrid(), createSerializedGrid(), mockNavigate, mockTechTreeData, createCellFromModuleData(), createEmptyCell(), createGrid() (+12 more)

### Community 62 - "useShakeStore"
Cohesion: 0.47
Nodes (4): GridShake(), GridShakeProps, GridTableRoot(), useShakeStore

### Community 63 - "GridTable.tsx"
Cohesion: 0.13
Nodes (14): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+6 more)

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

### Community 76 - "RecommendedBuild.stories.tsx"
Cohesion: 0.14
Nodes (14): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+6 more)

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 79 - "gridSerializer.ts"
Cohesion: 0.30
Nodes (8): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer()

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
Cohesion: 0.22
Nodes (10): Root(), useThemeStore, createAppRouter(), LogEntry, LogLevel, logs, SentryIntegration, SentrySDK (+2 more)

### Community 99 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 131 - "Logger"
Cohesion: 0.40
Nodes (6): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), UseLoadBuildReturn, Logger

### Community 133 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 134 - "Seo.tsx"
Cohesion: 0.30
Nodes (5): normalizePath(), Seo(), useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 137 - "UpdatePromptWrapper.tsx"
Cohesion: 0.38
Nodes (6): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, activateLatestServiceWorker(), evictStaleServiceWorkers()

### Community 143 - "App.tsx"
Cohesion: 0.09
Nodes (28): getPageByDialogTitleKey(), getPageById(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent (+20 more)

### Community 145 - "usePlatformStore"
Cohesion: 0.14
Nodes (18): AppContent(), BuildNameContent(), BuildNameContentProps, RecommendedBuildProvider(), Desktop, Mobile, Story, Tablet (+10 more)

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

### Community 147 - "spa-routes.test.mjs"
Cohesion: 0.22
Nodes (6): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, ROUTED_DIALOG_IDS

## Knowledge Gaps
- **442 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `ShipSelectionProvider.tsx`, `MarkdownContentRenderer.tsx`, `useMainAppLogic.tsx`, `UpdatePromptWrapper.tsx`, `bootPipeline.tsx`, `lifecycleCoordinator.ts`, `LifecycleCoordinator`, `App.tsx`, `usePlatformStore`, `network.ts`, `src/constants.ts`, `ErrorBoundary.tsx`, `ShareLinkDialog.tsx`, `dataValidation.ts`, `dialogUtils.ts`, `GridCell.tsx`, `useAnalytics`, `useTechTree.tsx`, `useBreakpoint`, `environment.ts`, `techStore.ts`, `gridStore.ts`, `gridSerializer.ts`, `monitoring.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `MainAppContent.stories.tsx`, `TechTreeRow.test.tsx`, `Logger`, `ShipSelectionProvider.tsx`, `GridCell.tsx`, `useMainAppLogic.tsx`, `useOptimize.test.tsx`, `useAnalytics`, `RecommendedBuild.stories.tsx`, `useTechTree.tsx`, `AppHeader.stories.tsx`, `useBreakpoint`, `usePlatformStore`, `gridSerializer.ts`, `MainAppLayout.tsx`, `techStore.ts`, `environment.ts`, `GridTable.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `bootPipeline.tsx`, `lifecycleCoordinator.ts`, `routes.tsx`, `App.tsx`, `ErrorBoundary.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06277436347673397 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `ShipSelectionProvider.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07922705314009662 - nodes in this community are weakly interconnected._