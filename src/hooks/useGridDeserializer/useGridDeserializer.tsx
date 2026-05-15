import { useCallback } from "react";

import { usePlatformStore } from "../../store/app/platformStore";
import { createGrid, Grid, useGridStore } from "../../store/grid/gridStore";
import { useTechStore } from "../../store/tech/techStore";
import { getTechTreeMaps } from "../../utils/tech/techTreeUtils";
import { isValidRecommendedBuild } from "../../utils/validation/dataValidation";
import { fetchTechTreeAsync, RecommendedBuild, TechTree } from "../useTechTree/useTechTree";

/**
 * Compresses a string using Run-Length Encoding (RLE).
 *
 * @remarks
 * Consecutive identical characters are replaced by the character followed by the count.
 * Used internally for compacting grid serialization tokens, reducing the length of
 * strings representing long runs of identical cell states or tech codes.
 *
 * @param {string} input - The string to compress.
 *
 * @returns {string} The compressed string.
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const compressed = compressRLE("AAAABBBCC");
 * // returns "A4B3C2"
 * ```
 */
const compressRLE = (input: string): string => {
	if (!input) return "";
	let compressed = "";
	let count = 1;

	for (let i = 0; i < input.length; i++) {
		if (i + 1 < input.length && input[i] === input[i + 1]) {
			count++;
		} else {
			compressed += input[i];

			if (count > 1) {
				compressed += count.toString();
			}

			count = 1;
		}
	}

	return compressed;
};

/**
 * Decompresses a string that was compressed using Run-Length Encoding (RLE).
 *
 * @remarks
 * Restores the original string by expanding character-count pairs.
 * Inverse operation of {@link compressRLE}.
 *
 * @param {string} input - The compressed string to decompress.
 *
 * @returns {string} The decompressed string.
 *
 * @see {@link compressRLE}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const original = decompressRLE("A4B3C2");
 * // returns "AAAABBBCC"
 * ```
 */
const decompressRLE = (input: string): string => {
	if (!input) return "";
	let decompressed = "";
	let i = 0;

	while (i < input.length) {
		const currentChar = input[i];
		i++; // Move past the character
		let countStr = "";

		while (i < input.length && !isNaN(parseInt(input[i]))) {
			countStr += input[i];
			i++;
		}

		const count = countStr ? parseInt(countStr) : 1;
		decompressed += currentChar.repeat(count);
	}

	return decompressed;
};

/**
 * Serializes the grid state into a URL-safe compressed string.
 *
 * @remarks
 * The format consists of six pipe-separated parts:
 * 1. `gridString` - Map of cell states (`0`=inactive, `1`=active, `2`=supercharged).
 * 2. `compressedTech` - RLE-compressed characters representing tech keys.
 * 3. `compressedModule` - RLE-compressed characters representing module IDs.
 * 4. `compressedAdjBonus` - RLE-compressed adjacency bonus status flags.
 * 5. `techMap` - Mapping of characters to tech keys.
 * 6. `moduleMap` - Mapping of characters to module IDs.
 *
 * This compact representation allows sharing complex grid layouts via URL hash or parameters.
 *
 * @param {Grid} grid - The grid object to serialize.
 *
 * @returns {string} An encoded string representing the grid state.
 *
 * @see {@link Grid}
 * @see {@link compressRLE}
 * @see {@link deserialize}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const sharedLink = serialize(currentGrid);
 * // returns "111000%7CA3B3%7CC2D2%7CT6F4%7Cpulse%3AA%2Cinfra%3AB%7CS1%3AC%2CS2%3AD"
 * ```
 */
export const serialize = (grid: Grid): string => {
	const techMap: { [key: string]: string } = {};
	const moduleMap: { [key: string]: string } = {};
	let nextTechCode = 3;
	let nextModuleCode = 0;

	const allCells = grid.cells.flat();

	const gridString = allCells
		.map((cell) => (cell.active ? (cell.supercharged ? "2" : "1") : "0"))
		.join("");

	const techString = allCells
		.map((cell) =>
			cell.tech
				? techMap[cell.tech] || (techMap[cell.tech] = String.fromCharCode(nextTechCode++))
				: " "
		)
		.join("");

	const moduleString = allCells
		.map((cell) =>
			cell.module
				? moduleMap[cell.module] ||
					(moduleMap[cell.module] = String.fromCharCode(nextModuleCode++ + 65))
				: " "
		)
		.join("");

	const adjBonusString = allCells
		.map((cell) => ((cell.adjacency_bonus ?? 0) != 0 ? "T" : "F"))
		.join("");

	// Compress the other strings
	const compressedTech = compressRLE(techString);
	const compressedModule = compressRLE(moduleString);
	const compressedAdjBonus = compressRLE(adjBonusString);

	const techMapString = Object.entries(techMap)
		.map(([key, value]) => `${key}:${value}`)
		.join(",");
	const moduleMapString = Object.entries(moduleMap)
		.map(([key, value]) => `${key}:${value}`)
		.join(",");

	// Format: gridString|compressedTech|compressedModule|compressedAdjBonus|techMap|moduleMap
	return encodeURIComponent(
		`${gridString}|${compressedTech}|${compressedModule}|${compressedAdjBonus}|${techMapString}|${moduleMapString}`
	);
};

