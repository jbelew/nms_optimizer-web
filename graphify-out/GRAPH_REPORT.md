# Graph Report - nms_optimizer-web  (2026-10-09)

## Corpus Check
- 453 files · ~209,684 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1754 nodes · 4242 edges · 134 communities (112 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da13cfe3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- RoutedDialogs.integration.test.tsx
- tracking.ts
- useTechTreeRow.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useBreakpoint
- FakeCommandRunnerAdapter
- sessionCoordinator.ts
- AppHeader.tsx
- page-metadata.js
- WelcomeContent.tsx
- RecommendedBuild.stories.tsx
- LifecycleCoordinator
- uiStore.ts
- gridSerializer.ts
- __init__.py
- OptimizationAlertDialog.tsx
- lifecycleCoordinator.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- generate-ssg.mjs
- userStatsData.tsx
- generate-sitemap.mjs
- ShipSelection.tsx
- TechTreeRow.test.tsx
- Logger
- ErrorBoundary.tsx
- useTechStore
- MainAppLayout.tsx
- dataValidation.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- routes.tsx
- App.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- useMainAppLogic.tsx
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- useTechTree.tsx
- reportWebVitals.ts
- monitoring.ts
- ShareLinkDialog.tsx
- generate-radix-colors.mjs
- useToast.ts
- sentryMock.ts
- store-helpers.ts
- process_stream
- LanguageSelector.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- GridTableButtons.test.tsx
- platformStore.ts
- bootstrap.ts
- CliAgentRunnerAdapter
- useGridStore
- useOptimize.test.tsx
- spa-routes.test.mjs
- GridControlButtons.tsx
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
- TechTree.stories.tsx
- OfflineBanner.stories.tsx
- UpdatePrompt.tsx
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
- useAnalytics
- Seo.tsx
- techStore.ts
- gridStore.ts
- useTechOptimization.ts
- lazyNamed.ts
- usePlatformStore
- AppDialog.tsx

## God Nodes (most connected - your core abstractions)
1. `Logger` - 91 edges
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

## Communities (134 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.20
Nodes (9): AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer (+1 more)

### Community 2 - "tracking.ts"
Cohesion: 0.15
Nodes (17): NotFound(), API_URL, CLOUDFLARE_BEACON_CONFIG, CLOUDFLARE_BEACON_SRC, TRACKING_ID, AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker() (+9 more)

### Community 3 - "useTechTreeRow.ts"
Cohesion: 0.30
Nodes (7): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (14): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+6 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 6 - "useBreakpoint"
Cohesion: 0.10
Nodes (17): AppHeader, AppHeaderProvider(), ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage (+9 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "sessionCoordinator.ts"
Cohesion: 0.14
Nodes (13): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore (+5 more)

### Community 9 - "AppHeader.tsx"
Cohesion: 0.05
Nodes (31): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+23 more)

### Community 10 - "page-metadata.js"
Cohesion: 0.33
Nodes (12): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath(), getRoutedDialogs() (+4 more)

### Community 11 - "WelcomeContent.tsx"
Cohesion: 0.33
Nodes (6): formatDocumentTitle(), WelcomeContent(), WelcomeContentProps, UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck()

### Community 12 - "RecommendedBuild.stories.tsx"
Cohesion: 0.13
Nodes (15): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+7 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "uiStore.ts"
Cohesion: 0.08
Nodes (32): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, ErrorMessageRenderer() (+24 more)

### Community 15 - "gridSerializer.ts"
Cohesion: 0.22
Nodes (11): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, createSerializedGrid() (+3 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 18 - "lifecycleCoordinator.ts"
Cohesion: 0.12
Nodes (24): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, fetchTechTreeAsync(), Root(), useThemeStore (+16 more)

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "ShipSelection.tsx"
Cohesion: 0.11
Nodes (19): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), mockNavigate, mockSendDeferredEvent, mockShowInfo (+11 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 27 - "Logger"
Cohesion: 0.25
Nodes (8): WS_URL, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, mockCreateSocket, Logger

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (5): ErrorBoundary, Props, State, handleError(), RouteError()

### Community 29 - "useTechStore"
Cohesion: 0.25
Nodes (11): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), mockModules (+3 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.19
Nodes (20): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppLayoutContent() (+12 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (14): BuildNameContent(), BuildNameContentProps, BuildNameContentRef, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName() (+6 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "routes.tsx"
Cohesion: 0.25
Nodes (7): App(), languages, DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes

### Community 35 - "App.tsx"
Cohesion: 0.10
Nodes (23): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, mockDialogContext (+15 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.13
Nodes (17): GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+9 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.06
Nodes (25): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Any, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels. (+17 more)

### Community 41 - "useMainAppLogic.tsx"
Cohesion: 0.13
Nodes (18): MainAppProvider(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), useLatest(), SCROLL_OPTIONS, useOptimize() (+10 more)

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.24
Nodes (11): TechTreeSectionList(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges() (+3 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "useTechTree.tsx"
Cohesion: 0.11
Nodes (28): EmptyState(), EmptyStateProps, RecommendedBuildProvider(), SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent(), TechTreeContentProps (+20 more)

### Community 46 - "reportWebVitals.ts"
Cohesion: 0.29
Nodes (8): AppHeaderContext, AppHeaderContextValue, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric(), DialogType

### Community 47 - "monitoring.ts"
Cohesion: 0.25
Nodes (8): captureException(), LogEntry, LogLevel, logs, SentryIntegration, SentrySDK, __setSentryInstance(), sentryMock

### Community 48 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "useToast.ts"
Cohesion: 0.10
Nodes (25): INSTALL_PROMPT_DISMISSED_KEY, AndroidChromium, AndroidStoryWrapper(), Default, Story, USER_VISIT_KEY, NmsToast(), Default (+17 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "LanguageSelector.tsx"
Cohesion: 0.31
Nodes (4): LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "GridTableButtons.test.tsx"
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

### Community 58 - "platformStore.ts"
Cohesion: 0.18
Nodes (18): InstallPrompt(), UI_TIMING, DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, debouncedStorage, debounceSetItem(), SetItemFunction (+10 more)

### Community 59 - "bootstrap.ts"
Cohesion: 0.44
Nodes (5): safeRemoveItem(), migrateTutorialKey(), performBootstrapMigrations(), performGridCleanup(), runWhenIdle()

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "useGridStore"
Cohesion: 0.10
Nodes (18): GridTable, GridTableProps, Default, Solving, Story, GridTableContent(), GridTableGrid(), MainAppContent() (+10 more)

### Community 62 - "useOptimize.test.tsx"
Cohesion: 0.25
Nodes (7): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState

### Community 63 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 64 - "GridControlButtons.tsx"
Cohesion: 0.29
Nodes (7): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), useTechTreeLoadingStore

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

### Community 76 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

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

### Community 130 - "useAnalytics"
Cohesion: 0.17
Nodes (18): BuyMeACoffee(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useAnalytics(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
} (+10 more)

### Community 131 - "Seo.tsx"
Cohesion: 0.33
Nodes (5): normalizePath(), Seo(), useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 132 - "techStore.ts"
Cohesion: 0.19
Nodes (9): mockCellState, MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS, debouncedStorage, debounceSetItem(), SetItemFunction (+1 more)

### Community 133 - "gridStore.ts"
Cohesion: 0.15
Nodes (19): TranslateFn, applyValidationFeedback(), feedbackMap, ValidationReason, createCellFromModuleData(), validateToggleActive(), validateToggleSupercharged(), ValidationResult (+11 more)

### Community 135 - "useTechOptimization.ts"
Cohesion: 0.36
Nodes (5): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), useShakeStore

### Community 138 - "usePlatformStore"
Cohesion: 0.18
Nodes (15): ShipTypesLoader(), MobileToolbar(), MobileToolbarProps, Default, Story, ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext (+7 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.10
Nodes (25): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+17 more)

## Knowledge Gaps
- **438 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+433 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `useAnalytics`, `tracking.ts`, `MarkdownContentRenderer.tsx`, `gridStore.ts`, `techStore.ts`, `useTechOptimization.ts`, `sessionCoordinator.ts`, `usePlatformStore`, `WelcomeContent.tsx`, `LifecycleCoordinator`, `uiStore.ts`, `gridSerializer.ts`, `lifecycleCoordinator.ts`, `ErrorBoundary.tsx`, `dataValidation.ts`, `routes.tsx`, `App.tsx`, `GridCell.tsx`, `useMainAppLogic.tsx`, `useTechTree.tsx`, `reportWebVitals.ts`, `monitoring.ts`, `ShareLinkDialog.tsx`, `platformStore.ts`, `bootstrap.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useAnalytics`, `useTechTreeRow.ts`, `gridStore.ts`, `useBreakpoint`, `useTechOptimization.ts`, `sessionCoordinator.ts`, `AppHeader.tsx`, `usePlatformStore`, `RecommendedBuild.stories.tsx`, `gridSerializer.ts`, `TechTreeRow.test.tsx`, `useTechStore`, `MainAppLayout.tsx`, `dataValidation.ts`, `GridCell.tsx`, `useMainAppLogic.tsx`, `useTechTree.tsx`, `GridTableButtons.test.tsx`, `bootstrap.ts`, `useOptimize.test.tsx`, `GridControlButtons.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `useBreakpoint()` connect `useBreakpoint` to `GridControlButtons.tsx`, `useAnalytics`, `useMainAppLogic.tsx`, `TechTreeRow.tsx`, `RecommendedBuild.stories.tsx`, `useTechTree.tsx`, `UpdatePrompt.tsx`, `LanguageSelector.tsx`, `useOptimize.test.tsx`, `GridTableButtons.test.tsx`, `MainAppLayout.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _438 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06543385490753911 - nodes in this community are weakly interconnected._
- **Should `ModuleSelectionDialog.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._