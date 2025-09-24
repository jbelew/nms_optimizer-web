import { useMemo } from "react";

import { useTechStore } from "@/store/TechStore";

/**
 * Custom hook for managing the module selection logic within a technology tree row.
 *
 * @param tech - The technology identifier.
 * @param modules - The list of modules associated with the technology.
 * @returns An object containing module management state and functions.
 */
export const useTechModuleManagement = (
	tech: string,
	modules: { label: string; id: string; image: string; type?: string }[]
) => {
	const { setCheckedModules, checkedModules: allCheckedModules } = useTechStore();
	const currentCheckedModules = useMemo(
		() => allCheckedModules[tech] || [],
		[allCheckedModules, tech]
	);

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
		};

		modules.forEach((module) => {
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
					if (["upgrade", "cosmetic", "reactor"].includes(groupName)) {
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

	const allModulesSelected = nonCoreModuleIds.every((id) =>
		currentCheckedModules.includes(id)
	);
	const isIndeterminate = currentCheckedModules.length > 0 && !allModulesSelected;

	return {
		currentCheckedModules,
		groupedModules,
		allModulesSelected,
		isIndeterminate,
		handleValueChange,
		handleSelectAllChange,
	};
};
