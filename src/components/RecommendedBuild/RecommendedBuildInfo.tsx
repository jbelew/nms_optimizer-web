import React from "react";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { ConditionalTooltip } from "@/components/ConditionalTooltip/ConditionalTooltip";

import { useRecommendedBuildContext } from "./useRecommendedBuildContext";

/**
 * Info icon for desktop view.
 */
export const RecommendedBuildInfo: React.FC = () => {
	const { t } = useTranslation();
	const { handleOpenInstructions, isLarge } = useRecommendedBuildContext();

	if (!isLarge) return null;

	return (
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
	);
};
