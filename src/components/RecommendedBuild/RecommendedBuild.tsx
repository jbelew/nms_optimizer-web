// src/components/RecommendedBuild/RecommendedBuild.tsx
import React from "react";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, Em, Separator, Strong } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

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
						{builds.map((build, index) => (
							<DropdownMenu.Item key={index} onClick={() => handleApply(build)}>
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
				<div className="flex justify-center mt-4">{renderBuildButton()}</div>
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
								5: <Em />,
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
