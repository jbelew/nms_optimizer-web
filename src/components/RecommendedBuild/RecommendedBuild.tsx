// src/components/RecommendedBuild/RecommendedBuild.tsx
import React from "react";
import { MagicWandIcon } from "@radix-ui/react-icons";
import { Button, Callout, DropdownMenu, Em, Separator, Strong } from "@radix-ui/themes";
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
		<div>
			{isLarge ? (
				<div className="flex justify-center mt-4">{renderBuildButton()}</div>
			) : (
				<Callout.Root mb="4" mt="1" size="1" highContrast>
					<Callout.Icon>🧪</Callout.Icon>
					<Callout.Text wrap="pretty" trim="start">
						<Trans
							i18nKey="techTree.recommendedBuilds.summary"
							components={{
								1: <Strong />,
								3: <Strong />,
								5: <Em />,
							}}
						/>
						<br />
						{renderBuildButton({ mt: "3", mb: "0" })}
					</Callout.Text>
				</Callout.Root>
			)}
		</div>
	);
};

export default RecommendedBuild;
