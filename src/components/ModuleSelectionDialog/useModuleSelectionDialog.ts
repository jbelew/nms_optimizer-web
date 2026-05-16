/**
 * Coordinator hook for the `ModuleSelectionDialog` component.
 *
 * @category Hooks
 */

import type {
	GroupedModules,
	ModuleDialogBodyProps,
	ModuleDialogFooterProps,
	ModuleSelectionDialogProps,
	SelectionModule,
} from "../../types/props";
import { useCallback, useMemo } from "react";

import { usePlatformStore } from "../../store/app/platformStore";

/**
 * Coordinator hook for the `ModuleSelectionDialog` component.
 *
 * It encapsulates the complex state management for module selection, specifically:
 * 1. Synchronizing the native DOM indeterminate state for the "Select All" checkbox.
 * 2. Determining ship-specific behavioral overrides (e.g., for Corvettes).
 * 3. Structuring and distributing props to specialized sub-components (`DialogHeader`, `DialogBody`, `DialogFooter`).
 *
 * @param {ModuleSelectionDialogProps} props - The raw properties passed to the main dialog.
 *
 * @returns {object} Structured props for children and internal UI flags.
 */
export const useModuleSelectionDialog = (props: ModuleSelectionDialogProps) => {
	const {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleOptimizeClick,
		handleSelectAllChange,
		handleValueChange,
		isIndeterminate,
		onClose,
		tech,
	} = props;

	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);

	// Detect if we're configuring a Corvette (which has strict non-removable modules)
	const isCorvette = tech?.toLowerCase() === "corvette" || selectedPlatform === "corvette";

	/**
	 * Processes and filters module groups for display.
	 * 1. Removes non-upgrade modules for Corvettes.
	 * 2. Sorts all modules alphabetically by label for easier scanning.
	 */
	const processedGroupedModules = useMemo(() => {
		const nextGroups: GroupedModules = {};

		for (const [group, modules] of Object.entries(groupedModules)) {
			let filtered = modules;

			// Filter out base technologies that cannot be removed from a Corvette build
			if (isCorvette) {
				filtered = modules.filter(
					(m: SelectionModule) => m.type !== "base" && m.type !== "normal"
				);
			}

			// Sort alphabetically by label
			nextGroups[group] = [...filtered].sort((a, b) => a.label.localeCompare(b.label));
		}

		return nextGroups;
	}, [groupedModules, isCorvette]);

	const handleAction = useCallback(async () => {
		await handleOptimizeClick();
		onClose();
	}, [handleOptimizeClick, onClose]);

	// Structured props for DialogBody
	const bodyProps: ModuleDialogBodyProps & { onValueChange: (v: string[]) => void } = {
		groupedModules: processedGroupedModules,
		onValueChange: handleValueChange,
		selectedModules: currentCheckedModules,
	};

	// Structured props for DialogFooter
	const footerProps: ModuleDialogFooterProps = {
		currentCheckedModules,
		handleOptimizeClick: handleAction,
	};

	return {
		allModulesSelected,
		bodyProps,
		footerProps,
		handleSelectAllChange,
		handleValueChange,
		isIndeterminate,
	};
};

/** Type representing the return value of the coordinator hook. */
export type UseModuleSelectionDialogReturn = ReturnType<typeof useModuleSelectionDialog>;
