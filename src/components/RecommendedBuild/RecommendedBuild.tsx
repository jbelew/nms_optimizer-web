// src/components/RecommendedBuild/RecommendedBuild.tsx
import React from "react";
import { InfoCircledIcon, MagicWandIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
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

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useRecommendedBuild } from "../../hooks/useRecommendedBuild/useRecommendedBuild";
import { type TechTree } from "../../hooks/useTechTree/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";

interface RecommendedBuildProps {
	techTree: TechTree;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

/**
 * RecommendedBuild component displays and allows applying recommended technology builds.
 * It provides options to select and apply different builds based on the available tech tree.
 *
 * @param {RecommendedBuildProps} props - The props for the RecommendedBuild component.
 * @param {TechTree} props.techTree - The technology tree data containing recommended builds.
 * @param {React.MutableRefObject<HTMLDivElement | null>} props.gridContainerRef - Ref to the grid container for scrolling after applying a build.
 * @param {boolean} props.isLarge - Indicates if the current screen size is large or larger.
 * @returns {JSX.Element} The rendered RecommendedBuild component.
 */
const RecommendedBuild: React.FC<RecommendedBuildProps> = ({
	techTree,
	gridContainerRef,
	isLarge,
}) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree, gridContainerRef);
	const { sendEvent } = useAnalytics();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const builds = techTree.recommended_builds || [];

	/**
	 * Handles applying a selected recommended build.
	 * @param {(typeof builds)[number]} build - The build object to apply.
	 */
	const handleApply = (build: (typeof builds)[number]) => {
		applyRecommendedBuild(build);
		sendEvent({
			category: "Recommended Build",
			action: "apply_build",
			build: build.title,
			platform: selectedPlatform,
			value: 1,
		});
	};

	/**
	 * Handles opening the instructions dialog, specifically to the section about recommended builds.
	 */
	const handleOpenInstructions = () => {
		openDialog("instructions", { section: "section-3" });
	};

	/**
	 * Renders the appropriate button for applying a recommended build.
	 * If there are multiple builds, it renders a dropdown menu. If only one, a direct button.
	 * @param {React.ComponentProps<typeof Button>} [buttonProps] - Optional props to pass to the Button component.
	 * @returns {JSX.Element | null} The rendered button or dropdown, or null if no builds are available.
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
						<DropdownMenu.Label className="shipSelection__header">
							Select Build
						</DropdownMenu.Label>
						{builds.map((build, index) => (
							<DropdownMenu.Item
								className="font-medium"
								key={index}
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
				<div className="mt-5 flex items-center justify-center gap-2">
					{renderBuildButton()}
					<IconButton
						variant="ghost"
						size="2"
						radius="full"
						aria-label={t("buttons.changelog")}
						onClick={handleOpenInstructions}
					>
						<QuestionMarkCircledIcon className="h-5 w-5" />
					</IconButton>
				</div>
			) : (
				<>
					<Callout.Root size="1">
						<Callout.Icon>
							<InfoCircledIcon />
						</Callout.Icon>
						<Callout.Text size={{ initial: "2", sm: "3" }}>
							<Trans
								i18nKey="techTree.recommendedBuilds.summary"
								components={{
									1: <Strong />,
									3: <Strong />,
									5: (
										<Link
											href="#"
											underline="always"
											onClick={(e) => {
												e.preventDefault(); // Prevent jump to top
												handleOpenInstructions();
											}}
										/>
									),
								}}
							/>
						</Callout.Text>
						<div>
							{renderBuildButton({
								mt: "0",
								mb: "1",
								className: "w-full justify-center",
							})}
						</div>
					</Callout.Root>
				</>
			)}
		</>
	);
};

export default RecommendedBuild;
