/**
 * Pinned Recommended Presets Card component for desktop Tech Tree sidebar.
 *
 * @remarks
 * Displays community-sourced recommended technology builds optimized for maximum
 * adjacency bonuses on platforms with fixed supercharged slots.
 *
 * @see {@link TechTreePresetsCard}
 * @see {@link ./TechTreePresetsCard.test.tsx Unit Tests}
 *
 * @category Components
 */

import React from "react";
import { InfoCircledIcon, LayersIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { RecommendedBuildProvider } from "@/components/RecommendedBuild/RecommendedBuild";
import { useRecommendedBuildContext } from "@/components/RecommendedBuild/useRecommendedBuildContext";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { type TechTree } from "@/hooks/useTechTree/useTechTree";
import { type RecommendedBuild } from "@/types/tech";
import { countBuildModules } from "@/utils/tech/techTreeUtils";

/**
 * Props for the {@link PresetCardItem} component.
 */
interface PresetCardItemProps {
	/** The recommended build data item. */
	build: RecommendedBuild;
}

/**
 * Props for the {@link PresetsCardContent} component.
 */
interface PresetsCardContentProps {
	/** List of recommended builds to display. */
	builds: RecommendedBuild[];
}

/**
 * Props for the {@link TechTreePresetsCard} component.
 */
interface TechTreePresetsCardProps {
	/** The technology tree data containing recommended builds. */
	techTree: TechTree;
}

/**
 * Single item row inside the {@link TechTreePresetsCard}.
 *
 * @param {PresetCardItemProps} props - Component properties.
 * @param {RecommendedBuild} props.build - Build configuration.
 *
 * @returns {JSX.Element} The rendered preset item row.
 */
const PresetCardItem: React.FC<PresetCardItemProps> = ({ build }) => {
	const { t } = useTranslation();
	const { handleApply } = useRecommendedBuildContext();
	const moduleCount = countBuildModules(build);
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<div className="mb-1 flex items-center justify-between shadow-2xs">
			<Flex align="center" gap="2">
				<LayersIcon color="cyan" height="16" width="16" />
				<Text size={isSmallAndUp ? "3" : "2"} weight="medium">
					{build.title}
				</Text>
				{moduleCount > 0 && (
					<Button
						className="font-mono! tabular-nums"
						color="gray"
						disabled={true}
						radius="medium"
						size="1"
						variant="surface"
					>
						x{moduleCount}
					</Button>
				)}
			</Flex>

			<Button
				className="cursor-pointer! font-medium shadow-xs"
				onClick={() => handleApply(build)}
				size="2"
				variant="soft"
			>
				<MagicWandIcon />
				{t("techTree.recommendedBuilds.applyBuild", "Apply Build")}
			</Button>
		</div>
	);
};

/**
 * Inner content layout for {@link TechTreePresetsCard}, consuming RecommendedBuildContext.
 *
 * @param {PresetsCardContentProps} props - Component properties.
 * @param {RecommendedBuild[]} props.builds - Array of builds.
 *
 * @returns {JSX.Element} The rendered presets card UI.
 */
const PresetsCardContent: React.FC<PresetsCardContentProps> = ({ builds }) => {
	const { t } = useTranslation();
	const { handleOpenInstructions } = useRecommendedBuildContext();

	return (
		<Card
			className="mb-4 shadow-sm! [--base-card-border-radius:var(--radius-2)]! before:bg-(--accent-a3)!"
			size="1"
			variant="surface"
		>
			<Flex direction="column" gap="1" width="100%">
				<Flex align="center" justify="between" width="100%">
					<Flex align="center" gap="2">
						<InfoCircledIcon
							className="shrink-0 text-(--accent-11)"
							height="16"
							width="16"
						/>
						<h2 className="heading-styled">
							{t("techTree.recommendedBuilds.header", "Recommended Builds")}
						</h2>
					</Flex>
				</Flex>

				<Text as="p" color="gray" size="2">
					<Trans
						components={{
							5: (
								<Link
									color="cyan"
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handleOpenInstructions();
									}}
									underline="always"
									weight="medium"
								/>
							),
						}}
						i18nKey="techTree.recommendedBuilds.cardDescription"
					/>
				</Text>

				<div className="mt-1 flex flex-col gap-1 pt-1">
					{builds.map((build, index) => (
						<PresetCardItem build={build} key={build.title || index} />
					))}
				</div>
			</Flex>
		</Card>
	);
};

/**
 * Pinned card component for recommended technology builds on desktop.
 *
 * @remarks
 * Renders a stylized card at the top of the desktop Tech Tree list showcasing
 * preconfigured layouts for ships with fixed supercharged slots.
 *
 * @param {TechTreePresetsCardProps} props - Component properties.
 * @param {TechTree} props.techTree - Full technology tree data structure.
 *
 * @returns {JSX.Element | null} The rendered presets card, or null if no recommended builds exist.
 */
export const TechTreePresetsCard: React.FC<TechTreePresetsCardProps> = ({ techTree }) => {
	const builds = (techTree.recommended_builds as RecommendedBuild[]) || [];

	if (builds.length === 0) return null;

	return (
		<RecommendedBuildProvider isLarge techTree={techTree}>
			<PresetsCardContent builds={builds} />
		</RecommendedBuildProvider>
	);
};

TechTreePresetsCard.displayName = "TechTreePresetsCard";
