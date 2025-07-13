// src/components/ShipSelection/ShipSelection.tsx
import "./ShipSelection.css";

import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator } from "@radix-ui/themes";
import PropTypes from "prop-types";
import React, { useCallback, useMemo } from "react";
import ReactGA from "react-ga4";
import { useTranslation } from "react-i18next";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { type ShipTypeDetail, useShipTypesStore } from "../../hooks/useShipTypes";
import { createGrid, useGridStore } from "../../store/GridStore";

// --- Constants for Grid Configuration ---
const DEFAULT_GRID_HEIGHT = 10;
const DEFAULT_GRID_WIDTH = 6;

interface ShipSelectionProps {
	solving: boolean;
}

const ShipSelection: React.FC<ShipSelectionProps> = React.memo(({ solving }) => {
	const selectedShipType = useShipTypesStore((state) => state.selectedShipType);
	const setSelectedShipType = useShipTypesStore((state) => state.setSelectedShipType);
	const setGridAndResetAuxiliaryState = useGridStore(
		(state) => state.setGridAndResetAuxiliaryState
	);
	const isSmallAndUp = useBreakpoint("640px");

	const handleOptionSelect = useCallback(
		(option: string) => {
			// Only proceed if the selection is actually different from the current state.
			// This prevents unnecessary grid resets, especially on initial page load
			// if an action dispatches with the already-selected ship type.
			if (option !== selectedShipType) {
				ReactGA.event("platform_selection", {
					platform: option,
				});

				setSelectedShipType(option);

				// When the ship type changes, we reset the grid to a default blank state.
				// Any special grid layouts (like for freighters) are now handled by the API
				// when fetching the tech tree for that ship type.
				const initialGrid = createGrid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);
				setGridAndResetAuxiliaryState(initialGrid);
			}
		},
		[selectedShipType, setSelectedShipType, setGridAndResetAuxiliaryState]
	);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger disabled={solving}>
				{isSmallAndUp ? (
					<Button size="2" variant="soft" aria-label="Select ship type" className="!shadow-md !p-2">
						<GearIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						<Separator orientation="vertical" color="cyan" decorative />
						<DropdownMenu.TriggerIcon />
					</Button>
				) : (
					<IconButton
						size="2"
						variant="soft"
						aria-label="Select ship type"
						className="!shadow-md !mt-1"
					>
						<GearIcon className="w-4 h-4 sm:w-5 sm:h-5" />
					</IconButton>
				)}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content color="cyan" className="shipSelection__dropdownMenu">
				<ShipTypesDropdown
					selectedShipType={selectedShipType}
					handleOptionSelect={handleOptionSelect}
					solving={solving}
				/>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
});
ShipSelection.displayName = "ShipSelection";
ShipSelection.propTypes = {
	solving: PropTypes.bool.isRequired,
};

interface ShipTypesDropdownProps {
	selectedShipType: string;
	handleOptionSelect: (option: string) => void;
	solving: boolean;
}

/**
 * Dropdown menu for selecting a ship type, grouped by category.
 *
 * @param selectedShipType - The currently selected ship type key.
 * @param handleOptionSelect - Callback when a different ship type is selected.
 * @param solving - Boolean indicating if the solving process is active, to disable items.
 */
const ShipTypesDropdown: React.FC<ShipTypesDropdownProps> = React.memo(
	({ selectedShipType, handleOptionSelect, solving }) => {
		// Get shipTypes from the store.
		// This assumes MainAppContentInternal has already ensured data is fetched via Suspense.
		const shipTypes = useShipTypesStore((state) => state.shipTypes);
		const { t } = useTranslation();

		const groupedShipTypes = useMemo(() => {
			// Add a guard for when shipTypes might initially be null from the store
			if (!shipTypes) {
				return {};
			}
			return Object.entries(shipTypes).reduce(
				(acc, [key, details]) => {
					const type = details.type;
					if (!acc[type]) {
						acc[type] = [];
					}
					acc[type].push({ key, details }); // 'details' is already ShipTypeDetail
					return acc;
				},
				{} as Record<string, { key: string; details: ShipTypeDetail }[]>
			);
		}, [shipTypes]); // Dependency is now shipTypes from the store

		if (!shipTypes || Object.keys(shipTypes).length === 0) {
			return <DropdownMenu.Item disabled>{t("loading") || "Loading..."}</DropdownMenu.Item>;
		}

		return (
			<DropdownMenu.RadioGroup value={selectedShipType} onValueChange={handleOptionSelect}>
				{Object.entries(groupedShipTypes).map(([type, items], groupIndex) => (
					<React.Fragment key={type}>
						{groupIndex > 0 && <DropdownMenu.Separator />}
						{/* <DropdownMenu.Label>
							<span className="shipSelection__header">{t(`platformTypes.${type}`)}</span>
						</DropdownMenu.Label> */}
						{items.map(({ key }) => (
							<DropdownMenu.RadioItem
								key={key}
								value={key}
								className="font-medium last:mb-2"
								disabled={solving}
							>
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
ShipTypesDropdown.propTypes = {
	selectedShipType: PropTypes.string.isRequired,
	handleOptionSelect: PropTypes.func.isRequired,
	solving: PropTypes.bool.isRequired,
};

export default ShipSelection;
