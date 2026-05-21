import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useModuleSelectionStore } from "@/store/tech/moduleSelectionStore";
import { useTechStore } from "@/store/tech/techStore";

/**
 * Custom hook to manage the lifecycle of technology modules within the grid.
 *
 * @remarks
 * Coordinates between {@link useTechStore} and {@link useModuleSelectionStore} to:
 * 1. **Persistence Sync**: Automatically saves module selections to local storage via {@link useModuleSelectionStore}.
 * 2. **Grouping Logic**: Segregates modules into semantic categories (e.g., 'core', 'upgrade', 'figurines').
 * 3. **Hierarchical Selection**: Enforces tier-based constraints (e.g., removing a 'Theta' module deselects its 'Tau' and 'Sigma' counterparts).
 * 4. **Interaction State**: Derives indeterminate and "select all" states for complex checkbox interfaces.
 *
 * @param {string} tech - The unique technology identifier (e.g., 'pulse').
 * @param {Array<{ label: string, id: string, image: string, type?: string }>} modules - The full list of available modules.
 *
 * @returns {object} Module management state and handlers.
 * @returns {boolean} returns.allModulesSelected - Whether all available non-core modules are checked.
 * @returns {Array} returns.currentCheckedModules - IDs of currently selected modules.
 * @returns {object} returns.groupedModules - Modules grouped by their `type` property.
 * @returns {function} returns.handleSelectAllChange - Handler for the "Select All" toggle.
 * @returns {function} returns.handleValueChange - Handler for batch checkbox updates with hierarchy logic.
 * @returns {boolean} returns.isIndeterminate - Whether some but not all modules are selected.
 *
 * @see {@link useTechStore} for the source of truth.
 * @see {@link useModuleSelectionStore} for persistence logic.
 * @see {@link ./useTechModuleManagement.test.ts Unit Tests}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook initialization
 * ```tsx
 * const { groupedModules, handleValueChange } = useTechModuleManagement("pulse", pulseModules);
 * // returns { allModulesSelected: false, currentCheckedModules: [...], ... }
 * ```
 */
export const useTechModuleManagement = (
	tech: string,
	modules: { id: string; image: string; label: string; type?: string }[]
) => {
	const setCheckedModules = useTechStore((state) => state.setCheckedModules);
	const currentCheckedModules = useTechStore(
		useShallow((state) => state.checkedModules[tech] || [])
	);
	const { getModuleSelection, setModuleSelection } = useModuleSelectionStore();

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
	 */
	const handleAllCheckboxesChange = (moduleIds: string[]) => {
		setCheckedModules(tech, () => moduleIds);
	};

	/**
	 * Handles the "Select All" toggle interaction.
	 */
	const handleSelectAllChange = (checked: "indeterminate" | boolean) => {
		if (checked) {
			handleAllCheckboxesChange([...nonCoreModuleIds, ...coreModuleIds]);
		} else {
			handleAllCheckboxesChange(coreModuleIds);
		}
	};

	/**
	 * Processes a batch value change from the checkbox group.
	 *
	 * @remarks
	 * Enforces tier-based de-selection logic (Theta > Tau > Sigma). Removing
	 * a higher-tier module automatically deselects dependent lower-tier ones.
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

					if (["atlantid", "cosmetic", "reactor", "upgrade"].includes(groupName)) {
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
	};

	const allModulesSelected = nonCoreModuleIds.every((id) => currentCheckedModules.includes(id));
	const isIndeterminate = currentCheckedModules.length > 0 && !allModulesSelected;

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
