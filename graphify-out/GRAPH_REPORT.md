# Graph Report - nms_optimizer-web  (2026-10-09)

## Corpus Check
- 451 files · ~208,529 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1739 nodes · 4205 edges · 136 communities (115 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 113 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f53d8384`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- performanceChart.tsx
- useTechTree.tsx
- tracking.ts
- useBreakpoint
- MarkdownContentRenderer.tsx
- ModuleSelectionDialog.tsx
- useMainAppLogic.tsx
- FakeCommandRunnerAdapter
- techStore.ts
- useGridStore
- page-metadata.js
- Logger
- TechTreePresetsCard.tsx
- LifecycleCoordinator
- uiStore.ts
- ModuleSelectionDialog.stories.tsx
- __init__.py
- applyValidationFeedback.ts
- monitoring.ts
- CliIssueTrackerAdapter
- agent.py
- No Man's Sky Technology Layout Optimizer (Web UI)
- UpdatePrompt.tsx
- userStatsData.tsx
- generate-sitemap.mjs
- OptimizationAlertDialog.tsx
- TechTreeRow.test.tsx
- useOptimize.tsx
- ErrorBoundary.tsx
- useTechStore
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
- TechTree.stories.tsx
- TechTreeRow.tsx
- pwa-config.test.mjs
- vite-plugin-markdown-bundle.mjs
- TechTree
- lifecycleCoordinator.ts
- RecommendedBuild.stories.tsx
- TechTreeSection.tsx
- generate-radix-colors.mjs
- GridTableButtons.tsx
- sentryMock.ts
- store-helpers.ts
- process_stream
- ConditionalTooltip.tsx
- create_screenshot_video.py
- update-lighthouse-history.mjs
- AppHeader.stories.tsx
- ShareLinkDialog.tsx
- environment.ts
- CliAgentRunnerAdapter
- useMarkdownContent.ts
- useTechTreeContext.ts
- youTubeEmbed.tsx
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
- OfflineBanner.stories.tsx
- reportWebVitals.ts
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
- useDialog
- Seo.tsx
- iconRegistry.ts
- gridStore.ts
- AppHeader.tsx
- routes.tsx
- usePlatformStore
- MainAppContent.stories.tsx
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

## Communities (136 total, 21 thin omitted)

### Community 0 - "performanceChart.tsx"
Cohesion: 0.07
Nodes (43): ACTIVE_DOT_STYLE, CHART_MARGIN, CHART_TICK_STYLE, ChartTooltipContent, ChartTooltipContentProps, MetricSummaryCardProps, OVERALL_DOT_STYLE, OVERALL_Y_DOMAIN (+35 more)

### Community 1 - "useTechTree.tsx"
Cohesion: 0.15
Nodes (19): API_URL, cache, fetchShipTypes(), ShipTypes, ShipTypesState, useShipTypesStore, MockGridStoreState, MockTechStoreState (+11 more)

### Community 2 - "tracking.ts"
Cohesion: 0.15
Nodes (19): AnalyticsEventParams, AnalyticsEventPayload, detectAdBlocker(), dispatchEvent(), env, getAdBlockerDetectionResult(), getClientId(), getGaClientIdFromCookie() (+11 more)

### Community 3 - "useBreakpoint"
Cohesion: 0.12
Nodes (17): ErrorContent(), ErrorContentProps, PageVariant, Story, WithComponentStack, WithErrorMessage, WithStackTrace, {
	markTutorialFinishedMock,
	mockResetGrid,
	mockSendEvent,
	mockSetIsSharedGrid,
	mockUpdateUrlForReset,
	mockUpdateUrlForShare,
	openDialogMock,
} (+9 more)

### Community 4 - "MarkdownContentRenderer.tsx"
Cohesion: 0.09
Nodes (5): H2Context, LazyReactMarkdown, MARKDOWN_COMPONENTS, MarkdownContentRendererProps, PrerenderedMarkdownRenderer

### Community 5 - "ModuleSelectionDialog.tsx"
Cohesion: 0.16
Nodes (16): MODULE_GROUP_ORDER, MODULE_RANK_ORDER, ModuleSelectionContext, ModuleSelectionContextValue, ModuleSelectionProvider(), DialogBody(), DialogFooter(), formatLabel() (+8 more)

### Community 6 - "useMainAppLogic.tsx"
Cohesion: 0.17
Nodes (19): MainAppProvider(), useMainAppBuildManagement(), mockShowInfo, useMainAppLogic(), AppLayout, useAppLayout(), ERROR_THRESHOLDS, useErrorDispatcher() (+11 more)

### Community 7 - "FakeCommandRunnerAdapter"
Cohesion: 0.18
Nodes (13): FakeAgentRunnerAdapter, FakeCommandRunnerAdapter, Fake AgentRunnerAdapter for testing., In-memory fake CommandRunnerAdapter for testing., AgentClient, High-level client for running the autonomous agent., VerificationResult, main() (+5 more)

### Community 8 - "techStore.ts"
Cohesion: 0.13
Nodes (16): mockCellState, createGrid(), createSerializedGrid(), mockNavigate, mockTechTreeData, computeBonusStatus(), sessionCoordinator, mockGridStore (+8 more)

### Community 9 - "useGridStore"
Cohesion: 0.13
Nodes (18): GridControlButtons(), RowControlButtonProps, selectHasAnyActiveCells(), mockActivateRow, mockDeActivateRow, useGridRowState(), GridProvider(), GridTable (+10 more)

### Community 10 - "page-metadata.js"
Cohesion: 0.17
Nodes (18): __dirname, DIST, FN_PATH, HYBRID_ROUTES, ROOT, DEFAULT_BASE_URL, DEFAULT_OG_IMAGE_PATH, extractContentHeading() (+10 more)

### Community 11 - "Logger"
Cohesion: 0.19
Nodes (13): App(), OfflineBanner, PerformanceRoute, RoutedDialogs, ShareLinkDialog, UserStatsRoute, WelcomeContent, {
	mockGetGridState,
	mockGetPlatformState,
	mockGetTechState,
	mockRestoreGridState,
	mockRestoreTechState,
	mockSetSelectedPlatform,
	mockSetTechState,
} (+5 more)

### Community 12 - "TechTreePresetsCard.tsx"
Cohesion: 0.22
Nodes (11): PresetCardItem(), PresetCardItemProps, PresetsCardContent(), PresetsCardContentProps, TechTreePresetsCard(), TechTreePresetsCardProps, mockHandleApply, mockHandleOpenInstructions (+3 more)

### Community 13 - "LifecycleCoordinator"
Cohesion: 0.11
Nodes (6): bootApp(), BootOptions, BootResult, DeferredTask, LifecycleCoordinator, LifecycleCoordinatorOptions

### Community 14 - "uiStore.ts"
Cohesion: 0.08
Nodes (27): ErrorContent(), ErrorDialog(), ErrorDialogProps, Default, Story, ErrorDisplay(), ErrorDisplayProps, ErrorMessageRenderer() (+19 more)

### Community 15 - "ModuleSelectionDialog.stories.tsx"
Cohesion: 0.14
Nodes (10): ModuleSelectionDialog, Corvette, Default, meta, Story, defaultProps, MockAppDialogProps, mockGroupedModules (+2 more)

### Community 16 - "__init__.py"
Cohesion: 0.12
Nodes (18): CommandRunnerAdapter, Interface for running OS commands., Execute a command. Returns (exit_code, stdout, stderr)., Real implementation of CommandRunnerAdapter using subprocess., SubprocessCommandRunnerAdapter, commit(), format_commit_message(), has_staged_changes() (+10 more)

### Community 17 - "applyValidationFeedback.ts"
Cohesion: 0.31
Nodes (7): applyValidationFeedback(), feedbackMap, ValidationReason, validateToggleActive(), validateToggleSupercharged(), ValidationResult, UiActions

### Community 18 - "monitoring.ts"
Cohesion: 0.19
Nodes (13): Root(), useThemeStore, handleFatalBootstrapError(), captureException(), createAppRouter(), initializeSentry(), LogEntry, LogLevel (+5 more)

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

### Community 26 - "TechTreeRow.test.tsx"
Cohesion: 0.14
Nodes (11): defaultProps, mockClearTechMaxBonus, mockClearTechSolvedBonus, mockResetGridTech, mockUseGridStore, mockUseModuleSelectionDialogStore, mockUseShakeStore, mockUseTechStore (+3 more)

### Community 27 - "useOptimize.tsx"
Cohesion: 0.11
Nodes (20): WS_URL, useLatest(), SCROLL_OPTIONS, mockCreateSocket, mockUseAnalytics, mockUseBreakpoint, mockUseGridStore, mockUsePlatformStore (+12 more)

### Community 28 - "ErrorBoundary.tsx"
Cohesion: 0.18
Nodes (5): ErrorBoundary, Props, State, handleError(), RouteError()

### Community 29 - "useTechStore"
Cohesion: 0.17
Nodes (15): GridShake(), GridShakeProps, GridTableRoot(), EMPTY_MODULES_ARRAY, SharedModuleSelectionDialog(), MockPresentationalProps, mockModules, useTechModuleManagement() (+7 more)

### Community 30 - "MainAppLayout.tsx"
Cohesion: 0.06
Nodes (47): MainAppContent(), MainAppGridSection(), BuildNameDialog, ErrorMessageRenderer, InstallPrompt, MainAppBackgroundServices(), MainAppFooter(), MainAppHeader() (+39 more)

### Community 31 - "dataValidation.ts"
Cohesion: 0.21
Nodes (12): SHIP_NAME_PREFIXES_COMPOUND, SHIP_NAME_PREFIXES_SIMPLE, SHIP_NAME_SUFFIXES, generateBuildNameWithType(), getShipTypeName(), SHIP_TYPE_NAMES, BuildFile, FILENAME_REGEX (+4 more)

### Community 32 - "AppFooter.tsx"
Cohesion: 0.17
Nodes (11): AppFooter, AppFooterContent(), AppFooterRating(), AppFooterRoot(), Desktop, Mobile, Story, Tablet (+3 more)

### Community 33 - "check-remote-sync.test.mjs"
Cohesion: 0.44
Nodes (7): checkRemoteSync(), getCurrentBranch(), getUpstreamInfo(), isForceOrDeletePush(), main(), __dirname, ROOT

### Community 34 - "gridSerializer.ts"
Cohesion: 0.31
Nodes (7): compressRLE(), decompressRLE(), deserialize(), GRID_SERIALIZATION_CONSTANTS, serialize(), fixturePath, nmsFixture

### Community 35 - "RoutedDialogs.integration.test.tsx"
Cohesion: 0.14
Nodes (14): getRoutedDialogs(), AppDialog, LoremIpsumSkeleton(), PerformanceDialog(), PerformanceDialogProps, UserStatsDialog(), UserStatsDialogProps, supportedLanguages (+6 more)

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

### Community 41 - "TechTree.stories.tsx"
Cohesion: 0.29
Nodes (4): Desktop, Mobile, Story, Tablet

### Community 42 - "TechTreeRow.tsx"
Cohesion: 0.19
Nodes (14): TechTreeSectionList(), useTechTree(), TechTreeRowContext, TechTreeRowContextValue, BonusStatusIcon(), BonusStatusIconProps, renderIcon(), TechTreeRow (+6 more)

### Community 43 - "pwa-config.test.mjs"
Cohesion: 0.33
Nodes (5): __dirname, DIST, MANIFEST_PATH, ROOT, SW_PATH

### Community 44 - "vite-plugin-markdown-bundle.mjs"
Cohesion: 0.15
Nodes (6): __dirname, LOCALES_DIR, markdownBundlePlugin(), COMPONENT_CSS_MAP, purgeRadixCss(), DEFAULT_SHORTCUT_ICONS

### Community 45 - "TechTree"
Cohesion: 0.20
Nodes (12): EmptyState(), EmptyStateProps, RecommendedBuildProps, RecommendedBuildContextValue, SharedModuleSelectionDialog, TechTree(), TechTreeProps, TechTreeContent() (+4 more)

### Community 46 - "lifecycleCoordinator.ts"
Cohesion: 0.23
Nodes (7): NotFound(), NotFound(), AppLifecyclePhase, DeferredTaskHandler, LifecycleListener, hideSplashScreenAndShowBackground(), SplashHider()

### Community 47 - "RecommendedBuild.stories.tsx"
Cohesion: 0.19
Nodes (10): RecommendedBuild(), Desktop, Mobile, mockTechTree, Story, Tablet, RecommendedBuildButton(), RecommendedBuildInfo() (+2 more)

### Community 48 - "TechTreeSection.tsx"
Cohesion: 0.38
Nodes (4): TechTreeSection(), TechTreeSectionProps, TechTreeSectionHeader(), TypeImageMap

### Community 49 - "generate-radix-colors.mjs"
Cohesion: 0.17
Nodes (10): ALL_RADIX_COLORS, baseInputPath, colors, concatenatedContent, concatenatedPath, __dirname, optimizedColorContents, outputDir (+2 more)

### Community 50 - "GridTableButtons.tsx"
Cohesion: 0.22
Nodes (9): GridContext, GridContextValue, useGridContext(), BuildNameDialog, GridTableButtons(), GridTableButtonsProps, SCROLL_OPTIONS, useScreenshot() (+1 more)

### Community 52 - "store-helpers.ts"
Cohesion: 0.30
Nodes (5): getShakeCount(), resetGrid(), waitForOptimization(), waitForStore(), waitForTechTree()

### Community 53 - "process_stream"
Cohesion: 0.38
Nodes (6): format_tool_detail(), main(), process_stream(), Any, Extract a concise, human-readable summary of tool arguments., Process an NDJSON stream from agy and format it to out (default: sys.stdout).

### Community 54 - "ConditionalTooltip.tsx"
Cohesion: 0.21
Nodes (11): ConditionalTooltip, ConditionalTooltipProps, TooltipManager(), TooltipProvider(), isTouchDevice(), TooltipActions, TooltipActionsContext, TooltipState (+3 more)

### Community 55 - "create_screenshot_video.py"
Cohesion: 0.29
Nodes (9): calculate_durations(), create_video(), extract_versions(), get_screenshot_history(), main(), Create video with crossfades by pre-rendering each transition., Get all commits that modified the screenshot in reverse chronological order., Extract each version of the screenshot from git history. (+1 more)

### Community 56 - "update-lighthouse-history.mjs"
Cohesion: 0.20
Nodes (9): dataPath, existingIndex, fontsDestDir, history, manifest, manifestPath, newData, reportPath (+1 more)

### Community 57 - "AppHeader.stories.tsx"
Cohesion: 0.25
Nodes (5): AppHeader, Desktop, Mobile, Story, Tablet

### Community 58 - "ShareLinkDialog.tsx"
Cohesion: 0.27
Nodes (5): ShareLinkContent(), ShareLinkContentProps, mockClipboard, ShareLinkDialog(), ShareLinkDialogProps

### Community 59 - "environment.ts"
Cohesion: 0.06
Nodes (41): BeforeInstallPromptEvent, INSTALL_PROMPT_DISMISSED_KEY, InstallPrompt(), Default, Story, USER_VISIT_KEY, NmsToast(), Default (+33 more)

### Community 60 - "CliAgentRunnerAdapter"
Cohesion: 0.14
Nodes (8): Protocol, AgentRunnerAdapter, CliAgentRunnerAdapter, model_supports_effort(), Interface for invoking the autonomous agent., Run the agent with a prompt. Returns True if successful., Check if a model identifier accepts the --effort flag in agy., Real adapter running `agy` and formatting the NDJSON stream in-process.

### Community 61 - "useMarkdownContent.ts"
Cohesion: 0.43
Nodes (4): MarkdownContentRenderer(), MarkdownContentState, useMarkdownContent(), Window

### Community 62 - "useTechTreeContext.ts"
Cohesion: 0.50
Nodes (3): TechTreeProvider(), TechTreeContext, TechTreeContextValue

### Community 64 - "generate-ssg.mjs"
Cohesion: 0.23
Nodes (12): DIST_DIR, extractSsgTemplate(), FONTS_CSS_PATH, generateNavigationLinks(), generatePage(), generateSeoTags(), generateSsg(), initI18n() (+4 more)

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

### Community 77 - "OfflineBanner.stories.tsx"
Cohesion: 0.47
Nodes (3): OfflineBanner(), Offline, Story

### Community 78 - "reportWebVitals.ts"
Cohesion: 0.43
Nodes (5): GA4Event, reportTBT(), reportWebVitals(), SendEventFunction, sendVitalsMetric()

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

### Community 121 - "useAnalytics"
Cohesion: 0.28
Nodes (8): BuyMeACoffee(), UpdatePrompt, UpdatePromptWrapper(), useAnalytics(), UseSaveBuildReturn, useUpdateCheck(), sendDeferredEvent(), sendEvent()

### Community 130 - "useDialog"
Cohesion: 0.08
Nodes (30): AppContent(), BuildNameContent(), BuildNameContentProps, DynamicRadixIcon(), DynamicRadixIconProps, mockDialogContext, mockSendEvent, TransProps (+22 more)

### Community 131 - "Seo.tsx"
Cohesion: 0.21
Nodes (8): getLocalizedSchema(), OG_LOCALE_MAP, resolveAppVersion(), normalizePath(), Seo(), useLanguage(), getSupportedLanguages(), useSupportedLanguages()

### Community 132 - "iconRegistry.ts"
Cohesion: 0.29
Nodes (6): DialogIconAndStyle, iconMap, iconStyle, radixIconRegistry, staticIconMap, staticIconStyle

### Community 133 - "gridStore.ts"
Cohesion: 0.18
Nodes (12): createCellFromModuleData(), createEmptyCell(), createGrid(), resetCellContent(), Grid, GridActions, GridComputed, GridState (+4 more)

### Community 136 - "AppHeader.tsx"
Cohesion: 0.20
Nodes (9): AppHeaderAccessibilityToggle(), AppHeaderChangelogButton(), AppHeaderContainer(), AppHeaderLogo(), AppHeaderPerformanceButton(), AppHeaderSubtitle(), AppHeaderUserStatsButton(), EasterEggCoordinates (+1 more)

### Community 137 - "routes.tsx"
Cohesion: 0.33
Nodes (5): languages, DIALOG_ROUTE_PATHS, languageRoutes, pageRoutes, routes

### Community 138 - "usePlatformStore"
Cohesion: 0.18
Nodes (16): ShipSelectionProvider(), ShipSelectionProviderProps, TechTreeRoot(), TechTreeRootProps, RouteContext, RouteContextType, useRouteContext(), useGridDeserializer() (+8 more)

### Community 139 - "MainAppContent.stories.tsx"
Cohesion: 0.29
Nodes (5): Desktop, Mobile, Story, StorybookWrapper(), Tablet

### Community 143 - "AppDialog.tsx"
Cohesion: 0.13
Nodes (20): getPageByDialogTitleKey(), getPageById(), AppDialogBody(), AppDialogBodyProps, AppDialogContext, AppDialogContextValue, AppDialogFooter(), AppDialogFooterProps (+12 more)

## Knowledge Gaps
- **435 isolated node(s):** `BackgroundWrapperProps`, `config`, `customViewports`, `globalTypes`, `preview` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Logger` connect `Logger` to `useTechTree.tsx`, `useDialog`, `useBreakpoint`, `tracking.ts`, `gridStore.ts`, `useMainAppLogic.tsx`, `techStore.ts`, `usePlatformStore`, `LifecycleCoordinator`, `monitoring.ts`, `useOptimize.tsx`, `ErrorBoundary.tsx`, `useTechStore`, `dataValidation.ts`, `gridSerializer.ts`, `GridCell.tsx`, `TechTree`, `lifecycleCoordinator.ts`, `GridTableButtons.tsx`, `ShareLinkDialog.tsx`, `environment.ts`, `useMarkdownContent.ts`, `reportWebVitals.ts`, `useAnalytics`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `useGridStore` connect `useGridStore` to `useTechTree.tsx`, `useDialog`, `useBreakpoint`, `gridStore.ts`, `useMainAppLogic.tsx`, `techStore.ts`, `usePlatformStore`, `MainAppContent.stories.tsx`, `Logger`, `TechTreeRow.test.tsx`, `useOptimize.tsx`, `useTechStore`, `MainAppLayout.tsx`, `GridCell.tsx`, `TechTree`, `RecommendedBuild.stories.tsx`, `GridTableButtons.tsx`, `AppHeader.stories.tsx`, `environment.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `LifecycleCoordinator` connect `LifecycleCoordinator` to `tracking.ts`, `routes.tsx`, `Logger`, `lifecycleCoordinator.ts`, `monitoring.ts`, `ErrorBoundary.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `BackgroundWrapperProps`, `config`, `customViewports` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `performanceChart.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06845238095238096 - nodes in this community are weakly interconnected._
- **Should `tracking.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._
- **Should `useBreakpoint` be split into smaller, more focused modules?**
  _Cohesion score 0.11553030303030302 - nodes in this community are weakly interconnected._