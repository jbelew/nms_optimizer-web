import type { TechTreeRowProps } from "@/types/props";
import { useCallback, useMemo, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useOptimize } from "@/hooks/useOptimize/useOptimize";
import { useGridStore } from "@/store/grid/gridStore";
import { sessionCoordinator } from "@/store/sessionCoordinator";
import { getTechnologyTranslationKey, resolveActiveTechVariant } from "@/store/tech/techRules";
import { useTechStore } from "@/store/tech/techStore";
import { Logger } from "@/utils/system/monitoring";

/** Default empty array for modules to ensure stable reference for hooks. */
const EMPTY_MODULES_ARRAY: { id: string; image: string; label: string; type?: string }[] = [];

/**
 * Orchestrates the state and callbacks for a single technology sidebar row.
 *
 * @remarks
 * This coordinator hook acts as a facade, aggregating data from multiple stores
 * and delegating solver and reset interactions to {@link useOptimize} and {@link sessionCoordinator}. It handles:
 * 1. Data aggregation from {@link useGridStore} and {@link useTechStore}, selecting
 *    only the primitive `checkedModulesCount` to avoid per-row module grouping overhead.
 * 2. Optimization and **Technology Reset** lifecycle via {@link useOptimize} and {@link sessionCoordinator.resetTechnology}.
 * 3. Derived logic for localization and resolution-aware image path generation.
 *
 * @param {TechTreeRowProps} props - The properties passed to the parent component.
 *
 * @returns {object} A unified interface containing state flags, localized strings, and event handlers.
 * @returns {number} returns.checkedModulesCount - Count of currently checked modules for this technology.
 * @returns {() => void} returns.handleOptimizeClick - Initiates the optimization process for this technology.
 * @returns {() => void} returns.handleReset - Executes a Technology Reset for this technology.
 * @returns {boolean} returns.hasTechInGrid - Whether the technology is currently placed in the grid.
 * @returns {string} returns.imagePath - Path to the 1x resolution technology icon.
 * @returns {string} returns.imagePath2x - Path to the 2x resolution technology icon.
 * @returns {boolean} returns.isGridFull - Whether the grid has no remaining active empty slots.
 * @returns {boolean} returns.isOptimizing - Whether an optimize transition is in progress.
 * @returns {boolean} returns.isResetting - Whether a reset transition is in progress.
 * @returns {number} returns.moduleCount - Total count of modules in the active variant.
 * @returns {object[]} returns.modules - Modules belonging to the active technology variant.
 * @returns {boolean} returns.solving - Whether any solver request is currently active.
 * @returns {string} returns.tech - Technology category identifier.
 * @returns {TechTreeRowProps["techColor"]} returns.techColor - Accent color for the technology row.
 * @returns {string | null} returns.techImage - Base image filename for the technology.
 * @returns {number} returns.techMaxBonus - The maximum possible efficiency score.
 * @returns {number} returns.techSolvedBonus - The current solved efficiency score.
 * @returns {string} returns.translatedTechName - The localized name of the technology.
 *
 * @see {@link ./TechTreeRow.tsx TechTreeRow} for the consuming component.
 * @see {@link useOptimize} for solver orchestration.
 * @see {@link sessionCoordinator.resetTechnology} for Technology Reset orchestration.
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
 *   tech: "pulse",
 *   techColor: "blue",
 *   techImage: "pulse.webp",
 * });
 * // returns { checkedModulesCount, handleOptimizeClick, handleReset, ... }
 * ```
 */
export const useTechTreeRow = ({ tech, techColor, techImage }: TechTreeRowProps) => {
	const { t } = useTranslation();
	const { handleOptimize, solving } = useOptimize();
	const [isResetting, startResetTransition] = useTransition();
	const [isOptimizing, startOptimizeTransition] = useTransition();

	// State from stores
	const hasTechInGrid = useGridStore((state) => Boolean(state.activeTechs?.has?.(tech)));
	const isGridFull = useGridStore((state) => Boolean(state.isGridFull));

	const { activeGroupType, checkedModulesCount, techGroup, techMaxBonus, techSolvedBonus } =
		useTechStore(
			useShallow((state) => ({
				activeGroupType: state.activeGroups?.[tech] || "normal",
				checkedModulesCount: state.checkedModules?.[tech]?.length ?? 0,
				techGroup: state.techGroups?.[tech],
				techMaxBonus: state.maxBonus?.[tech] ?? 0,
				techSolvedBonus: state.solvedBonus?.[tech] ?? 0,
			}))
		);

	// Derived state
	const activeGroup = resolveActiveTechVariant(techGroup, activeGroupType);
	const modules = activeGroup?.modules || EMPTY_MODULES_ARRAY;
	const moduleCount = activeGroup?.module_count || 0;

	/**
	 * Clears the technology from the grid and resets its efficiency scores.
	 *
	 * @returns {void}
	 */
	const handleReset = useCallback(() => {
		performance.mark("reset-start");
		startResetTransition(() => {
			try {
				sessionCoordinator.resetTechnology(tech);
			} catch (error) {
				Logger.error("Failed to reset technology in grid:", error);
			}
		});
		performance.mark("reset-end");
		performance.measure("reset-duration", "reset-start", "reset-end");
	}, [tech]);

	/**
	 * Initiates the solver run for this technology.
	 *
	 * @returns {void}
	 */
	const handleOptimizeClick = useCallback(() => {
		startOptimizeTransition(async () => {
			try {
				await handleOptimize(tech);
			} catch (error) {
				Logger.error("Failed to optimize technology:", error);
			}
		});
	}, [handleOptimize, tech]);

	// Other logic specific to TechTreeRow
	const translationKeyPart = getTechnologyTranslationKey(tech, techImage);
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

	return useMemo(
		() => ({
			checkedModulesCount,
			handleOptimizeClick,
			handleReset,
			hasTechInGrid,
			imagePath,
			imagePath2x,
			isGridFull,
			isOptimizing,
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
		}),
		[
			checkedModulesCount,
			handleOptimizeClick,
			handleReset,
			hasTechInGrid,
			imagePath,
			imagePath2x,
			isGridFull,
			isOptimizing,
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
		]
	);
};
