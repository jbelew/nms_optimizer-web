# Graph Report - nms_optimizer-web  (2026-09-23)

## Corpus Check
- 446 files · ~204,902 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1722 nodes · 4155 edges · 144 communities (123 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3a55cc6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useGridStore
- tracking.ts
- App.tsx
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useTechTree.tsx
- FakeCommandRunnerAdapter
- sessionCoordinator.ts
- useToast.ts
- page-metadata.js
- uiStore.ts
- useRecommendedBuild.tsx
- LifecycleCoordinator
- TechTreeItem
- bootstrap.ts
- __init__.py
- ShipSelectionProvider.tsx
- tooltipUtils.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- UpdatePrompt.tsx
- userStatsData.tsx
- generate-sitemap.mjs
- OptimizationAlertDialog.tsx
- useTechTreeContext.ts
- TechTree.tsx
- lifecycleCoordinator.ts
- techStore.ts
- MainAppLayout.tsx
- buildNameGenerator.ts
- AppFooter.tsx
- check-remote-sync.test.mjs
- src/constants.ts
- useDialog
- report-inp.py
- translate.py
- GridCell.tsx
- VerificationGate
- IssueLifecycle
- applyValidationFeedback.ts
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite.config.ts
- TechTree
- useAnalytics
- RecommendedBuild.tsx
- monitoring.ts
- generate-radix-colors.mjs
- GridTableButtons.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- usePlatformStore
- create_screenshot_video.py
- update-lighthouse-history.mjs
- TechTreeRow.test.tsx
- ShareLinkDialog.tsx
- platformStore.ts
- CliAgentRunnerAdapter
- AppHeader.stories.tsx
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
- spa-routes.test.mjs
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
- BuildNameContent.tsx
- useBreakpoint
- dialogContext.tsx
- dialogUtils.ts
- gridStore.ts
- RecommendedBuild.stories.tsx
- useOptimize.test.tsx
- AppHeader.tsx
- useOptimizeStore
- MobileToolbar.tsx
- ConditionalTooltip.tsx
- Logger
- BuildNameDialog.stories.tsx
- AppDialog.tsx
- gridSerializer.ts

## God Nodes (most connected - your core abstractions)
1. `Logger` - 89 edges
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

## Communities (144 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.06
Nodes (46): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+38 more)

### Community 1 - "useGridStore"
Cohesion: 0.15
Nodes (16): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridTable, GridTableProps (+8 more)

### Community 2 - "tracking.ts"
Cohesion: 0.12
Nodes (22): AppHeaderContext, AppHeaderContextValue, NotFound(), AnalyticsEventParams, GA4Event, reportTBT(), reportWebVitals(), SendEventFunction (+14 more)

### Community 3 - "App.tsx"
Cohesion: 0.22
Nodes (8): OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, lazyNamed(), ReactLazyInternal

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.05
Nodes (20): DynamicRadixIcon(), DynamicRadixIconProps, LoremIpsumSkeleton(), H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRenderer(), MarkdownContentRendererProps (+12 more)

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.09
Nodes (25): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+17 more)

