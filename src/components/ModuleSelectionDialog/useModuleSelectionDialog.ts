import type {
	DialogBodyProps,
	DialogFooterProps,
	ModuleSelectionDialogProps,
} from "./ModuleSelectionDialog";
import { useEffect, useRef } from "react";

import { usePlatformStore } from "@/store/app/platformStore";

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
 *
 * @example
 * const { headerProps, bodyProps } = useModuleSelectionDialog(rawProps);
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
		techColor,
	} = props;

	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const isCorvette = selectedShipType === "corvette";

	const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

	// Manage indeterminate state for the "select all" checkbox
	useEffect(() => {
		if (selectAllCheckboxRef.current) {
			const inputElement =
				selectAllCheckboxRef.current.querySelector('input[type="checkbox"]');

			if (inputElement instanceof HTMLInputElement) {
				inputElement.indeterminate = isIndeterminate;
			}
		}
	}, [isIndeterminate]);

	// Structured props for DialogBody
	const bodyProps: DialogBodyProps = {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleSelectAllChange,
		handleValueChange,
		onClose,
		selectAllCheckboxRef,
		tech,
		techColor,
	};

	// Structured props for DialogFooter
	const footerProps: DialogFooterProps = {
		currentCheckedModules,
		handleOptimizeClick,
	};

	return {
		bodyProps,
		footerProps,
		isCorvette,
		selectAllCheckboxRef,
	};
};

/** Type representing the return value of the coordinator hook. */
