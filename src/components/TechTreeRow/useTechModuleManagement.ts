import { useEffect, useMemo } from "react";

import { useModuleSelectionStore } from "@/store/ModuleSelectionStore";
import { useTechStore } from "@/store/TechStore";

/**
 * Custom hook for managing the state and selection logic of technology modules.
 *
 * @remarks
 * It handles:
 * 1. Syncing module selections with the global `TechStore` and persistent `ModuleSelectionStore`.
 * 2. Grouping raw module lists into categorical buckets (Core, Upgrade, etc.).
 * 3. Enforcing selection dependencies (e.g., removing 'Theta' should also remove 'Tau' and 'Sigma').
 * 4. Managing "Select All" and indeterminate checkbox states.
 *
 * @param {string} tech - The unique technology identifier.
 * @param {Array<{ label: string, id: string, image: string, type?: string }>} modules - The full list of modules available for the tech.
 * @returns {object} State flags and event handlers for module selection UI.
 *
 * @see {@link ../../../store/TechStore.ts TechStore}
 * @see {@link ../../../store/ModuleSelectionStore.ts ModuleSelectionStore}
 * @see {@link ./useTechModuleManagement.test.ts Unit Tests}
 * @hook
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { groupedModules, handleValueChange } = useTechModuleManagement("pulse", availableModules);
 * ```
 */
export const useTechModuleManagement = (
	tech: string,
	modules: { label: string; id: string; image: string; type?: string }[]
) => {
	const setCheckedModules = useTechStore((state) => state.setCheckedModules);
	const allCheckedModules = useTechStore((state) => state.checkedModules);
	const { setModuleSelection, getModuleSelection } = useModuleSelectionStore();

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

	const coreModuleIds = modules.filter((m) => m.type === "core").map((m) => m.id);

	const nonCoreModuleIds = modules.filter((m) => m.type !== "core").map((m) => m.id);

	const groups: { [key: string]: typeof modules } = {
		core: [],
		bonus: [],
		upgrade: [],
		reactor: [],
		cosmetic: [],
		atlantid: [],
		trails: [],
		figurines: [],
	};

	modules.forEach((module) => {
		if (module.label.toLowerCase().includes("figurine")) {
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

	const groupedModules = groups;

	/**
	 * Toggles the selection status of a single module.
	 *
	 * @param {string} moduleId - The unique ID of the module.
	 * @example
	 * ```typescript
	 * handleCheckboxChange("MOD_1");
	 * // returns void, side-effect: toggles selection in TechStore
	 * ```
	 */
	const handleCheckboxChange = (moduleId: string) => {
		setCheckedModules(tech, (prevChecked = []) => {
			const isChecked = prevChecked.includes(moduleId);

			return isChecked
				? prevChecked.filter((id) => id !== moduleId)
				: [...prevChecked, moduleId];
		});
	};

	/**
	 * Replaces the entire selection list for this technology.
	 *
	 * @param {string[]} moduleIds - The new array of selected module IDs.
	 * @example
	 * ```typescript
	 * handleAllCheckboxesChange(["MOD_1", "MOD_2"]);
	 * // returns void, side-effect: sets new selection in TechStore
	 * ```
	 */
	const handleAllCheckboxesChange = (moduleIds: string[]) => {
		setCheckedModules(tech, () => moduleIds);
	};

	/**
	 * Handles the "Select All" toggle interaction.
	 *
	 * @param {boolean | "indeterminate"} checked - The new checkbox state.
	 * @example
	 * ```typescript
	 * handleSelectAllChange(true);
	 * // returns void, side-effect: selects all non-core modules
	 * ```
	 */
	const handleSelectAllChange = (checked: boolean | "indeterminate") => {
		if (checked) {
			handleAllCheckboxesChange([...nonCoreModuleIds, ...coreModuleIds]);
		} else {
			handleAllCheckboxesChange(coreModuleIds);
		}
	};

	/**
	 * Processes a batch value change from the checkbox group.
	 * Enforces tier-based de-selection logic (Theta > Tau > Sigma).
	 *
	 * @param {string[]} newValues - The new set of checked IDs.
	 * @example
	 * ```typescript
	 * handleValueChange(["MOD_CORE", "MOD_THETA"]);
	 * // returns void, side-effect: processes selection and enforces rules
	 * ```
	 */
	const handleValueChange = (newValues: string[]) => {
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

					if ([`upgrade`, `cosmetic`, `reactor`, `atlantid`].includes(groupName)) {
						const label = module.label;

						if (label.includes("Theta")) {
							const tauModule = groupedModules[groupName].find((m) =>
								m.label.includes("Tau")
							);
							const sigmaModule = groupedModules[groupName].find((m) =>
								m.label.includes("Sigma")
							);
							if (tauModule) finalNewValues.delete(tauModule.id);
							if (sigmaModule) finalNewValues.delete(sigmaModule.id);
						} else if (label.includes("Tau")) {
							const sigmaModule = groupedModules[groupName].find((m) =>
								m.label.includes("Sigma")
							);
							if (sigmaModule) finalNewValues.delete(sigmaModule.id);
						}
					}
				}
			}

			handleAllCheckboxesChange(Array.from(finalNewValues));
		}
	};

	const allModulesSelected = nonCoreModuleIds.every((id) => currentCheckedModules.includes(id));
	const isIndeterminate = currentCheckedModules.length > 0 && !allModulesSelected;

	return {
		currentCheckedModules,
		groupedModules,
		allModulesSelected,
		isIndeterminate,
		handleValueChange,
		handleSelectAllChange,
		handleAllCheckboxesChange,
	};
};
