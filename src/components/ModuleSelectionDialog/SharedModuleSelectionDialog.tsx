/**
 * Shared module selection dialog rendered once at the TechTree level.
 *
 * @remarks
 * Instead of each `TechTreeRow` instantiating its own `ModuleSelectionDialog`,
 * this component subscribes to {@link useModuleSelectionDialogStore} and renders
 * a single dialog instance. It derives all necessary row-level data from the
 * Zustand stores when a dialog is opened, avoiding ~30+ redundant component
 * subtrees during TechTree scrolling.
 *
 * @see {@link ModuleSelectionDialog} for the presentational dialog component.
 * @see {@link useModuleSelectionDialogStore} for dialog open/close state.
 *
 * @category Components
 */

import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { ModuleSelectionDialog } from "@/components/ModuleSelectionDialog/ModuleSelectionDialog";
import { useTechTree } from "@/components/TechTree/useTechTreeContext";
import { useTechModuleManagement } from "@/components/TechTreeRow/useTechModuleManagement";
import { useAnalytics } from "@/hooks/useAnalytics/useAnalytics";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { useModuleSelectionDialogStore } from "@/store/ui/uiStore";

/** Default empty array for modules to ensure stable reference when dialog is closed. */
const EMPTY_MODULES_ARRAY: { id: string; image: string; label: string; type?: string }[] = [];

/**
 * A wrapper component that renders a single, shared `ModuleSelectionDialog`.
 *
 * @remarks
 * Placed as a sibling to `TechTreeRoot` inside `TechTreeProvider`, so it has
 * access to the `useTechTree()` context for `handleOptimize`, `isGridFull`,
 * and `solving` state.
 *
 * @returns {React.ReactElement | null} The dialog when a tech is selected, or `null`.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <TechTreeProvider ...>
 *   <TechTreeRoot ...>...</TechTreeRoot>
 *   <SharedModuleSelectionDialog />
 * </TechTreeProvider>
 * ```
 */
export const SharedModuleSelectionDialog: React.FC = () => {
	const { t } = useTranslation();
	const { handleOptimize, isGridFull } = useTechTree();
	const { sendDeferredEvent } = useAnalytics();
	const [, startTransition] = useTransition();

	// Dialog store state
	const { closeDialog, isOpen, selectedTechData } = useModuleSelectionDialogStore(
		useShallow((state) => ({
			closeDialog: state.closeDialog,
			isOpen: state.isOpen,
			selectedTechData: state.selectedTechData,
		}))
	);

	// Derive the active tech key (empty string when closed — hooks cannot be conditional)
	const activeTech = selectedTechData?.tech ?? "";
	const techColor = selectedTechData?.techColor ?? "blue";
	const techImage = selectedTechData?.techImage ?? null;

	// Read module data from the tech store for the active tech
	const { techGroup } = useTechStore(
		useShallow((state) => ({
			techGroup: state.techGroups[activeTech],
		}))
	);

	const hasTechInGrid = useGridStore((state) => state.activeTechs?.has(activeTech) ?? false);

	const modules = techGroup?.[0]?.modules || EMPTY_MODULES_ARRAY;

	// Reuse the existing module management hook
	const {
		allModulesSelected,
		currentCheckedModules,
		groupedModules,
		handleAllCheckboxesChange,
		handleSelectAllChange,
		handleValueChange,
		isIndeterminate,
	} = useTechModuleManagement(activeTech, modules);

	// Snapshot of initial module selections when dialog opens (for cancel/revert)
	const [initialModules, setInitialModules] = useState<string[]>([]);
	const optimizeClickedRef = useRef(false);

	// Compute translated tech name
	const translationKeyPart = techImage
		? techImage.replace(/\.\w+$/, "").replace(/\//g, ".")
		: activeTech;
	const translatedTechName = activeTech ? t(`technologies.${translationKeyPart}`) : "";

	// Snapshot initial modules and fire analytics when dialog opens
	useEffect(() => {
		if (isOpen && activeTech) {
			setTimeout(() => setInitialModules(currentCheckedModules), 0);
			optimizeClickedRef.current = false;

			sendDeferredEvent({
				action: "page_view",
				category: "engagement",
				nonInteraction: true,
				page: `${window.location.pathname}${window.location.search}#module-selection-${activeTech}`,
				page_location: window.location.href,
				page_title: `NMS Optimizer: ${translatedTechName} Selection`,
			});
		}
		// Only run when the dialog opens — intentionally excluding currentCheckedModules
		// to capture the snapshot at open time, not on subsequent selection changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, activeTech]);

	/**
	 * Handles the optimize action from the dialog footer.
	 * Marks that optimize was clicked (so close doesn't revert), runs the solver,
	 * and closes the dialog.
	 */
	const handleOptimizeClick = useCallback(async () => {
		optimizeClickedRef.current = true;

		if (isGridFull && !hasTechInGrid) {
			closeDialog();

			return;
		}

		await handleOptimize(activeTech);
		closeDialog();
	}, [activeTech, closeDialog, handleOptimize, hasTechInGrid, isGridFull]);

	/**
	 * Handles dialog close (cancel or backdrop click).
	 * If optimize wasn't clicked, reverts module selections to the snapshot.
	 */
	const handleClose = useCallback(() => {
		startTransition(() => {
			if (!optimizeClickedRef.current) {
				handleAllCheckboxesChange(initialModules);
			}

			closeDialog();
		});
	}, [closeDialog, handleAllCheckboxesChange, initialModules]);

	// Don't render anything when no tech is selected
	if (!selectedTechData) {
		return null;
	}

	return (
		<ModuleSelectionDialog
			allModulesSelected={allModulesSelected}
			currentCheckedModules={currentCheckedModules}
			groupedModules={groupedModules}
			handleOptimizeClick={handleOptimizeClick}
			handleSelectAllChange={handleSelectAllChange}
			handleValueChange={handleValueChange}
			isIndeterminate={isIndeterminate}
			isOpen={isOpen}
			onClose={handleClose}
			tech={activeTech}
			techColor={techColor}
			techImage={techImage}
			translatedTechName={translatedTechName}
		/>
	);
};

SharedModuleSelectionDialog.displayName = "SharedModuleSelectionDialog";
