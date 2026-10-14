# Graph Report - nms_optimizer-web  (2026-10-14)

## Corpus Check
- 454 files · ~213,345 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1755 nodes · 4229 edges · 141 communities (121 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d44d6d3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- uiStore.ts
- tracking.ts
- ShipSelectionProvider.test.tsx
- MarkdownContentRenderer.tsx
- TechTreePresetsCard.tsx
- useMainAppLogic.tsx
- FakeCommandRunnerAdapter
- useOptimize.tsx
- preview.tsx
- useDialog
- bootPipeline.tsx
- sessionCoordinator.ts
- LifecycleCoordinator
- page-metadata.js
- UpdatePrompt.tsx
- __init__.py
- OptimizationAlertDialog.tsx
- AppHeader.tsx
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- usePlatformStore
- userStatsData.tsx
- generate-ssg.mjs
- MainAppLayout.tsx
- TechTreeRow.test.tsx
- src/constants.ts
- lifecycleCoordinator.ts
- platformStore.ts
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
- MobileToolbar.tsx
- ModuleSelectionDialog.tsx
- pwa-config.test.mjs
- vite.config.ts
- TechTreeContent.tsx
- useTechTreeRow.ts
- ErrorBoundary/ErrorContent.tsx
- useBreakpoint
- generate-radix-colors.mjs
- TechTree.tsx
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
- useTechStore
- useGridStore
- network.ts
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
- TechTree
- OfflineBanner.stories.tsx
- GridTableButtons.stories.tsx
- useTechTree.tsx
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
- ShipSelection.tsx
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
- RecommendedBuild.stories.tsx
- ShipSelectionProvider.tsx
- Logger
- techRules.ts
- applyValidationFeedback.ts
- reportWebVitals.ts
- useTechTreeContext.ts
- useAnalytics
- App.tsx
- useValidation.ts
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

## Communities (141 total, 20 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (44): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+36 more)

### Community 1 - "uiStore.ts"
Cohesion: 0.15
Nodes (18): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+10 more)

### Community 2 - "tracking.ts"
Cohesion: 0.17
Nodes (15): NotFound(), NotFound(), AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult() (+7 more)

### Community 3 - "ShipSelectionProvider.test.tsx"
Cohesion: 0.15
Nodes (14): ShipSelectionContent(), mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), ShipSelectionTrigger(), defaultContextValue, mockT (+6 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "TechTreePresetsCard.tsx"
Cohesion: 0.26
Nodes (9): PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions, RecommendedBuild, countBuildModules() (+1 more)

### Community 6 - "useMainAppLogic.tsx"
Cohesion: 0.16
Nodes (13): MainAppContent(), MainAppProvider(), MainAppLayoutContent(), ShipTypesLoader(), useMainAppLogic(), build, getBuildDate(), LanguageCode (+5 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "useOptimize.tsx"
Cohesion: 0.19
Nodes (10): useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+2 more)

### Community 9 - "preview.tsx"
Cohesion: 0.09
Nodes (18): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), hideSplashScreenAndShowBackground(), TooltipActions, TooltipActionsContext, TooltipState (+10 more)

### Community 10 - "useDialog"
Cohesion: 0.16
Nodes (14): AppDialog, PerformanceContent(), PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS (+6 more)

### Community 11 - "bootPipeline.tsx"
Cohesion: 0.19
Nodes (15): Root(), useThemeStore, getGaClientIdFromCookie(), initializeAnalyticsClient(), isBot(), registerDefaultDeferredServices(), handleFatalBootstrapError(), createAppRouter() (+7 more)

### Community 12 - "sessionCoordinator.ts"
Cohesion: 0.15
Nodes (15): createGrid(), createCellFromModuleData(), Grid, GridActions, GridComputed, GridState, computeBonusStatus(), mockGridStore (+7 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "page-metadata.js"
Cohesion: 0.18
Nodes (16): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle() (+8 more)

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
Cohesion: 0.10
Nodes (19): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+11 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "usePlatformStore"
Cohesion: 0.22
Nodes (12): TechTreeRoot(), TechTreeRootProps, serialize(), useGridDeserializer(), useFetchShipTypesSuspense(), createSerializedGrid(), mockNavigate, mockTechTreeData (+4 more)

### Community 23 - "userStatsData.tsx"
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (31): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+23 more)

### Community 25 - "MainAppLayout.tsx"
Cohesion: 0.17
Nodes (22): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppMobileToolbar() (+14 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.13
Nodes (12): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockOpenDialog, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+4 more)

### Community 27 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 28 - "lifecycleCoordinator.ts"
Cohesion: 0.15
Nodes (9): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener (+1 more)

### Community 29 - "platformStore.ts"
Cohesion: 0.24
Nodes (11): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, PlatformState, preloadInitialState(), getPlatformFromStorage() (+3 more)

