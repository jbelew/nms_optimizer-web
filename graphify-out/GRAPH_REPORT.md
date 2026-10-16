# Graph Report - nms_optimizer-web  (2026-10-16)

## Corpus Check
- 455 files · ~214,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1757 nodes · 4232 edges · 138 communities (115 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ffac45f7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useMainAppLogic.tsx
- tracking.ts
- ShipSelection.tsx
- MarkdownContentRenderer.tsx
- generate-ssg.mjs
- OptimizationAlertDialog.tsx
- FakeCommandRunnerAdapter
- dialogUtils.ts
- AppFooter.tsx
- App.tsx
- uiStore.ts
- preview.tsx
- LifecycleCoordinator
- lifecycleCoordinator.ts
- ShipSelectionProvider.tsx
- __init__.py
- useOptimize.tsx
- platformStore.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- useTechTree.tsx
- network.ts
- techStore.ts
- props.ts
- TechTreeRow.test.tsx
- page-metadata.js
- ErrorBoundary.tsx
- environment.ts
- src/constants.ts
- errorHandler.ts
- AppHeader.tsx
- check-remote-sync.test.mjs
- .executeDeferredTask
- Logger
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- ModuleSelectionDialog.tsx
- pwa-config.test.mjs
- vite-plugin-purge-radix-css.mjs
- usePlatformStore
- UpdatePrompt.tsx
- generate-radix-colors.mjs
- ShareLinkDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- create_screenshot_video.py
- update-lighthouse-history.mjs
- useToast.ts
- RoutedDialogs.integration.test.tsx
- TechTreeRow.tsx
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
- Root.tsx
- OfflineBanner.stories.tsx
- GridTableButtons.test.tsx
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
- ConditionalTooltip.tsx
- check-commit-msg-early.mjs
- cloudflare-function.test.mjs
- PrerenderedMarkdownRenderer.tsx
- Seo.tsx
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
- techRules.ts
- applyValidationFeedback.ts
- useBreakpoint
- MainAppLayout.tsx
- UpdatePromptWrapper.tsx
- routes.tsx
- useTechOptimization.ts
- lazyNamed.ts
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

## Communities (138 total, 23 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "useMainAppLogic.tsx"
Cohesion: 0.20
Nodes (11): MainAppProvider(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), registerToolbarForceShow(), __resetScrollGridIntoViewRef(), sharedGridContainerRef (+3 more)

### Community 2 - "tracking.ts"
Cohesion: 0.13
Nodes (18): AppHeaderContext, AppHeaderContextValue, AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+10 more)

### Community 3 - "ShipSelection.tsx"
Cohesion: 0.12
Nodes (17): ShipSelectionProps, ShipSelectionContent(), mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), ShipSelectionRoot(), ShipSelectionSkeleton() (+9 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 6 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "dialogUtils.ts"
Cohesion: 0.13
Nodes (13): DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, DialogProvider() (+5 more)

### Community 9 - "AppFooter.tsx"
Cohesion: 0.15
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 10 - "App.tsx"
Cohesion: 0.21
Nodes (13): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, PlatformStoreSelector (+5 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.13
Nodes (20): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+12 more)

### Community 12 - "preview.tsx"
Cohesion: 0.15
Nodes (8): hideSplashScreenAndShowBackground(), BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview, SplashHider()

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.13
Nodes (5): bootApp(), BootOptions, BootResult, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "lifecycleCoordinator.ts"
Cohesion: 0.25
Nodes (6): NotFound(), NotFound(), runWhenIdle(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener

### Community 15 - "ShipSelectionProvider.tsx"
Cohesion: 0.29
Nodes (9): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), useGridDeserializer(), useFetchShipTypesSuspense(), mockNavigate (+1 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "useOptimize.tsx"
Cohesion: 0.17
Nodes (12): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+4 more)

### Community 18 - "platformStore.ts"
Cohesion: 0.23
Nodes (12): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, fetchTechTreeAsync(), preloadInitialState() (+4 more)

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
Cohesion: 0.09
Nodes (33): EmptyState(), EmptyStateProps, RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildProvider(), RecommendedBuildRoot(), RecommendedBuildContext (+25 more)

### Community 23 - "network.ts"
Cohesion: 0.08
Nodes (26): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, UserStatsContent(), UserStatsContentProps, COLORS (+18 more)

### Community 24 - "techStore.ts"
Cohesion: 0.11
Nodes (19): Desktop, Mobile, Story, StorybookWrapper(), Tablet, createGrid(), computeBonusStatus(), sessionCoordinator (+11 more)

### Community 25 - "props.ts"
Cohesion: 0.31
Nodes (7): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.13
Nodes (12): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockOpenDialog, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+4 more)

### Community 27 - "page-metadata.js"
Cohesion: 0.14
Nodes (21): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading() (+13 more)

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.20
Nodes (3): ErrorBoundary, Props, State

### Community 29 - "environment.ts"
Cohesion: 0.21
Nodes (16): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), USER_VISIT_KEY, UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isIosSafari() (+8 more)

### Community 30 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 31 - "errorHandler.ts"
Cohesion: 0.46
Nodes (3): handleError(), RouteError(), captureException()

