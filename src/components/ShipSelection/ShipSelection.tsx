// src/components/ShipSelection/ShipSelection.tsx
import "./ShipSelection.scss";

import type { ShipTypeDetail } from "../../hooks/useShipTypes/useShipTypes";
import React, { Suspense, useTransition } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

import { useRouteContext } from "../../context/RouteContext";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes/useShipTypes";
import { useToast } from "../../hooks/useToast/useToast";
import { createGrid, useGridStore } from "../../store/GridStore";
import { usePlatformStore } from "../../store/PlatformStore";
import { Logger } from "../../utils/logger";

// --- Constants for Grid Configuration ---
const DEFAULT_GRID_HEIGHT = 10;
const DEFAULT_GRID_WIDTH = 6;

/**
 * Props for the `ShipSelection` component.
 */
interface ShipSelectionProps {
	/** Whether an optimization solve is currently active. */
	solving: boolean;
}

/**
 * A skeleton component that mimics the `ShipSelection` trigger button.
 *
 * Used as a fallback for `Suspense` while ship type metadata is being fetched.
 *
 * @returns {JSX.Element} The rendered loading state.
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
					className="p-2!"
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
					className="mt-1!"
					disabled
				>
					<Spinner size="3" />
				</IconButton>
			)}
		</>
	);
};

/**
 * Internal component that manages the ship type selection logic.
 *
 * It uses `useFetchShipTypesSuspense` to retrieve the list of available
 * equipment categories from the backend. When a selection is made, it
 * synchronizes the `PlatformStore` and resets the grid state.
 *
 * @param {ShipSelectionProps} props - Component properties.
 * @returns {JSX.Element} The rendered selection interface.
 */
const ShipSelectionInternal: React.FC<ShipSelectionProps> = ({ solving }) => {
	const shipTypes = useFetchShipTypesSuspense(); // This will suspend the component
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipType = usePlatformStore((state) => state.setSelectedPlatform);
	const setGridAndResetAuxiliaryState = useGridStore(
		(state) => state.setGridAndResetAuxiliaryState
	);
	const { sendEvent } = useAnalytics();
	const { showInfo } = useToast();
	const [isPending, startTransition] = useTransition();
	const { isKnownRoute } = useRouteContext();
	const { t } = useTranslation();

	const shipTypeKeys = Object.keys(shipTypes);

	const groupedShipTypes = Object.entries(shipTypes).reduce(
		(acc, [key, details]) => {
			const type = details.type;

			if (!acc[type]) {
				acc[type] = [];
			}

			acc[type].push({ key, label: t(`platforms.${key}`), details });

			return acc;
		},
		{} as Record<string, { key: string; label: string; details: ShipTypeDetail }[]>
	);

	/**
	 * Finalizes the platform selection and updates global state.
	 *
	 * @param {string} option - The internal platform identifier.
	 */
	const handleOptionSelect = (option: string) => {
		if (option !== usePlatformStore.getState().selectedPlatform) {
			Logger.info(`Platform selected: ${option}`, { platform: option });
			// Use startTransition to keep dropdown responsive while handling updates
			startTransition(() => {
				sendEvent({
					category: "ui",
					action: "platform_selection",
					platform: option,
					value: 1,
					nonInteraction: false,
				});

				// TODO: Turn this back on if the Corvette bug shows up again
				if (option === "corvette") {
					showInfo(
						"Corvette Warning!",
						<>
							As of version 6.24, Corvettes <strong>still</strong> have known layout
							issues! If you create a layout, we highly recommend using the{" "}
							<strong>Save Build</strong> feature to keep a backup of your work.
						</>
					);
				}

				setSelectedShipType(option, shipTypeKeys, true, isKnownRoute);

				const initialGrid = createGrid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);
				setGridAndResetAuxiliaryState(initialGrid);
			});
		}
	};

	return (
		<>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger disabled={solving || isPending}>
					<Button size="2" variant="soft" aria-label="Select ship type" className="p-2!">
						<GearIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						<Separator
							orientation="vertical"
							color={solving || isPending ? "gray" : "cyan"}
							decorative
						/>
						<DropdownMenu.TriggerIcon />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content className="shipSelection__dropdownMenu">
					<DropdownMenu.Label className="shipSelection__header heading-styled">
						{t("shipSelection.selectPlatform", "Select Platform")}
					</DropdownMenu.Label>
					<ShipTypesDropdown
						selectedShipType={selectedShipType}
						handleOptionSelect={handleOptionSelect}
						groupedShipTypes={groupedShipTypes}
					/>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</>
	);
};

/**
 * A component that allows users to toggle between different equipment platforms.
 *
 * This is the primary entry point for changing the application's context
 * (e.g., from Starship to Multi-Tool). It is designed to work with React Suspense.
 *
 * @param {ShipSelectionProps} props - Component properties.
 * @returns {JSX.Element} The selection component wrapped in Suspense.
 *
 * @example
 * <ShipSelection solving={false} />
 */
const ShipSelectionComponent: React.FC<ShipSelectionProps> = (props) => {
	return (
		<Suspense fallback={<ShipSelectionLoadingState />}>
			<ShipSelectionInternal {...props} />
		</Suspense>
	);
};

export const ShipSelection = ShipSelectionComponent;

/**
 * Props for the `ShipTypesDropdown` helper component.
 */
interface ShipTypesDropdownProps {
	/** The ID of the currently active ship type. */
	selectedShipType: string;
	/** Callback function for when a new type is selected. */
	handleOptionSelect: (option: string) => void;
	/** Map of grouped ship type data for rendering sections. */
	groupedShipTypes: Record<string, { key: string; label: string; details: ShipTypeDetail }[]>;
}

/**
 * Helper component that renders the categorical list of ship types.
 *
 * @param {ShipTypesDropdownProps} props - Component properties.
 * @returns {JSX.Element} The rendered radio group content.
 */
const ShipTypesDropdown: React.FC<ShipTypesDropdownProps> = ({
	selectedShipType,
	handleOptionSelect,
	groupedShipTypes,
}) => {
	return (
		<DropdownMenu.RadioGroup value={selectedShipType} onValueChange={handleOptionSelect}>
			{Object.entries(groupedShipTypes).map(([type, items], groupIndex) => (
				<React.Fragment key={type}>
					{groupIndex > 0 && <DropdownMenu.Separator />}
					{items.map(({ key, label }) => (
						<DropdownMenu.RadioItem key={key} value={key} className="font-medium">
							{label}
						</DropdownMenu.RadioItem>
					))}
				</React.Fragment>
			))}
		</DropdownMenu.RadioGroup>
	);
};

export default ShipSelection;
