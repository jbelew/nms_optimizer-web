# Graph Report - nms_optimizer-web  (2026-10-09)

## Corpus Check
- 451 files · ~208,641 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1742 nodes · 4210 edges · 138 communities (116 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9defa73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- App.tsx
- tracking.ts
- TechTreePresetsCard.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.stories.tsx
- useBreakpoint
- FakeCommandRunnerAdapter
- techStore.ts
- useAnalytics
- page-metadata.js
- dialogUtils.ts
- RecommendedBuild.stories.tsx
- LifecycleCoordinator
- uiStore.ts
- useTechTree.tsx
- __init__.py
- gridTypes.ts
- bootPipeline.tsx
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- UpdatePrompt.tsx
- userStatsData.tsx
- generate-ssg.mjs
- useToast.ts
- TechTreeRow.test.tsx
- optimizationManager.ts
- lifecycleCoordinator.ts
- SharedModuleSelectionDialog.tsx
- MainAppLayout.tsx
- dataValidation.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- gridSerializer.ts
- RoutedDialogs.integration.test.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- AppHeader.tsx
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- TechTree
- reportWebVitals.ts
- ErrorBoundary/ErrorContent.tsx
- TechTreeSection.tsx
- generate-radix-colors.mjs
- LanguageSelector.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- preview.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- ModuleSelectionDialog.tsx
- useOptimizeStore
- environment.ts
- CliAgentRunnerAdapter
- GridTable.tsx
- useTechTreeRow.ts
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
- GridTableButtons.stories.tsx
- OfflineBanner.stories.tsx
- props.ts
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
- useOptimize.test.tsx
- check-commit-msg-early.mjs
- cloudflare-function.test.mjs
- PrerenderedMarkdownRenderer.tsx
- AppHeader.stories.tsx
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
- useMarkdownContent.ts
- Logger
- dialogContext.tsx
- MainAppContent.stories.tsx
- gridStore.ts
- splashScreen.ts
- youTubeEmbed.tsx
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

## Communities (138 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "App.tsx"
Cohesion: 0.15
Nodes (15): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, PlatformStoreSelector (+7 more)

### Community 2 - "tracking.ts"
Cohesion: 0.16
Nodes (18): NotFound(), CLOUDFLARE_BEACON_CONFIG, CLOUDFLARE_BEACON_SRC, TRACKING_ID, NotFound(), detectAdBlocker(), dispatchEvent(), env (+10 more)

### Community 3 - "TechTreePresetsCard.tsx"
Cohesion: 0.26
Nodes (9): PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions, RecommendedBuild, countBuildModules() (+1 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.08
Nodes (6): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.stories.tsx"
Cohesion: 0.14
Nodes (10): ModuleSelectionDialog, Corvette, Default, meta, Story, defaultProps, MockAppDialogProps, mockGroupedModules (+2 more)

### Community 6 - "useBreakpoint"
Cohesion: 0.11
Nodes (18): ErrorContent(), {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, MessageSpinner(), MessageSpinnerProps, ShipSelectionSkeleton(), TechTreeSkeleton() (+10 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "techStore.ts"
Cohesion: 0.12
Nodes (18): mockModules, createGrid(), MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, computeBonusStatus(), sessionCoordinator, mockGridStore (+10 more)

### Community 9 - "useAnalytics"
Cohesion: 0.15
Nodes (18): AppHeaderProvider(), BuyMeACoffee(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, MobileToolbar() (+10 more)

### Community 10 - "page-metadata.js"
Cohesion: 0.17
Nodes (19): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath(), getRoutedDialogs() (+11 more)

### Community 11 - "dialogUtils.ts"
Cohesion: 0.16
Nodes (13): formatDocumentTitle(), DynamicRadixIcon(), mockDialogContext, mockSendEvent, TransProps, WelcomeContent(), WelcomeContentProps, UpdatePrompt (+5 more)

### Community 12 - "RecommendedBuild.stories.tsx"
Cohesion: 0.13
Nodes (16): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+8 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "uiStore.ts"
Cohesion: 0.10
Nodes (28): ErrorMessageRenderer(), mockUseTranslation, MainAppContent(), MainAppProvider(), ShipTypesLoader(), mockShowInfo, useMainAppLogic(), ERROR_THRESHOLDS (+20 more)

### Community 15 - "useTechTree.tsx"
Cohesion: 0.24
Nodes (12): API_URL, fetchShipTypes(), cache, clearTechTreeCache(), fetchTechTree(), fetchTechTreeAsync(), preloadInitialState(), apiCall() (+4 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "gridTypes.ts"
Cohesion: 0.17
Nodes (13): applyValidationFeedback(), feedbackMap, ValidationReason, createCellFromModuleData(), validateToggleActive(), validateToggleSupercharged(), ValidationResult, GridActions (+5 more)

### Community 18 - "bootPipeline.tsx"
Cohesion: 0.25
Nodes (11): Root(), useA11yStore, useThemeStore, initializeAnalyticsClient(), registerDefaultDeferredServices(), handleFatalBootstrapError(), createAppRouter(), initializeSentry() (+3 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "UpdatePrompt.tsx"
Cohesion: 0.38
Nodes (4): Default, Story, UpdatePrompt(), UpdatePromptProps

### Community 23 - "userStatsData.tsx"
Cohesion: 0.08
Nodes (23): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story, ShareLinkContent(), ShareLinkContentProps (+15 more)

### Community 24 - "generate-ssg.mjs"
Cohesion: 0.10
Nodes (30): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+22 more)

### Community 25 - "useToast.ts"
Cohesion: 0.07
Nodes (26): Default, Story, ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionRoot() (+18 more)

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 27 - "optimizationManager.ts"
Cohesion: 0.24
Nodes (10): WS_URL, ApiResponse, Grid, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 28 - "lifecycleCoordinator.ts"
Cohesion: 0.11
Nodes (14): ErrorBoundary, Props, State, handleError(), RouteError(), languages, DIALOG_ROUTE_PATHS, languageRoutes (+6 more)

### Community 29 - "SharedModuleSelectionDialog.tsx"
Cohesion: 0.27
Nodes (9): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, TechTreeProvider(), TechTreeContext, TechTreeContextValue, useTechTree(), useTechModuleManagement() (+1 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.17
Nodes (22): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppLayoutContent() (+14 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (14): BuildNameContent(), BuildNameContentProps, BuildNameContentRef, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName() (+6 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.16
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "gridSerializer.ts"
Cohesion: 0.21
Nodes (11): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, createSerializedGrid() (+3 more)

### Community 35 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.10
Nodes (20): AppDialog, DynamicRadixIconProps, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS (+12 more)

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

### Community 41 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.23
Nodes (12): ConditionalTooltip, ConditionalTooltipProps, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions(), TechTreeRowAvatar(), TechTreeRowBadges() (+4 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree"
Cohesion: 0.14
Nodes (14): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree() (+6 more)

### Community 46 - "reportWebVitals.ts"
Cohesion: 0.22
Nodes (10): AppHeaderContext, AppHeaderContextValue, AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+2 more)

### Community 47 - "ErrorBoundary/ErrorContent.tsx"
Cohesion: 0.16
Nodes (8): ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, ErrorDisplay(), ErrorDisplayProps

### Community 48 - "TechTreeSection.tsx"
Cohesion: 0.27
Nodes (6): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "LanguageSelector.tsx"
Cohesion: 0.31
Nodes (4): LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "preview.tsx"
Cohesion: 0.13
Nodes (13): TooltipManager(), TooltipProvider(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext, useTooltipState(), BackgroundWrapper() (+5 more)

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "ModuleSelectionDialog.tsx"
Cohesion: 0.23
Nodes (10): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel(), formatParentheses(), ModuleCheckbox (+2 more)

### Community 58 - "useOptimizeStore"
Cohesion: 0.30
Nodes (6): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, useOptimizeStore

### Community 59 - "environment.ts"
Cohesion: 0.16
Nodes (18): BeforeInstallPromptEvent, INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), USER_VISIT_KEY, UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction (+10 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "GridTable.tsx"
Cohesion: 0.14
Nodes (12): GridShake(), GridShakeProps, GridTable, GridTableProps, Default, Solving, Story, GridTableContent() (+4 more)

### Community 62 - "useTechTreeRow.ts"
Cohesion: 0.30
Nodes (7): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

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

### Community 76 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "props.ts"
Cohesion: 0.39
Nodes (5): ModuleSelectionContext, ModuleSelectionContextValue, SelectedTechData, ModuleSelectionDialogProps, TechColor

### Community 79 - "techRules.ts"
Cohesion: 0.60
Nodes (4): MODULE_RANK_ORDER, mockModules, validateModuleSelections(), VALIDATION_GROUPS

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

### Community 95 - "useOptimize.test.tsx"
Cohesion: 0.25
Nodes (7): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, GridStore

### Community 99 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 121 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

### Community 130 - "Logger"
Cohesion: 0.16
Nodes (18): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), UseLoadBuildReturn, UseSaveBuildReturn, getPlatformFromStorage(), getPlatformFromUrl() (+10 more)

### Community 131 - "dialogContext.tsx"
Cohesion: 0.18
Nodes (5): DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages()

### Community 132 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 133 - "gridStore.ts"
Cohesion: 0.28
Nodes (7): useRecommendedBuild(), createEmptyCell(), createGrid(), resetCellContent(), useGridStore, useUiStore, StoreResetWrapper()

### Community 138 - "usePlatformStore"
Cohesion: 0.12
Nodes (23): ShipSelectionProvider(), ShipSelectionProviderProps, mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), GroupedShipType, TechTreeRoot() (+15 more)

### Community 143 - "AppDialog.tsx"
Cohesion: 0.14
Nodes (18): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+10 more)

## Knowledge Gaps
- **435 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `App.tsx`, `tracking.ts`, `gridStore.ts`, `useBreakpoint`, `techStore.ts`, `useAnalytics`, `usePlatformStore`, `dialogUtils.ts`, `LifecycleCoordinator`, `useTechTree.tsx`, `bootPipeline.tsx`, `userStatsData.tsx`, `optimizationManager.ts`, `lifecycleCoordinator.ts`, `dataValidation.ts`, `gridSerializer.ts`, `RoutedDialogs.integration.test.tsx`, `GridCell.tsx`, `TechTree`, `reportWebVitals.ts`, `environment.ts`, `GridTable.tsx`, `useMarkdownContent.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `Logger`, `MainAppContent.stories.tsx`, `useBreakpoint`, `techStore.ts`, `useAnalytics`, `usePlatformStore`, `RecommendedBuild.stories.tsx`, `uiStore.ts`, `useTechTree.tsx`, `TechTreeRow.test.tsx`, `SharedModuleSelectionDialog.tsx`, `MainAppLayout.tsx`, `dataValidation.ts`, `gridSerializer.ts`, `GridCell.tsx`, `TechTree`, `environment.ts`, `GridTable.tsx`, `useTechTreeRow.ts`, `GridControlButtons.tsx`, `GridTableButtons.stories.tsx`, `useOptimize.test.tsx`, `AppHeader.stories.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `App.tsx`, `tracking.ts`, `splashScreen.ts`, `bootPipeline.tsx`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._