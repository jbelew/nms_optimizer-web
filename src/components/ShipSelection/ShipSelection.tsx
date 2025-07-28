// src/components/ShipSelection/ShipSelection.tsx
import "./ShipSelection.css";

import type { ShipTypeDetail, ShipTypes } from "../../hooks/useShipTypes";
import React, { Suspense, useCallback, useEffect, useMemo } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useAnalytics } from "../../hooks/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { fetchShipTypes } from "../../hooks/useShipTypes";
import { createGrid, useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";

// --- Constants for Grid Configuration ---
const DEFAULT_GRID_HEIGHT = 10;
const DEFAULT_GRID_WIDTH = 6;

interface ShipSelectionProps {
	solving: boolean;
}

const shipTypesResource = fetchShipTypes(); // Start fetching immediately

/**
 * A skeleton component that mimics the ShipSelection trigger button,
 * but shows a spinner. Used as a Suspense fallback.
 */
const ShipSelectionLoadingState = () => {
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<>
			{isSmallAndUp ? (
				<Button size="2" variant="soft" aria-label="Select ship type" className="!p-2" disabled>
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

const ShipSelectionInternal: React.FC<ShipSelectionProps> = React.memo(({ solving }) => {
	const shipTypes = shipTypesResource.read(); // This will suspend the component
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

	const handleOptionSelect = useCallback(
		(option: string) => {
			if (option !== selectedShipType) {
				sendEvent({
					category: "User Interactions",
					action: "platform_selection",
					platform: option,
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
						<Button size="2" variant="soft" aria-label="Select ship type" className="!p-2">
							<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							<Separator orientation="vertical" color="cyan" decorative />
							<DropdownMenu.TriggerIcon />
						</Button>
					) : (
						<IconButton size="2" variant="soft" aria-label="Select ship type" className="!mt-1">
							<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</IconButton>
					)}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content className="shipSelection__dropdownMenu">
					<DropdownMenu.Label className="shipSelection__header">Select Platform</DropdownMenu.Label>
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

interface ShipTypesDropdownProps {
	selectedShipType: string;
	handleOptionSelect: (option: string) => void;
	solving: boolean;
	shipTypes: ShipTypes;
}

const ShipTypesDropdown: React.FC<ShipTypesDropdownProps> = React.memo(
	({ selectedShipType, handleOptionSelect, shipTypes }) => {
		const { t } = useTranslation();

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
