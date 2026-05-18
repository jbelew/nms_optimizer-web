import type { ShipTypeDetail } from "@/hooks/useShipTypes/useShipTypes";
import { createContext, use } from "react";

/**
 * Details for a grouped ship type entry.
 */
export interface GroupedShipType {
	details: ShipTypeDetail;
	key: string;
	label: string;
}

/**
 * Context interface for the ship selection component.
 */
export interface ShipSelectionContextValue {
	/** Map of grouped ship type data for rendering sections. */
	groupedShipTypes: Record<string, GroupedShipType[]>;
	/** Callback function for when a new type is selected. */
	handleOptionSelect: (option: string) => void;
	/** Whether an optimization solve or transition is currently active. */
	isPending: boolean;
	/** The ID of the currently active ship type. */
	selectedShipType: string;
}

export const ShipSelectionContext = createContext<null | ShipSelectionContextValue>(null);

/**
 * Hook to access the ShipSelection context.
 *
 * @returns {ShipSelectionContextValue} The selection context value.
 *
 * @throws {Error} If used outside of ShipSelectionProvider.
 */
export const useShipSelectionContext = () => {
	const context = use(ShipSelectionContext);

	if (!context) {
		throw new Error("useShipSelectionContext must be used within ShipSelectionProvider");
	}

	return context;
};
