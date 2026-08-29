import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTechStore } from "@/store/tech/techStore";

/**
 * Custom hook to manage the lifecycle of technology modules within the grid.
 *
 * @remarks
 * Coordinates useTechStore state to:
 * 1. **Grouping Logic**: Segregates modules into semantic categories (e.g., 'core', 'upgrade', 'figurines').
 * 2. **Delegated Selection**: Delegates selection state and cascading rules to the store.
 * 3. **Interaction State**: Derives indeterminate and "select all" states for complex checkbox interfaces.
 *
 * @param {string} tech - The unique technology identifier (e.g., 'pulse').
 * @param {Array<{ id: string; label: string; type?: string }>} modules - The full list of available modules.
 *
 * @returns {object} Module management state and handlers.
 * @returns {boolean} returns.allModulesSelected - Whether all available non-core modules are checked.
 * @returns {Array} returns.currentCheckedModules - IDs of currently selected modules.
 * @returns {object} returns.groupedModules - Modules grouped by their `type` property.
 * @returns {function} returns.handleAllCheckboxesChange - Handler to replace the entire selection list.
 * @returns {function} returns.handleSelectAllChange - Handler for the "Select All" toggle.
 * @returns {function} returns.handleValueChange - Handler for batch checkbox updates delegating to store.
 * @returns {boolean} returns.isIndeterminate - Whether some but not all modules are selected.
 *
 * @see {@link useTechStore} for the source of truth and persistence logic.
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
	 * Directly delegates the new list of checked IDs to the store action,
	 * allowing the store's validation engine to handle cascading selections.
	 */
	const handleValueChange = (newValues: string[]) => {
		handleAllCheckboxesChange(newValues);
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
