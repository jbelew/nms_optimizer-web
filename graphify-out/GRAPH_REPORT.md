# Graph Report - nms_optimizer-web  (2026-09-21)

## Corpus Check
- 439 files · ~200,479 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1687 nodes · 4090 edges · 137 communities (115 shown, 22 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83c92f9b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- MainAppLayout.tsx
- AppFooter.tsx
- generate-ssg.mjs
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- gridStore.ts
- FakeCommandRunnerAdapter
- useTechTreeRow.ts
- useMainAppLogic.tsx
- ConditionalTooltip.tsx
- uiStore.ts
- AppDialog.tsx
- LifecycleCoordinator
- sessionCoordinator.ts
- AppHeader.tsx
- __init__.py
- App.tsx
- reportWebVitals.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- lifecycleCoordinator.ts
- network.ts
- generate-sitemap.mjs
- ErrorContent.stories.tsx
- monitoring.ts
- platformStore.ts
- environment.ts
- TechTreeRow.tsx
- page-metadata.js
- dataValidation.ts
- src/constants.ts
- applyValidationFeedback.ts
- dialogContext.tsx
- ShipSelectionProvider.tsx
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- optimizationManager.ts
- TechTreeRow.test.tsx
- TechTreePresetsCard.tsx
- vite-plugin-markdown-bundle.mjs
- TechTree
- techStore.ts
- RecommendedBuild.stories.tsx
- tracking.ts
- generate-radix-colors.mjs
- OptimizationAlertDialog.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- splashScreen.ts
- create_screenshot_video.py
- update-lighthouse-history.mjs
- preview.tsx
- CliAgentRunnerAdapter
- useAnalytics
- ShareLinkDialog.tsx
- spa-routes.test.mjs
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
- useOptimize.test.tsx
- OfflineBanner.stories.tsx
- routes.tsx
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
- Toast.stories.tsx
- tooltipUtils.ts
- useFetchTechTreeSuspense.test.ts
- MobileToolbar.tsx
- useBreakpoint
- useToast.ts
- AppHeader.stories.tsx
- Logger
- RoutedDialogs.integration.test.tsx
- useTechTree.tsx

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

## Communities (137 total, 22 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (45): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+37 more)

### Community 1 - "MainAppLayout.tsx"
Cohesion: 0.07
Nodes (38): GridContext, GridContextValue, GridProvider(), GridTable, GridTableProps, GridTableContent(), GridTableGrid(), GridTableRoot() (+30 more)

### Community 2 - "AppFooter.tsx"
Cohesion: 0.15
Nodes (13): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+5 more)

### Community 3 - "generate-ssg.mjs"
Cohesion: 0.23
Nodes (12): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+4 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.07
Nodes (12): LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps, PrerenderedMarkdownRenderer, YouTubeEmbed() (+4 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.10
Nodes (24): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+16 more)

