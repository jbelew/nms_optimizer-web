/**
 * Community build recommendation integration module.
 *
 * @remarks
 * This module provides the `RecommendedBuild` component, which allows users
 * to quickly apply expert-verified technology layouts to their equipment.
 *
 * @see {@link RecommendedBuild}
 * @see {@link ./RecommendedBuild.stories.tsx Storybook}
 *
 * @category Components
 */

import React from "react";
import { InfoCircledIcon, MagicWandIcon } from "@radix-ui/react-icons";
import {
	Button,
	Callout,
	DropdownMenu,
	IconButton,
	Link,
	Separator,
	Strong,
} from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useRecommendedBuild } from "../../hooks/useRecommendedBuild/useRecommendedBuild";
import { type TechTree } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/app/platformStore";
import { useDialog } from "../../utils/system/dialogUtils";
import { ConditionalTooltip } from "../ConditionalTooltip/ConditionalTooltip";

/**
 * Props for the `RecommendedBuild` component.
 */
interface RecommendedBuildProps {
	/** Whether the screen matches the 'large' (desktop) breakpoint. */
	isLarge: boolean;
	/** The technology tree data containing available builds for the current ship. **Must not be null.** */
	techTree: TechTree;
}

/**
 * A component that allows users to view and apply pre-configured technology layouts.
 *
 * @remarks
 * It provides a "Magic Wand" interface that automatically populates the grid with
 * optimized community builds. If multiple builds are available, it displays a
 * dropdown menu; otherwise, it shows a direct apply button. On mobile, it
 * includes an informative callout with a link to instructions.
 *
 * @param {RecommendedBuildProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered recommended build interface.
 *
 * @see {@link useRecommendedBuild}
 * @see {@link usePlatformStore}
 *
 * @component
 *
 * @category Components
 *
 * @example Basic usage
 * ```tsx
 * <RecommendedBuild techTree={currentTree} isLarge={true} />
 * // renders build selection UI
 * ```
 */
const RecommendedBuild: React.FC<RecommendedBuildProps> = ({ isLarge, techTree }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree);
	const { sendEvent } = useAnalytics();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const builds = techTree.recommended_builds || [];

	/**
	 * Defers the build application and tracks the event.
	 *
	 * @param {object} build - The build configuration object to apply.
	 *
	 * @example Apply a specific build
	 * ```ts
	 * handleApply(builds[0]);
	 * ```
	 */
	const handleApply = (build: (typeof builds)[number]) => {
		// Defer async work to avoid blocking main thread on INP
		setTimeout(async () => {
			await applyRecommendedBuild(build);
			sendEvent({
				action: "apply_build",
				build: build.title,
				category: "build",
				nonInteraction: false,
				platform: selectedPlatform,
				value: 1,
			});
		}, 0);
	};

	/**
	 * Navigates to the relevant section of the instructions dialog.
	 * @example Trigger instructions
	 * ```ts
	 * handleOpenInstructions();
	 * ```
	 */
	const handleOpenInstructions = () => {
		openDialog("instructions", { section: "section-7" });
	};

	/**
	 * Renders the interaction element based on the number of available builds.
	 *
	 * @param {React.ComponentProps<typeof Button>} [buttonProps] - Style overrides for the button.
	 *
	 * @returns {JSX.Element | null} The button element or null if no builds available.
	 *
	 * @example Render with custom margin
	 * ```tsx
	 * renderBuildButton({ mt: "2" });
	 * ```
	 */
	const renderBuildButton = (buttonProps?: React.ComponentProps<typeof Button>) => {
		if (builds.length > 1) {
			return (
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button {...buttonProps}>
							<MagicWandIcon />
							{t("techTree.recommendedBuilds.selectBuildButton")}
							<Separator orientation="vertical" size="1" />
							<DropdownMenu.TriggerIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Label className="shipSelection__header heading-styled">
							{t("techTree.recommendedBuilds.selectBuildLabel")}
						</DropdownMenu.Label>
						{builds.map((build) => (
							<DropdownMenu.Item
								className="font-medium"
								key={build.title}
								onClick={() => handleApply(build)}
							>
								{build.title}
							</DropdownMenu.Item>
						))}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			);
		}

		if (builds.length === 1) {
			return (
				<Button {...buttonProps} onClick={() => handleApply(builds[0])}>
					<MagicWandIcon />
					{t("techTree.recommendedBuilds.applyBuildButton")}
				</Button>
			);
		}

		return null;
	};

	return (
		<>
			{isLarge ? (
				<div className="mt-4 flex items-center justify-center gap-2">
					{renderBuildButton()}
					<IconButton
						aria-label={t("techTree.recommendedBuilds.aboutRecommendedBuildsTooltip")}
						onClick={handleOpenInstructions}
						radius="full"
						size="1"
						variant="ghost"
					>
						<ConditionalTooltip
							label={t("techTree.recommendedBuilds.aboutRecommendedBuildsTooltip")}
						>
							<InfoCircledIcon className="shrink-0" height="20" width="20" />
						</ConditionalTooltip>
					</IconButton>
				</div>
			) : (
				<Callout.Root size="1">
					<Callout.Icon>
						<InfoCircledIcon className="shrink-0" />
					</Callout.Icon>
					<Callout.Text>
						<span className="text-sm sm:text-base">
							<Trans
								components={{
									1: <Strong />,
									3: <Strong />,
									5: (
										<Link
											href="#"
											onClick={(e) => {
												e.preventDefault(); // Prevent jump to top
												handleOpenInstructions();
											}}
											underline="always"
											weight="medium"
										/>
									),
								}}
								i18nKey="techTree.recommendedBuilds.summary"
							/>
						</span>
					</Callout.Text>
					<div>
						{renderBuildButton({
							mb: "1",
							mt: "0",
						})}
					</div>
				</Callout.Root>
			)}
		</>
	);
};

export default RecommendedBuild;
