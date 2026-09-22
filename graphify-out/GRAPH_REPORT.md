# Graph Report - nms_optimizer-web  (2026-09-22)

## Corpus Check
- 439 files · ~200,714 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1687 nodes · 4093 edges · 132 communities (109 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d20195e9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- GridTable.tsx
- AppFooter.tsx
- page-metadata.js
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeCommandRunnerAdapter
- useMainAppLogic.tsx
- WelcomeContent.tsx
- uiStore.ts
- AppDialog.tsx
- LifecycleCoordinator
- techStore.ts
- AppHeader.tsx
- __init__.py
- App.tsx
- tracking.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- lifecycleCoordinator.ts
- userStatsData.tsx
- generate-sitemap.mjs
- ErrorBoundary/ErrorContent.tsx
- monitoring.ts
- useTechTree.tsx
- Logger
- useTechStore
- MainAppLayout.tsx
- dataValidation.ts
- useOptimizeStore
- Cell
- getPageMetadata
- useToast.ts
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- optimizationManager.ts
- TechTreeRow.test.tsx
- iconRegistry.ts
- vite-plugin-markdown-bundle.mjs
- TechTree.tsx
- TechTreeRow.tsx
- TechTree
- bootPipeline.tsx
- generate-radix-colors.mjs
- ShareLinkDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- MainAppGridSection.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- TechTreeSection.tsx
- TechTreeContent.tsx
- RecommendedBuild.stories.tsx
- CliAgentRunnerAdapter
- GridShake.tsx
- useAnalytics
- MainAppContent.stories.tsx
- dialogContext.tsx
- AGENTS.md
- Issue tracker: GitHub
- Agent Guidelines
- Architecture Guidelines
- Code Style Guidelines
- Domain Docs
- [[path]].js
- performance-check.mjs
- run-bench.mjs
- verify-routes-consistency.mjs
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
- UpdatePrompt.tsx
- useGridStore
- MobileToolbar.tsx
- useBreakpoint
- usePlatformStore
- RoutedDialogs.integration.test.tsx
- gridSerializer.ts

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

## Communities (132 total, 23 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "GridTable.tsx"
Cohesion: 0.13
Nodes (13): GridContext, GridContextValue, GridProvider(), GridTable, GridTableProps, Default, Solving, Story (+5 more)

### Community 2 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 3 - "page-metadata.js"
Cohesion: 0.11
Nodes (28): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+20 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.21
Nodes (9): createGrid(), createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), debouncedStorage, Grid, useUiStore (+1 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 9 - "useMainAppLogic.tsx"
Cohesion: 0.20
Nodes (13): MainAppProvider(), useMainAppLogic(), AppLayout, useAppLayout(), useLatest(), SCROLL_OPTIONS, useOptimize(), UseOptimizeReturn (+5 more)

### Community 10 - "WelcomeContent.tsx"
Cohesion: 0.18
Nodes (11): formatDocumentTitle(), mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, UpdatePrompt, UpdatePromptWrapper() (+3 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.15
Nodes (18): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+10 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.13
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+12 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "techStore.ts"
Cohesion: 0.13
Nodes (15): mockCellState, mockNavigate, mockTechTreeData, computeBonusStatus(), sessionCoordinator, mockGridStore, mockPlatformStoreState, mockTechStore (+7 more)

### Community 15 - "AppHeader.tsx"
Cohesion: 0.05
Nodes (32): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+24 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.18
Nodes (15): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, RecommendedBuildProvider() (+7 more)

### Community 18 - "tracking.ts"
Cohesion: 0.11
Nodes (21): AppHeaderContext, AppHeaderContextValue, NotFound(), NotFound(), AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals() (+13 more)

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "lifecycleCoordinator.ts"
Cohesion: 0.09
Nodes (17): ErrorBoundary, Props, State, handleError(), RouteError(), MainAppContent(), MainAppLayoutContent(), ShipTypesLoader() (+9 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.24
Nodes (11): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+3 more)

### Community 25 - "ErrorBoundary/ErrorContent.tsx"
Cohesion: 0.16
Nodes (9): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, ErrorDisplay() (+1 more)

### Community 26 - "monitoring.ts"
Cohesion: 0.16
Nodes (13): TRACKING_ID, WS_URL, Root(), useThemeStore, SOCKET_OPTIONS, createAppRouter(), LogEntry, LogLevel (+5 more)

### Community 27 - "useTechTree.tsx"
Cohesion: 0.15
Nodes (19): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, MockGridStoreState, MockTechStoreState (+11 more)

### Community 28 - "Logger"
Cohesion: 0.25
Nodes (14): InstallPrompt(), UI_TIMING, debounceSetItem(), SetItemFunction, isTouchDevice(), safeClear(), safeGetItem(), safeRemoveItem() (+6 more)

### Community 29 - "useTechStore"
Cohesion: 0.24
Nodes (12): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps (+4 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.17
Nodes (11): BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppHeader(), OptimizationAlertDialog, SharedModuleSelectionDialog, ToastRenderer (+3 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (15): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType(), getShipTypeName() (+7 more)

### Community 32 - "useOptimizeStore"
Cohesion: 0.27
Nodes (7): App(), ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, useOptimizeStore

### Community 33 - "Cell"
Cohesion: 0.21
Nodes (12): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, Cell, GridActions (+4 more)

### Community 34 - "getPageMetadata"
Cohesion: 0.18
Nodes (10): getPageMetadata(), getLocalizedSchema(), OG_LOCALE_MAP, resolveAppVersion(), normalizePath(), Seo(), useLanguage(), useSeoAndTitle() (+2 more)

### Community 35 - "useToast.ts"
Cohesion: 0.08
Nodes (25): Default, Story, ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionRoot() (+17 more)

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
Cohesion: 0.06
Nodes (25): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Any, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., List open issues with number, title, body, and labels. (+17 more)

### Community 41 - "optimizationManager.ts"
Cohesion: 0.30
Nodes (7): ApiResponse, createSocket(), TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions, mockCreateSocket

### Community 42 - "TechTreeRow.test.tsx"
Cohesion: 0.12
Nodes (14): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+6 more)

### Community 43 - "iconRegistry.ts"
Cohesion: 0.22
Nodes (8): DynamicRadixIcon(), DynamicRadixIconProps, DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "TechTree.tsx"
Cohesion: 0.14
Nodes (12): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeProvider() (+4 more)

### Community 46 - "TechTreeRow.tsx"
Cohesion: 0.20
Nodes (13): TechTreeContextValue, useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions() (+5 more)

### Community 47 - "TechTree"
Cohesion: 0.15
Nodes (20): RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext(), PresetCardItem() (+12 more)

### Community 48 - "bootPipeline.tsx"
Cohesion: 0.35
Nodes (9): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), setupServiceWorkerRegistration(), mockRegisterSW (+1 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "ShareLinkDialog.tsx"
Cohesion: 0.12
Nodes (11): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story, ShareLinkContent(), ShareLinkContentProps (+3 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "MainAppGridSection.tsx"
Cohesion: 0.44
Nodes (9): MainAppGridSection(), MainAppFooter(), MainAppMobileToolbar(), MainAppSidebarContent(), MainAppSidebarSection(), ShipSelectionHeading(), useMainAppGlobal(), useMainAppLayout() (+1 more)

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "TechTreeSection.tsx"
Cohesion: 0.27
Nodes (6): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow

### Community 58 - "TechTreeContent.tsx"
Cohesion: 0.31
Nodes (5): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreeList()

### Community 59 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 62 - "useAnalytics"
Cohesion: 0.17
Nodes (18): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useMainAppBuildManagement(), useAnalytics(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
} (+10 more)

### Community 63 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 64 - "dialogContext.tsx"
Cohesion: 0.14
Nodes (10): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, getPageByPath(), ROUTED_DIALOG_IDS, DialogProvider() (+2 more)

### Community 65 - "AGENTS.md"
Cohesion: 0.29
Nodes (3): Language, NMS Optimizer Web Domain Model, Triage Labels

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

### Community 130 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 133 - "useGridStore"
Cohesion: 0.22
Nodes (11): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTableContent(), useCell() (+3 more)

### Community 136 - "MobileToolbar.tsx"
Cohesion: 0.18
Nodes (10): AppHeaderProvider(), LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, languages (+2 more)

### Community 137 - "useBreakpoint"
Cohesion: 0.17
Nodes (12): BuyMeACoffee(), {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, mockShowInfo, ShipSelectionSkeleton(), useBreakpoint(), useRecommendedBuild() (+4 more)

### Community 140 - "usePlatformStore"
Cohesion: 0.14
Nodes (20): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), mockCreateSocket, mockUseAnalytics, mockUseBreakpoint (+12 more)

### Community 143 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.15
Nodes (12): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS (+4 more)

### Community 144 - "gridSerializer.ts"
Cohesion: 0.29
Nodes (9): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+1 more)

## Knowledge Gaps
- **415 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `MarkdownContentRenderer.tsx`, `gridStore.ts`, `useMainAppLogic.tsx`, `useBreakpoint`, `WelcomeContent.tsx`, `usePlatformStore`, `LifecycleCoordinator`, `techStore.ts`, `gridSerializer.ts`, `App.tsx`, `tracking.ts`, `lifecycleCoordinator.ts`, `monitoring.ts`, `useTechTree.tsx`, `useTechStore`, `dataValidation.ts`, `useOptimizeStore`, `optimizationManager.ts`, `iconRegistry.ts`, `bootPipeline.tsx`, `ShareLinkDialog.tsx`, `TechTreeContent.tsx`, `useAnalytics`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `GridTable.tsx`, `gridStore.ts`, `MobileToolbar.tsx`, `useMainAppLogic.tsx`, `useBreakpoint`, `usePlatformStore`, `techStore.ts`, `AppHeader.tsx`, `gridSerializer.ts`, `useTechTree.tsx`, `Logger`, `useTechStore`, `MainAppLayout.tsx`, `dataValidation.ts`, `GridCell.tsx`, `TechTreeRow.test.tsx`, `TechTree.tsx`, `MainAppGridSection.tsx`, `RecommendedBuild.stories.tsx`, `useAnalytics`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useDialog()` connect `App.tsx` to `dialogContext.tsx`, `AppFooter.tsx`, `ModuleSelectionDialog.tsx`, `MobileToolbar.tsx`, `useMainAppLogic.tsx`, `WelcomeContent.tsx`, `RoutedDialogs.integration.test.tsx`, `MainAppGridSection.tsx`, `useAnalytics`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06321334503950835 - nodes in this community are weakly interconnected._
- **Should `GridTable.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Should `page-metadata.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._