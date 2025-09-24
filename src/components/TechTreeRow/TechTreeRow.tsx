import "./TechTreeRow.css";

import React, { useCallback, useMemo } from "react";
import { Avatar, Switch } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useGridStore } from "../../store/GridStore";
import { useShakeStore } from "../../store/ShakeStore";
import { useTechStore } from "../../store/TechStore";
import { ActionButtons } from "./ActionButtons";
import { TechInfo } from "./TechInfo";
import { TechInfoBadges } from "./TechInfoBadges";

const EMPTY_ARRAY: string[] = [];

/**
 * Props for the TechTreeRow component.
 */
export interface TechTreeRowProps {
	/** The unique identifier for the technology. */
	tech: string;
	/** Async function to handle the optimization process for a given technology. */
	handleOptimize: (tech: string) => Promise<void>;
	/** Boolean indicating if an optimization process is currently active. */
	solving: boolean;
	/** The filename of the image representing the technology (e.g., "hyperdrive.webp"). Null if no specific image. */
	techImage: string | null;
	/** Function to check if the grid is full. */
	isGridFull: boolean;
	/** The currently selected ship type. */
	selectedShipType: string;
	/** The color associated with the technology. */
	techColor:
		| "gray"
		| "gold"
		| "bronze"
		| "brown"
		| "yellow"
		| "amber"
		| "orange"
		| "tomato"
		| "red"
		| "ruby"
		| "crimson"
		| "pink"
		| "plum"
		| "purple"
		| "violet"
		| "iris"
		| "indigo"
		| "blue"
		| "cyan"
		| "teal"
		| "jade"
		| "green"
		| "grass"
		| "lime"
		| "mint"
		| "sky";
}

/**
 * Renders a single row in the technology tree, allowing users to optimize, reset, and view module details.
 *
 * @param {TechTreeRowProps} props - The props for the component.
 * @returns {JSX.Element} The rendered tech tree row.
 */
const TechTreeRowComponent: React.FC<TechTreeRowProps> = ({
	tech,
	handleOptimize,
	solving,
	techImage,
	isGridFull,
	techColor,
}) => {
	const { t } = useTranslation();
	const hasTechInGrid = useGridStore((state) => state.hasTechInGrid(tech));
	const handleResetGridTech = useGridStore((state) => state.resetGridTech);
	const {
		clearTechMaxBonus,
		clearTechSolvedBonus,
		setCheckedModules,
		techGroups,
		activeGroups,
		setActiveGroup,
	} = useTechStore();

	const activeGroup = useMemo(() => {
		const groupType = activeGroups[tech] || "normal";
		return techGroups[tech]?.find((g) => g.type === groupType) || techGroups[tech]?.[0];
	}, [tech, activeGroups, techGroups]);

	const rewardModules = useMemo(() => {
		return (
			activeGroup?.modules.filter((m) => m.type === "reward") ||
			([] as { label: string; id: string; image: string; type?: string }[])
		);
	}, [activeGroup]);

	const hasRewardModules = rewardModules.length > 0;
	const moduleCount = (activeGroup?.module_count || 0) - rewardModules.length;

	const techMaxBonus = useTechStore((state) => state.max_bonus?.[tech] ?? 0);
	const techSolvedBonus = useTechStore((state) => state.solved_bonus?.[tech] ?? 0);
	const { setShaking } = useShakeStore();

	// Use techImage to build a more descriptive translation key, falling back to the tech key if image is not available.
	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	const handleReset = useCallback(() => {
		handleResetGridTech(tech);
		clearTechMaxBonus(tech);
		clearTechSolvedBonus(tech);
	}, [tech, handleResetGridTech, clearTechMaxBonus, clearTechSolvedBonus]);

	const handleCheckboxChange = useCallback(
		(moduleId: string) => {
			setCheckedModules(tech, (prevChecked = []) => {
				const isChecked = prevChecked.includes(moduleId);
				return isChecked
					? prevChecked.filter((id) => id !== moduleId)
					: [...prevChecked, moduleId];
			});
		},
		[tech, setCheckedModules]
	);

	const handleAllCheckboxesChange = useCallback(
		(moduleIds: string[]) => {
			setCheckedModules(tech, () => moduleIds);
		},
		[tech, setCheckedModules]
	);

	const handleOptimizeClick = useCallback(async () => {
		if (isGridFull && !hasTechInGrid) {
			setShaking(true); // Trigger the shake
			setTimeout(() => {
				setShaking(false); // Stop the shake after a delay
			}, 500); // Adjust the duration as needed
		} else {
			handleResetGridTech(tech);
			clearTechMaxBonus(tech);
			clearTechSolvedBonus(tech);
			await handleOptimize(tech);
		}
	}, [
		isGridFull,
		hasTechInGrid,
		setShaking,
		handleResetGridTech,
		clearTechMaxBonus,
		clearTechSolvedBonus,
		handleOptimize,
		tech,
	]);

	const currentCheckedModules = useTechStore(
		(state) => state.checkedModules[tech] || EMPTY_ARRAY
	);

	const baseImagePath = "/assets/img/tech/";
	const fallbackImage = `${baseImagePath}infra.webp`;
	const imagePath = techImage ? `${baseImagePath}${techImage}` : fallbackImage;
	const imagePath2x = techImage
		? `${baseImagePath}${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	const hasMultipleGroups = (techGroups[tech]?.length || 0) > 1;

	return (
		<div className="items-top optimizationButton mt-2 mr-1 mb-2 ml-0 flex gap-2 sm:ml-1">
			<ActionButtons
				tech={tech}
				hasTechInGrid={hasTechInGrid}
				isGridFull={isGridFull}
				solving={solving}
				translatedTechName={translatedTechName}
				handleOptimizeClick={handleOptimizeClick}
				handleReset={handleReset}
			/>

			<Avatar
				size="2"
				radius="full"
				alt={translatedTechName}
				fallback="IK"
				src={imagePath}
				color={techColor}
				srcSet={`${imagePath} 1x, ${imagePath2x} 2x`}
			/>

			<div className="grid flex-1 grid-cols-[1fr_auto] items-start gap-2">
				{/* First column */}
				<div className="flex justify-start">
					<TechInfo
						tech={tech}
						translatedTechName={translatedTechName}
						hasRewardModules={hasRewardModules}
						rewardModules={rewardModules}
						currentCheckedModules={currentCheckedModules}
						handleCheckboxChange={handleCheckboxChange}
					/>
				</div>

				{/* Right-hand group */}
				<div className="flex items-start justify-end gap-1">
					<TechInfoBadges
						hasTechInGrid={hasTechInGrid}
						techColor={techColor}
						moduleCount={moduleCount}
						currentCheckedModulesLength={currentCheckedModules.length}
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
						modules={activeGroup?.modules || []}
						currentCheckedModules={currentCheckedModules}
						handleCheckboxChange={handleCheckboxChange}
						handleAllCheckboxesChange={handleAllCheckboxesChange}
						translatedTechName={translatedTechName}
						handleOptimizeClick={handleOptimizeClick}
					/>

					{hasMultipleGroups && (
						<Switch
							mt="1"
							ml="1"
							checked={activeGroups[tech] === "max"}
							onCheckedChange={(checked) =>
								setActiveGroup(tech, checked ? "max" : "normal")
							}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

/**
 * Memoized version of TechTreeRowComponent to prevent unnecessary re-renders.
 */
export const TechTreeRow = React.memo(TechTreeRowComponent);
