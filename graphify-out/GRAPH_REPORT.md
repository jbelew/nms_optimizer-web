# Graph Report - nms_optimizer-web  (2026-09-20)

## Corpus Check
- 437 files · ~197,786 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1672 nodes · 4054 edges · 130 communities (108 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `419edfb7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- MainAppLayout.tsx
- AppFooter.tsx
- useToast.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeCommandRunnerAdapter
- AppHeader.tsx
- techStore.ts
- platformStore.ts
- TechTreeRow.test.tsx
- AppDialog.tsx
- LifecycleCoordinator
- useBreakpoint
- useAnalytics
- __init__.py
- App.tsx
- tracking.ts
- CliIssueTrackerAdapter
- issues.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- TechTreeSection.tsx
- network.ts
- page-metadata.js
- useTechTree.tsx
- lifecycleCoordinator.ts
- generate-ssg.mjs
- environment.ts
- TechTreeRow.tsx
- RoutedDialogs.integration.test.tsx
- dataValidation.ts
- GridTable.tsx
- useOptimizeStore
- dialogContext.tsx
- GridControlButtons.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- adapters.py
- IssueLifecycle
- src/constants.ts
- page-registry.js
- useTechTreeRow.ts
- vite-plugin-markdown-bundle.mjs
- RecommendedBuild.stories.tsx
- useOptimize.tsx
- Logger
- bootPipeline.tsx
- generate-radix-colors.mjs
- OptimizationAlertDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- gridSerializer.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- ShareLinkDialog.tsx
- gridTypes.ts
- useMainAppContext.ts
- CliAgentRunnerAdapter
- lazyNamed.ts
- dialogUtils.ts
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
- uiStore.ts
- GridTableButtons.tsx
- UpdatePrompt.tsx

## God Nodes (most connected - your core abstractions)
1. `Logger` - 89 edges
2. `useGridStore` - 81 edges
3. `useBreakpoint()` - 43 edges
4. `usePlatformStore` - 43 edges
5. `LifecycleCoordinator` - 40 edges
6. `useAnalytics()` - 39 edges
7. `useTechStore` - 33 edges
8. `useDialog()` - 32 edges
9. `IssueLifecycle` - 31 edges
10. `createGrid()` - 30 edges

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

## Communities (130 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (46): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+38 more)

### Community 1 - "MainAppLayout.tsx"
Cohesion: 0.15
Nodes (22): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+14 more)

### Community 2 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 3 - "useToast.ts"
Cohesion: 0.06
Nodes (32): ErrorMessageRenderer(), mockUseTranslation, Default, Story, ShipSelection(), ShipSelectionProps, Default, Story (+24 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (14): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+6 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (25): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+17 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.16
Nodes (16): createGrid(), createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), useGridStore, Grid, computeBonusStatus() (+8 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.21
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "AppHeader.tsx"
Cohesion: 0.05
Nodes (35): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+27 more)

### Community 9 - "techStore.ts"
Cohesion: 0.22
Nodes (11): useGridCellStyle(), EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), debouncedStorage, debounceSetItem() (+3 more)

### Community 10 - "platformStore.ts"
Cohesion: 0.25
Nodes (12): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, fetchTechTreeAsync(), preloadInitialState() (+4 more)

### Community 11 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.09
Nodes (26): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+18 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "useBreakpoint"
Cohesion: 0.15
Nodes (11): ErrorContent(), ErrorContentProps, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, ShipSelectionSkeleton(), TechTreeRoot(), useBreakpoint() (+3 more)

### Community 15 - "useAnalytics"
Cohesion: 0.13
Nodes (19): formatDocumentTitle(), WelcomeContent(), WelcomeContentProps, AppHeaderProvider(), BuyMeACoffee(), LanguageFlagPaths, LanguageSelector(), MobileToolbar() (+11 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.16
Nodes (17): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, BuildNameContent() (+9 more)

### Community 18 - "tracking.ts"
Cohesion: 0.10
Nodes (23): AppHeaderContext, AppHeaderContextValue, NotFound(), TRACKING_ID, NotFound(), routes, AnalyticsEventParams, GA4Event (+15 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.10
Nodes (10): CliIssueTrackerAdapter, IssueTrackerAdapter, Any, Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+2 more)

### Community 20 - "issues.py"
Cohesion: 0.19
Nodes (9): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+1 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "TechTreeSection.tsx"
Cohesion: 0.27
Nodes (6): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow

### Community 23 - "network.ts"
Cohesion: 0.14
Nodes (17): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+9 more)

### Community 24 - "page-metadata.js"
Cohesion: 0.15
Nodes (17): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+9 more)

### Community 25 - "useTechTree.tsx"
Cohesion: 0.13
Nodes (24): EmptyState(), EmptyStateProps, RecommendedBuildProvider(), SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent(), TechTreeContentProps (+16 more)

### Community 26 - "lifecycleCoordinator.ts"
Cohesion: 0.15
Nodes (9): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener (+1 more)

### Community 27 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

### Community 28 - "environment.ts"
Cohesion: 0.21
Nodes (14): InstallPrompt(), UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isTouchDevice(), safeClear(), safeGetItem() (+6 more)

### Community 29 - "TechTreeRow.tsx"
Cohesion: 0.19
Nodes (13): TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions() (+5 more)

### Community 30 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.15
Nodes (13): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS (+5 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.22
Nodes (11): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+3 more)

### Community 32 - "GridTable.tsx"
Cohesion: 0.23
Nodes (7): GridTable, GridTableProps, Default, Solving, Story, GridTableContent(), GridTableGrid()

### Community 33 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 34 - "dialogContext.tsx"
Cohesion: 0.16
Nodes (9): DEFAULT_BASE_URL, normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages() (+1 more)

### Community 35 - "GridControlButtons.tsx"
Cohesion: 0.26
Nodes (8): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridStore, useTechTreeLoadingStore

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.14
Nodes (15): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+7 more)

### Community 39 - "adapters.py"
Cohesion: 0.18
Nodes (10): Protocols and concrete adapters for external dependencies (CLI tools, agent,…, distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi() (+2 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.09
Nodes (17): main(), FakeIssueTrackerAdapter, In-memory fake IssueTrackerAdapter for testing., check_all_tasks(), extract_blockers(), extract_parent_issue(), IssueLifecycle, Find the first open issue with the 'ready-for-agent' label. (+9 more)

### Community 41 - "src/constants.ts"
Cohesion: 0.24
Nodes (9): WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions (+1 more)

### Community 42 - "page-registry.js"
Cohesion: 0.16
Nodes (16): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle() (+8 more)

### Community 43 - "useTechTreeRow.ts"
Cohesion: 0.19
Nodes (11): GridShake(), GridShakeProps, GridTableRoot(), TechTreeRowContext, TechTreeRowContextValue, useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps (+3 more)

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "RecommendedBuild.stories.tsx"
Cohesion: 0.15
Nodes (13): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+5 more)

### Community 46 - "useOptimize.tsx"
Cohesion: 0.18
Nodes (11): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+3 more)

### Community 47 - "Logger"
Cohesion: 0.13
Nodes (21): ShipSelectionProvider(), RouteContext, RouteContextType, useRouteContext(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), UseLoadBuildReturn (+13 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.38
Nodes (8): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), setupServiceWorkerRegistration(), mockRegisterSW, mockUpdateSW

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

### Community 54 - "gridSerializer.ts"
Cohesion: 0.30
Nodes (8): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer()

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 58 - "gridTypes.ts"
Cohesion: 0.21
Nodes (11): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, GridActions, GridComputed (+3 more)

### Community 59 - "useMainAppContext.ts"
Cohesion: 0.26
Nodes (11): MainAppProvider(), useMainAppBuildManagement(), useMainAppLogic(), AppLayout, useAppLayout(), useLoadBuild(), useSaveBuild(), registerToolbarForceShow() (+3 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 62 - "dialogUtils.ts"
Cohesion: 0.15
Nodes (13): App(), mockDialogContext, mockSendEvent, TransProps, build, LanguageCode, languages, PageName (+5 more)

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

### Community 131 - "uiStore.ts"
Cohesion: 0.16
Nodes (16): ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType, OptimizeState, OptimizeStatus (+8 more)

### Community 132 - "GridTableButtons.tsx"
Cohesion: 0.16
Nodes (13): GridContext, GridContextValue, GridProvider(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS (+5 more)

### Community 137 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

## Knowledge Gaps
- **409 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+404 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `MarkdownContentRenderer.tsx`, `GridTableButtons.tsx`, `gridStore.ts`, `techStore.ts`, `platformStore.ts`, `LifecycleCoordinator`, `useBreakpoint`, `useAnalytics`, `App.tsx`, `tracking.ts`, `network.ts`, `useTechTree.tsx`, `lifecycleCoordinator.ts`, `environment.ts`, `dataValidation.ts`, `src/constants.ts`, `useTechTreeRow.ts`, `useOptimize.tsx`, `bootPipeline.tsx`, `gridSerializer.ts`, `ShareLinkDialog.tsx`, `useMainAppContext.ts`, `dialogUtils.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `MainAppLayout.tsx`, `GridTableButtons.tsx`, `AppHeader.tsx`, `techStore.ts`, `TechTreeRow.test.tsx`, `useAnalytics`, `App.tsx`, `useTechTree.tsx`, `environment.ts`, `GridTable.tsx`, `GridControlButtons.tsx`, `GridCell.tsx`, `useTechTreeRow.ts`, `RecommendedBuild.stories.tsx`, `useOptimize.tsx`, `Logger`, `gridSerializer.ts`, `useMainAppContext.ts`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `AppHeader.tsx`, `bootPipeline.tsx`, `App.tsx`, `tracking.ts`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _409 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06180733162830349 - nodes in this community are weakly interconnected._
- **Should `useToast.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06285714285714286 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06543385490753911 - nodes in this community are weakly interconnected._