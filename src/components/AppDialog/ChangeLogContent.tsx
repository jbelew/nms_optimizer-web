import React from "react";

/**
 * ChangeLogContent component displays the version history and changes made
 * to the application in a list format.
 */
const ChangeLogContent: React.FC = () => {
	return (
		<article className="appDialog__body">
			<h2 className="appDialog__subheading">Model Status</h2>
			<p className="pb-4 appDialog__text border-b-1 border-white/25">
				See this{" "}
				<a
					className="underline"
					href="https://github.com/jbelew/nms_optimizer-service/tree/main/training/trained_models"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub page
				</a>{" "}
				for up to date model build information.
			</p>

			<h2 className="pt-2 appDialog__subheading">Version 2.9.1 (2025-06-26)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Refactored Grid Table Buttons to use pure CSS positioning. Should address React
					performance violation warnings.
				</li>
				<li className="appDialog__listItem">Additional code cleanup.</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.90 (2025-06-19)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added internationalization (i18n) support.</li>
				<li className="appDialog__listItem">Added a language selection UI element.</li>
				<li className="appDialog__listItem">
					Added Spanish, French, and German translations (initial machine-generated draft).
				</li>
				<li>
					Finally found and addressed the issue impacting application "responsiveness" on mobile
					devices.
				</li>
				<li>Additional UI performance enhancements.</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.86 (2025-06-10)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Simplified &quot;TechRow&quot; button presentation.</li>
				<li className="appDialog__listItem">
					Refactored the header presentation into something more &quot;elegant&quot;, matching the
					game title screen.
				</li>
				<li className="appDialog__listItem">Additional UI and performance enhancements.</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.85 (2025-06-05)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added experimental support and models for 4x3 Pulse Engine solves—for those looking to
					push maneuverability—per request from <strong>u/Jupiter67</strong> on Reddit.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.81 (2025-05-30)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Corrected Neutron Cannon model.</li>
				<li className="appDialog__listItem">
					Expanded window size for Pulse Engines to 3x3 / 4x3. Needs further testing.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.80 (2025-05-22)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Some final UI refinements and optimizations.</li>
				<li className="appDialog__listItem">
					Renamed app to <strong>No Man&apos;s Sky Technology Layout Optimizer AI</strong>.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.75 (2025-05-16)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Fixed issue where the canonical URL setting was interfering with &quot;Share&quot;
					functionality.{" "}
				</li>
				<li className="appDialog__listItem">
					Updated algorithm to prefer upper corners instead of lower left corner (it was annoying
					me).{" "}
				</li>
				<li className="appDialog__listItem">
					Enabled compression on the service endpoint to reduce payload size and improve
					performance.
				</li>
				<li className="appDialog__listItem">
					Repositioned content dialog buttons to more logical locations.
				</li>
				<li className="appDialog__listItem">Resized and optimized sidebar button images.</li>
				<li className="appDialog__listItem">
					Finally fixed automated Docker builds! See{" "}
					<a
						href="https://github.com/jbelew/nms_optimizer-web/pkgs/container/nms-optimizer-app"
						target="_blank"
						rel="noopener noreferrer"
						className="underline"
					>
						the artifact page
					</a>{" "}
					for additional info.
				</li>
				<li className="appDialog__listItem">Significantly reduced DOM complexity.</li>
				<li className="appDialog__listItem">
					Numerous UI enhancements, performance improvements, and accessibility fixes based on
					Lighthouse audits (scored 98/100!).
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.70 (2025-05-14)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Updated Solar Starships and Freighters with full 16k-sample models.
				</li>
				<li className="appDialog__listItem">Added a dedicated “About” page.</li>
				<li className="appDialog__listItem">
					Introduced named routes for content dialogs to improve SEO.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.69 (2025-05-13)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added updated models for Solar Starship Pulse Engines, significantly improving solving
					speed and accuracy.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.68 (2025-05-10)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Further model updates for Freighter Hyperdrive.</li>
				<li className="appDialog__listItem">
					Added Photonix Core as an option for Solar Starships. (Note: Solving may be slower until
					models are updated.)
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.67 (2025-05-10)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Implemented a larger, 8k sample model for Freighter Hyperdrive for higher accuracy.
				</li>
				<li className="appDialog__listItem">More code clean-up and UI optimizations.</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.66 (2025-05-10)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Implemented a small, 4k sample model for Freighter Hyperdrive that works well on blank
					grids. Need more data to ensure consistency in other cases.
				</li>
			</ul>

			<h2 className="pt-2 appDialog__subheading">Version 2.65 (2025-05-09)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added preliminary support for Freighters. Models are still pending. Need to implement
					shared adjacency logic for fleet technology types.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.61 (2025-05-08)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Improved error handling.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.6 (2025-05-07)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added warning for when no solves fit within the grid. Seeing too many users trying to
					force things and getting sub-optimal results.
				</li>
				<li className="appDialog__listItem">
					I give in. No one knows what a Convolutional Neural Network is. Marketing wins and
					we&apos;re calling it <strong>AI Technology Optimizer</strong>.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.51 (2025-05-06)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Increased &quot;window&quot; size to support better solves for Living Starships.
				</li>
				<li className="appDialog__listItem">Additional mobile UI refinements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.5 (2025-05-05)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Significant UI clean-up, optimization, and refactoring.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.24 (2025-05-03)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added solve quality visuals to notify user when a sub-optimal solve is generated.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.23 (2025-05-03)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Updated Starship Trails to provide adjacency to the Tentacled Figurine when more than 5
					are available (boosts the hidden speed stat).
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.22 (2025-05-03)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Improved interaction performance on slower devices.</li>
				<li className="appDialog__listItem">
					Fixed issue where &quot;ghost&quot; modules would sometimes persist after SA/Refine
					fallback solves were applied.
				</li>
				<li className="appDialog__listItem">Additional UI improvements and enhancements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.2 (2025-04-24)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Refactored opportunity (supercharger) windowing and scoring engine.
				</li>
				<li className="appDialog__listItem">All new, faster, AI models based on 16k samples.</li>
				<li className="appDialog__listItem">Added Staves and Solar Starships.</li>
				<li className="appDialog__listItem">Now available as a Docker image to run locally.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.1 (2025-04-21)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added correct Boltcaster / Forbidden Upgrade Module relationship.
				</li>
				<li className="appDialog__listItem">Minor bug fixes for MacOS Safari.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 2.0 (2025-04-19)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Renamed tool to Neural Technology Optimizer to reflect its new capabilities.
				</li>
				<li className="appDialog__listItem">
					Added support for TensorFlow (AI) based solves resulting in an ~5x performance boost.
				</li>
				<li className="appDialog__listItem">Implemented support for Multi-tools.</li>
				<li className="appDialog__listItem">New, higher quality, grid graphical assets.</li>
				<li className="appDialog__listItem">
					Various bug fixes, enhancements, and performance improvements.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 1.1 (2025-04-07)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Improved scoring algorithms to provide more consistant solves.
				</li>
				<li className="appDialog__listItem">Minor UI enchancements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 1.0 (2025-04-05)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Calling it done!</li>
				<li className="appDialog__listItem">Additional solver improvements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 1.0 (RC3) (2025-04-04)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Completely refactored scoring algorithm. Please
					<a
						href="https://github.com/jbelew/nms_optimizer-web/issues"
						target="_blank"
						rel="noopener noreferrer"
					>
						file a report
					</a>
					if you identify a persistent issue. Be sure to include a <strong>Share Link</strong> to
					your solve map.
				</li>
				<li className="appDialog__listItem">
					Calculations now take into account greater and lesser adjacency.
				</li>
				<li className="appDialog__listItem">
					Core Hyperdrive documented as lesser, but actually performs as greater.
				</li>
				<li className="appDialog__listItem">Improved solver opportunity detection.</li>
				<li className="appDialog__listItem">
					Implemented conditional algorithm selection. If a technology has fewer than 6 modules, the
					solver will use the brute force method; otherwise, it will use the simulated annealing
					algorithm.
				</li>
				<li className="appDialog__listItem">Added support for Living Ships.</li>
				<li className="appDialog__listItem">Various bug fixes and UI enhancements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.99.5 (2025-04-01)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added additional tech color coding.</li>
				<li className="appDialog__listItem">Introduced upgrade priority labels.</li>
				<li className="appDialog__listItem">Refactored the &quot;Shared&quot; link UI.</li>
				<li className="appDialog__listItem">Further solver refinements (should be finished!).</li>
				<li className="appDialog__listItem">Improved usage of available space in the grid.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.99.1 (2025-03-31)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Fixed major flaws in the solver logic.</li>
				<li className="appDialog__listItem">Added adjacency color coding.</li>
				<li className="appDialog__listItem">Numerous bug fixes.</li>
				<li className="appDialog__listItem">Additional UI refinements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.99 (2025-03-30)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Enabled sharing and bookmarking of solves (grid serialization).
				</li>
				<li className="appDialog__listItem">Various UI refinements.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.98 (2025-03-29)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added support for Sentinel Interceptors.</li>
				<li className="appDialog__listItem">Major UI updates.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.97 (2025-03-28)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Added support for optional modules received as Expedition rewards.
				</li>
				<li className="appDialog__listItem">Additional UI refinements.</li>
				<li className="appDialog__listItem">Significant codebase cleanup.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.96 (2025-03-27)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Further tuning of the <strong>simulated annealing</strong> solver.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.95 (2025-03-27)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">
					Introduced a <strong>simulated annealing</strong> solver and deprecated the brute-force
					solver due to server timeout issues.
				</li>
				<li className="appDialog__listItem">Improved error handling.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.94 (2025-03-26)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added error messaging for solver failures.</li>
				<li className="appDialog__listItem">Updated the header.</li>
				<li className="appDialog__listItem">Refined mobile UX.</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.93 (2025-03-26)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added support for mobile touch events.</li>
				<li className="appDialog__listItem">
					Updated the main font to match Hello Games branding.
				</li>
				<li className="appDialog__listItem">Additional UI refinements.</li>
				<li className="appDialog__listItem">
					Fixed incorrect image mapping for Photon Cannon upgrades.
				</li>
				<li className="appDialog__listItem">Reverted the default grid state to 3 rows.</li>
				<li className="appDialog__listItem">
					Added authorship footer and GitHub repository links.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.91α (2025-03-25)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Added Instructions dialog.</li>
				<li className="appDialog__listItem">Added Changelog dialog.</li>
				<li className="appDialog__listItem">Enhanced UI/UX for mobile devices.</li>
				<li className="appDialog__listItem">
					Fixed an issue where grid refinement failed to find the best solve; improved packing
					algorithms.
				</li>
			</ul>

			<h2 className="appDialog__subheading">Version 0.90α (2025-03-24)</h2>
			<ul className="appDialog__list">
				<li className="appDialog__listItem">Initial alpha release.</li>
				<li className="appDialog__listItem">Implemented basic grid functionality.</li>
				<li className="appDialog__listItem">Enabled row activation/deactivation.</li>
				<li className="appDialog__listItem">Added cell state toggling.</li>
				<li className="appDialog__listItem">Integrated optimization API.</li>
				<li className="appDialog__listItem">Added grid reset functionality.</li>
			</ul>
		</article>
	);
};

export default React.memo(ChangeLogContent);
