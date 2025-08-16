import "./TechTreeRow.css";

import React, { useCallback, useEffect } from "react";
import { Avatar } from "@radix-ui/themes";
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
	/** Boolean indicating if there are any reward modules. */
	hasRewardModules: boolean;
	/** Filtered array of reward modules. */
	rewardModules: { label: string; id: string; image: string; type?: string }[];
	/** The currently selected ship type. */
	selectedShipType: string;
	/** The count of modules for the technology. */
	moduleCount: number;
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
 */
const TechTreeRowComponent: React.FC<TechTreeRowProps> = ({
	tech,
	handleOptimize,
	solving,
	techImage,
	isGridFull,
	hasRewardModules,
	rewardModules,
	moduleCount,
	techColor,
}) => {
	const { t } = useTranslation();
	const hasTechInGrid = useGridStore((state) => state.hasTechInGrid(tech));
	const handleResetGridTech = useGridStore((state) => state.resetGridTech);
	const { clearTechMaxBonus, clearTechSolvedBonus, setCheckedModules, clearCheckedModules } =
		useTechStore();
	const techMaxBonus = useTechStore((state) => state.max_bonus?.[tech] ?? 0);
	const techSolvedBonus = useTechStore((state) => state.solved_bonus?.[tech] ?? 0);
	const { setShaking } = useShakeStore();

	// Use techImage to build a more descriptive translation key, falling back to the tech key if image is not available.
	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	useEffect(() => {
		return () => {
			clearCheckedModules(tech);
		};
	}, [tech, clearCheckedModules]);

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

			<div className="flex flex-1 items-start justify-between">
				<TechInfo
					tech={tech}
					translatedTechName={translatedTechName}
					hasRewardModules={hasRewardModules}
					rewardModules={rewardModules}
					currentCheckedModules={currentCheckedModules}
					handleCheckboxChange={handleCheckboxChange}
				/>
				<div className="flex justify-end">
					<TechInfoBadges
						hasTechInGrid={hasTechInGrid}
						techColor={techColor}
						moduleCount={moduleCount}
						currentCheckedModulesLength={currentCheckedModules.length}
						techMaxBonus={techMaxBonus}
						techSolvedBonus={techSolvedBonus}
					/>
				</div>
			</div>
		</div>
	);
};

/**
 * Memoized version of TechTreeRowComponent to prevent unnecessary re-renders.
 */
export const TechTreeRow = React.memo(TechTreeRowComponent);
