/**
 * Pinned Recommended Presets Card component for the Tech Tree.
 *
 * @remarks
 * Displays community-sourced recommended technology builds optimized for maximum
 * adjacency bonuses on platforms with fixed supercharged slots across all viewports.
 *
 * @see {@link TechTreePresetsCard}
 * @see {@link ./TechTreePresetsCard.test.tsx Unit Tests}
 *
 * @category Components
 */

import React, { useCallback } from "react";
import { LayersIcon, MagicWandIcon, StackIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useRecommendedBuild } from "@/hooks/useRecommendedBuild/useRecommendedBuild";
import { type TechTree } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { type RecommendedBuild } from "@/types/tech";
import { useDialog } from "@/utils/system/dialogUtils";
import { countBuildModules } from "@/utils/tech/techTreeUtils";

/**
 * Props for the {@link PresetCardItem} component.
 */
interface PresetCardItemProps {
	/** The recommended build data item. */
	build: RecommendedBuild;
	/** Callback invoked when the user applies the recommended build. */
	onApply: (build: RecommendedBuild) => void;
}

/**
 * Props for the {@link PresetsCardContent} component.
 */
interface PresetsCardContentProps {
	/** List of recommended builds to display. */
	builds: RecommendedBuild[];
	/** The technology tree data containing recommended builds. */
	techTree: TechTree;
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
 *
 * @returns {JSX.Element} The rendered preset item row.
 */
const PresetCardItem: React.FC<PresetCardItemProps> = ({ build, onApply }) => {
	const { t } = useTranslation();
	const moduleCount = countBuildModules(build);
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
			<Flex align="center" gap="2" minWidth="0">
				<StackIcon
					className="shrink-0"
					height="18"
					style={{ color: "var(--accent-a11)" }}
					width="18"
				/>
				<Text size={isSmallAndUp ? "3" : "2"} weight="medium">
					{build.title}
				</Text>
			</Flex>

			{moduleCount > 0 ? (
				<Button
					className="justify-self-end font-mono! tabular-nums"
					color="gray"
					disabled={true}
					radius="medium"
					size="1"
					variant="surface"
				>
					x{moduleCount}
				</Button>
			) : (
				<span />
			)}

			<Button
				className="cursor-pointer! font-medium"
				onClick={() => onApply(build)}
				size="2"
				variant="soft"
			>
				<MagicWandIcon height="15" style={{ color: "var(--accent-a11)" }} width="15" />
				{t("techTree.recommendedBuilds.applyBuild", "Apply Build")}
			</Button>
		</div>
	);
};

/**
 * Inner content layout for {@link TechTreePresetsCard}.
 *
 * @param {PresetsCardContentProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered presets card UI.
 */
const PresetsCardContent: React.FC<PresetsCardContentProps> = ({ builds, techTree }) => {
	const { t } = useTranslation();
	const { openDialog } = useDialog();
	const { applyRecommendedBuild } = useRecommendedBuild(techTree);
	const { sendEvent } = useAnalytics();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const handleApply = useCallback(
		(build: RecommendedBuild) => {
			setTimeout(async () => {
				await applyRecommendedBuild(build);
				sendEvent({
					action: "apply_build",
					build: build.title,
					category: "build",
					nonInteraction: false,
					platform: selectedPlatform,
					value: 1,
				});
			}, 0);
		},
		[applyRecommendedBuild, sendEvent, selectedPlatform]
	);

	const handleOpenInstructions = useCallback(() => {
		openDialog("instructions", { section: "section-6" });
	}, [openDialog]);

	return (
		<div className="mb-4 rounded-(--radius-2) bg-(--accent-a3) p-3 sm:shadow-sm lg:bg-(--accent-surface)">
			<Flex direction="column" gap="1" width="100%">
				<Flex align="center" justify="between" width="100%">
					<Flex align="center" gap="2">
						<LayersIcon
							className="shrink-0"
							height="18"
							style={{ color: "var(--accent-a11)" }}
							width="18"
						/>
						<h2 className="heading-styled">
							{t("techTree.recommendedBuilds.header", "Recommended Builds")}
						</h2>
					</Flex>
				</Flex>

				<Text as="p" size="2">
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

				<div className="mt-2 flex flex-col gap-3">
					{builds.map((build, index) => (
						<PresetCardItem
							build={build}
							key={build.title || index}
							onApply={handleApply}
						/>
					))}
				</div>
			</Flex>
		</div>
	);
};

/**
 * Pinned card component for recommended technology builds across viewports.
 *
 * @remarks
 * Renders a stylized card at the top of the Tech Tree list showcasing
 * preconfigured layouts for ships with fixed supercharged slots.
 *
 * @param {TechTreePresetsCardProps} props - Component properties.
 *
 * @returns {JSX.Element | null} The rendered presets card, or null if no recommended builds exist.
 *
 * @see {@link useRecommendedBuild}
 * @see {@link ./TechTreePresetsCard.test.tsx Unit Tests}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreePresetsCard techTree={techTree} />
 * // renders presets card when recommended_builds exist, or null
 * ```
 */
export const TechTreePresetsCard: React.FC<TechTreePresetsCardProps> = ({ techTree }) => {
	const builds = (techTree.recommended_builds as RecommendedBuild[]) || [];

	if (builds.length === 0) return null;

	return <PresetsCardContent builds={builds} techTree={techTree} />;
};

TechTreePresetsCard.displayName = "TechTreePresetsCard";