### Community 6 - "useTechTree.tsx"
Cohesion: 0.18
Nodes (16): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, cache, clearTechTreeCache() (+8 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "sessionCoordinator.ts"
Cohesion: 0.16
Nodes (13): createGrid(), createCellFromModuleData(), Grid, GridActions, GridComputed, GridState, computeBonusStatus(), sessionCoordinator (+5 more)

### Community 9 - "useToast.ts"
Cohesion: 0.31
Nodes (7): ShipSelection(), Default, Story, ToastConfig, ToastContext, ToastContextType, ToastProvider()

### Community 10 - "page-metadata.js"
Cohesion: 0.36
Nodes (11): DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading(), formatErrorDocumentTitle(), getPageMetadata(), getAllPages(), getPageByPath(), PAGE_IDS (+3 more)

### Community 11 - "uiStore.ts"
Cohesion: 0.10
Nodes (20): GridShake(), GridShakeProps, GridTableRoot(), useTechOptimization(), MockGridStoreState, MockTechStoreState, MockTechTreeLoadingState, A11yState (+12 more)

### Community 12 - "useRecommendedBuild.tsx"
Cohesion: 0.22
Nodes (12): RecommendedBuildProvider(), PresetCardItemProps, PresetsCardContentProps, TechTreePresetsCardProps, useRecommendedBuild(), resetCellContent(), RecommendedBuild, countBuildModules() (+4 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "TechTreeItem"
Cohesion: 0.24
Nodes (8): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap, TechTreeSectionList(), TechTreeRow, TechTreeItem, TechTreeMaps

### Community 15 - "bootstrap.ts"
Cohesion: 0.44
Nodes (5): safeRemoveItem(), migrateTutorialKey(), performBootstrapMigrations(), performGridCleanup(), runWhenIdle()

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "ShipSelectionProvider.tsx"
Cohesion: 0.10
Nodes (22): ShipSelectionProps, ShipSelectionContent(), ShipSelectionProvider(), ShipSelectionProviderProps, mockNavigate, mockSendDeferredEvent, mockShowInfo, TestConsumer() (+14 more)

### Community 18 - "tooltipUtils.ts"
Cohesion: 0.39
Nodes (6): TooltipManager(), TooltipActions, TooltipActionsContext, TooltipState, TooltipStateContext, useTooltipState()

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
Cohesion: 0.18
Nodes (12): UserStatsContent(), UserStatsContentProps, COLORS, LazyRechartsChart, PieLabelRenderProps, UserStatsData(), useTechTreeColors(), useUserStats() (+4 more)

### Community 24 - "generate-sitemap.mjs"
Cohesion: 0.14
Nodes (18): CHANGE_FREQUENCIES, __dirname, escapeXml(), EXCLUDED_FROM_SITEMAP, __filename, generateSitemap(), getFileLastMod(), getPageImages() (+10 more)

### Community 25 - "OptimizationAlertDialog.tsx"
Cohesion: 0.23
Nodes (6): OptimizationAlertContent(), OptimizationAlertContentProps, OptimizationAlertDialog(), OptimizationAlertDialogProps, Default, Story

### Community 26 - "useTechTreeContext.ts"
Cohesion: 0.50
Nodes (3): TechTreeProvider(), TechTreeContext, TechTreeContextValue

### Community 27 - "TechTree.tsx"
Cohesion: 0.19
Nodes (9): SharedModuleSelectionDialog, Desktop, Mobile, Story, Tablet, TechTree(), TechTreeProps, TechTreeList() (+1 more)

### Community 28 - "lifecycleCoordinator.ts"
Cohesion: 0.13
Nodes (9): ErrorBoundary, handleError(), RouteError(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, captureException(), hideSplashScreenAndShowBackground() (+1 more)

### Community 29 - "techStore.ts"
Cohesion: 0.22
Nodes (11): EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement(), BonusStatusData, debouncedStorage, debounceSetItem() (+3 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.16
Nodes (21): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+13 more)

### Community 31 - "buildNameGenerator.ts"
Cohesion: 0.33
Nodes (7): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, sanitizeFilename()

### Community 32 - "AppFooter.tsx"
Cohesion: 0.15
Nodes (12): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+4 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "src/constants.ts"
Cohesion: 0.22
Nodes (10): TRACKING_ID, WS_URL, ApiResponse, createSocket(), SOCKET_OPTIONS, TRANSPORT_ERROR_MESSAGES, isApiResponse(), OptimizationManager (+2 more)

### Community 35 - "useDialog"
Cohesion: 0.17
Nodes (14): getRoutedDialogs(), AppDialog, PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages, MARKDOWN_DIALOGS (+6 more)

### Community 36 - "report-inp.py"
Cohesion: 0.16
Nodes (17): BetaAnalyticsDataClient, FilterExpression, Namespace, Path, get_unique_characters(), Reads all .json and .md files in the specified directory, extracts all unique…, create_client(), format_status() (+9 more)

### Community 37 - "translate.py"
Cohesion: 0.18
Nodes (17): GenerateContentConfig, flatten_json(), get_config(), get_system_instruction(), main(), process_json(), process_markdown(), Any (+9 more)

### Community 38 - "GridCell.tsx"
Cohesion: 0.14
Nodes (15): GridCell(), GridCellProps, ModuleContent(), stripLabel(), mockCellState, mockRegisterCellTap, mockToggleCellActive, mockToggleCellSupercharged (+7 more)

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
Cohesion: 0.19
Nodes (16): useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRowActions(), TechTreeRowAvatar() (+8 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite.config.ts"
Cohesion: 0.14
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree"
Cohesion: 0.24
Nodes (8): EmptyState(), EmptyStateProps, TechTreeContent(), TechTreeContentProps, TechTreePresetsCard(), mockHandleApply, mockHandleOpenInstructions, TechTree

### Community 46 - "useAnalytics"
Cohesion: 0.28
Nodes (9): formatDocumentTitle(), WelcomeContent(), WelcomeContentProps, AppHeaderProvider(), UpdatePrompt, UpdatePromptWrapper(), useAnalytics(), useUpdateCheck() (+1 more)

### Community 47 - "RecommendedBuild.tsx"
Cohesion: 0.26
Nodes (9): RecommendedBuildProps, RecommendedBuildButton(), RecommendedBuildInfo(), RecommendedBuildRoot(), RecommendedBuildContext, RecommendedBuildContextValue, useRecommendedBuildContext(), PresetCardItem() (+1 more)

### Community 48 - "monitoring.ts"
Cohesion: 0.16
Nodes (18): Root(), useThemeStore, getGaClientIdFromCookie(), initializeAnalyticsClient(), registerDefaultDeferredServices(), handleFatalBootstrapError(), createAppRouter(), initializeSentry() (+10 more)

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "GridTableButtons.tsx"
Cohesion: 0.11
Nodes (20): GridContext, GridContextValue, GridProvider(), useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS (+12 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "usePlatformStore"
Cohesion: 0.16
Nodes (22): MainAppProvider(), useMainAppBuildManagement(), mockShowInfo, useMainAppLogic(), useAppLayout(), ERROR_THRESHOLDS, useErrorDispatcher(), useLatest() (+14 more)

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 58 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 59 - "platformStore.ts"
Cohesion: 0.21
Nodes (14): InstallPrompt(), UI_TIMING, debouncedStorage, debounceSetItem(), SetItemFunction, isBot(), isTouchDevice(), safeClear() (+6 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 62 - "InstallPrompt.stories.tsx"
Cohesion: 0.19
Nodes (9): Default, Story, NmsToast(), Default, Error, Story, Success, ToastProps (+1 more)

### Community 63 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 64 - "generate-ssg.mjs"
Cohesion: 0.17
Nodes (16): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+8 more)

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

### Community 76 - "spa-routes.test.mjs"
Cohesion: 0.25
Nodes (5): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "preview.tsx"
Cohesion: 0.16
Nodes (8): TooltipProvider(), BackgroundWrapper(), BackgroundWrapperProps, StoreResetWrapper(), ThemeWrapper(), customViewports, globalTypes, preview

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
Cohesion: 0.22
Nodes (7): ErrorMessageRenderer(), mockUseTranslation, LanguageFlagPaths, LanguageSelector(), languages, nativeLanguageNames, useErrorStore

### Community 121 - "BuildNameContent.tsx"
Cohesion: 0.20
Nodes (12): AppContent(), BuildNameContent(), BuildNameContentProps, BuildNameContentRef, PlatformStoreSelector, PlatformStoreState, useDebouncedValidation(), UseDebouncedValidationOptions (+4 more)

### Community 130 - "useBreakpoint"
Cohesion: 0.10
Nodes (16): BuyMeACoffee(), Props, State, ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack (+8 more)

### Community 131 - "dialogContext.tsx"
Cohesion: 0.18
Nodes (8): normalizePath(), Seo(), DialogProvider(), getActiveDialogFromPathname(), VALID_DIALOGS, useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 132 - "dialogUtils.ts"
Cohesion: 0.14
Nodes (13): mockDialogContext, mockSendEvent, TransProps, LanguageCode, languages, PageName, DIALOG_ROUTE_PATHS, languageRoutes (+5 more)

### Community 133 - "gridStore.ts"
Cohesion: 0.32
Nodes (3): createEmptyCell(), createGrid(), useUiStore

### Community 134 - "RecommendedBuild.stories.tsx"
Cohesion: 0.22
Nodes (6): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet

### Community 135 - "useOptimize.test.tsx"
Cohesion: 0.22
Nodes (8): mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore, mockUseTechStore, PlatformState, TechStore

### Community 136 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 137 - "useOptimizeStore"
Cohesion: 0.30
Nodes (6): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, useOptimizeStore

### Community 138 - "MobileToolbar.tsx"
Cohesion: 0.38
Nodes (4): MobileToolbar(), MobileToolbarProps, Default, Story

### Community 139 - "ConditionalTooltip.tsx"
Cohesion: 0.53
Nodes (3): ConditionalTooltip, ConditionalTooltipProps, useTooltipActions()

### Community 140 - "Logger"
Cohesion: 0.50
Nodes (5): App(), {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
}, useBuildFileManager(), useFileHandling(), Logger

### Community 141 - "BuildNameDialog.stories.tsx"
Cohesion: 0.50
Nodes (3): BuildNameDialog(), Default, Story

### Community 143 - "AppDialog.tsx"
Cohesion: 0.17
Nodes (16): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+8 more)

### Community 144 - "gridSerializer.ts"
Cohesion: 0.20
Nodes (14): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture, useGridDeserializer() (+6 more)

## Knowledge Gaps
- **432 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+427 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `tracking.ts`, `App.tsx`, `MarkdownContentRenderer.tsx`, `gridStore.ts`, `useTechTree.tsx`, `sessionCoordinator.ts`, `uiStore.ts`, `useRecommendedBuild.tsx`, `LifecycleCoordinator`, `bootstrap.ts`, `gridSerializer.ts`, `ShipSelectionProvider.tsx`, `lifecycleCoordinator.ts`, `techStore.ts`, `src/constants.ts`, `TechTree`, `useAnalytics`, `monitoring.ts`, `GridTableButtons.tsx`, `usePlatformStore`, `ShareLinkDialog.tsx`, `platformStore.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `gridStore.ts`, `RecommendedBuild.stories.tsx`, `useOptimize.test.tsx`, `sessionCoordinator.ts`, `useTechTree.tsx`, `MobileToolbar.tsx`, `uiStore.ts`, `Logger`, `useRecommendedBuild.tsx`, `bootstrap.ts`, `gridSerializer.ts`, `TechTree.tsx`, `techStore.ts`, `MainAppLayout.tsx`, `GridCell.tsx`, `TechTreeRow.tsx`, `useAnalytics`, `GridTableButtons.tsx`, `usePlatformStore`, `TechTreeRow.test.tsx`, `AppHeader.stories.tsx`, `MainAppContent.stories.tsx`, `preview.tsx`, `BuildNameContent.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `useBreakpoint`, `App.tsx`, `dialogUtils.ts`, `monitoring.ts`, `lifecycleCoordinator.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _432 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06180733162830349 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12096774193548387 - nodes in this community are weakly interconnected._
- **Should `MarkdownContentRenderer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05410628019323672 - nodes in this community are weakly interconnected._