### Community 32 - "AppHeader.tsx"
Cohesion: 0.09
Nodes (18): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+10 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 35 - "Logger"
Cohesion: 0.14
Nodes (24): App(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, MobileToolbar(), MobileToolbarProps (+16 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.12
Nodes (20): GridCell(), GridCellProps, ModuleContent(), mockCellState, getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap (+12 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 42 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-purge-radix-css.mjs"
Cohesion: 0.11
Nodes (11): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, isResponsiveRefUsed(), purgeRadixCss(), purgeUnusedRadixRules(), RESPONSIVE_PROP_CLASS_MAP (+3 more)

### Community 45 - "usePlatformStore"
Cohesion: 0.16
Nodes (12): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeProvider() (+4 more)

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

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "useToast.ts"
Cohesion: 0.12
Nodes (16): Default, Story, ShipSelection(), Default, Story, NmsToast(), Default, Error (+8 more)

### Community 58 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.20
Nodes (9): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer, RoutedDialogs() (+1 more)

### Community 59 - "TechTreeRow.tsx"
Cohesion: 0.19
Nodes (16): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeContextValue, useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon() (+8 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.17
Nodes (13): useRecommendedBuild(), createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), Grid, GridActions, GridComputed (+5 more)

### Community 62 - "dataValidation.ts"
Cohesion: 0.17
Nodes (16): BuildNameContent(), BuildNameContentProps, BuildNameContentRef, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType() (+8 more)

### Community 63 - "useGridStore"
Cohesion: 0.15
Nodes (15): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+7 more)

### Community 64 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

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

### Community 76 - "Root.tsx"
Cohesion: 0.20
Nodes (12): AppHeaderProvider(), TooltipManager(), TooltipProvider(), Root(), useA11yStore, useThemeStore, createAppRouter(), TooltipActions (+4 more)

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "GridTableButtons.test.tsx"
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

### Community 79 - "gridSerializer.ts"
Cohesion: 0.23
Nodes (10): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, createSerializedGrid() (+2 more)

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

### Community 95 - "ConditionalTooltip.tsx"
Cohesion: 0.48
Nodes (4): ConditionalTooltip, ConditionalTooltipProps, isTouchDevice(), useTooltipActions()

### Community 99 - "Seo.tsx"
Cohesion: 0.21
Nodes (8): UserStatsDialog(), normalizePath(), Seo(), useLanguage(), useSeoAndTitle(), getSupportedLanguages(), useSupportedLanguages(), UserStatsRoute()

### Community 121 - "TechTreeSection.tsx"
Cohesion: 0.27
Nodes (6): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow

### Community 132 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 133 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 134 - "useBreakpoint"
Cohesion: 0.13
Nodes (12): BuyMeACoffee(), ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace (+4 more)

### Community 136 - "MainAppLayout.tsx"
Cohesion: 0.15
Nodes (24): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+16 more)

### Community 137 - "UpdatePromptWrapper.tsx"
Cohesion: 0.38
Nodes (6): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, activateLatestServiceWorker(), evictStaleServiceWorkers()

### Community 139 - "routes.tsx"
Cohesion: 0.33
Nodes (5): languages, DIALOG_ROUTE_PATHS, languageRoutes, pageRoutes, routes

### Community 141 - "useTechOptimization.ts"
Cohesion: 0.36
Nodes (5): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), useShakeStore

### Community 143 - "AppDialog.tsx"
Cohesion: 0.10
Nodes (25): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+17 more)

### Community 144 - "monitoring.ts"
Cohesion: 0.16
Nodes (19): initializeAnalytics(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), initializeSentry(), LogEntry, LogLevel (+11 more)

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

## Knowledge Gaps
- **443 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+438 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `useMainAppLogic.tsx`, `tracking.ts`, `MarkdownContentRenderer.tsx`, `dialogUtils.ts`, `UpdatePromptWrapper.tsx`, `App.tsx`, `useTechOptimization.ts`, `LifecycleCoordinator`, `ShipSelectionProvider.tsx`, `monitoring.ts`, `useOptimize.tsx`, `platformStore.ts`, `lifecycleCoordinator.ts`, `useTechTree.tsx`, `network.ts`, `techStore.ts`, `environment.ts`, `src/constants.ts`, `errorHandler.ts`, `.executeDeferredTask`, `GridCell.tsx`, `ShareLinkDialog.tsx`, `gridStore.ts`, `dataValidation.ts`, `gridSerializer.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useMainAppLogic.tsx`, `MainAppLayout.tsx`, `useTechOptimization.ts`, `ShipSelectionProvider.tsx`, `useOptimize.tsx`, `useTechTree.tsx`, `techStore.ts`, `props.ts`, `TechTreeRow.test.tsx`, `environment.ts`, `AppHeader.tsx`, `Logger`, `GridCell.tsx`, `usePlatformStore`, `TechTreeRow.tsx`, `gridStore.ts`, `dataValidation.ts`, `RecommendedBuild.stories.tsx`, `Root.tsx`, `GridTableButtons.test.tsx`, `gridSerializer.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `.executeDeferredTask`, `App.tsx`, `routes.tsx`, `preview.tsx`, `lifecycleCoordinator.ts`, `monitoring.ts`, `ErrorBoundary.tsx`, `errorHandler.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12666666666666668 - nodes in this community are weakly interconnected._
- **Should `ShipSelection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1225071225071225 - nodes in this community are weakly interconnected._