### Community 30 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 31 - "dataValidation.ts"
Cohesion: 0.19
Nodes (14): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType(), getShipTypeName() (+6 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.11
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 35 - "dialogUtils.ts"
Cohesion: 0.12
Nodes (17): formatDocumentTitle(), DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps (+9 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.12
Nodes (20): GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap, mockToggleCellActive (+12 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "MobileToolbar.tsx"
Cohesion: 0.17
Nodes (8): LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, languages, nativeLanguageNames

### Community 42 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (23): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+15 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite.config.ts"
Cohesion: 0.14
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTreeContent.tsx"
Cohesion: 0.17
Nodes (9): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreeList(), TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader() (+1 more)

### Community 46 - "useTechTreeRow.ts"
Cohesion: 0.26
Nodes (9): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), SelectedTechData, TechTreeRowProps (+1 more)

### Community 47 - "ErrorBoundary/ErrorContent.tsx"
Cohesion: 0.16
Nodes (8): ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, ErrorDisplay(), ErrorDisplayProps

### Community 48 - "useBreakpoint"
Cohesion: 0.14
Nodes (16): ErrorContent(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef (+8 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "TechTree.tsx"
Cohesion: 0.19
Nodes (9): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeSkeleton() (+1 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "useOptimizeStore"
Cohesion: 0.30
Nodes (6): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, useOptimizeStore

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "environment.ts"
Cohesion: 0.07
Nodes (35): INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), Default, Story, USER_VISIT_KEY, NmsToast(), Default, Error (+27 more)

### Community 58 - "techStore.ts"
Cohesion: 0.15
Nodes (10): mockCellState, GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), debouncedStorage, debounceSetItem(), SetItemFunction (+2 more)

### Community 59 - "TechTreeRow.tsx"
Cohesion: 0.24
Nodes (12): TechTreeSectionList(), useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions(), TechTreeRowAvatar() (+4 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.24
Nodes (6): useRecommendedBuild(), createEmptyCell(), createGrid(), resetCellContent(), useUiStore, StoreResetWrapper()

### Community 62 - "useTechStore"
Cohesion: 0.42
Nodes (7): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechStore, useModuleSelectionDialogStore

### Community 63 - "useGridStore"
Cohesion: 0.15
Nodes (15): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+7 more)

### Community 64 - "network.ts"
Cohesion: 0.25
Nodes (7): MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, ApiCallOptions, fetchJson(), fetchWithTimeout(), HttpError

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

### Community 76 - "TechTree"
Cohesion: 0.25
Nodes (11): RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildProvider(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext() (+3 more)

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 79 - "useTechTree.tsx"
Cohesion: 0.22
Nodes (13): API_URL, compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, fixturePath, nmsFixture, cache (+5 more)

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

### Community 95 - "ShipSelection.tsx"
Cohesion: 0.27
Nodes (6): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionRoot(), ShipSelectionSkeleton()

### Community 99 - "Seo.tsx"
Cohesion: 0.29
Nodes (7): DEFAULT_BASE_URL, getLocalizedSchema(), OG_LOCALE_MAP, resolveAppVersion(), normalizePath(), Seo(), useSupportedLanguages()

### Community 121 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 130 - "ShipSelectionProvider.tsx"
Cohesion: 0.38
Nodes (5): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext()

### Community 131 - "Logger"
Cohesion: 0.15
Nodes (19): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), useLoadBuild(), UseLoadBuildReturn, useSaveBuild(), UseSaveBuildReturn (+11 more)

### Community 132 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 133 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 134 - "reportWebVitals.ts"
Cohesion: 0.53
Nodes (4): reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric()

### Community 135 - "useTechTreeContext.ts"
Cohesion: 0.50
Nodes (3): TechTreeProvider(), TechTreeContext, TechTreeContextValue

### Community 137 - "useAnalytics"
Cohesion: 0.29
Nodes (8): BuyMeACoffee(), UpdatePrompt, UpdatePromptWrapper(), useAnalytics(), useUpdateCheck(), VersionPayload, activateLatestServiceWorker(), evictStaleServiceWorkers()

### Community 143 - "App.tsx"
Cohesion: 0.09
Nodes (28): getPageByDialogTitleKey(), getPageById(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent (+20 more)

### Community 145 - "useValidation.ts"
Cohesion: 0.36
Nodes (6): AppContent(), PlatformStoreSelector, PlatformStoreState, UseDebouncedValidationOptions, useUrlNormalization(), useUrlValidation()

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

## Knowledge Gaps
- **442 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `ShipSelectionProvider.tsx`, `tracking.ts`, `MarkdownContentRenderer.tsx`, `reportWebVitals.ts`, `useOptimize.tsx`, `useAnalytics`, `bootPipeline.tsx`, `sessionCoordinator.ts`, `LifecycleCoordinator`, `App.tsx`, `usePlatformStore`, `src/constants.ts`, `lifecycleCoordinator.ts`, `platformStore.ts`, `ShareLinkDialog.tsx`, `dataValidation.ts`, `dialogUtils.ts`, `GridCell.tsx`, `TechTreeContent.tsx`, `useBreakpoint`, `environment.ts`, `techStore.ts`, `gridStore.ts`, `network.ts`, `useTechTree.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `Logger`, `useMainAppLogic.tsx`, `useOptimize.tsx`, `sessionCoordinator.ts`, `AppHeader.tsx`, `usePlatformStore`, `MainAppLayout.tsx`, `TechTreeRow.test.tsx`, `dataValidation.ts`, `MainAppContent.stories.tsx`, `GridCell.tsx`, `MobileToolbar.tsx`, `useTechTreeRow.ts`, `useBreakpoint`, `TechTree.tsx`, `environment.ts`, `techStore.ts`, `gridStore.ts`, `useTechStore`, `network.ts`, `GridTableButtons.stories.tsx`, `useTechTree.tsx`, `RecommendedBuild.stories.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `Logger`, `useMainAppLogic.tsx`, `preview.tsx`, `bootPipeline.tsx`, `App.tsx`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0642243328810493 - nodes in this community are weakly interconnected._
- **Should `uiStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._