import React from "react";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, Separator } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useRecommendedBuildContext } from "./useRecommendedBuildContext";

/**
 * Action button/dropdown for applying builds.
 */
export const RecommendedBuildButton: React.FC<React.ComponentProps<typeof Button>> = (
	buttonProps
) => {
	const { t } = useTranslation();
	const { handleApply, techTree } = useRecommendedBuildContext();
	const builds = techTree.recommended_builds || [];

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
