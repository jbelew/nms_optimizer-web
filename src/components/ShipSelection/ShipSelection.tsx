/**
 * Equipment platform and ship type selection module.
 *
 * @remarks
 * This module provides the `ShipSelection` component and its internal helpers,
 * allowing users to switch the optimization context between different
 * equipment types (e.g., starships, freighters).
 *
 * @see {@link ShipSelection}
 * @see {@link ./ShipSelection.stories.tsx Storybook}
 *
 * @category Components
 */

import "./ShipSelection.scss";

import type { ShipTypeDetail } from "../../hooks/useShipTypes/useShipTypes";
import React, { Suspense, useTransition } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, IconButton, Separator, Spinner } from "@radix-ui/themes";
import { Trans, useTranslation } from "react-i18next";

import { useRouteContext } from "../../context/RouteContext";
import { useAnalytics } from "../../hooks/useAnalytics/useAnalytics";
import { useBreakpoint } from "../../hooks/useBreakpoint/useBreakpoint";
import { useFetchShipTypesSuspense } from "../../hooks/useShipTypes/useShipTypes";
import { useToast } from "../../hooks/useToast/useToast";
import { usePlatformStore } from "../../store/app/platformStore";
import { createGrid, useGridStore } from "../../store/grid/gridStore";
import { Logger } from "../../utils/system/monitoring";

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
 * @remarks
 * Used as a fallback for `Suspense` while ship type metadata is being fetched.
 *
 * @returns {JSX.Element} The rendered loading state.
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelectionLoadingState />
 * // renders disabled button with spinner
 * ```
 */
const ShipSelectionLoadingState = () => {
	const { t } = useTranslation();
	const isSmallAndUp = useBreakpoint("640px");

	return (
		<>
			{isSmallAndUp ? (
				<Button
					size="2"
					variant="soft"
					aria-label={t("shipSelection.ariaLabel") ?? ""}
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
					aria-label={t("shipSelection.ariaLabel") ?? ""}
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
 * @remarks
 * It uses `useFetchShipTypesSuspense` to retrieve the list of available
 * equipment categories from the backend. When a selection is made, it
 * synchronizes the `PlatformStore` and resets the grid state.
 *
 * @param {ShipSelectionProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered selection interface.
 *
 * @see {@link useFetchShipTypesSuspense}
 * @see {@link usePlatformStore}
 *
 * @component
 *
 * @category Components
 *
 * @example Internal component usage
 * ```tsx
 * <ShipSelectionInternal solving={false} />
 * // renders platform selection dropdown
 * ```
 */
const ShipSelectionInternal: React.FC<ShipSelectionProps> = ({ solving }) => {
	const shipTypes = useFetchShipTypesSuspense(); // This will suspend the component
	const selectedShipType = usePlatformStore((state) => state.selectedPlatform);
	const setSelectedShipType = usePlatformStore((state) => state.setSelectedPlatform);
	const setGridAndResetAuxiliaryState = useGridStore(
		(state) => state.setGridAndResetAuxiliaryState
	);
	const { sendDeferredEvent } = useAnalytics();
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
	 *
	 * @example Handle platform change
	 * ```ts
	 * handleOptionSelect("starship");
	 * ```
	 */
	const handleOptionSelect = (option: string) => {
		if (option !== usePlatformStore.getState().selectedPlatform) {
			Logger.info(`Platform selected: ${option}`, { platform: option });
			// Use startTransition to keep dropdown responsive while handling heavy updates
			startTransition(() => {
				// TODO: Turn this back on if the Corvette bug shows up again ...
				if (option === "corvette") {
					showInfo(
						t("shipSelection.corvetteWarning.title"),
						<Trans i18nKey="shipSelection.corvetteWarning.description" />
					);
				}

				setSelectedShipType(option, shipTypeKeys, true, isKnownRoute);
				const initialGrid = createGrid(DEFAULT_GRID_HEIGHT, DEFAULT_GRID_WIDTH);
				setGridAndResetAuxiliaryState(initialGrid);
			});

			sendDeferredEvent({
				category: "ui",
				action: "select_content",
				content_type: "platform",
				item_id: option,
				value: 1,
				nonInteraction: false,
			});
		}
	};

	return (
		<>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger disabled={solving || isPending}>
					<Button
						size="2"
						variant="soft"
						aria-label={t("shipSelection.ariaLabel") ?? ""}
						className="p-2!"
					>
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
 * @remarks
 * This is the primary entry point for changing the application's context
 * (e.g., from Starship to Multi-Tool). It is designed to work with React Suspense.
 *
 * @param {ShipSelectionProps} props - Component properties.
 *
 * @returns {JSX.Element} The selection component wrapped in Suspense.
 *
 * @see {@link ShipSelectionInternal}
 *
 * @component
 *
 * @category Components
 *
 * @example
 * ```tsx
 * <ShipSelection solving={false} />
 * // renders suspended selection button
 * ```
 */
const ShipSelectionComponent: React.FC<ShipSelectionProps> = (props) => {
	return (
		<Suspense fallback={<ShipSelectionLoadingState />}>
			<ShipSelectionInternal {...props} />
		</Suspense>
	);
};

/**
 * Exported reference for the ShipSelection component.
 *
 * @see {@link ShipSelectionComponent}
 *
 * @category Components
 */
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
 * @remarks
 * It maps grouped ship data into a set of radio items, separated by
 * category lines.
 *
 * @param {ShipTypesDropdownProps} props - Component properties.
 *
 * @returns {JSX.Element} The rendered radio group content.
 *
 * @component
 *
 * @category Components
 *
 * @example Categorical dropdown content
 * ```tsx
 * <ShipTypesDropdown
 *   selectedShipType="starship"
 *   handleOptionSelect={fn}
 *   groupedShipTypes={data}
 * />
 * // renders list of selectable ship types
 * ```
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