/**
 * Deserializes a compressed string back into a functional grid state.
 *
 * @remarks
 * Fetches current tech tree data to ensure the deserialized techs and modules
 * still exist and have up-to-date properties. Handles backward compatibility
 * with older shared links by validating against the latest API data.
 *
 * @param {string} serializedGrid - The encoded grid string to deserialize.
 * @param {string} shipType - The ship type context for fetching tech tree data.
 * @param {function(Record<string, string>): void} setTechColors - Callback to update the tech color registry.
 *
 * @returns {Promise<Grid | null>} A promise resolving to the restored {@link Grid} object, or `null` if deserialization fails.
 *
 * @see {@link Grid}
 * @see {@link decompressRLE}
 * @see {@link serialize}
 * @see {@link fetchTechTreeAsync}
 * @see {@link ./useGridDeserializer.test.tsx Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * const restoredGrid = await deserialize(urlParam, "fighter", setColors);
 * // returns { width: 10, height: 6, cells: [...] }
 * ```
 */
export const deserialize = async (
	serializedGrid: string,
	shipType: string,
	setTechColors: (colors: { [key: string]: string }) => void
): Promise<Grid | null> => {
	try {
		if (!serializedGrid) {
			console.warn("No serialized grid data found. Skipping deserialization.");

			return null;
		}

		const decoded = decodeURIComponent(serializedGrid);

		if (!decoded) {
			console.error("Failed to decodeURIComponent. Skipping deserialization.");

			return null;
		}

		// Format: gridString|compressedTech|compressedModule|compressedAdjBonus|techMap|moduleMap
		const parts = decoded.split("|");

		if (parts.length !== 6) {
			console.error(
				"Invalid serialized grid format. Incorrect number of parts. Expected 6, got",
				parts.length,
				"Skipping deserialization."
			);

			return null;
		}

		const [
			gridString,
			compressedTech,
			compressedModule,
			compressedAdjBonus,
			techMapString,
			moduleMapString,
		] = parts;

		if (
			[
				gridString,
				compressedTech,
				compressedModule,
				compressedAdjBonus,
				techMapString,
				moduleMapString,
			].some((part) => part === undefined)
		) {
			console.error(
				"Invalid serialized grid format. Missing parts. Skipping deserialization."
			);

			return null;
		}

		const newGrid = createGrid(10, 6);
		const expectedLength = newGrid.width * newGrid.height;

		// Decompress the other strings
		const decompressedTech = decompressRLE(compressedTech);
		const decompressedModule = decompressRLE(compressedModule);
		const decompressedAdjBonus = decompressRLE(compressedAdjBonus);

		if (
			gridString.length !== expectedLength ||
			decompressedTech.length !== expectedLength ||
			decompressedModule.length !== expectedLength ||
			decompressedAdjBonus.length !== expectedLength
		) {
			console.error(
				`Invalid serialized grid format: String length mismatch. Expected ${expectedLength}. Got Grid: ${gridString.length}, Tech: ${decompressedTech.length}, Module: ${decompressedModule.length}, AdjBonus: ${decompressedAdjBonus.length}. Skipping deserialization.`
			);

			return null;
		}

		// --- Maps ---
		const techMap = (techMapString || "")
			.split(",")
			.reduce((acc: { [key: string]: string }, entry) => {
				if (!entry) return acc;
				const [key, value] = entry.split(":");
				if (key && value) acc[value] = key;

				return acc;
			}, {});
		const moduleMap = (moduleMapString || "")
			.split(",")
			.reduce((acc: { [key: string]: string }, entry) => {
				if (!entry) return acc;
				const [key, value] = entry.split(":");
				if (key && value) acc[value] = key;

				return acc;
			}, {});

		// --- Fetch Tech Tree Data (using cached promise) ---
		const techTreeData: TechTree = await fetchTechTreeAsync(shipType);

		// Check if tech tree data is empty (indicates a fetch failure)
		if (Object.keys(techTreeData).length === 0) {
			console.error("Tech tree data is empty. Fetch likely failed.");

			return null;
		}

		if (techTreeData.recommended_builds && Array.isArray(techTreeData.recommended_builds)) {
			techTreeData.recommended_builds = techTreeData.recommended_builds.filter(
				(build: RecommendedBuild) => {
					if (!isValidRecommendedBuild(build)) {
						console.error("Invalid recommended build found in tech tree:", build);

						return false;
					}

					return true;
				}
			);
		}

		const { modulesMap, techColors, validTechKeys } = getTechTreeMaps(techTreeData);

		// Validate that all techs in serialized grid exist in current API data
		const missingTechs = new Set<string>();

		for (const techChar of Object.values(techMap)) {
			if (techChar !== " " && !validTechKeys.has(techChar)) {
				missingTechs.add(techChar);
			}
		}

		if (missingTechs.size > 0) {
			console.error(
				`Grid deserialization warning: The following techs no longer exist in the API: ${Array.from(missingTechs).join(", ")}. They will be skipped. This may be due to API changes since the grid was shared.`
			);
		}

		setTechColors(techColors);

		// --- Grid Population Loop ---
		let index = 0;
		let skippedCellsCount = 0;

		for (let r = 0; r < newGrid.height; r++) {
			for (let c = 0; c < newGrid.width; c++) {
				const gridChar = gridString[index];
				newGrid.cells[r][c].active = gridChar !== "0";
				newGrid.cells[r][c].supercharged = gridChar === "2";

				const techChar = decompressedTech[index];
				const techName = techChar === " " ? null : techMap[techChar];
				const moduleChar = decompressedModule[index];
				const moduleId = moduleChar === " " ? null : moduleMap[moduleChar];
				const adjBonusChar = decompressedAdjBonus[index];

				// Reset cell properties
				newGrid.cells[r][c].module = null;
				newGrid.cells[r][c].label = "";
				newGrid.cells[r][c].image = null;
				newGrid.cells[r][c].bonus = 0.0;
				newGrid.cells[r][c].value = 0;
				newGrid.cells[r][c].adjacency = "none";
				newGrid.cells[r][c].adjacency_bonus = adjBonusChar === "T" ? 1.0 : 0.0;
				newGrid.cells[r][c].sc_eligible = false;

				// Validate tech exists before assigning (handles API changes)
				if (techName && !validTechKeys.has(techName)) {
					console.warn(
						`Cell [${r},${c}] references missing tech: ${techName}. Skipping cell content.`
					);
					newGrid.cells[r][c].tech = null;
					newGrid.cells[r][c].active = false;
					skippedCellsCount++;
				} else {
					newGrid.cells[r][c].tech = techName;
				}

				if (moduleId && techName) {
					const moduleData = modulesMap.get(`${techName}/${moduleId}`);

					if (moduleData) {
						newGrid.cells[r][c].module = moduleData.id;
						newGrid.cells[r][c].label = moduleData.label;
						newGrid.cells[r][c].image = moduleData.image;
						newGrid.cells[r][c].bonus = moduleData.bonus ?? 0.0;
						newGrid.cells[r][c].value = moduleData.value ?? 0;
						newGrid.cells[r][c].adjacency = moduleData.adjacency ?? "none";
						newGrid.cells[r][c].sc_eligible = moduleData.sc_eligible ?? false;
					} else {
						console.warn(
							`Module data not found for tech: ${techName}, module ID: ${moduleId}. Cell state might be incomplete.`
						);
					}
				}

				index++;
			}
		}

		if (skippedCellsCount > 0) {
			console.warn(
				`Grid deserialization: Skipped ${skippedCellsCount} cells due to missing techs in API.`
			);
		}

		console.log("Deserialized Grid (using raw gridString):", newGrid);

		return newGrid;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error deserializing grid:", error.message, error.stack);
		} else {
			console.error("An unknown error occurred during grid deserialization:", error);
		}

		return null;
	}
};

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
 * @returns {{ serializeGrid: () => string, deserializeGrid: (serializedGrid: string) => Promise<void> }} Serialization and deserialization utilities.
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
	const setGrid = useGridStore((state) => state.setGrid);
	const setIsSharedGrid = useGridStore((state) => state.setIsSharedGrid);
	const setTechColors = useTechStore((state) => state.setTechColors);

	/**
	 * Serializes the current grid state from `GridStore` into a compressed string.
	 *
	 * @returns {string} The serialized grid data.
	 */
	const serializeGrid = useCallback((): string => {
		const grid = useGridStore.getState().grid;

		return serialize(grid);
	}, []);

	/**
	 * Restores the grid state from a serialized string and updates the application stores.
	 *
	 * @param {string} serializedGrid - The encoded grid string to process.
	 *
	 * @returns {Promise<void>}
	 */
	const deserializeGrid = useCallback(
		async (serializedGrid: string) => {
			console.log("Attempting to deserialize:", serializedGrid);
			const currentPlatform = usePlatformStore.getState().selectedPlatform;
			const newGrid = await deserialize(serializedGrid, currentPlatform, setTechColors);

			if (newGrid) {
				console.log("Deserialization successful, setting grid and colors.");
				setGrid(newGrid); // Update grid state
				setIsSharedGrid(true);
			} else {
				console.error("Deserialization failed, grid not set.");
			}
		},
		[setGrid, setIsSharedGrid, setTechColors]
	);

	return { deserializeGrid, serializeGrid };
};
