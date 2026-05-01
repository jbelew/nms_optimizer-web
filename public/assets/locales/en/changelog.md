# NMS Optimizer Changelog: Latest Updates, Features & Improvements

The full commit history for this project is available on [GitHub](https://github.com/jbelew/nms_optimizer-web/blob/main/CHANGELOG.md).

---

## Version 7.0 (2026-05-01)

This update brings full Italian language support and a lot of under-the-hood work to make the app load faster and feel more stable. 

**Please note:** This will be our last planned release until the game makes major changes to its core mechanics.

- **Italian Translation:** The app is now fully translated into Italian.
- **Faster Loading:** We moved pop-up dialogs and CSS to load on-demand instead of blocking the main page. The app should load noticeably faster from a cold start.
- **Visual Fixes:** Fixed the brief "flash of unstyled content" that happened on slower connections, and stopped the page layout from jumping around as things load in. 
- **Focus Mode:** Tweaked the desktop background to improve contrast for Focus Mode users.
- **Privacy & Ad-Blockers:** The app now runs smoothly even with strict privacy settings or ad-blockers enabled, and the site icon displays reliably in incognito mode.
- **Update Prompts:** You'll now get a small notification when a new version is out so you know when to refresh.

## Version 6.34 – SEO & Page Title Synchronization (2026-04-20)

This update refines how the app presents itself to search engines and users, ensuring consistent page titles across the experience.

- **Consistent Titles:** Standardized page titles across the app and automated H1 synchronization so the title you see always matches the page content perfectly.
- **Visual Stability:** Fixed an issue where the background styles could be temporarily lost during the initial page load.

## Version 6.33 – SEO Schema & Translation Polish (2026-04-18)

This update focuses on making the app's structural data more accessible to international search engines and fixing some translation edge cases.

- **Localized Search Data:** Added localized FAQ schemas to help global search engines better understand the app's content in different languages.
- **Translation Fixes:** Repaired several translation issues, ensured missing values are handled gracefully, and cleaned up how the app's version is displayed.

## Version 6.32 – Application Resilience & Stability (2026-04-18)

This update focuses on eliminating loading errors and improving cache behavior after a new version of the app is released.

- **Robust Caching:** Fixed overlapping edge cache rules to ensure you always receive the latest assets without running into stale data.
- **Smoother Upgrades:** Improved the recovery flow when loading old cached versions of the app, eliminating annoying reload loops.

## Version 6.31 – Delivery Pipeline Optimizations (2026-04-18)

This update hardens the app's delivery pipeline to ensure a smoother and more reliable experience.

- **Delivery Pipeline:** Optimized how the app is delivered from the edge, making the initial load more robust against network interruptions and caching issues.

## Version 6.30 – Recovery & Resilience (2026-04-17)

This update introduces a new safety net to help users recover if the application fails to start correctly.

- **Initialization Recovery UI:** Implemented a new isolated recovery screen that helps you safely reload the app if a strict ad-blocker or network error prevents the app from starting up.

## Version 6.29 – Dashboard Enhancements (2026-04-17)

This minor update improves the usability of the github hosted performance dashboard.

- **Audit Log Polish:** Streamlined the performance dashboard by limiting the audit table to the 10 most recent runs and adding direct links to the relevant code commits.

## Version 6.28 – Performance Polish & Build Sharing (2026-04-17)

This update delivers massive under-the-hood speed improvements, layout-sharing enhancements, and a handful of stability fixes.

- **Lightning Fast Loading:** Completely overhauled how the app is delivered to your browser, heavily optimizing edge-caching to result in near-instant load times.
- **Shared Grids:** Restored the ability to view technology tooltips seamlessly when inspecting a grid shared by another player.
- **Link Stability:** Polished our URL sharing logic so that returning to your bookmarked builds feels smoother and safer.

## Version 6.24 – AI-Powered Localization (2026-04-11)

This update introduces a major overhaul of our translation system along with terminology improvements for better global consistency.

- **Gemini-AI Translations:** Migrated to a new automated translation workflow powered by Gemini 2.5 Flash. This ensures higher-quality, context-aware translations for all supported languages.
- **Terminology Polish:** Standardized game-specific terms like "Supercharged Slot" across all supported languages for a more consistent experience.
- **Global Discovery:** Added international SEO improvements so players around the world can more easily find the app in their native language.

## Version 6.21 – UI Polish & Sharp Visuals (2026-04-08)

This update focuses on visual refinements and performance insights for a better cross-device experience.

- **SVG Branding:** Switched to a high-quality SVG logo for sharper visuals on high-resolution screens.
- **Header Refinements:** Polished the header styling and layout dimensions for better consistency across different screen sizes.
- **Performance Insights:** Added specialized performance monitoring to ensure a smooth experience for our growing mobile community.

## Version 6.19 – Performance & Optimization (2026-04-05)

A deep-dive optimization update that makes the app feel faster and more responsive from the moment it loads.

- **Lightning Startup:** Implemented high-priority preloading for game data (platforms and technology trees), significantly reducing the time it takes to get to your first solve.
- **Improved Backgrounds:** Refined the background visibility logic and updated CSS selectors for a more immersive and reliable visual experience.
- **Visual Feedback:** Added new icons and refined styles for error messages and dialog content to provide clearer feedback when things go wrong.

## Version 6.18 – Build Screenshots & Polish (2026-03-27)

This update introduces a new feature for sharing your builds, along with several smaller improvements to translations and app stability.

- **Grid Screenshots:** A new screenshot tool lets you easily capture high-quality, attributed images of your optimized grid layouts. _(Note: This tool is temporarily disabled on the mobile web-app toolbar while we fix a compatibility issue)._
- **Clearer Instructions:** Improved the optimization and module selection descriptions across all supported languages.
- **Global Discovery:** Added international SEO improvements so players around the world can more easily find the app in their native language.
- **Rendering & Stability:** Fixed a timing bug related to loading text content, updated privacy dialog icons for better clarity, and upgraded various internal systems.

## Version 6.17 – Privacy & Focus Mode Discovery (2026-03-16)

This update focuses on making the app more transparent and its accessibility features easier to find.

- **Privacy Policy:** Added a dedicated Privacy Policy so you know exactly how we protect your information.
- **Focus Mode Discovery:** Added Focus Mode to the Welcome dialog to help new users find our readability improvements right away.
- **Transition Polish:** Smoothed out the transition from the loading screen to the app for a faster, cleaner startup.

## Version 6.16 – Smooth Interactions & Safari Support (2026-03-15)

A major performance and reliability update that makes the app feel faster and work better in more browser environments.

- **Safari Private Browsing:** Fixed a critical bug that caused the app to crash for users in Safari's Private Browsing mode.
- **Faster Loading:** Significantly improved startup times and navigation speed, especially on mobile, through better image handling and smarter caching.
- **Better Reliability:** Added automatic retries for loading app components. If your internet connection flickers, the app will now try to recover automatically instead of failing.
- **Consistent Tooltips:** Overhauled the tooltip system to ensure information always appears correctly and follows your interactions perfectly.
- **Search Engine Visibility:** Improved how the app presents itself to search engines, making it easier for the No Man's Sky community to find the tool.

## Version 6.15 – Notification Polish (2026-03-07)

- **Polished Notifications:** Updated the look and feel of the "toast" notifications that appear when saving, loading, or optimizing your builds.
- **General Cleanup:** Internal performance improvements to keep the app running smoothly as we prepare for future features.

## Version 6.14 – Onboarding, Stability & Infrastructure Refinements (2026-02-28)

This release introduces a new first-run onboarding experience, alongside a large set of stability, reliability, and performance improvements across optimization workflows, URL synchronization, storage handling, observability, and error recovery.

- Added a new **welcome dialog** to better orient first-time users and explain core functionality.
- Improved **optimization workflow stability**, including safer async handling, stronger WebSocket lifecycle management, and protection against race conditions and duplicate requests.
- Significantly enhanced **URL synchronization and navigation reliability**, reducing desynchronization, unnecessary re-renders, and history-related edge cases.
- Improved **error handling and recovery** across the app:
    - Safer localStorage and IndexedDB access with defensive checks.
    - Reduced unhandled promise rejections and state updates on unmounted components.
    - Clearer handling of cross-origin and browser security errors.
- Refined **instructional and help text** for improved clarity, readability, and conciseness.
- Continued **performance optimizations**, including improved bundle chunking, lazy loading, and reduced non-critical runtime overhead.
- Major **observability and monitoring refinements**, which surfaced a number of real-world issues that were not reproducible through local testing alone:
    - Improved release tracking and version detection.
    - Tuned performance and profiling sample rates for production.
    - Simplified monitoring setup by removing unnecessary integrations and dashboards.
- Improved **build, deployment, and infrastructure configuration**, including better environment handling, safer script loading, and more reliable CI diagnostics.

This update focuses on robustness and polish—reducing friction during everyday use while strengthening the underlying systems that support optimization, navigation, and long-running sessions.

## Version 6.8 – Remnant Update (2026-02-17)

- Added technology modules originally introduced in v6.2.
- Updated Starship Trails solves to reflect revised adjacency bonus behavior.
- Added text labels to Starship Trails grid images for improved usability.
- Improved error handling and user-visible messaging when the Web UI cannot connect to the API service layer.
- Updated adjacency bonus indicators across most Exocraft solutions.

## Version 6.7 – Grid Logic Enhancements, Stability & Performance (2026-02-07)

This update introduces a small but important grid-behavior enhancement, alongside continued refinements to guidance, performance, analytics reliability, and overall stability.

- Introduced improved **grid-cell grouping logic**, enabling more accurate handling of adjacent cell behaviors in complex layouts.
- Added clearer **instructional text during module selection**, helping players better understand required actions before making changes.
- Fixed incorrect **launch thruster labeling for Corvettes**, ensuring ship modules are accurately identified.
- Improved **URL sync and back-navigation behavior**, preventing grid desynchronization when navigating history.
- Refined **module labels and Starship Trails guidance** for better clarity and consistency.
- Expanded **localization and SEO support**, including Portuguese language structured data fixes.
- Improved **analytics reliability and error handling**, with better ad-blocker detection and corrected event timing.
- Enhanced **security configuration**, ensuring required third-party services load correctly under strict content policies.
- Continued **performance improvements**, including:
    - Faster initial page load and improved Largest Contentful Paint (LCP).
    - Optimized bundle chunking and CSS delivery.
    - Deferred non-critical analytics events to keep the UI responsive.

This release continues the focus on polish and correctness, reducing friction in everyday use while laying groundwork for future grid and layout features.

## Version 6.6 – Supercharged Slot Limits & Constraint Messages (2025-12-19)

This update focuses on clarity around supercharged and fixed cells, with new error messages and improved guidance for grid constraints.

- Added **constraint messages** for supercharged and fixed slots:
    - Maximum of four supercharged slots allowed.
    - Supercharged slots for **Exocraft and Exosuits** cannot be changed.
    - Slots containing modules cannot be changed; remove the module group first.
    - Supercharged slots can only be placed in the first four rows.
    - Fixed Exocraft slot locations cannot be modified.
- Refined **grid-cell feedback**, so players see instant responses when actions are unavailable.
- Enhanced **accessibility**, including wrapping bonus icons in buttons for better keyboard and screen reader support.
- Minor **performance and responsiveness improvements** across the UI.

## Version 6.5 – UI Clarity & Mobile Improvements (2025-12-09)

This update focuses on cleaner visuals, better mobile behavior, and clearer messaging in shared layouts.

- Added a clear read-only notice when viewing shared builds.
- Improved grid-cell interactions and overall tap responsiveness.
- Updated blurred background assets for better consistency on mobile.
- Refined accessibility-font mode for stronger contrast.
- Improved error screens, ensuring backgrounds render correctly on mobile.
- Polished headings, image visibility, and spacing across the UI.

## Version 6.4 – UI Polish & Mobile Stability Improvements (2025-12-02)

This update delivers a series of visual refinements and stability fixes across the app, with a focus on visual consistancy and mobile usability.

- Improved mobile rendering stability and toolbar responsiveness.
- Incorporated Storybook into the development process to improve visual testing capabilities.
- Updated panel styling with cleaner spacing, subtle shadows, and new translucent panels.
- Enhanced visibility of supercharged slots with responsive borders.
- Refined UI sizing, spacing, and overall visual consistency.
- Fixed an issue where the splash screen could remain visible during errors.
- Improved Tech Tree responsiveness and shared-grid interactions.

## Version 6.3 – Improved Mobile Rendering Stability (2025-11-29)

This update focuses on making the app far more stable and consistent on mobile devices—especially Safari and Chrome on iOS.

- Fixed several iOS zoom and rendering issues, including a GPU acceleration glitch that caused visual artifacts during pinch-zoom.
- Removed a CSS optimization that caused grid cells to **disappear or flicker** when zooming on mobile.
- Restored visibility for an internal grid element that wasn’t rendering correctly.
- Optimized background images to reduce memory usage and improve load times on mobile.
- Improved internal store behavior and expanded test coverage for better long-term stability.

## Version 6.1 – Improved State Saving & UI Stability (2025-11-24)

- Saved builds now **store the full UI state**, so layouts reload exactly as they were when saved.
- Fixed a rare issue where **“Force Optimize” could fail to produce a solve**.
- Improved mobile toolbar behavior with **smoother scrolling and fewer false triggers**.
- Corrected dialog icons and cleaned up minor typography issues.
- Performance improved by splitting analytics and real-time services into lighter, lazy-loaded chunks.

## Version 6.0 – Local Build Saving & Major Performance Improvements (2025-11-23)

- You can now **save, load, and manage builds locally**, making it easy to keep backups of your favorite layouts and switch between them without re-entering everything.
- Improved performance and caching across the entire app, resulting in faster loading—especially on repeat visits.
- Fonts and static assets now load more efficiently for smoother startup.
- The backend optimization engine received major stability and correctness updates, including:
-   - Better module placement to minimize wasted space on the grid.
    - More reliable handling of missing or unusual module data.
    - More robust solving logic across different grid sizes.
    - Expanded automated test coverage to ensure better long-term stability and fewer regressions.

## Version 5.13 - New Artwork (2025-11-21)

- Added a brand new background image! The old one was something I “found,” and I wasn't giving proper credit to the creator, so now the art is clean and original. I also put together a quick video showing a visual history of the app.

[youtube:nGbHf9fQmds]

## Version 5.12 – Supercharge Limits & Touch Improvements (2025-11-20)

- Limited supercharge slot placement to the first 4 rows of the grid for better gameplay balance.
- Fixed touch interactions that could occasionally get stuck after canceling a tap.
- Improved responsiveness of touch interactions on mobile devices.
- Fixed a rare issue where blocked module placements wouldn't provide feedback.

## Version 5.11 – Blocked Module Feedback (2025-11-19)

- Added visual shake feedback when attempting to place a module on a blocked cell.
- Prevented accidental state changes when interacting with blocked cells.

## Version 5.10 – Static Markdown Pages & SEO Improvements (2025-11-18)

- Added static site generation for all markdown pages (`/about`, `/instructions`, `/changelog`, etc.).
- Pages now ship with pre-rendered HTML for faster first load and better SEO.
- Includes graceful client-side hydration when dynamic rendering is needed.

## Version 5.9 – Enhanced Bot Detection & SEO Improvements (2025-11-18)

- Improved splash-screen behavior for bots and crawlers to ensure correct rendering and telemetry.
- Optimized initial page render when accessed by search engines for better SEO performance.

## Version 5.8 – Centralized Data Fetching & Error Handling (2025-11-18)

- Introduced a unified data-fetching system with built-in timeout and error handling.
- Lays groundwork for smarter caching and prefetching in future releases.

## Version 5.7 – Performance, Animation & UI Fixes (2025-11-17)

- Refined grid-cell glow effects for smoother, cleaner animations.
- Corrected glow behavior on white accent cells.
- Reduced layout shift in the User Stats dialog by fixing skeleton height.
- Switched to a subsetted Raleway font to reduce font-load overhead.

## Version 5.6 – Build-Time Optimizations & Layout Fixes (2025-11-15/16)

- Preloaded key font assets to improve perceived load time.
- Removed console and debug statements from production builds to shrink bundle size.
- Improved global performance through profiling and architectural cleanup.
- Updated layout units (`dvw`) and adjusted header styling to fix mobile spacing issues.

## Version 5.5 – Update Prompt, Mobile Toolbar & Performance Improvements (2025-11-15)

- Introduced a dedicated **toolbar on mobile devices**, increasing hotspot/tap target sizes for easier interaction.
- Applied consistant styling to the **Update Prompt** dialog.
- Improved grid rendering performance through hardware acceleration.
- Optimized UI animations to run on the GPU for smoother responsiveness.
- Fixed mobile scrolling and layout issues related to the new toolbar.

## Version 5.4 – Loading Optimizations & Corvette Fix (2025-11-14/15)

- Improved preload priority for translation files to speed up localization on first load.
- Optimized critical asset loading for faster startup.
- Re-enabled the corvette selection toast warning. Come on HG! Fix it!

## Version 5.3 – Improved PWA & Trail Update Fixes (2025-11-13)

- Added a more complete Service Worker for improved offline reliability and correct caching of core files (`sw.js`, `index.html`).
- Improved iOS update detection to prevent false “new version available” prompts.
- Added several new starship trail types and included corresponding images.
- Fixed multiple issues in starship trail definitions, including corruption introduced during the earlier trail update.
- Corrected shield classification (greater vs. lesser) and resolved related scoring issues.
- Increased most living-ship technology module windows to **2×3** to better support supercharge slot usage.

## Version 5.2 – Major iOS Service Worker Recovery (2025-11-11)

- Added GA4-compliant analytics event names.
- Implemented multiple patches to recover from iOS Service Worker corruption:
    - Forced unregister for corrupted SWs
    - Temporary PWA disablement on iOS
    - Updated splash screen behavior
    - Added reliability guards to prevent offline lockouts
- Improved image optimization and caching for static API responses.
- Fixed issues with i18n routing, deserialization, toasts, and layout instability.
- Updated corvette solve maps for more accurate scoring.

## Version 5.1 – Stability & Tooling Improvements (2025-11-08)

- Added full Lighthouse CI integration for automated performance audits.
- Introduced a proper 404 page.
- Fixed CSP rules, CSS overflow behavior, and several Lighthouse configuration issues.

## Version 5.0 (2025-11-06)

### 🚀 Major Update

Version 5 introduces a complete solver overhaul focused on speed, accuracy, and long-term maintainability.

- The core solver has been **rebuilt in Rust ⚡**, making it **38× faster** and capable of running deeper optimization passes.
- Solve quality has improved significantly, especially for complex layouts and custom module sets.
- Many internal systems have been cleaned up and modularized for more reliable and predictable results.

### 🧠 Improvements

- More consistent solves through better pattern matching and refinement logic.
- Improved handling of special cases like partial module sets and custom solve maps.
- New ML models for Corvettes.
- More stable randomization and reproducible solve results.

### 🛠 Fixes

- Fixed several bugs affecting specific ship types and hyperdrive configurations.
- Addressed rare cases where solve maps couldn't be found or reused correctly.
- General polish, stability, and performance improvements throughout.

## Version 4.8.0 (2025-10-25)

- Implemented PWA Service Workers for (hopefully) better Android performance.

## Version 4.7.0 (2025-10-25)

- Updated Corvette weapon systems for v6.1 **Breach**.

## Version 4.4.0 (2025-10-20)

- Added **Dependabot configuration** to automate dependency updates and run tests on pull requests.
- Various **CI improvements**, including Docker build fixes, version injection at build time, and proper semantic versioning support.
- **Accessibility fixes** to ensure full Lighthouse score in Focus Mode.
- Updated fonts to match project settings.
- Fixed changelog links and content.

## Version 4.3.0 (2025-10-17)

- Added **Focus Mode**, an accessibility feature that enhances readability for all users, including those with dyslexia or other reading and visual challenges, by using Atkinson Hyperlegible Next, a typeface developed by the Braille Institute.

## Version 4.2.0 (2025-10-15)

- Improved input responsiveness (INP), including Tech Tree buttons.
- Removed deprecated Tech Tree “accordion” functionality and code.
- Ported custom CSS to SCSS for better maintainability.
- Implemented initial CSP support for improved security.
- Updated Cache-Control headers for better caching behavior.
- Fixed Docker build issues for smoother container setup.

## Version 4.1.0 (2025-09-28)

- Improved Module Selection Dialog interactions.
- Added full AI model for corrected Bolt-caster layout.
- Numerous minor bug fixes and UI improvements.

## Version 4.0.1 (2025-09-26)

- Fixed a mapping issue with Corvettes and the Weaponry ML models.
- Corrected a regression in Bolt-caster module data that impacted solve quality.
- Improved progress visualization for simulated annealing reheat operations.
- Optimized simulated annealing parameters to reduce solve times.
- Additional messaging and UI improvements.

## Version 4.0 (2025-09-25)

- Added the ability to choose which modules are included in a solve.
- Improved simulated annealing for faster performance and better solve quality.
- ~~Expanded training data for the Corvette Hyperdrive ML model to **36k samples**, aiming for higher accuracy with this complex layout~~.
- Removed the Corvette Hyperdrive ML model. The layout is just too complex and causing server timeout issues.

## Version 3.15 (2025-09-23)

- Refactored ML model architecture to improve solve accuracy.
- Rebuilt all models with full, 16k datasets.

## Version 3.14 (2025-09-22)

- Updated language selection to use routes instead of query parameters.

## Version 3.13 (2025-09-16)

- Added support for **Portuguese**
- Completed a thorough audit of existing translations
- Set up Crowdin integration for user-submitted translations

## Version 3.12 (2025-09-10)

- Refactored and cleaned-up the services layer.
- Added initial 8k models for Corvette "propulsion" systems ... Hyper, Launch, Pulse, and Photonix.

## Version 3.11 (2025-09-06)

- Corvettes now support both **cosmetic** and **min/max** solves.
  _Note: space is limited, so you'll only be able to fit two or three min/max solves — choose carefully!_

## Version 3.10 (2025-09-02)

- Added **beta support for Corvettes**. Right now, space is too limited to allow even a partial build using the current approach, but this update lays the groundwork. I'll be exploring solutions that don't disrupt the existing models and ML functionality over the next few days, so check back soon.

## Corvettes Coming Soon (2025-08-31)

I thought I was finished here... **until Corvettes showed up**. Once the bugs around Corvette technology are sorted (and there are plenty right now), I'll build the new models and roll out a release.

## Version 3.9 (2025-08-24)

- Optimization now runs over WebSockets, providing real-time progress updates directly in the UI.

## Version 3.8 (2025-08-20)

### Bug Fixes

- Fixed missing custom 404 page and improved its error styling.
- Improved app layout responsiveness and removed dynamic width glitches.
- Fixed callout sizing issues, especially in landscape mode.
- Corrected dialog content targeting and grid cell tap behavior.
- Fixed sidebar image proportions and skeleton loading on mobile.
- Improved spinner behavior on shared grid URLs.
- Better mobile experience for slower devices.
- Fixed preload strategy, cache headers, and responsive layout quirks.
- Updated techtree category images with missing `srcset`.

### Performance Improvements

- Refined critical CSS loading strategy.
- Optimized dialog and markdown loading with skeletons and lazy loading.
- Improved hook click handlers and background preload.
- Enhanced lazy loading for images and content.
- Updated server cache settings for faster loads.
- Adjusted splash screen timing for smoother techtree loading.

## Version 3.7 (2025-08-09)

- Improved SEO with dynamic meta tags and updated keywords.
- Added analytics tracking for Photonix Core solves.
- Improved input delay, rendering, and layout performance throughout the app.
- Optimized Tech Tree state management for better responsiveness.
- Fixed a spelling error in Pulse Spitter tech.
- Made user statistics accessible via a dedicated route.
- Added UI styling improvements.

## Version 3.6 (2025-08-07)

- Added a **User Statistics** dialog showing which technologies are most frequently supercharged.
- Added instructional text below the grid for users on touch devices.
- Fixed a major issue in the Pulse Engine CNN model.
- Various UI enhancements and improvements.

## Version 3.5 (2025-08-05)

- **performance:** Removed Critical CSS functionality from the build ([956ea38](https://github.com/jbelew/nms_optimizer-web/commit/956ea38a002b27e84a227872436b599a0fd8ebf9))
- **scoring:** Added support for group adjacency across multiple tech types ([bac995b](https://github.com/jbelew/nms_optimizer-web/commit/bac995bec9ef2ed06fc439057354f681051a07e3))

## Version 3.4 (2025-07-31)

- Updated mobile grid cell interations.
- Updated Google Analytics implementation.
- Improved performance of empty grid cell rendering.
- Fixed test issues related to GridCell interactions.

## Version 3.3 (2025-07-30)

- Updated grid presentation.
- Corrected issues with Sentinel Multi-tools and the Minotaur AI build.

## Version 3.2 (2025-07-26)

- Final UI pass to standardize color usage and component presentation.
- Added solve score percentages to tooltips on solve quality icons.
- Simplified CSS to mitigate a hardware acceleration bug in Chrome.
- Added a section on "Recommended Builds" to the Instructions dialog.

## Version 3.1 (2025-07-24)

**It's a wrap, my work is done here!**

- Completed a final pass to ensure complete data consistency flow from API to grid display.
- Fixed lingering bugs related to `localStorage` behavior.
- Traced and identified a persistent crash issue—ultimately caused by a driver/Chrome hardware acceleration conflict.

## Version 3.0 (2025-07-20)

- Removed dynamic sizing feature due to instability and infinite loop issues.
- Fixed multiple test failures and refined TechTree store logic.
- Improved consistency in grid types and corrected various spelling errors.
- Cleaned up console logs and removed unnecessary visual elements (e.g. double shadow).
- Refactored and streamlined store-related code.
- Added a "Share Grid" dialog interstitial and refactored dialog boxes to ensure common presentation.

## Version 3.0. RC2 (2025-07-17)

- Increased solve window size for Bolt Caster from 3x3 to 3x4 based on user feedback.
- Updated recommended Exosuit build.

## Version 3.0. RC1 (2025-07-17)

- Fixed a browser crash caused by a numeric precision issue in Radix UI.
- Refined mobile interaction patterns on the grid to account for changes in iOS long-press behavior.
- Applied numerous UI fixes and visual enhancements.
- Updated translation files to reflect recent changes and new features.

## Version 3.0.0 beta 5 (2025-07-16)

- Refactored localStorage logic to improve reliability and consistency across sessions.

## Version 3.0.0 beta 4 (2025-07-15)

- Refactored stores and hooks for significantly improved memory usage and performance.
- Improved placement of the "Recommended Build" button for better visibility and accessibility.
- Enhanced visual presentation of TechTree badges.

## Version 3.0.0 beta 3 (2025-07-14)

- Added module count indicator for each technology type.
- Addressed untrapped loop that was causing browser crashes.
- Updated translation files.

## Version 3.0.0 beta 2 (2025-07-14)

- Added support for mutliple recommended builds per platform.
- Added missing category icon assets.
- Corrected some typos on label text elements.

## Version 3.0.0 beta (2025-07-13)

- Added experimental support for Exosuits and Exocraft.
- Lot's of code clean-up and refactoring.

## Version 2.9.4 (2025-07-08)

- Replaced AI German translations with proper human-reviewed versions, courtesy of **Slathibatfas**.

## Version 2.9.3 (2025-07-01)

- Broke down scanner modules into seperate entities for starships per user request.

## Version 2.9.2 (2025-07-01)

- Increased button hotspot sizes to improve mobile touch interaction.
- Added branded splash screen on app launch.
- Additional UI refinements and internal code cleanup.

## Version 2.9.1 (2025-06-26)

- Refactored Grid Table Buttons to use pure CSS positioning. Should address React performance violation warnings.
- Additional code cleanup.

## Version 2.90 (2025-06-19)

- Added internationalization (i18n) support.
- Added a language selection UI element.
- Added Spanish, French, and German translations (initial machine-generated draft).
- Finally found and addressed the issue impacting application "responsiveness" on mobile devices.
- Additional UI performance enhancements.

## Version 2.86 (2025-06-10)

- Simplified "TechRow" button presentation.
- Refactored the header presentation into something more "elegant", matching the game title screen.
- Additional UI and performance enhancements.

## Version 2.85 (2025-06-05)

- Added experimental support and models for 4x3 Pulse Engine solves—for those looking to push maneuverability—per request from **u/Jupiter67** on Reddit.

## Version 2.81 (2025-05-30)

- Corrected Neutron Cannon model.
- Expanded window size for Pulse Engines to 3x3 / 4x3. Needs further testing.

## Version 2.80 (2025-05-22)

- Some final UI refinements and optimizations.
- Renamed app to **No Man's Sky Technology Layout Optimizer**.

## Version 2.75 (2025-05-16)

- Fixed issue where the canonical URL setting was interfering with "Share" functionality.
- Updated algorithm to prefer upper corners instead of lower left corner (it was annoying me).
- Enabled compression on the service endpoint to reduce payload size and improve performance.
- Repositioned content dialog buttons to more logical locations.
- Resized and optimized sidebar button images.
- Finally fixed automated Docker builds! See [the artifact page](https://github.com/jbelew/nms_optimizer-web/pkgs/container/nms-optimizer-app) for additional info.
- Significantly reduced DOM complexity.
- Numerous UI enhancements, performance improvements, and accessibility fixes based on Lighthouse audits (scored 98/100!).

## Version 2.70 (2025-05-14)

- Updated Solar Starships and Freighters with full 16k-sample models.
- Added a dedicated “About” page.
- Introduced named routes for content dialogs to improve SEO.

## Version 2.69 (2025-05-13)

- Added updated models for Solar Starship Pulse Engines, significantly improving solving speed and accuracy.

## Version 2.68 (2025-05-10)

- Further model updates for Freighter Hyperdrive.
- Added Photonix Core as an option for Solar Starships. (Note: Solving may be slower until models are updated.)

## Version 2.67 (2025-05-10)

- Implemented a larger, 8k sample model for Freighter Hyperdrive for higher accuracy.
- More code clean-up and UI optimizations.

## Version 2.66 (2025-05-10)

- Implemented a small, 4k sample model for Freighter Hyperdrive that works well on blank grids. Need more data to ensure consistency in other cases.

## Version 2.65 (2025-05-09)

- Added preliminary support for Freighters. Models are still pending. Need to implement shared adjacency logic for fleet technology types.

## Version 2.61 (2025-05-08)

- Improved error handling.

## Version 2.6 (2025-05-07)

- Added warning for when no solves fit within the grid. Seeing too many users trying to force things and getting sub-optimal results.
- I give in. No one knows what a Convolutional Neural Network is. Marketing wins and we're calling it **AI Technology Optimizer**.

## Version 2.51 (2025-05-06)

- Increased "window" size to support better solves for Living Starships.
- Additional mobile UI refinements.

## Version 2.5 (2025-05-05)

- Significant UI clean-up, optimization, and refactoring.

## Version 2.24 (2025-05-03)

- Added solve quality visuals to notify user when a sub-optimal solve is generated.

## Version 2.23 (2025-05-03)

- Updated Starship Trails to provide adjacency to the Tentacled Figurine when more than 5 are available (boosts the hidden speed stat).

## Version 2.22 (2025-05-03)

- Improved interaction performance on slower devices.
- Fixed issue where "ghost" modules would sometimes persist after SA/Refine fallback solves were applied.
- Additional UI improvements and enhancements.

## Version 2.2 (2025-04-24)

- Refactored opportunity (supercharged) windowing and scoring engine.
- All new, faster, AI models based on 16k samples.
- Added Staves and Solar Starships.
- Now available as a Docker image to run locally.

## Version 2.1 (2025-04-21)

- Added correct Boltcaster / Forbidden Upgrade Module relationship.
- Minor bug fixes for MacOS Safari.

## Version 2.0 (2025-04-19)

- Renamed tool to Neural Technology Optimizer to reflect its new capabilities.
- Added support for TensorFlow (AI) based solves resulting in an ~5x performance boost.
- Implemented support for Multi-tools.
- New, higher quality, grid graphical assets.
- Various bug fixes, enhancements, and performance improvements.

## Version 1.1 (2025-04-07)

- Improved scoring algorithms to provide more consistant solves.
- Minor UI enchancements.

## Version 1.0 (2025-04-05)

- Calling it done!
- Additional solver improvements.

## Version 1.0 (RC3) (2025-04-04)

- Completely refactored scoring algorithm. Please [file a report](https://github.com/jbelew/nms_optimizer-web/issues) if you identify a persistent issue. Be sure to include a **Share Link** to your solve map.
- Calculations now take into account greater and lesser adjacency.
- Core Hyperdrive documented as lesser, but actually performs as greater.
- Improved solver opportunity detection.
- Implemented conditional algorithm selection. If a technology has fewer than 6 modules, the solver will use the brute force method; otherwise, it will use the simulated annealing algorithm.
- Added support for Living Ships.
- Various bug fixes and UI enhancements.

## Version 0.99.5 (2025-04-01)

- Added additional tech color coding.
- Introduced upgrade priority labels.
- Refactored the "Shared" link UI.
- Further solver refinements (should be finished!).
- Improved usage of available space in the grid.

## Version 0.99.1 (2025-03-31)

- Fixed major flaws in the solver logic.
- Added adjacency color coding.
- Numerous bug fixes.
- Additional UI refinements.

## Version 0.99 (2025-03-30)

- Enabled sharing and bookmarking of solves (grid serialization).
- Various UI refinements.

## Version 0.98 (2025-03-29)

- Added support for Sentinel Interceptors.
- Major UI updates.

## Version 0.97 (2025-03-28)

- Added support for optional modules received as Expedition rewards.
- Additional UI refinements.
- Significant codebase cleanup.

## Version 0.96 (2025-03-27)

- Further tuning of the **simulated annealing** solver.

## Version 0.95 (2025-03-27)

- Introduced a **simulated annealing** solver and deprecated the brute-force solver due to server timeout issues.
- Improved error handling.

## Version 0.94 (2025-03-26)

- Added error messaging for solver failures.
- Updated the header.
- Refined mobile UX.

## Version 0.93 (2025-03-26)

- Added support for mobile touch events.
- Updated the main font to match Hello Games branding.
- Additional UI refinements.
- Fixed incorrect image mapping for Photon Cannon upgrades.
- Reverted the default grid state to 3 rows.
- Added authorship footer and GitHub repository links.

## Version 0.91α (2025-03-25)

- Added Instructions dialog.
- Added Changelog dialog.
- Enhanced UI/UX for mobile devices.
- Fixed an issue where grid refinement failed to find the best solve; improved packing algorithms.

## Version 0.90α (2025-03-24)

- Initial alpha release.
- Implemented basic grid functionality.
- Enabled row activation/deactivation.
- Added cell state toggling.
- Integrated optimization API.
- Added grid reset functionality.
