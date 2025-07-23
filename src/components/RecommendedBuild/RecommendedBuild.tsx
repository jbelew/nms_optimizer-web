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
					className="p-2 my-4 text-sm rounded-md sm:text-base"
					style={{ backgroundColor: "var(--accent-a3)" }}
				>
					<div className="flex items-start">
						<span className="mr-2" role="img" aria-label="experiment icon">🧪</span>
						<div>
							<Trans
								i18nKey="techTree.recommendedBuilds.summary"
								components={{
									1: <Strong />,
									3: <Strong />,
									5: <Em />,
								}}
							/>
							<div className="mt-2">
								{renderBuildButton({ mb: "2" })}
							</div>
						</div>
					</div>
				</div>

			)}
		</>

	);
};

export default RecommendedBuild;
