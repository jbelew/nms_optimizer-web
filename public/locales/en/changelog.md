## Model Status

See this [GitHub page](https://github.com/jbelew/nms_optimizer-service/tree/main/training/trained_models) for up to date model build information.

---

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
- Renamed app to **No Man's Sky Technology Layout Optimizer AI**.

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