### Community 6 - "gridStore.ts"
Cohesion: 0.16
Nodes (13): Default, Solving, Story, Desktop, Mobile, Story, StorybookWrapper(), Tablet (+5 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "useTechTreeRow.ts"
Cohesion: 0.30
Nodes (7): TechTreeRowContext, TechTreeRowContextValue, TechTreeRowProvider(), EMPTY_MODULES_ARRAY, mockProps, useTechTreeRow(), TechTreeRowProps

### Community 9 - "useMainAppLogic.tsx"
Cohesion: 0.29
Nodes (9): MainAppProvider(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), ERROR_THRESHOLDS, useErrorDispatcher(), registerToolbarForceShow() (+1 more)

### Community 10 - "ConditionalTooltip.tsx"
Cohesion: 0.53
Nodes (3): ConditionalTooltip, ConditionalTooltipProps, useTooltipActions()

### Community 11 - "uiStore.ts"
Cohesion: 0.11
Nodes (19): AppHeaderProvider(), GridShake(), GridShakeProps, useTechOptimization(), A11yState, ErrorMessage, ErrorState, OptimizeErrorType (+11 more)

### Community 12 - "AppDialog.tsx"
Cohesion: 0.12
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialog, AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter() (+12 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "sessionCoordinator.ts"
Cohesion: 0.15
Nodes (13): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, createGrid(), computeBonusStatus(), sessionCoordinator, mockGridStore (+5 more)

### Community 15 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "App.tsx"
Cohesion: 0.13
Nodes (21): AppContent(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, mockDialogContext (+13 more)

### Community 18 - "reportWebVitals.ts"
Cohesion: 0.23
Nodes (9): AppHeaderContext, AppHeaderContextValue, AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric() (+1 more)

### Community 19 - "CliIssueTrackerAdapter"
Cohesion: 0.14
Nodes (5): CliIssueTrackerAdapter, Any, List open issues with number, title, body, and labels., Fetch details for a single issue (number, title, body)., Adapter for GitHub using gh CLI.

### Community 20 - "agent.py"
Cohesion: 0.16
Nodes (10): format_initial_prompt(), format_remediation_prompt(), Agent orchestration module: prompt formatting, session continuation, and…, Construct the initial autonomous implementation prompt for the agent., Construct the continuation prompt when verification gate fails., Run the initial autonomous session for an issue with high reasoning effort., Resume an existing session with low reasoning effort to fix verification…, Issue (+2 more)

### Community 21 - "No Man's Sky Technology Layout Optimizer (Web UI)"
Cohesion: 0.08
Nodes (24): Agentic JSDoc, Auto-Translation Workflow, Bundle Strategy & Resilience, CI/CD Status, Commit Convention, Component Architecture (Colocated Hooks), 🚀 Development Workflow, 🐳 Docker (+16 more)

### Community 22 - "lifecycleCoordinator.ts"
Cohesion: 0.15
Nodes (9): ErrorBoundary, Props, State, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener (+1 more)

### Community 23 - "network.ts"
Cohesion: 0.08
Nodes (25): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, UserStatsContent(), UserStatsContentProps, COLORS (+17 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.11
Nodes (22): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+14 more)

### Community 25 - "ErrorContent.stories.tsx"
Cohesion: 0.33
Nodes (5): PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace

### Community 26 - "monitoring.ts"
Cohesion: 0.21
Nodes (11): Root(), useThemeStore, createAppRouter(), initializeSentry(), LogEntry, LogLevel, logs, SentryIntegration (+3 more)

### Community 27 - "platformStore.ts"
Cohesion: 0.24
Nodes (10): cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, preloadInitialState(), getPlatformFromStorage(), getPlatformFromUrl() (+2 more)

### Community 28 - "environment.ts"
Cohesion: 0.18
Nodes (16): InstallPrompt(), Default, Story, UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isTouchDevice() (+8 more)

### Community 29 - "TechTreeRow.tsx"
Cohesion: 0.21
Nodes (12): TechTreeSectionList(), TechTreeContextValue, useTechTree(), BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow, TechTreeRowActions() (+4 more)

### Community 30 - "page-metadata.js"
Cohesion: 0.24
Nodes (15): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath(), PAGE_IDS (+7 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.18
Nodes (15): BuildNameContent(), BuildNameContentProps, BuildNameContentRef, SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, useDebouncedValidation(), generateBuildNameWithType() (+7 more)

### Community 32 - "src/constants.ts"
Cohesion: 0.60
Nodes (3): TRACKING_ID, WS_URL, SOCKET_OPTIONS

### Community 33 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 34 - "dialogContext.tsx"
Cohesion: 0.18
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 35 - "ShipSelectionProvider.tsx"
Cohesion: 0.17
Nodes (13): ShipSelection(), ShipSelectionProps, Default, Story, ShipSelectionContent(), ShipSelectionProviderProps, ShipSelectionRoot(), ShipSelectionTrigger() (+5 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.15
Nodes (14): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged, useGridCellInteraction() (+6 more)

### Community 39 - "VerificationGate"
Cohesion: 0.20
Nodes (9): distill_gate_output(), Module for running the verification gatekeeper and reporting distilled results., Remove ANSI escape sequences from terminal text., Distill raw gate output to reduce token usage during remediation retries: 1.…, Encapsulates execution and evaluation of the pre-commit verification gate., Run the gate command and return structured result., strip_ansi(), VerificationGate (+1 more)

### Community 40 - "IssueLifecycle"
Cohesion: 0.08
Nodes (22): main(), FakeIssueTrackerAdapter, IssueTrackerAdapter, Protocols and concrete adapters for external dependencies (CLI tools, agent,…, In-memory fake IssueTrackerAdapter for testing., Interface for querying and updating GitHub issues., Fetch comments for an issue., Edit an issue's assignee, labels, or body. (+14 more)

### Community 41 - "optimizationManager.ts"
Cohesion: 0.30
Nodes (7): ApiResponse, createSocket(), TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager, OptimizationOptions, mockCreateSocket

### Community 42 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 43 - "TechTreePresetsCard.tsx"
Cohesion: 0.23
Nodes (12): PresetCardItem(), PresetCardItemProps, PresetsCardContentProps, createCellFromModuleData(), Grid, GridActions, GridComputed, GridState (+4 more)

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (5): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss()

### Community 45 - "TechTree"
Cohesion: 0.09
Nodes (21): EmptyState(), EmptyStateProps, SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree() (+13 more)

### Community 46 - "techStore.ts"
Cohesion: 0.21
Nodes (12): mockCellState, EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), debouncedStorage, debounceSetItem() (+4 more)

### Community 47 - "RecommendedBuild.stories.tsx"
Cohesion: 0.14
Nodes (15): RecommendedBuild(), RecommendedBuildProps, Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton() (+7 more)

### Community 48 - "tracking.ts"
Cohesion: 0.18
Nodes (17): API_URL, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult(), getClientId(), getGaClientIdFromCookie(), initializeAnalytics() (+9 more)

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

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 58 - "preview.tsx"
Cohesion: 0.17
Nodes (7): TooltipProvider(), BackgroundWrapper(), BackgroundWrapperProps, ThemeWrapper(), customViewports, globalTypes, preview

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 62 - "useAnalytics"
Cohesion: 0.14
Nodes (18): formatDocumentTitle(), DynamicRadixIcon(), DynamicRadixIconProps, WelcomeContent(), WelcomeContentProps, BuyMeACoffee(), useGridContext(), BuildNameDialog (+10 more)

### Community 63 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 64 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

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

### Community 76 - "useOptimize.test.tsx"
Cohesion: 0.25
Nodes (7): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "routes.tsx"
Cohesion: 0.24
Nodes (8): NotFound(), DIALOG_ROUTE_PATHS, languageRoutes, NotFound(), pageRoutes, routes, sendEvent(), validateEvent()

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

### Community 131 - "Toast.stories.tsx"
Cohesion: 0.29
Nodes (6): NmsToast(), Default, Error, Story, Success, ToastProps

### Community 132 - "tooltipUtils.ts"
Cohesion: 0.39
Nodes (6): TooltipManager(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext, useTooltipState()

### Community 133 - "useFetchTechTreeSuspense.test.ts"
Cohesion: 0.17
Nodes (11): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), MockGridStoreState, MockTechStoreState (+3 more)

### Community 136 - "MobileToolbar.tsx"
Cohesion: 0.22
Nodes (8): LanguageFlagPaths, LanguageSelector(), MobileToolbar(), MobileToolbarProps, Default, Story, languages, nativeLanguageNames

### Community 137 - "useBreakpoint"
Cohesion: 0.12
Nodes (15): ErrorContent(), ErrorContentProps, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
}, mockGridRef, { setGridStoreState, useGridStore }, ShipSelectionSkeleton(), TechTreeRoot(), useBreakpoint() (+7 more)

### Community 138 - "useToast.ts"
Cohesion: 0.28
Nodes (9): ErrorMessageRenderer(), mockUseTranslation, ToastRenderer(), ToastConfig, ToastContext, ToastContextType, ToastProvider(), useToast() (+1 more)

### Community 139 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 140 - "Logger"
Cohesion: 0.19
Nodes (18): App(), ShipSelectionProvider(), RouteContext, RouteContextType, useRouteContext(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling() (+10 more)

### Community 143 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.14
Nodes (15): getRoutedDialogs(), PerformanceDialog(), UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS, MarkdownContentRenderer, RoutedDialogs() (+7 more)

### Community 144 - "useTechTree.tsx"
Cohesion: 0.17
Nodes (18): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useRecommendedBuild() (+10 more)

## Knowledge Gaps
- **415 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `MarkdownContentRenderer.tsx`, `gridStore.ts`, `useBreakpoint`, `uiStore.ts`, `LifecycleCoordinator`, `sessionCoordinator.ts`, `useTechTree.tsx`, `App.tsx`, `reportWebVitals.ts`, `lifecycleCoordinator.ts`, `network.ts`, `monitoring.ts`, `platformStore.ts`, `environment.ts`, `dataValidation.ts`, `src/constants.ts`, `ShipSelectionProvider.tsx`, `optimizationManager.ts`, `TechTree`, `techStore.ts`, `tracking.ts`, `useAnalytics`, `ShareLinkDialog.tsx`, `routes.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `gridStore.ts` to `MainAppLayout.tsx`, `useFetchTechTreeSuspense.test.ts`, `MobileToolbar.tsx`, `useMainAppLogic.tsx`, `useTechTreeRow.ts`, `uiStore.ts`, `AppHeader.stories.tsx`, `Logger`, `useBreakpoint`, `sessionCoordinator.ts`, `useTechTree.tsx`, `environment.ts`, `dataValidation.ts`, `GridCell.tsx`, `TechTreeRow.test.tsx`, `TechTree`, `techStore.ts`, `RecommendedBuild.stories.tsx`, `useAnalytics`, `useOptimize.test.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `useDialog()` connect `App.tsx` to `MainAppLayout.tsx`, `AppFooter.tsx`, `dialogContext.tsx`, `ModuleSelectionDialog.tsx`, `MobileToolbar.tsx`, `useMainAppLogic.tsx`, `uiStore.ts`, `RecommendedBuild.stories.tsx`, `RoutedDialogs.integration.test.tsx`, `useAnalytics`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06321334503950835 - nodes in this community are weakly interconnected._
- **Should `MainAppLayout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._