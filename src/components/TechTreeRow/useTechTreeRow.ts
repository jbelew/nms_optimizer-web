import { useTranslation } from "react-i18next";

import { useGridStore } from "@/store/GridStore";
import { useTechStore } from "@/store/TechStore";

import { TechTreeRowProps } from "./TechTreeRow";
import { useTechModuleManagement } from "./useTechModuleManagement";
import { useTechOptimization } from "./useTechOptimization";

const EMPTY_MODULES_ARRAY: { label: string; id: string; image: string; type?: string }[] = [];

/**
 * A coordinator hook that orchestrates all the logic for the TechTreeRow component.
 * It consumes specialized hooks for module management (`useTechModuleManagement`) and
 * optimization (`useTechOptimization`), fetches data from stores, and computes derived state.
 * This provides a single, clean interface for the presentational `TechTreeRow` component.
 *
 * @param props - The props passed to the `TechTreeRow` component.
 * @returns A comprehensive object containing all state and callbacks required by the `TechTreeRow`
 * and its children, abstracting away the underlying implementation details.
 */
export const useTechTreeRow = ({
	tech,
	handleOptimize,
	solving,
	techImage,
	isGridFull,
	techColor,
}: TechTreeRowProps) => {
	const { t } = useTranslation();

	// State from stores
	const hasTechInGrid = useGridStore((state) => state.hasTechInGrid(tech));
	const { techGroups, max_bonus, solved_bonus } = useTechStore();

	const techMaxBonus = max_bonus?.[tech] ?? 0;
	const techSolvedBonus = solved_bonus?.[tech] ?? 0;

	// Derived state
	const modules = techGroups[tech]?.[0]?.modules || EMPTY_MODULES_ARRAY;
	const moduleCount = techGroups[tech]?.[0]?.module_count || 0;

	// Specialized hooks
	const { handleOptimizeClick, handleReset, isResetting } = useTechOptimization(
		tech,
		handleOptimize,
		isGridFull,
		hasTechInGrid
	);

	const {
		currentCheckedModules,
		groupedModules,
		allModulesSelected,
		isIndeterminate,
		handleValueChange,
		handleSelectAllChange,
		handleAllCheckboxesChange,
	} = useTechModuleManagement(tech, modules);

	// Other logic specific to TechTreeRow

	// Translation and image paths
	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	const baseImagePath = "/assets/img/tech/";
	const fallbackImage = `${baseImagePath}infra.webp`;
	const imagePath = techImage ? `${baseImagePath}${techImage}` : fallbackImage;
	const imagePath2x = techImage
		? `${baseImagePath}${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}`
		: fallbackImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1");

	return {
		// State and derived data
		hasTechInGrid,
		techColor,
		moduleCount,
		techMaxBonus,
		techSolvedBonus,
		modules,
		translatedTechName,
		imagePath,
		imagePath2x,
		solving,
		techImage,
		isResetting,

		// Module management
		currentCheckedModules,
		groupedModules,
		allModulesSelected,
		isIndeterminate,

		// Callbacks
		handleOptimizeClick,
		handleReset,
		handleAllCheckboxesChange,
		handleValueChange,
		handleSelectAllChange,
	};
};
