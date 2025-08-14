// src/components/ShipSelection/ShipSelection.tsx
import "./ShipSelection.css";

import type { ShipTypeDetail, ShipTypes } from "../../hooks/useShipTypes/useShipTypes";
import React, { Suspense, useCallback, useEffect, useMemo } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes/useShipTypes";
import { createGrid, useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";

// --- Constants for Grid Configuration ---
const DEFAULT_GRID_HEIGHT = 10;
const DEFAULT_GRID_WIDTH = 6;

/**
 * @interface ShipSelectionProps
 * @property {boolean} solving - Indicates if an optimization calculation is in progress.
 */
interface ShipSelectionProps {
	solving: boolean;
}

/**
 * A skeleton component that mimics the ShipSelection trigger button,
 * showing a spinner. Used as a Suspense fallback.
 *
 * @returns {JSX.Element} The rendered loading state component.
 */
const ShipSelectionLoadingState = () => {
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<>
			{isSmallAndUp ? (
				<Button
					size="2"
					variant="soft"
					aria-label="Select ship type"
					className="!p-2"
					disabled
				>
					<Spinner size="3" />
					<Separator orientation="vertical" color="gray" decorative />
					<DropdownMenu.TriggerIcon />
				</Button>
			) : (
				<IconButton
					size="2"
					variant="soft"
					aria-label="Select ship type"
					className="!mt-1"
					disabled
				>
					<Spinner size="3" />
				</IconButton>
			)}
		</>
	);
};

/**
 * ShipSelectionInternal component allows users to select a ship type (platform).
 * It fetches available ship types, manages the selected type, and updates the grid accordingly.
 * This component is memoized to prevent unnecessary re-renders.
 *
 * @param {ShipSelectionProps} props - The props for the ShipSelectionInternal component.
 * @param {boolean} props.solving - Indicates if an optimization calculation is in progress, which disables selection.
 * @returns {JSX.Element} The rendered ShipSelectionInternal component.
 */
const ShipSelectionInternal: React.FC<ShipSelectionProps> = React.memo(({ solving }) => {
	const shipTypes = useFetchShipTypesSuspense(); // This will suspend the component
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipType = usePlatformStore((state) => state.setSelectedPlatform);
	const setGridAndResetAuxiliaryState = useGridStore(
		(state) => state.setGridAndResetAuxiliaryState
	);
	const isSmallAndUp = useBreakpoint("640px");
	const { sendEvent } = useAnalytics();

	// This validation logic is moved up from the old SuspensefulShipTypesDropdown
	useEffect(() => {
		const platformState = usePlatformStore.getState();
		const currentSelected = platformState.selectedPlatform;
		const availableTypes = Object.keys(shipTypes);

		if (availableTypes.length > 0 && !availableTypes.includes(currentSelected)) {
			console.warn(
				`Selected ship type "${currentSelected}" is not valid. Resetting to "standard".`
			);
			platformState.setSelectedPlatform("standard", availableTypes, false);
		}
	}, [shipTypes]);

	/**
	 * Handles the selection of a new ship type from the dropdown.
	 * Updates the selected ship type in the store and resets the grid.
	 * @param {string} option - The selected ship type code.
	 */
	const handleOptionSelect = useCallback(
		(option: string) => {
			if (option !== selectedShipType) {
				sendEvent({
					category: "User Interactions",
					action: "platform_selection",
					platform: option,
					value: 1,
				});

				setSelectedShipType(option, Object.keys(shipTypes));

				const initialGrid = createGrid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);
				setGridAndResetAuxiliaryState(initialGrid);
			}
		},
		[selectedShipType, setSelectedShipType, setGridAndResetAuxiliaryState, sendEvent, shipTypes]
	);

	return (
		<>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger disabled={solving}>
					{isSmallAndUp ? (
						<Button
							size="2"
							variant="soft"
							aria-label="Select ship type"
							className="!p-2"
						>
							<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							<Separator orientation="vertical" color="cyan" decorative />
							<DropdownMenu.TriggerIcon />
						</Button>
					) : (
						<IconButton
							size="2"
							variant="soft"
							aria-label="Select ship type"
							className="!mt-1"
						>
							<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					)}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content className="shipSelection__dropdownMenu">
					<DropdownMenu.Label className="shipSelection__header">
						Select Platform
					</DropdownMenu.Label>
					<ShipTypesDropdown
						selectedShipType={selectedShipType}
						handleOptionSelect={handleOptionSelect}
						solving={solving}
						shipTypes={shipTypes}
					/>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</>
	);
});
ShipSelectionInternal.displayName = "ShipSelectionInternal";

export const ShipSelection: React.FC<ShipSelectionProps> = (props) => {
	return (
		<Suspense fallback={<ShipSelectionLoadingState />}>
			<ShipSelectionInternal {...props} />
		</Suspense>
	);
};
ShipSelection.displayName = "ShipSelection";

/**
 * @interface ShipTypesDropdownProps
 * @property {string} selectedShipType - The currently selected ship type.
 * @property {(option: string) => void} handleOptionSelect - Callback for when a ship type is selected.
 * @property {boolean} solving - Indicates if an optimization calculation is in progress.
 * @property {ShipTypes} shipTypes - The available ship types data.
 */
interface ShipTypesDropdownProps {
	selectedShipType: string;
	handleOptionSelect: (option: string) => void;
	solving: boolean;
	shipTypes: ShipTypes;
}

/**
 * ShipTypesDropdown component renders the dropdown menu for selecting ship types.
 * It groups ship types by their category and displays them as radio items.
 *
 * @param {ShipTypesDropdownProps} props - The props for the ShipTypesDropdown component.
 * @param {string} props.selectedShipType - The currently selected ship type.
 * @param {(option: string) => void} props.handleOptionSelect - Callback function for when a ship type is selected.
 * @param {boolean} props.solving - Indicates if an optimization calculation is in progress.
 * @param {ShipTypes} props.shipTypes - The available ship types data.
 * @returns {JSX.Element} The rendered ShipTypesDropdown component.
 */
const ShipTypesDropdown: React.FC<ShipTypesDropdownProps> = React.memo(
	({ selectedShipType, handleOptionSelect, shipTypes }) => {
		const { t } = useTranslation();

		/**
		 * Memoized grouping of ship types by their category.
		 * @type {Record<string, { key: string; details: ShipTypeDetail }[]>}
		 */
		const groupedShipTypes = useMemo(() => {
			if (!shipTypes) {
				return {};
			}
			return Object.entries(shipTypes).reduce(
				(acc, [key, details]) => {
					const type = details.type;
					if (!acc[type]) {
						acc[type] = [];
					}
					acc[type].push({ key, details });
					return acc;
				},
				{} as Record<string, { key: string; details: ShipTypeDetail }[]>
			);
		}, [shipTypes]);

		return (
			<DropdownMenu.RadioGroup value={selectedShipType} onValueChange={handleOptionSelect}>
				{Object.entries(groupedShipTypes).map(([type, items], groupIndex) => (
					<React.Fragment key={type}>
						{groupIndex > 0 && <DropdownMenu.Separator />}
						{items.map(({ key }) => (
							<DropdownMenu.RadioItem key={key} value={key} className="font-medium">
								{t(`platforms.${key}`)}
							</DropdownMenu.RadioItem>
						))}
					</React.Fragment>
				))}
			</DropdownMenu.RadioGroup>
		);
	}
);

ShipTypesDropdown.displayName = "ShipTypesDropdown";
