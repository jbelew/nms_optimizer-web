import type { DialogBodyProps } from "./DialogBody";
import type { DialogFooterProps } from "./DialogFooter";
import type { DialogHeaderProps } from "./DialogHeader";
import type { ModuleSelectionDialogProps } from "./index";
import { useEffect, useRef } from "react";

import { usePlatformStore } from "@/store/PlatformStore";

/**
 * Coordinator hook for the ModuleSelectionDialog component.
 * Encapsulates all state management and logic, returning structured props
 * for DialogHeader, DialogBody, and DialogFooter sub-components.
 *
 * Handles:
 * - Ship type detection (corvette-specific logic)
 * - Indeterminate checkbox state management
 * - Props distribution to child components
 *
 * @param props - The props for the ModuleSelectionDialog component
 * @returns Structured object containing header, body, and footer props
 */
export const useModuleSelectionDialog = (props: ModuleSelectionDialogProps) => {
	const {
		translatedTechName,
		groupedModules,
		currentCheckedModules,
		handleValueChange,
		handleSelectAllChange,
		handleOptimizeClick,
		allModulesSelected,
		isIndeterminate,
		techColor,
		techImage,
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

	// Structured props for DialogHeader
	const headerProps: DialogHeaderProps = {
		translatedTechName,
		techImage,
		techColor,
	};

	// Structured props for DialogBody
	const bodyProps: DialogBodyProps = {
		groupedModules,
		currentCheckedModules,
		handleValueChange,
		handleSelectAllChange,
		allModulesSelected,
		techColor,
		selectAllCheckboxRef,
	};

	// Structured props for DialogFooter
	const footerProps: DialogFooterProps = {
		handleOptimizeClick,
		currentCheckedModules,
	};

	return {
		headerProps,
		bodyProps,
		footerProps,
		isCorvette,
		selectAllCheckboxRef,
	};
};

export type UseModuleSelectionDialogReturn = ReturnType<typeof useModuleSelectionDialog>;
