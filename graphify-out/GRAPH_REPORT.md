# Graph Report - nms_optimizer-web  (2026-10-16)

## Corpus Check
- 449 files · ~215,059 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1742 nodes · 4188 edges · 142 communities (119 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db910a04`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- uiStore.ts
- tracking.ts
- lifecycleCoordinator.ts
- MarkdownContentRenderer.tsx
- generate-sitemap.mjs
- OptimizationAlertDialog.tsx
- FakeCommandRunnerAdapter
- useShipTypes.tsx
- AppFooter.tsx
- RoutedDialogs.integration.test.tsx
- ShipSelection.tsx
- AppHeader.tsx
- LifecycleCoordinator
- App.tsx
- ShipSelectionProvider.tsx
- __init__.py
- src/constants.ts
- useMainAppLogic.tsx
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- useTechTree.tsx
- network.ts
- dataValidation.ts
- props.ts
- TechTreeRow.test.tsx
- page-metadata.js
- useAnalytics
- gridSerializer.ts
- reportWebVitals.ts
- dialogUtils.ts
- environment.ts
- check-remote-sync.test.mjs
- setupServiceWorker.ts
- LanguageSelector.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- GridShake.tsx
- ModuleSelectionDialog.tsx
- pwa-config.test.mjs
- vite-plugin-purge-radix-css.mjs
- usePlatformStore
- useOptimize.test.tsx
- spa-routes.test.mjs
- Logger
- generate-radix-colors.mjs
- ShareLinkDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- useScrollGridIntoView.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- MessageSpinner.tsx
- AppHeader.stories.tsx
- SharedModuleSelectionDialog.tsx
- CliAgentRunnerAdapter
- gridStore.ts
- MobileToolbar.tsx
- GridTableButtons.stories.tsx
- useOptimizeStore
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
- sessionCoordinator.ts
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
- RoutedDialogs.tsx
- MainAppContent.stories.tsx
- techRules.ts
- techStore.ts
- splashScreen.ts
- youTubeEmbed.tsx
- MainAppLayout.tsx
- useGridStore
- AppDialog.tsx
- monitoring.ts
- PWA Runtime Caching and Update Resilience
- generate-ssg.mjs

## God Nodes (most connected - your core abstractions)
1. `Logger` - 93 edges
2. `useGridStore` - 81 edges
3. `usePlatformStore` - 47 edges
4. `useBreakpoint()` - 43 edges
5. `LifecycleCoordinator` - 40 edges
6. `useAnalytics()` - 39 edges
7. `useTechStore` - 37 edges
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

## Communities (142 total, 23 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "uiStore.ts"
Cohesion: 0.12
Nodes (17): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, A11yState, ErrorMessage (+9 more)

### Community 2 - "tracking.ts"
Cohesion: 0.16
Nodes (17): NotFound(), useSeoAndTitle(), NotFound(), detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult(), getClientId() (+9 more)

### Community 3 - "lifecycleCoordinator.ts"
Cohesion: 0.11
Nodes (13): ErrorBoundary, Props, State, handleError(), RouteError(), DIALOG_ROUTE_PATHS, languageRoutes, pageRoutes (+5 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.09
Nodes (5): H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 6 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "useShipTypes.tsx"
Cohesion: 0.24
Nodes (12): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, fetchTechTreeAsync(), preloadInitialState() (+4 more)

### Community 9 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 10 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.13
Nodes (14): PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, PerformanceRoute(), UserStatsRoute(), DialogIconAndStyle (+6 more)

### Community 11 - "ShipSelection.tsx"
Cohesion: 0.13
Nodes (17): ShipSelection(), ShipSelectionProps, ShipSelectionContent(), mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), ShipSelectionRoot() (+9 more)

### Community 12 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "App.tsx"
Cohesion: 0.15
Nodes (16): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, PresetsCardContent() (+8 more)

### Community 15 - "ShipSelectionProvider.tsx"
Cohesion: 0.30
Nodes (8): ShipSelectionProvider(), ShipSelectionProviderProps, RouteContext, RouteContextType, useRouteContext(), useFetchShipTypesSuspense(), mockNavigate, useUrlSync()

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 18 - "useMainAppLogic.tsx"
Cohesion: 0.17
Nodes (14): MainAppProvider(), useMainAppLogic(), ERROR_THRESHOLDS, useErrorDispatcher(), useScrollHide(), UseScrollHideReturn, build, getBuildDate() (+6 more)

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
Cohesion: 0.11
Nodes (30): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent(), TechTreeContentProps, TechTreeList() (+22 more)

### Community 23 - "network.ts"
Cohesion: 0.14
Nodes (17): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+9 more)

### Community 24 - "dataValidation.ts"
Cohesion: 0.19
Nodes (14): BuildNameContent(), BuildNameContentProps, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType(), getShipTypeName() (+6 more)

### Community 25 - "props.ts"
Cohesion: 0.36
Nodes (6): ModuleSelectionContext, ModuleSelectionContextValue, SelectedTechData, ModuleSelectionDialogProps, TechTreeRowProps, TechColor

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.13
Nodes (12): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockOpenDialog, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore (+4 more)

### Community 27 - "page-metadata.js"
Cohesion: 0.32
Nodes (13): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+5 more)

### Community 28 - "useAnalytics"
Cohesion: 0.20
Nodes (15): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useAnalytics(), useLatest(), useLoadBuild() (+7 more)

### Community 29 - "gridSerializer.ts"
Cohesion: 0.23
Nodes (11): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+3 more)

### Community 30 - "reportWebVitals.ts"
Cohesion: 0.22
Nodes (10): AppHeaderContext, AppHeaderContextValue, AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+2 more)

### Community 31 - "dialogUtils.ts"
Cohesion: 0.22
Nodes (9): DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, DialogContext (+1 more)

### Community 32 - "environment.ts"
Cohesion: 0.08
Nodes (34): ErrorMessageRenderer(), mockUseTranslation, INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), Default, Story, USER_VISIT_KEY, NmsToast() (+26 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "setupServiceWorker.ts"
Cohesion: 0.20
Nodes (13): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck(), VersionPayload, isBot(), activateLatestServiceWorker(), evictStaleServiceWorkers(), isAppHiddenOrIdle() (+5 more)

### Community 35 - "LanguageSelector.tsx"
Cohesion: 0.31
Nodes (4): LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.06
Nodes (33): ConditionalTooltip, ConditionalTooltipProps, GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), TranslateFn (+25 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "GridShake.tsx"
Cohesion: 0.50
Nodes (3): GridShake(), GridShakeProps, GridTableRoot()

### Community 42 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (20): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel(), formatParentheses(), ModuleCheckbox (+12 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-purge-radix-css.mjs"
Cohesion: 0.11
Nodes (11): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, isResponsiveRefUsed(), purgeRadixCss(), purgeUnusedRadixRules(), RESPONSIVE_PROP_CLASS_MAP (+3 more)

### Community 45 - "usePlatformStore"
Cohesion: 0.18
Nodes (9): Default, Story, Desktop, Mobile, Story, Tablet, TechTreeRoot(), TechTreeRootProps (+1 more)

### Community 46 - "useOptimize.test.tsx"
Cohesion: 0.25
Nodes (7): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState

### Community 47 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 48 - "Logger"
Cohesion: 0.29
Nodes (8): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), UseLoadBuildReturn, UseSaveBuildReturn, debounceSetItem(), Logger

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

### Community 54 - "useScrollGridIntoView.ts"
Cohesion: 0.23
Nodes (7): {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, mockShowInfo, registerToolbarForceShow(), __resetScrollGridIntoViewRef(), sharedGridContainerRef

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "MessageSpinner.tsx"
Cohesion: 0.31
Nodes (4): FLAVOR_MESSAGE_DELAY_MS, MessageSpinner(), MessageSpinnerProps, TechTreeSkeleton()

### Community 58 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 59 - "SharedModuleSelectionDialog.tsx"
Cohesion: 0.21
Nodes (11): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), TechTreeRowProvider() (+3 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "gridStore.ts"
Cohesion: 0.16
Nodes (14): useCell(), createCellFromModuleData(), createEmptyCell(), createGrid(), Cell, Grid, GridActions, GridComputed (+6 more)

### Community 62 - "MobileToolbar.tsx"
Cohesion: 0.36
Nodes (5): MobileToolbar(), MobileToolbarProps, Default, Story, useA11yStore

### Community 63 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 64 - "useOptimizeStore"
Cohesion: 0.11
Nodes (15): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorContent(), ErrorContentProps, PageVariant (+7 more)

### Community 65 - "AGENTS.md"
Cohesion: 0.20
Nodes (5): Language, NMS Optimizer Web Domain Model, Component Architecture, Prop Drilling Prevention, Triage Labels

### Community 66 - "Issue tracker: GitHub"
Cohesion: 0.33
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 68 - "Agent Guidelines"
Cohesion: 0.33
Nodes (6): Agent Guidelines, Core Directives, Key Commands & Gotchas, Reference Guides (Progressive Disclosure), Verification Gate (Definition of Done), Workflow References

### Community 69 - "Architecture Guidelines"
Cohesion: 0.33
Nodes (5): Architecture Guidelines, Bundle Strategy, Directory Structure, Hybrid Rendering Flow, Tech Stack

### Community 70 - "Code Style Guidelines"
Cohesion: 0.29
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
Cohesion: 0.18
Nodes (9): BuyMeACoffee(), ShipSelectionSkeleton(), Default, Story, UpdatePrompt(), UpdatePromptProps, AppLayout, useAppLayout() (+1 more)

### Community 79 - "sessionCoordinator.ts"
Cohesion: 0.14
Nodes (13): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore (+5 more)

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
Cohesion: 0.18
Nodes (13): TechTreeSectionList(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions() (+5 more)

### Community 99 - "dialogContext.tsx"
Cohesion: 0.17
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 121 - "RoutedDialogs.tsx"
Cohesion: 0.40
Nodes (4): LoremIpsumSkeleton(), MARKDOWN_DIALOGS, MarkdownContentRenderer, RoutedDialogs()

### Community 130 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 131 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

### Community 132 - "techStore.ts"
Cohesion: 0.20
Nodes (14): mockCellState, useTechOptimization(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), computeDefaultCheckedModules(), computeIsDefaultModuleSelection(), debouncedStorage (+6 more)

### Community 136 - "MainAppLayout.tsx"
Cohesion: 0.17
Nodes (22): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+14 more)

### Community 139 - "useGridStore"
Cohesion: 0.14
Nodes (16): AppHeaderProvider(), GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable (+8 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.12
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialog, AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter() (+12 more)

### Community 144 - "monitoring.ts"
Cohesion: 0.21
Nodes (12): Root(), useThemeStore, handleFatalBootstrapError(), createAppRouter(), initializeSentry(), LogEntry, LogLevel, logs (+4 more)

### Community 146 - "PWA Runtime Caching and Update Resilience"
Cohesion: 0.33
Nodes (5): Consequences, Considered Options, Context, Decision, PWA Runtime Caching and Update Resilience

### Community 147 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

## Knowledge Gaps
- **439 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+434 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `lifecycleCoordinator.ts`, `techStore.ts`, `useShipTypes.tsx`, `LifecycleCoordinator`, `App.tsx`, `ShipSelectionProvider.tsx`, `monitoring.ts`, `src/constants.ts`, `useTechTree.tsx`, `network.ts`, `dataValidation.ts`, `useAnalytics`, `gridSerializer.ts`, `reportWebVitals.ts`, `dialogUtils.ts`, `environment.ts`, `setupServiceWorker.ts`, `GridCell.tsx`, `usePlatformStore`, `ShareLinkDialog.tsx`, `useScrollGridIntoView.ts`, `gridStore.ts`, `useMarkdownContent.ts`, `sessionCoordinator.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `MainAppContent.stories.tsx`, `techStore.ts`, `MainAppLayout.tsx`, `ShipSelectionProvider.tsx`, `useMainAppLogic.tsx`, `useTechTree.tsx`, `dataValidation.ts`, `TechTreeRow.test.tsx`, `useAnalytics`, `gridSerializer.ts`, `environment.ts`, `GridCell.tsx`, `useOptimize.test.tsx`, `Logger`, `useScrollGridIntoView.ts`, `AppHeader.stories.tsx`, `SharedModuleSelectionDialog.tsx`, `gridStore.ts`, `MobileToolbar.tsx`, `GridTableButtons.stories.tsx`, `sessionCoordinator.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useDialog()` connect `App.tsx` to `dialogContext.tsx`, `MainAppLayout.tsx`, `AppFooter.tsx`, `ModuleSelectionDialog.tsx`, `useGridStore`, `RoutedDialogs.integration.test.tsx`, `useMainAppLogic.tsx`, `useTechTree.tsx`, `RoutedDialogs.tsx`, `useAnalytics`, `MobileToolbar.tsx`, `dialogUtils.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _439 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `uiStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `lifecycleCoordinator.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11330049261083744 - nodes in this community are weakly interconnected._