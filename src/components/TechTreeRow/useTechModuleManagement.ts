import { useEffect, useMemo } from "react";

import { useModuleSelectionStore } from "@/store/ModuleSelectionStore";
import { useTechStore } from "@/store/TechStore";

/**
 * Manages the state and logic for module selection within a technology tree row.
 * This includes grouping modules, handling checkbox states, and managing dependencies
 * between modules (e.g., Sigma -> Tau -> Theta).
 *
 * @param tech - The unique identifier for the technology.
 * @param modules - The list of all modules available for the technology.
 * @returns An object containing the state and handlers for module management.
 * @property {string[]} currentCheckedModules - An array of IDs for the currently selected modules.
 * @property {object} groupedModules - Modules grouped by their type (core, bonus, upgrade, etc.).
 * @property {boolean} allModulesSelected - True if all non-core modules are selected.
 * @property {boolean} isIndeterminate - True for the "select all" checkbox's indeterminate state.
 * @property {(newValues: string[]) => void} handleValueChange - Handler for the checkbox group's value change.
 * @property {(checked: boolean | "indeterminate") => void} handleSelectAllChange - Handler for the "select all" checkbox.
 * @property {(moduleIds: string[]) => void} handleAllCheckboxesChange - Handler for setting all checkboxes to specific module IDs.
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

		return groups;
	}, [modules]);

	const handleCheckboxChange = (moduleId: string) => {
		setCheckedModules(tech, (prevChecked = []) => {
			const isChecked = prevChecked.includes(moduleId);

			return isChecked
				? prevChecked.filter((id) => id !== moduleId)
				: [...prevChecked, moduleId];
		});
	};

	const handleAllCheckboxesChange = (moduleIds: string[]) => {
		setCheckedModules(tech, () => moduleIds);
	};

	const handleSelectAllChange = (checked: boolean | "indeterminate") => {
		if (checked) {
			handleAllCheckboxesChange([...nonCoreModuleIds, ...coreModuleIds]);
		} else {
			handleAllCheckboxesChange(coreModuleIds);
		}
	};

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
