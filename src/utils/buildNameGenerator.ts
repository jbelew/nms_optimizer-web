import {
	SHIP_NAME_PREFIXES_COMPOUND,
	SHIP_NAME_PREFIXES_SIMPLE,
	SHIP_NAME_SUFFIXES,
} from "../constants/shipNames";
import { sanitizeFilename } from "./filenameValidation";

/**
 * Lookup table for user-friendly ship type names
 */
const SHIP_TYPE_NAMES: Record<string, string> = {
	standard: "Starship",
	sentinel: "Sentinel",
	solar: "Solar",
	living: "Living",
	"standard-mt": "MultiTool",
	atlantid: "Atlantid",
	"sentinel-mt": "Sentinel MultiTool",
	staves: "Staff",
	freighter: "Freighter",
	nomad: "Nomad",
	pilgrim: "Pilgrim",
	roamer: "Roamer",
	nautilon: "Nautilon",
	colossus: "Colossus",
	minotaur: "Minotaur",
	exosuit: "Exosuit",
	corvette: "Corvette",
};

/**
 * Gets the user-friendly name for a ship type
 * @param {string} shipType - The ship type identifier
 * @returns {string} The user-friendly name, or the original shipType if not found
 */
export const getShipTypeName = (shipType: string): string => {
	return SHIP_TYPE_NAMES[shipType.toLowerCase()] || shipType;
};

/**
 * Generates a random build name based on the ship type.
 * Format: ShipType - Prefix Suffix
 * Creates NMS-themed names like "Corvette - Crusade of the Starfall"
 * Returns a sanitized filename-safe version.
 *
 * @param {string} shipType - The type of ship (e.g., "freighter", "standard").
 * @returns {string} A sanitized build name combining ship type with NMS-themed prefix and suffix.
 */
export const generateBuildNameWithType = (shipType: string): string => {
	// Randomly choose between simple and compound prefix (50/50)
	const useCompound = Math.random() > 0.5;
	const prefixList = useCompound ? SHIP_NAME_PREFIXES_COMPOUND : SHIP_NAME_PREFIXES_SIMPLE;
	const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
	const suffix = SHIP_NAME_SUFFIXES[Math.floor(Math.random() * SHIP_NAME_SUFFIXES.length)];
	const friendlyShipType = getShipTypeName(shipType);

	return sanitizeFilename(`${friendlyShipType} - ${prefix} ${suffix}`);
};
