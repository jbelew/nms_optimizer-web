// src/components/RecommendedBuild/RecommendedBuild.tsx
import React from "react";
import { MagicWandIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
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
import { useRecommendedBuild } from "../../hooks/useRecommendedBuild";
import { type TechTree } from "../../hooks/useTechTree";
import { usePlatformStore } from "../../store/PlatformStore";

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
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const builds = techTree.recommended_builds || [];

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

	const handleOpenInstructions = () => {
		openDialog("instructions", { section: "section-3" });
	};

	const renderBuildButton = (buttonProps?: React.ComponentProps<typeof Button>) => {
		if (builds.length > 1) {
			return (
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button {...buttonProps}>
							{t("techTree.recommendedBuilds.selectBuildButton")}
							<Separator orientation="vertical" size="1" />
							<DropdownMenu.TriggerIcon />
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Label className="shipSelection__header">Select Build</DropdownMenu.Label>
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
							<MagicWandIcon />
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
						<div>{renderBuildButton({ mb: "0", className: "w-full justify-center" })}</div>
					</Callout.Root>
				</>
			)}
		</>
	);
};

export default RecommendedBuild;
