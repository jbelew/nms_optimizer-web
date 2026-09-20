# Graph Report - nms_optimizer-web  (2026-09-20)

## Corpus Check
- 439 files · ~199,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1680 nodes · 4071 edges · 136 communities (113 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `24bfb53a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- MainAppLayout.tsx
- AppFooter.tsx
- reportWebVitals.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeCommandRunnerAdapter
- ConditionalTooltip.tsx
- preview.tsx
- useBreakpoint
- uiStore.ts
- AppDialog.tsx
- LifecycleCoordinator
- gridSerializer.ts
- AppHeader.tsx
- __init__.py
- App.tsx
- tracking.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- ErrorBoundary.tsx
- network.ts
- generate-sitemap.mjs
- useTechTree.tsx
- monitoring.ts
- spa-routes.test.mjs
- environment.ts
- TechTreeRow.tsx
- useSeoAndTitle.ts
- dataValidation.ts
- usePlatformStore
- generate-ssg.mjs
- Seo.tsx
- TechTree.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- optimizationManager.ts
- page-metadata.js
- routes.tsx
- vite-plugin-markdown-bundle.mjs
- RecommendedBuild.tsx
- RecommendedBuild.stories.tsx
- useShipTypes.tsx
- bootPipeline.tsx
- generate-radix-colors.mjs
- OptimizationAlertDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- bootstrap.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- iconRegistry.ts
- useOptimize.tsx
- useGridStore
- CliAgentRunnerAdapter
- platformStore.ts
- ErrorContent.stories.tsx
- ShareLinkDialog.tsx
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
- AppHeader.stories.tsx
- OfflineBanner.stories.tsx
- useMarkdownContent.ts
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
- youTubeEmbed.tsx
- InstallPrompt.stories.tsx
- GridTableButtons.tsx
- GridTable.tsx
- useAnalytics
- UpdatePrompt.tsx
- Logger

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
- 2-file cycle: `src/components/RecommendedBuild/RecommendedBuild.tsx -> src/components/RecommendedBuild/RecommendedBuildButton.tsx -> src/components/RecommendedBuild/RecommendedBuild.tsx`
- 2-file cycle: `src/components/ShipSelection/ShipSelection.tsx -> src/components/ShipSelection/ShipSelectionContent.tsx -> src/components/ShipSelection/ShipSelection.tsx`
- 2-file cycle: `src/components/GridTable/GridTable.tsx -> src/components/GridTable/GridTableGrid.tsx -> src/components/GridTable/GridTable.tsx`
- 3-file cycle: `src/components/ErrorBoundary/ErrorBoundary.tsx -> src/components/ErrorBoundary/ErrorContent.tsx -> src/components/ErrorBoundary/ErrorDisplay.tsx -> src/components/ErrorBoundary/ErrorBoundary.tsx`

## Communities (136 total, 23 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "MainAppLayout.tsx"
Cohesion: 0.07
Nodes (37): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+29 more)

### Community 2 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 3 - "reportWebVitals.ts"
Cohesion: 0.29
Nodes (8): AppHeaderContext, AppHeaderContextValue, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), DialogType

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.08
Nodes (6): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (26): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+18 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.13
Nodes (19): createGrid(), applyValidationFeedback(), feedbackMap, ValidationReason, createCellFromModuleData(), createEmptyCell(), createGrid(), validateToggleActive() (+11 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "ConditionalTooltip.tsx"
Cohesion: 0.24
Nodes (9): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext, useTooltipActions() (+1 more)

### Community 9 - "preview.tsx"
Cohesion: 0.14
Nodes (9): TooltipProvider(), hideSplashScreenAndShowBackground(), BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview (+1 more)

### Community 10 - "useBreakpoint"
Cohesion: 0.21
Nodes (6): BuyMeACoffee(), ErrorContent(), ErrorContentProps, TechTreeRoot(), AppLayout, useBreakpoint()

### Community 11 - "uiStore.ts"
Cohesion: 0.05
Nodes (44): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, ErrorMessageRenderer() (+36 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.13
Nodes (19): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+11 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.12
Nodes (5): bootApp(), BootOptions, BootResult, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "gridSerializer.ts"
Cohesion: 0.23
Nodes (11): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+3 more)

### Community 15 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.12
Nodes (22): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, mockDialogContext (+14 more)

### Community 18 - "tracking.ts"
Cohesion: 0.14
Nodes (17): NotFound(), API_URL, TRACKING_ID, UI_TIMING, AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent() (+9 more)

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "ErrorBoundary.tsx"
Cohesion: 0.20
Nodes (3): ErrorBoundary, Props, State

### Community 23 - "network.ts"
Cohesion: 0.14
Nodes (17): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+9 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "useTechTree.tsx"
Cohesion: 0.10
Nodes (29): EmptyState(), EmptyStateProps, TechTree(), TechTreeContent(), TechTreeContentProps, TechTreeList(), TechTreeSection(), TechTreeSectionProps (+21 more)

### Community 26 - "monitoring.ts"
Cohesion: 0.14
Nodes (16): handleError(), RouteError(), AppLifecyclePhase, DeferredTask, DeferredTaskHandler, LifecycleListener, captureException(), createAppRouter() (+8 more)

### Community 27 - "spa-routes.test.mjs"
Cohesion: 0.22
Nodes (6): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, ROUTED_DIALOG_IDS

### Community 28 - "environment.ts"
Cohesion: 0.17
Nodes (13): InstallPrompt(), BonusStatusIcon(), renderIcon(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, debouncedStorage, debounceSetItem() (+5 more)

### Community 29 - "TechTreeRow.tsx"
Cohesion: 0.20
Nodes (13): TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIconProps, TechTreeRowActions() (+5 more)

### Community 30 - "useSeoAndTitle.ts"
Cohesion: 0.21
Nodes (8): AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, useSeoAndTitle(), PerformanceRoute(), UserStatsRoute()

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (14): BuildNameContent(), BuildNameContentProps, BuildNameContentRef, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName() (+6 more)

### Community 32 - "usePlatformStore"
Cohesion: 0.28
Nodes (13): MainAppProvider(), useMainAppBuildManagement(), useMainAppLogic(), useAppLayout(), useLoadBuild(), useOptimize(), useSaveBuild(), useScrollHide() (+5 more)

### Community 33 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 34 - "Seo.tsx"
Cohesion: 0.27
Nodes (5): normalizePath(), Seo(), useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 35 - "TechTree.tsx"
Cohesion: 0.17
Nodes (8): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTreeProps, TechTreeRecommended(), TechTreeSkeleton()

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.12
Nodes (16): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+8 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.06
Nodes (25): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Any, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels. (+17 more)

### Community 41 - "optimizationManager.ts"
Cohesion: 0.25
Nodes (9): WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions (+1 more)

### Community 42 - "page-metadata.js"
Cohesion: 0.24
Nodes (16): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+8 more)

### Community 43 - "routes.tsx"
Cohesion: 0.29
Nodes (6): languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "RecommendedBuild.tsx"
Cohesion: 0.33
Nodes (7): RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext()

### Community 46 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 47 - "useShipTypes.tsx"
Cohesion: 0.21
Nodes (12): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), cache, ShipTypes, ShipTypesState (+4 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.28
Nodes (10): Root(), useThemeStore, initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), setupServiceWorkerRegistration() (+2 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 52 - "store-helpers.ts"
Cohesion: 0.31
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "bootstrap.ts"
Cohesion: 0.44
Nodes (5): safeRemoveItem(), migrateTutorialKey(), performBootstrapMigrations(), performGridCleanup(), runWhenIdle()

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "iconRegistry.ts"
Cohesion: 0.29
Nodes (6): DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 58 - "useOptimize.tsx"
Cohesion: 0.17
Nodes (10): useLatest(), SCROLL_OPTIONS, UseOptimizeReturn, computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState, mockTechStore (+2 more)

### Community 59 - "useGridStore"
Cohesion: 0.22
Nodes (14): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps (+6 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "platformStore.ts"
Cohesion: 0.18
Nodes (13): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, fetchShipTypes(), PlatformState (+5 more)

### Community 62 - "ErrorContent.stories.tsx"
Cohesion: 0.33
Nodes (5): PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace

### Community 63 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

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

### Community 76 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

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

### Community 131 - "InstallPrompt.stories.tsx"
Cohesion: 0.14
Nodes (13): Default, Story, NmsToast(), Default, Error, Story, Success, ToastProps (+5 more)

### Community 132 - "GridTableButtons.tsx"
Cohesion: 0.11
Nodes (18): GridContext, GridContextValue, GridProvider(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS (+10 more)

### Community 133 - "GridTable.tsx"
Cohesion: 0.13
Nodes (14): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+6 more)

### Community 136 - "useAnalytics"
Cohesion: 0.19
Nodes (12): AppHeaderProvider(), LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, RecommendedBuildProvider(), UpdatePrompt (+4 more)

### Community 137 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 140 - "Logger"
Cohesion: 0.19
Nodes (13): App(), DynamicRadixIcon(), DynamicRadixIconProps, {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), UseLoadBuildReturn, UseSaveBuildReturn (+5 more)

## Knowledge Gaps
- **413 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+408 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `reportWebVitals.ts`, `GridTableButtons.tsx`, `gridStore.ts`, `useAnalytics`, `LifecycleCoordinator`, `gridSerializer.ts`, `App.tsx`, `tracking.ts`, `network.ts`, `useTechTree.tsx`, `monitoring.ts`, `environment.ts`, `dataValidation.ts`, `usePlatformStore`, `optimizationManager.ts`, `useShipTypes.tsx`, `bootPipeline.tsx`, `bootstrap.ts`, `useOptimize.tsx`, `useGridStore`, `platformStore.ts`, `ShareLinkDialog.tsx`, `useMarkdownContent.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `MainAppLayout.tsx`, `GridTableButtons.tsx`, `GridTable.tsx`, `gridStore.ts`, `useAnalytics`, `uiStore.ts`, `Logger`, `gridSerializer.ts`, `useTechTree.tsx`, `dataValidation.ts`, `usePlatformStore`, `TechTree.tsx`, `GridCell.tsx`, `RecommendedBuild.stories.tsx`, `useShipTypes.tsx`, `bootstrap.ts`, `useOptimize.tsx`, `platformStore.ts`, `MainAppContent.stories.tsx`, `AppHeader.stories.tsx`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `useBreakpoint()` connect `useBreakpoint` to `usePlatformStore`, `MainAppLayout.tsx`, `performanceChart.tsx`, `TechTree.tsx`, `GridTableButtons.tsx`, `GridTable.tsx`, `useAnalytics`, `UpdatePrompt.tsx`, `uiStore.ts`, `RecommendedBuild.tsx`, `platformStore.ts`, `useTechTree.tsx`, `useOptimize.tsx`, `TechTreeRow.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _413 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06321334503950835 - nodes in this community are weakly interconnected._
- **Should `MainAppLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._