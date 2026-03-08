import { useTranslation } from "react-i18next";

import { useGridStore } from "@/store/GridStore";
import { useTechStore } from "@/store/TechStore";

import { TechTreeRowProps } from "./TechTreeRow";
import { useTechModuleManagement } from "./useTechModuleManagement";
import { useTechOptimization } from "./useTechOptimization";

/** Default empty array for modules to ensure stable reference. */
const EMPTY_MODULES_ARRAY: { label: string; id: string; image: string; type?: string }[] = [];

/**
 * A coordinator hook that orchestrates the complex logic for a single technology sidebar row.
 *
 * It acts as a facade, aggregating data from multiple stores (`GridStore`, `TechStore`)
 * and delegating specialized tasks to sub-hooks (`useTechModuleManagement`,
 * `useTechOptimization`). It also handles the derived logic for localization and
 * resolution-aware image path generation.
 *
 * @param {TechTreeRowProps} props - The properties passed to the parent component.
 * @returns {object} A unified interface containing state flags, localized strings, and event handlers.
 *
 * @example
 * const hookData = useTechTreeRow(props);
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
	const techGroups = useTechStore((state) => state.techGroups);
	const techMaxBonus = useTechStore((state) => state.max_bonus?.[tech] ?? 0);
	const techSolvedBonus = useTechStore((state) => state.solved_bonus?.[tech] ?? 0);

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

	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: tech;
	const translatedTechName = t(`technologies.${translationKeyPart}`);

	const baseImagePath = "/assets/img/tech/";
	const versionParam = `?v=${__APP_VERSION__}`;
	const fallbackImageBase = `${baseImagePath}infra.webp`;
	const fallbackImage = `${fallbackImageBase}${versionParam}`;
	const fallbackImage2x = `${fallbackImageBase.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}${versionParam}`;
	const imagePath = techImage ? `${baseImagePath}${techImage}${versionParam}` : fallbackImage;
	const imagePath2x = techImage
		? `${baseImagePath}${techImage.replace(/\.(webp|png|jpg|jpeg)$/, "@2x.$1")}${versionParam}`
		: fallbackImage2x;

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
