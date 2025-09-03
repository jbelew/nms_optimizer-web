## Model Status

See this [GitHub page](https://github.com/jbelew/nms_optimizer-service/tree/main/src/training/trained_models) for up to date model build information.

---

## Version 3.10 (2025-08-02)

- Added **beta support for Corvettes**. Right now, space is too limited to allow even a partial build using the current approach, but this update lays the groundwork. I’ll be exploring solutions that don’t disrupt the existing models and ML functionality over the next few days, so check back soon.

## Corvettes Coming Soon (2025-08-31)

I thought I was finished here... **until Corvettes showed up**. Once the bugs around Corvette technology are sorted (and there are plenty right now), I’ll build the new models and roll out a release.

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

- Refactored opportunity (supercharger) windowing and scoring engine.
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
