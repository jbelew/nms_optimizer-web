// src/components/RecommendedBuild/RecommendedBuild.tsx
import { MagicWandIcon } from "@radix-ui/react-icons";
import { Button, Callout, DropdownMenu, Em, Separator, Strong } from "@radix-ui/themes";
import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useRecommendedBuild } from "../../hooks/useRecommendedBuild";
import { type TechTree } from "../../hooks/useTechTree";

interface RecommendedBuildProps {
	techTree: TechTree;
	gridContainerRef: React.MutableRefObject<HTMLDivElement | null>;
	isLarge: boolean;
	onHeightChange: (height: number) => void;
}

const RecommendedBuild: React.FC<RecommendedBuildProps> = ({
	techTree,
	gridContainerRef,
	isLarge,
	onHeightChange,
}) => {
	const componentRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (componentRef.current) {
			onHeightChange(componentRef.current.offsetHeight);
		}
	}, [onHeightChange, techTree.recommended_builds, isLarge]);
	const { t } = useTranslation();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree, gridContainerRef);
	const { sendEvent } = useAnalytics();

	return (
		<div ref={componentRef}>
			{isLarge ? (
				<div className="flex justify-center mt-4">
					{techTree.recommended_builds && techTree.recommended_builds.length > 1 ? (
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Button>
									<MagicWandIcon style={{ color: "var(--amber-11)" }} />
									{t("techTree.recommendedBuilds.selectBuildButton")}
									<Separator orientation="vertical" size="1" />
									<DropdownMenu.TriggerIcon />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								{techTree.recommended_builds.map((build, index) => (
									<DropdownMenu.Item
										key={index}
										onClick={() => {
											applyRecommendedBuild(build);
											sendEvent({
												category: "Recommended Build",
												action: "apply_build",
												label: build.title,
											});
										}}
									>
										{build.title}
									</DropdownMenu.Item>
								))}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					) : (
						<Button
							onClick={() => {
								if (techTree.recommended_builds) {
									const build = techTree.recommended_builds[0];
									applyRecommendedBuild(build);
									sendEvent({
										category: "Recommended Build",
										action: "apply_build",
										label: build.title,
									});
								}
							}}
						>
							<MagicWandIcon style={{ color: "var(--amber-11)" }} />
							{t("techTree.recommendedBuilds.applyBuildButton")}
						</Button>
					)}
				</div>
			) : (
				<Callout.Root variant="soft" mb="4" mr="0" size="1" highContrast>
					<Callout.Icon>🧪</Callout.Icon>
					<Callout.Text>
						<Trans
							i18nKey="techTree.recommendedBuilds.summary"
							components={{
								1: <Strong />,
								3: <Strong />,
								5: <Em />,
							}}
						/>
						<br />
						{techTree.recommended_builds && techTree.recommended_builds.length > 1 ? (
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									<Button mt="3" mb="1">
										{t("techTree.recommendedBuilds.selectBuildButton")}
										<Separator orientation="vertical" size="1" />
										<DropdownMenu.TriggerIcon />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content>
									{techTree.recommended_builds.map((build, index) => (
										<DropdownMenu.Item
											key={index}
											onClick={() => {
												applyRecommendedBuild(build);
												sendEvent({
													category: "Recommended Build",
													action: "apply_build",
													label: build.title,
												});
											}}
										>
											{build.title}
										</DropdownMenu.Item>
									))}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						) : (
							<Button
								mt="3"
								mb="1"
								onClick={() => {
									if (techTree.recommended_builds) {
										const build = techTree.recommended_builds[0];
										applyRecommendedBuild(build);
										sendEvent({
											category: "Recommended Build",
											action: "apply_build",
											label: build.title,
										});
									}
								}}
							>
								<MagicWandIcon style={{ color: "var(--amber-11)" }} />
								{t("techTree.recommendedBuilds.applyBuildButton")}
							</Button>
						)}
					</Callout.Text>
				</Callout.Root>
			)}
		</div>
	);
};

export default RecommendedBuild;
