import { useCallback } from "react";

import { usePlatformStore } from "@/store/app/platformStore";
import { useGridStore } from "@/store/grid/gridStore";
import { useTechStore } from "@/store/tech/techStore";
import { Logger } from "@/utils/system/monitoring";

import { deserialize, serialize } from "./gridSerializer";

/**
 * Custom hook for serializing and deserializing the grid state for sharing.
 *
 * @remarks
 * Provides functions to convert the complex grid state into a compact string
 * suitable for URL parameters, and to restore that state from a string.
 * Orchestrates updates across {@link useGridStore}, {@link usePlatformStore},
 * and {@link useTechStore}. This is the primary entry point for URL-based
 * persistence and sharing functionality.
 *
 * @returns {object} An object containing the serialization and deserialization functions.
 * @returns {Function} returns.serializeGrid - Synchronously serializes the current grid.
 * @returns {Function} returns.deserializeGrid - Asynchronously restores grid state from a string.
 *
 * @see {@link useGridStore}
 * @see {@link usePlatformStore}
 * @see {@link useTechStore}
 * @see {@link serialize}
 * @see {@link deserialize}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example
 * ```tsx
 * const { serializeGrid, deserializeGrid } = useGridDeserializer();
 *
 * const link = serializeGrid();
 * await deserializeGrid(link);
 * // results in grid state being updated in the store and marked as shared
 * ```
 */
export const useGridDeserializer = () => {
	const grid = useGridStore((state) => state.grid);
	const setGrid = useGridStore((state) => state.setGrid);
	const setIsSharedGrid = useGridStore((state) => state.setIsSharedGrid);
	const selectedPlatform = usePlatformStore((state) => state.selectedPlatform);
	const setTechColors = useTechStore((state) => state.setTechColors);

	/**
	 * Serializes the current grid state from `GridStore` into a compressed string.
	 *
	 * @remarks
	 * Accesses the latest state from the GridStore and applies RLE compression
	 * to generate a URL-safe sharing token.
	 *
	 * @returns {string} The serialized grid data.
	 *
	 * @see {@link serialize}
	 *
	 * @example
	 * ```typescript
	 * const token = serializeGrid();
	 * // returns "111000..."
	 * ```
	 */
	const serializeGrid = useCallback((): string => {
		return serialize(grid);
	}, [grid]);

	/**
	 * Restores the grid state from a serialized string and updates the application stores.
	 *
	 * @remarks
	 * Validates the input string, fetches the necessary tech tree context for the
	 * current ship type, and populates the global store with the restored grid.
	 *
	 * @param {string} serializedGrid - The encoded grid string to process.
	 *
	 * @returns {Promise<void>} Resolves when the grid is successfully updated in the store.
	 *
	 * @see {@link deserialize}
	 *
	 * @example
	 * ```typescript
	 * await deserializeGrid(urlHash);
	 * ```
	 */
	const deserializeGrid = useCallback(
		async (serializedGrid: string) => {
			const newGrid = await deserialize(serializedGrid, selectedPlatform, setTechColors);

			if (newGrid) {
				setGrid(newGrid); // Update grid state
				setIsSharedGrid(true);
			} else {
				Logger.error("Deserialization failed, grid not set.");
			}
		},
		[selectedPlatform, setGrid, setIsSharedGrid, setTechColors]
	);

	return { deserializeGrid, serializeGrid };
};

export { compressRLE, decompressRLE, deserialize, serialize } from "./gridSerializer";
