// src/components/RecommendedBuild/RecommendedBuild.tsx
import React from "react";
import { MagicWandIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Link, Separator, Strong } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useDialog } from "../../context/dialog-utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useRecommendedBuild } from "../../hooks/useRecommendedBuild";
import { type TechTree } from "../../hooks/useTechTree";

interface RecommendedBuildProps {
	techTree: TechTree;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	isLarge: boolean;
}

const RecommendedBuild: React.FC<RecommendedBuildProps> = ({
	techTree,
	gridContainerRef,
	isLarge,
}) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree, gridContainerRef);
	const { sendEvent } = useAnalytics();

	const builds = techTree.recommended_builds || [];

	const handleApply = (build: (typeof builds)[number]) => {
		applyRecommendedBuild(build);
		sendEvent({
			category: "Recommended Build",
			action: "apply_build",
			label: build.title,
		});
	};

	const handleOpenInstructions = () => {
		openDialog("instructions", { section: "section-3" });
	};

	const renderBuildButton = (buttonProps?: React.ComponentProps<typeof Button>) => {
		if (builds.length > 1) {
			return (
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button {...buttonProps}>
							<MagicWandIcon style={{ color: "var(--amber-11)" }} />
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
							<DropdownMenu.Item className="font-medium" key={index} onClick={() => handleApply(build)}>
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
					<MagicWandIcon style={{ color: "var(--amber-11)" }} />
					{t("techTree.recommendedBuilds.applyBuildButton")}
				</Button>
			);
		}

		return null;
	};

	return (
		<>
			{isLarge ? (
				<div className="flex items-center justify-center gap-2 mt-5">
					{renderBuildButton()}
					<IconButton
						variant="ghost"
						size="2"
						radius="full"
						aria-label={t("buttons.changelog")}
						onClick={handleOpenInstructions}
					>
						<QuestionMarkCircledIcon className="w-5 h-5" />
					</IconButton>
				</div>
			) : (
				<div
					className="flex items-start p-2 text-sm rounded-md sm:text-base bg-[var(--accent-a3)]"
				>
					<span
						className="mr-2 shrink-0"
						role="img"
						aria-label="experiment icon"
					>
						🧪
					</span>
					<div className="flex-1">
						<Trans
							i18nKey="techTree.recommendedBuilds.summary"
							components={{
								1: <Strong />,
								3: <Strong />,
								5: <Link
									href="#"
									underline="hover"
									onClick={(e) => {
										e.preventDefault(); // Prevent jump to top
										handleOpenInstructions();
									}}
								/>,
							}}
						/>
						<div className="mt-3">
							{renderBuildButton({ mb: "2", className: "w-full justify-center" })}
						</div>
					</div>
				</div>
			)}
		</>

	);
};

export default RecommendedBuild;
