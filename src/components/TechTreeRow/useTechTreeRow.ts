import type { TechTreeRowProps } from "@/types/props";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";

import { useTechModuleManagement } from "./useTechModuleManagement";
import { useTechOptimization } from "./useTechOptimization";

/** Default empty array for modules to ensure stable reference for hooks. */
const EMPTY_MODULES_ARRAY: { id: string; image: string; label: string; type?: string }[] = [];

/**
 * Orchestrates the complex logic for a single technology sidebar row.
 *
 * @remarks
 * This coordinator hook acts as a facade, aggregating data from multiple stores
 * and delegating specialized tasks to sub-hooks. It handles:
 * 1. Data aggregation from {@link useGridStore} and {@link useTechStore}.
 * 2. Module selection state via {@link useTechModuleManagement}.
 * 3. Optimization and reset lifecycle via {@link useTechOptimization}.
 * 4. Derived logic for localization and resolution-aware image path generation.
 *
 * @param {TechTreeRowProps} props - The properties passed to the parent component.
 *
 * @returns {object} A unified interface containing state flags, localized strings, and event handlers.
 * @returns {boolean} returns.hasTechInGrid - Whether the technology is currently placed in the grid.
 * @returns {string} returns.translatedTechName - The localized name of the technology.
 * @returns {string} returns.imagePath - Path to the 1x resolution technology icon.
 * @returns {string} returns.imagePath2x - Path to the 2x resolution technology icon.
 * @returns {number} returns.techMaxBonus - The maximum possible efficiency score.
 * @returns {number} returns.techSolvedBonus - The current solved efficiency score.
 * @returns {boolean} returns.isResetting - Whether a reset operation is in progress.
 *
 * @see {@link import('./TechTreeRow').TechTreeRow} for the consuming component.
 * @see {@link useTechModuleManagement} for module selection logic.
 * @see {@link useTechOptimization} for solver orchestration.
 * @see {@link useGridStore} for grid state.
 * @see {@link useTechStore} for technology metadata.
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook orchestration and data aggregation
 * ```tsx
 * const hookData = useTechTreeRow({
 *   tech: 'pulse',
 *   techColor: 'blue',
 *   solving: false,
 *   isGridFull: false,
 *   handleOptimize: async (id) => {},
 *   techImage: 'pulse.webp'
 * });
 * ```
 */
export const useTechTreeRow = ({
	handleOptimize,
	isGridFull,
	solving,
	tech,
	techColor,
	techImage,
}: TechTreeRowProps & {
	handleOptimize: (tech: string) => Promise<void>;
	isGridFull: boolean;
	solving: boolean;
}) => {
	const { t } = useTranslation();

	// State from stores
	const hasTechInGrid = useGridStore((state) => state.activeTechs.has(tech));

	const { techGroup, techMaxBonus, techSolvedBonus } = useTechStore(
		useShallow((state) => ({
			techGroup: state.techGroups[tech],
			techMaxBonus: state.max_bonus?.[tech] ?? 0,
			techSolvedBonus: state.solved_bonus?.[tech] ?? 0,
		}))
	);

	// Derived state
	const modules = techGroup?.[0]?.modules || EMPTY_MODULES_ARRAY;
	const moduleCount = techGroup?.[0]?.module_count || 0;

	// Specialized hooks
	const { handleOptimizeClick, handleReset, isResetting } = useTechOptimization(
		tech,
		handleOptimize,
		isGridFull,
		hasTechInGrid
	);

	const {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleAllCheckboxesChange,
		handleSelectAllChange,
		handleValueChange,
		isIndeterminate,
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
		allModulesSelected,
		// Module management
		currentCheckedModules,
		groupedModules,
		handleAllCheckboxesChange,
		// Callbacks
		handleOptimizeClick,
		handleReset,
		handleSelectAllChange,
		handleValueChange,
		// State and derived data
		hasTechInGrid,
		imagePath,
		imagePath2x,
		isIndeterminate,

		isResetting,
		moduleCount,
		modules,
		solving,

		tech,
		techColor,
		techImage,
		techMaxBonus,
		techSolvedBonus,
		translatedTechName,
	};
};
