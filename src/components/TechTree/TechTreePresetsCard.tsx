/**
 * Pinned Recommended Builds card module for the TechTree sidebar.
 *
 * @remarks
 * Displays curated Recommended Builds optimized for maximum adjacency bonuses
 * on platforms with fixed supercharged slots across all viewports.
 *
 * @see {@link TechTreePresetsCard}
 * @see {@link ./TechTreePresetsCard.test.tsx Unit Tests}
 *
 * @category Components
 */

import React, { startTransition, useCallback } from "react";
import { LayersIcon, MagicWandIcon, StackIcon } from "@radix-ui/react-icons";
import { Button, Flex, Link, Text } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "@/hooks/useBreakpoint/useBreakpoint";
import { useScrollGridIntoView } from "@/hooks/useScrollGridIntoView/useScrollGridIntoView";
import { type TechTree } from "@/hooks/useTechTree/useTechTree";
import { usePlatformStore } from "@/store/app/platformStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { type RecommendedBuild } from "@/types/tech";
import { useDialog } from "@/utils/system/dialogUtils";
import { countBuildModules } from "@/utils/tech/techTreeUtils";

/**
 * Props for the {@link PresetCardItem} component.
 */
interface PresetCardItemProps {
	/** The Recommended Build item. */
	build: RecommendedBuild;
	/** Callback invoked when the user applies the Recommended Build. */
	onApply: (build: RecommendedBuild) => void;
}

/**
 * Props for the {@link PresetsCardContent} component.
 */
interface PresetsCardContentProps {
	/** List of Recommended Builds to display. */
	builds: RecommendedBuild[];
	/** The technology tree data containing Recommended Builds. */
	techTree: TechTree;
}

/**
 * Props for the {@link TechTreePresetsCard} component.
 */
interface TechTreePresetsCardProps {
	/** The technology tree data containing Recommended Builds. */
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
	const isAbove1024 = useBreakpoint("1024px");
	const { scrollIntoView } = useScrollGridIntoView({ skipOnLargeScreens: false });
	const { sendEvent } = useAnalytics();
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	const handleApply = useCallback(
		(build: RecommendedBuild) => {
			setTimeout(() => {
				if (!isAbove1024 && build?.layout?.length) {
					scrollIntoView();
				}

				startTransition(() => {
					const applied = sessionCoordinator.applyRecommendedBuild(build, techTree);

					if (applied) {
						sendEvent({
							action: "apply_build",
							build: build.title,
							category: "build",
							nonInteraction: false,
							platform: selectedPlatform,
							value: 1,
						});
					}
				});
			}, 0);
		},
		[isAbove1024, scrollIntoView, sendEvent, selectedPlatform, techTree]
	);

	const handleOpenInstructions = useCallback(() => {
		openDialog("instructions", { section: "section-6" });
	}, [openDialog]);

	return (
		<div className="mb-4 rounded-(--radius-3) bg-(--accent-a3) p-3 sm:shadow-sm lg:bg-(--accent-surface)">
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

				<Text as="p" className="text-sm sm:text-base">
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
 * Pinned card component for Recommended Builds across viewports.
 *
 * @remarks
 * Renders a stylized card at the top of the TechTree list showcasing
 * preconfigured layouts for platforms with fixed supercharged slots, delegating
 * grid materialization to `sessionCoordinator.applyRecommendedBuild`.
 *
 * @param {TechTreePresetsCardProps} props - Component properties.
 * @param {TechTree} props.techTree - The technology tree payload containing `recommended_builds`.
 *
 * @returns {JSX.Element | null} The rendered presets card, or `null` if no Recommended Builds exist.
 *
 * @see {@link sessionCoordinator}
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
