# Graph Report - nms_optimizer-web  (2026-09-24)

## Corpus Check
- 450 files · ~207,111 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1731 nodes · 4184 edges · 145 communities (122 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `313b2de8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useShakeStore
- tracking.ts
- useScrollGridIntoView.ts
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- platformStore.ts
- FakeCommandRunnerAdapter
- sessionCoordinator.ts
- GridControlButtons.tsx
- page-metadata.js
- uiStore.ts
- TechTreePresetsCard.tsx
- LifecycleCoordinator
- useOptimizeStore
- GridTableButtons.stories.tsx
- __init__.py
- ShipSelectionProvider.tsx
- monitoring.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- UpdatePrompt.tsx
- network.ts
- generate-sitemap.mjs
- OptimizationAlertDialog.tsx
- TechTreeRow.test.tsx
- TechTree.stories.tsx
- ErrorBoundary.tsx
- techStore.ts
- MainAppLayout.tsx
- dataValidation.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- useOptimize.test.tsx
- RoutedDialogs.integration.test.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- applyValidationFeedback.ts
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite.config.ts
- useTechTree.tsx
- reportWebVitals.ts
- TechTree
- lifecycleCoordinator.ts
- generate-radix-colors.mjs
- usePlatformStore
- sentryMock.ts
- store-helpers.ts
- process_stream
- useMainAppLogic.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- ErrorBoundary/ErrorContent.tsx
- ShareLinkDialog.tsx
- environment.ts
- CliAgentRunnerAdapter
- ShipSelection.tsx
- InstallPrompt.stories.tsx
- MainAppContent.stories.tsx
- generate-ssg.mjs
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
- useToast.ts
- OfflineBanner.stories.tsx
- preview.tsx
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
- LanguageSelector.tsx
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
- App.tsx
- useBreakpoint
- dialogContext.tsx
- iconRegistry.ts
- gridStore.ts
- props.ts
- Logger
- AppHeader.tsx
- ShipSelectionTrigger.test.tsx
- useUrlSync.tsx
- UpdatePromptWrapper.tsx
- useTechTreeContext.ts
- splashScreen.ts
- lazyNamed.ts
- AppDialog.tsx
- spa-routes.test.mjs

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

## Communities (145 total, 23 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (46): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+38 more)

### Community 1 - "useShakeStore"
Cohesion: 0.47
Nodes (4): GridShake(), GridShakeProps, GridTableRoot(), useShakeStore

### Community 2 - "tracking.ts"
Cohesion: 0.15
Nodes (16): NotFound(), routes, AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult() (+8 more)

### Community 3 - "useScrollGridIntoView.ts"
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

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (20): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel(), formatParentheses(), ModuleCheckbox (+12 more)

### Community 6 - "platformStore.ts"
Cohesion: 0.38
Nodes (6): fetchShipTypes(), preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl(), PLATFORM_STORAGE_KEY, resolveInitialPlatform()

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "sessionCoordinator.ts"
Cohesion: 0.11
Nodes (18): createGrid(), createSerializedGrid(), mockNavigate, mockTechTreeData, ApiResponse, Grid, computeBonusStatus(), sessionCoordinator (+10 more)

### Community 9 - "GridControlButtons.tsx"
Cohesion: 0.26
Nodes (8): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridStore, useTechTreeLoadingStore

### Community 10 - "page-metadata.js"
Cohesion: 0.19
Nodes (18): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatDocumentTitle(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath() (+10 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.15
Nodes (18): ErrorMessageRenderer(), mockUseTranslation, ERROR_THRESHOLDS, useErrorDispatcher(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+10 more)

### Community 12 - "TechTreePresetsCard.tsx"
Cohesion: 0.18
Nodes (14): PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions, createCellFromModuleData(), GridActions (+6 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "useOptimizeStore"
Cohesion: 0.22
Nodes (8): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, useOptimizeStore

### Community 15 - "GridTableButtons.stories.tsx"
Cohesion: 0.27
Nodes (6): GridContext, GridContextValue, GridProvider(), Default, meta, Story

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "ShipSelectionProvider.tsx"
Cohesion: 0.17
Nodes (12): ShipSelectionProviderProps, mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer(), GroupedShipType, ShipSelectionContext, cache (+4 more)

### Community 18 - "monitoring.ts"
Cohesion: 0.20
Nodes (10): Root(), useThemeStore, createAppRouter(), LogEntry, LogLevel, logs, SentryIntegration, SentrySDK (+2 more)

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

### Community 23 - "network.ts"
Cohesion: 0.14
Nodes (17): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+9 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 27 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (6): ErrorBoundary, Props, State, handleError(), RouteError(), captureException()

### Community 29 - "techStore.ts"
Cohesion: 0.17
Nodes (16): mockCellState, EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), useTechOptimization(), EMPTY_MODULES_ARRAY (+8 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.20
Nodes (18): MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader(), MainAppMobileToolbar() (+10 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.22
Nodes (11): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+3 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.18
Nodes (11): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+3 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "useOptimize.test.tsx"
Cohesion: 0.21
Nodes (10): TRACKING_ID, WS_URL, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore (+2 more)

### Community 35 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.23
Nodes (8): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer, RoutedDialogs()

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.12
Nodes (19): GridCell(), GridCellProps, ModuleContent(), getGridCellAriaLabel(), stripLabel(), TranslateFn, mockRegisterCellTap, mockToggleCellActive (+11 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.18
Nodes (14): TechTreeSectionList(), useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow (+6 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite.config.ts"
Cohesion: 0.14
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "useTechTree.tsx"
Cohesion: 0.10
Nodes (26): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, TechTree(), TechTreeContent(), TechTreeContentProps, TechTreeList(), TechTreeSection() (+18 more)

### Community 46 - "reportWebVitals.ts"
Cohesion: 0.26
Nodes (9): AppFooterContextValue, AppHeaderContext, AppHeaderContextValue, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+1 more)

### Community 47 - "TechTree"
Cohesion: 0.13
Nodes (18): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+10 more)

### Community 48 - "lifecycleCoordinator.ts"
Cohesion: 0.21
Nodes (11): initializeAnalyticsClient(), registerDefaultDeferredServices(), runWhenIdle(), AppLifecyclePhase, DeferredTaskHandler, handleFatalBootstrapError(), LifecycleListener, initializeSentry() (+3 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "usePlatformStore"
Cohesion: 0.17
Nodes (22): useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useMainAppBuildManagement(), ShipSelectionProvider(), useAnalytics() (+14 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "useMainAppLogic.tsx"
Cohesion: 0.31
Nodes (7): MainAppProvider(), useMainAppLogic(), AppLayout, useAppLayout(), useScrollHide(), UseScrollHideReturn, getBuildDate()

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "ErrorBoundary/ErrorContent.tsx"
Cohesion: 0.20
Nodes (7): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace

### Community 58 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 59 - "environment.ts"
Cohesion: 0.25
Nodes (13): InstallPrompt(), UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isTouchDevice(), safeClear(), safeGetItem() (+5 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "ShipSelection.tsx"
Cohesion: 0.31
Nodes (6): ShipSelectionProps, ShipSelectionContent(), ShipSelectionRoot(), ShipSelectionSkeleton(), ShipSelectionTrigger(), useShipSelectionContext()

### Community 62 - "InstallPrompt.stories.tsx"
Cohesion: 0.19
Nodes (9): Default, Story, NmsToast(), Default, Error, Story, Success, ToastProps (+1 more)

### Community 63 - "MainAppContent.stories.tsx"
Cohesion: 0.14
Nodes (12): MainAppContent(), Desktop, Mobile, Story, StorybookWrapper(), Tablet, MainAppLayoutContent(), ShipTypesLoader() (+4 more)

### Community 64 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (15): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+7 more)

### Community 65 - "AGENTS.md"
Cohesion: 0.29
Nodes (3): Language, NMS Optimizer Web Domain Model, Triage Labels

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

### Community 76 - "useToast.ts"
Cohesion: 0.31
Nodes (7): ShipSelection(), Default, Story, ToastConfig, ToastContext, ToastContextType, ToastProvider()

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "preview.tsx"
Cohesion: 0.11
Nodes (16): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext (+8 more)

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

### Community 99 - "LanguageSelector.tsx"
Cohesion: 0.31
Nodes (4): LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames

### Community 121 - "App.tsx"
Cohesion: 0.11
Nodes (24): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, UserStatsDialog() (+16 more)

### Community 130 - "useBreakpoint"
Cohesion: 0.28
Nodes (6): AppHeaderProvider(), BuyMeACoffee(), TechTreeRoot(), TechTreeRootProps, useBreakpoint(), useA11yStore

### Community 131 - "dialogContext.tsx"
Cohesion: 0.17
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 132 - "iconRegistry.ts"
Cohesion: 0.22
Nodes (8): DynamicRadixIcon(), DynamicRadixIconProps, DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 133 - "gridStore.ts"
Cohesion: 0.16
Nodes (14): GridTable, GridTableProps, Default, Solving, Story, GridTableContent(), GridTableGrid(), useRecommendedBuild() (+6 more)

### Community 134 - "props.ts"
Cohesion: 0.36
Nodes (6): ModuleSelectionContext, ModuleSelectionContextValue, SelectedTechData, ModuleSelectionDialogProps, TechTreeRowProps, TechColor

### Community 135 - "Logger"
Cohesion: 0.44
Nodes (6): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), useFetchShipTypesSuspense(), Logger

### Community 136 - "AppHeader.tsx"
Cohesion: 0.12
Nodes (14): AppHeader, AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton() (+6 more)

### Community 137 - "ShipSelectionTrigger.test.tsx"
Cohesion: 0.33
Nodes (4): defaultContextValue, mockT, TestWrapperProps, ShipSelectionContextValue

### Community 138 - "useUrlSync.tsx"
Cohesion: 0.14
Nodes (15): MobileToolbar(), MobileToolbarProps, Default, Story, RouteContext, RouteContextType, useRouteContext(), compressRLE() (+7 more)

### Community 139 - "UpdatePromptWrapper.tsx"
Cohesion: 0.57
Nodes (3): UpdatePrompt, UpdatePromptWrapper(), useUpdateCheck()

### Community 140 - "useTechTreeContext.ts"
Cohesion: 0.50
Nodes (3): TechTreeProvider(), TechTreeContext, TechTreeContextValue

### Community 143 - "AppDialog.tsx"
Cohesion: 0.11
Nodes (23): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+15 more)

### Community 144 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

## Knowledge Gaps
- **434 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+429 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `useScrollGridIntoView.ts`, `iconRegistry.ts`, `MarkdownContentRenderer.tsx`, `gridStore.ts`, `platformStore.ts`, `sessionCoordinator.ts`, `useUrlSync.tsx`, `UpdatePromptWrapper.tsx`, `LifecycleCoordinator`, `ShipSelectionProvider.tsx`, `monitoring.ts`, `network.ts`, `ErrorBoundary.tsx`, `techStore.ts`, `dataValidation.ts`, `useOptimize.test.tsx`, `GridCell.tsx`, `useTechTree.tsx`, `reportWebVitals.ts`, `lifecycleCoordinator.ts`, `usePlatformStore`, `ShareLinkDialog.tsx`, `environment.ts`, `App.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `useBreakpoint`, `useScrollGridIntoView.ts`, `Logger`, `AppHeader.tsx`, `GridControlButtons.tsx`, `useUrlSync.tsx`, `sessionCoordinator.ts`, `AppDialog.tsx`, `GridTableButtons.stories.tsx`, `TechTreeRow.test.tsx`, `techStore.ts`, `MainAppLayout.tsx`, `useOptimize.test.tsx`, `GridCell.tsx`, `useTechTree.tsx`, `TechTree`, `usePlatformStore`, `useMainAppLogic.tsx`, `environment.ts`, `MainAppContent.stories.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `splashScreen.ts`, `lifecycleCoordinator.ts`, `monitoring.ts`, `App.tsx`, `ErrorBoundary.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _434 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06180733162830349 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._
- **Should `ModuleSelectionDialog.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10256410256410256 - nodes in this community are weakly interconnected._