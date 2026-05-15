import { useCallback, useEffect, useMemo } from "react";

import { useModuleSelectionStore } from "@/store/tech/moduleSelectionStore";
import { useTechStore } from "@/store/tech/techStore";

/**
 * Custom hook to manage the lifecycle of technology modules within the grid.
 *
 * @remarks
 * Coordinates between {@link useTechStore} and {@link useModuleSelectionStore} to:
 * 1. Sync module selections between current state and persistence.
 * 2. Group modules into categories (core, upgrade, Figurines, etc.).
 * 3. Enforce tier-based de-selection logic (Theta > Tau > Sigma).
 * 4. Manage "Select All" and indeterminate checkbox states.
 *
 * @param {string} tech - The unique technology identifier (e.g., 'pulse').
 * @param {Array<{ label: string, id: string, image: string, type?: string }>} modules - The full list of modules available for the tech.
 *
 * @returns {object} State flags and event handlers for module selection UI.
 *
 * @see {@link useTechStore} for global module state.
 * @see {@link useModuleSelectionStore} for persistence logic.
 * @see {@link ./useTechModuleManagement.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook initialization
 * ```tsx
 * const { groupedModules, handleValueChange } = useTechModuleManagement("pulse", availableModules);
 * ```
 */
export const useTechModuleManagement = (
	tech: string,
	modules: { id: string; image: string; label: string; type?: string }[]
) => {
	const setCheckedModules = useTechStore((state) => state.setCheckedModules);
	const allCheckedModules = useTechStore((state) => state.checkedModules);
	const { getModuleSelection, setModuleSelection } = useModuleSelectionStore();

	const currentCheckedModules = useMemo(
		() => allCheckedModules[tech] || [],
		[allCheckedModules, tech]
	);

	// Sync module selections to persistent store (only if they changed)
	useEffect(() => {
		if (currentCheckedModules.length > 0) {
			const persistedSelection = getModuleSelection(tech);
			// Only update if the selection has actually changed
			const hasChanged =
				!persistedSelection ||
				persistedSelection.length !== currentCheckedModules.length ||
				!persistedSelection.every((id) => currentCheckedModules.includes(id));

			if (hasChanged) {
				setModuleSelection(tech, currentCheckedModules);
			}
		}
	}, [tech, currentCheckedModules, setModuleSelection, getModuleSelection]);

	const coreModuleIds = useMemo(
		() => modules.filter((m) => m.type === "core").map((m) => m.id),
		[modules]
	);

	const nonCoreModuleIds = useMemo(
		() => modules.filter((m) => m.type !== "core").map((m) => m.id),
		[modules]
	);

	const groupedModules = useMemo(() => {
		const groups: { [key: string]: typeof modules } = {
			atlantid: [],
			bonus: [],
			core: [],
			cosmetic: [],
			figurines: [],
			reactor: [],
			trails: [],
			upgrade: [],
		};

		modules.forEach((module) => {
			if (module.label?.toLowerCase().includes("figurine")) {
				groups.figurines.push(module);

				return;
			}

			const type = module.type || "upgrade";

			if (groups[type]) {
				groups[type].push(module);
			} else {
				groups.upgrade.push(module);
			}
		});

		return groups;
	}, [modules]);

	/**
	 * Toggles the selection status of a single module.
	 *
	 * @param {string} moduleId - The unique ID of the module.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleCheckboxChange("MOD_1");
	 * ```
	 */
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

	/**
	 * Replaces the entire selection list for this technology.
	 *
	 * @param {string[]} moduleIds - The new array of selected module IDs.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleAllCheckboxesChange(["MOD_1", "MOD_2"]);
	 * ```
	 */
	const handleAllCheckboxesChange = useCallback(
		(moduleIds: string[]) => {
			setCheckedModules(tech, () => moduleIds);
		},
		[tech, setCheckedModules]
	);

	/**
	 * Handles the "Select All" toggle interaction.
	 *
	 * @param {boolean | "indeterminate"} checked - The new checkbox state.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleSelectAllChange(true); // Selects all non-core modules
	 * ```
	 */
	const handleSelectAllChange = useCallback(
		(checked: "indeterminate" | boolean) => {
			if (checked) {
				handleAllCheckboxesChange([...nonCoreModuleIds, ...coreModuleIds]);
			} else {
				handleAllCheckboxesChange(coreModuleIds);
			}
		},
		[handleAllCheckboxesChange, nonCoreModuleIds, coreModuleIds]
	);

	/**
	 * Processes a batch value change from the checkbox group.
	 *
	 * @remarks
	 * Enforces tier-based de-selection logic (Theta > Tau > Sigma). Removing
	 * a higher-tier module automatically deselects dependent lower-tier ones.
	 *
	 * @param {string[]} newValues - The new set of checked IDs.
	 *
	 * @returns {void} Side-effects only.
	 *
	 * @example
	 * ```typescript
	 * handleValueChange(["MOD_CORE", "MOD_THETA"]);
	 * ```
	 */
	const handleValueChange = useCallback(
		(newValues: string[]) => {
			const oldValues = new Set(currentCheckedModules);
			const newValuesSet = new Set(newValues);

			const added = [...newValuesSet].filter((id) => !oldValues.has(id));
			const removed = [...oldValues].filter((id) => !newValuesSet.has(id));

			if (added.length > 0) {
				handleCheckboxChange(added[0]);
			} else if (removed.length > 0) {
				const finalNewValues = new Set(newValuesSet);

				for (const removedId of removed) {
					const module = modules.find((m) => m.id === removedId);

					if (module) {
						const groupName = module.type || "upgrade";

						if ([`atlantid`, `cosmetic`, `reactor`, `upgrade`].includes(groupName)) {
							const label = module.label || "";

							if (label.includes("Theta")) {
								const tauModule = groupedModules[groupName].find((m) =>
									m.label?.includes("Tau")
								);
								const sigmaModule = groupedModules[groupName].find((m) =>
									m.label?.includes("Sigma")
								);
								if (tauModule) finalNewValues.delete(tauModule.id);
								if (sigmaModule) finalNewValues.delete(sigmaModule.id);
							} else if (label.includes("Tau")) {
								const sigmaModule = groupedModules[groupName].find((m) =>
									m.label?.includes("Sigma")
								);
								if (sigmaModule) finalNewValues.delete(sigmaModule.id);
							}
						}
					}
				}

				handleAllCheckboxesChange(Array.from(finalNewValues));
			}
		},
		[
			currentCheckedModules,
			handleCheckboxChange,
			handleAllCheckboxesChange,
			modules,
			groupedModules,
		]
	);

	const allModulesSelected = useMemo(
		() => nonCoreModuleIds.every((id) => currentCheckedModules.includes(id)),
		[nonCoreModuleIds, currentCheckedModules]
	);

	const isIndeterminate = useMemo(
		() => currentCheckedModules.length > 0 && !allModulesSelected,
		[currentCheckedModules.length, allModulesSelected]
	);

	return {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleAllCheckboxesChange,
		handleSelectAllChange,
		handleValueChange,
		isIndeterminate,
	};
};
